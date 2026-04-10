import { useEffect, useCallback, useRef, useState } from 'react';
import { useCrm } from '@/contexts/CrmContext';
import { SHEETS_GET_URL, SHEETS_POST_URL } from '@/config/planilha';

// ─── Lista negra: números apagados pelo usuário (nunca reimportados) ─────────
const BLACKLIST_KEY = 'crm-telefones-apagados';

function getBlacklist(): Set<string> {
  try {
    const raw = localStorage.getItem(BLACKLIST_KEY);
    return new Set(JSON.parse(raw || '[]'));
  } catch {
    return new Set();
  }
}

function addToBlacklist(telefone: string) {
  const clean = telefone.replace(/\D/g, '');
  const list = getBlacklist();
  list.add(clean);
  localStorage.setItem(BLACKLIST_KEY, JSON.stringify([...list]));
}

// ─── Helper: extrai telefone de um item da planilha ───────────────────────
function extrairTelefone(item: Record<string, unknown>): string {
  return String(
    item['Numero'] ?? item['Número'] ?? item['numero'] ?? item['telefone'] ?? ''
  ).replace(/\D/g, '').trim();
}

// ─── POST genérico para a planilha ────────────────────────────────────────
async function postParaSheets(payload: Record<string, unknown>) {
  try {
    await fetch(SHEETS_POST_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      mode: 'no-cors',
    });
  } catch (e) {
    console.error('Erro ao enviar para Sheets:', e);
  }
}

// ─── Funções públicas de escrita ──────────────────────────────────────────

// Cria um lead na planilha — funil é o nome real do pipeline
export async function enviarLeadParaSheets(nome: string, telefone: string, origem: string, funil: string = 'Leads') {
  await postParaSheets({
    acao: 'criar',
    Nome: nome,
    Numero: telefone.replace(/\D/g, ''),
    Origem: origem,
    Funil: funil,
  });
}

// Apaga da planilha E adiciona à lista negra (nunca mais reimporta)
export async function apagarLeadDaSheets(telefone: string) {
  addToBlacklist(telefone);
  await postParaSheets({ acao: 'apagar', Numero: telefone.replace(/\D/g, '') });
}

// Atualiza a etapa na planilha — aceita funil opcional (padrão: 'Leads')
export async function atualizarEtapaNaSheets(
  telefone: string,
  etapa: string,
  funil: string = 'Leads'
) {
  await postParaSheets({
    acao: 'etapa',
    Numero: telefone.replace(/\D/g, ''),
    Etapa: etapa,
    Funil: funil,
  });
}

// Envia como paciente na planilha (funil Pacientes)
export async function enviarPacienteParaSheets(
  nome: string,
  telefone: string,
  origem?: string
) {
  await postParaSheets({
    acao: 'criar',
    Nome: nome,
    Numero: telefone.replace(/\D/g, ''),
    Origem: origem || 'Paciente',
    Funil: 'Pacientes',
  });
}

// ─── Hook principal: CRM = espelho da planilha ────────────────────────────

export function useGoogleSheetsSync() {
  const crm = useCrm();
  const [isSyncing, setIsSyncing] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastSyncRef = useRef<number>(0);

  const sincronizar = useCallback(async () => {
    // Evitar sincronizações muito frequentes que causam flickering
    const now = Date.now();
    if (now - lastSyncRef.current < 3000) {
      console.log('[GoogleSheets] Sincronização ignorada (menos de 3s desde última)');
      return;
    }
    lastSyncRef.current = now;

    try {
      setIsSyncing(true);
      const res = await fetch(SHEETS_GET_URL);
      if (!res.ok) return;
      const data = await res.json();
      if (!Array.isArray(data)) return;

      const blacklist = getBlacklist();

      const defaultPipeline = crm.pipelines[0];
      if (!defaultPipeline) return;
      const firstColId = defaultPipeline.colunas[0]?.id;
      if (!firstColId) return;

      // ── Separar por funil vindo do Sheets ────────────────────────────
      const itemsLeads = data.filter((i: any) => {
        const funil = String(i.Funil ?? i.funil ?? '').trim();
        return funil === '' || funil === 'Leads';
      });

      const itemsPacientes = data.filter((i: any) => {
        const funil = String(i.Funil ?? i.funil ?? '').trim();
        return funil === 'Pacientes';
      });

      console.log(`[GoogleSheets] 📊 Na planilha → Leads: ${itemsLeads.length}, Pacientes: ${itemsPacientes.length}`);

      // ── Números válidos na planilha (para detectar deleções) ─────────
      const numerosNaPlanilha = new Set<string>();
      for (const item of data) {
        const tel = extrairTelefone(item as Record<string, unknown>);
        if (tel && !blacklist.has(tel)) numerosNaPlanilha.add(tel);
      }

      // ── 1. Remover do CRM leads que sumiram da planilha ──────────────
      for (const lead of [...crm.leads]) {
        const cleanTel = lead.telefone.replace(/\D/g, '');
        if (cleanTel && !numerosNaPlanilha.has(cleanTel) && !blacklist.has(cleanTel)) {
          console.log(`[GoogleSheets] Removendo lead que sumiu: ${lead.nome} (${cleanTel})`);
          crm.deleteLead(lead.id);
        }
      }

      // ── 2. Telefones já presentes no CRM ─────────────────────────────
      const phonesNocrm = new Set([
        ...crm.leads.map(l => l.telefone.replace(/\D/g, '')),
        ...crm.pacientes.map(p => p.telefone.replace(/\D/g, '')),
      ]);

      // ── 3. Processar funil LEADS ──────────────────────────────────────
      for (const item of itemsLeads) {
        const nome = String(item.Nome ?? item.nome ?? '').trim();
        const telefone = extrairTelefone(item as Record<string, unknown>);
        const origem = String(item.Origem ?? item.origem ?? '').trim();

        if (!telefone) continue;
        if (blacklist.has(telefone)) continue;

        if (phonesNocrm.has(telefone)) {
          const existingLead = crm.leads.find(l => l.telefone.replace(/\D/g, '') === telefone);
          if (existingLead) {
            crm.updateLead(existingLead.id, {
              nome: nome || existingLead.nome,
              email: String(item.email ?? '') || existingLead.email,
              origem: origem || existingLead.origem,
            });
          }
          continue;
        }

        console.log(`[GoogleSheets] Importando lead: ${nome} (${telefone})`);
        crm.addLead({
          nome: nome || 'Lead importado',
          telefone,
          email: String(item.email ?? ''),
          origem,
          colunaId: firstColId,
          pipelineId: defaultPipeline.id,
        });
        phonesNocrm.add(telefone);
      }

      // ── 4. Processar funil PACIENTES ──────────────────────────────────
      const firstColPaciente = crm.colunasPacientes[0]?.id;

      for (const item of itemsPacientes) {
        const nome = String(item.Nome ?? item.nome ?? '').trim();
        const telefone = extrairTelefone(item as Record<string, unknown>);
        const origem = String(item.Origem ?? item.origem ?? '').trim();

        if (!telefone) continue;
        if (blacklist.has(telefone)) continue;

        if (phonesNocrm.has(telefone)) {
          const existingPaciente = crm.pacientes.find(p => p.telefone.replace(/\D/g, '') === telefone);
          if (existingPaciente) {
            crm.updatePaciente(existingPaciente.id, {
              nome: nome || existingPaciente.nome,
              email: String(item.email ?? '') || existingPaciente.email,
              origem: origem || existingPaciente.origem,
            });
          }
          continue;
        }

        if (!firstColPaciente) continue;

        console.log(`[GoogleSheets] Importando paciente: ${nome} (${telefone})`);
        crm.addPaciente({
          nome: nome || 'Paciente importado',
          telefone,
          email: String(item.email ?? ''),
          origem,
          colunaId: firstColPaciente,
        });
        phonesNocrm.add(telefone);
      }

    } catch (e) {
      console.error('Erro na sincronização com Sheets:', e);
    } finally {
      setIsSyncing(false);
    }
  }, [crm]);

  useEffect(() => {
    sincronizar();
    intervalRef.current = setInterval(sincronizar, 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sincronizar]);

  return { syncNow: sincronizar, isSyncing };
}
