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
  ).trim();
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

// Cria um lead na planilha
export async function enviarLeadParaSheets(nome: string, telefone: string, origem: string) {
  await postParaSheets({ acao: 'criar', Nome: nome, Numero: telefone.replace(/\D/g, ''), Origem: origem });
}

// Apaga da planilha E adiciona à lista negra (nunca mais reimporta)
export async function apagarLeadDaSheets(telefone: string) {
  addToBlacklist(telefone);
  await postParaSheets({ acao: 'apagar', Numero: telefone.replace(/\D/g, '') });
}

// Atualiza a etapa na planilha
export async function atualizarEtapaNaSheets(telefone: string, etapa: string) {
  await postParaSheets({ acao: 'etapa', Numero: telefone.replace(/\D/g, ''), Etapa: etapa });
}

// ─── Hook principal: CRM = espelho da planilha ────────────────────────────

export function useGoogleSheetsSync() {
  const crm = useCrm();
  const [isSyncing, setIsSyncing] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const sincronizar = useCallback(async () => {
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

      // Números válidos que existem na planilha agora (excluindo linhas vazias e blacklist)
      const numerosNaPlanilha = new Set<string>();
      for (const item of data) {
        const tel = extrairTelefone(item as Record<string, unknown>).replace(/\D/g, '');
        if (tel && !blacklist.has(tel)) {
          numerosNaPlanilha.add(tel);
        }
      }

      // ── 1. Apagar do CRM leads que sumiram da planilha ────────────────
      for (const lead of [...crm.leads]) {
        const cleanTel = lead.telefone.replace(/\D/g, '');
        if (cleanTel && !numerosNaPlanilha.has(cleanTel) && !blacklist.has(cleanTel)) {
          // Estava no CRM mas sumiu da planilha → apagar do CRM
          // Só apaga se o número já esteve na planilha (ou seja, foi importado dela)
          // Verifica se veio da planilha pela origem (qualquer origem != criação manual vazia)
          crm.deleteLead(lead.id);
        }
      }

      // ── 2. Importar da planilha leads que ainda não estão no CRM ──────
      // MAS: se o lead já existe, NÃO sobrescrever tarefas, atividades, anotações
      const phonesNocrm = new Set([
        ...crm.leads.map(l => l.telefone.replace(/\D/g, '')),
        ...crm.pacientes.map(p => p.telefone.replace(/\D/g, '')),
      ]);

      for (const item of data) {
        const nome = String(item.Nome ?? item.nome ?? '').trim();
        const telefone = extrairTelefone(item as Record<string, unknown>);
        const origem = String(item.Origem ?? item.origem ?? '').trim();

        if (!telefone) continue;
        const cleanPhone = telefone.replace(/\D/g, '');

        // Ignora blacklist
        if (blacklist.has(cleanPhone)) continue;

        // Se lead já existe no CRM, apenas atualizar nome/email/origem (preservando tarefas/atividades)
        if (phonesNocrm.has(cleanPhone)) {
          const existingLead = crm.leads.find(l => l.telefone.replace(/\D/g, '') === cleanPhone);
          if (existingLead) {
            // Atualizar APENAS os campos da planilha, preservar tarefas/atividades/anotações
            crm.updateLead(existingLead.id, {
              nome: nome || existingLead.nome,
              email: String(item.email ?? '') || existingLead.email,
              origem: origem || existingLead.origem,
            });
          }
          continue;
        }

        // Se lead NÃO existe, importar novo
        crm.addLead({
          nome: nome || 'Lead importado',
          telefone,
          email: String(item.email ?? ''),
          origem,
          colunaId: firstColId,
          pipelineId: defaultPipeline.id,
        });
        phonesNocrm.add(cleanPhone);
      }

    } catch (e) {
      console.error('Erro na sincronização com Sheets:', e);
    } finally {
      setIsSyncing(false);
    }
  }, [crm]);

  useEffect(() => {
    sincronizar();
    intervalRef.current = setInterval(sincronizar, 15000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sincronizar]);

  return { syncNow: sincronizar, isSyncing };
}
