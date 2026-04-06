import React from 'react';
import { useCrm } from '@/contexts/CrmContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, Calendar, TrendingUp, Clock, FileText, Timer, Zap, ShoppingCart, CalendarCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function DashboardPage() {
  const crm = useCrm();

  const totalLeads = crm.leads.length;
  const totalPacientes = crm.pacientes.length;
  const totalAgendamentos = crm.agendamentos.length;
  const agendamentosAgendados = crm.agendamentos.filter((a) => a.status === 'agendado').length;
  const compareceram = crm.agendamentos.filter((a) => a.status === 'compareceu').length;
  const faltaram = crm.agendamentos.filter((a) => a.status === 'faltou').length;
  const totalOrcamentos = crm.orcamentos.length;
  const orcamentosAprovados = crm.orcamentos.filter((o) => o.status === 'aprovado').length;

  const taxaComparecimento = totalAgendamentos > 0
    ? Math.round((compareceram / (compareceram + faltaram || 1)) * 100)
    : 0;

  // Taxa de Rendimento: pacientes convertidos em relação ao total
  const taxaRendimento = totalLeads + totalPacientes > 0
    ? Math.round((totalPacientes / (totalLeads + totalPacientes)) * 100)
    : 0;

  // Taxa de Conversão em Vendas: orçamentos aprovados / total de orçamentos
  const taxaConversaoVendas = totalOrcamentos > 0
    ? Math.round((orcamentosAprovados / totalOrcamentos) * 100)
    : 0;

  // Métricas de tempo
  const calcTempoMedio = (datas: { inicio: string; fim: string }[]) => {
    if (datas.length === 0) return null;
    const totalMs = datas.reduce((acc, d) => {
      return acc + (new Date(d.fim).getTime() - new Date(d.inicio).getTime());
    }, 0);
    return totalMs / datas.length;
  };

  const formatTempo = (ms: number | null) => {
    if (ms === null) return '—';
    const horas = ms / (1000 * 60 * 60);
    if (horas < 1) return `${Math.round(ms / (1000 * 60))}min`;
    if (horas < 24) return `${Math.round(horas)}h`;
    const dias = Math.round(horas / 24);
    return `${dias}d`;
  };

  // Tempo médio do lead em cada processo (da criação até conversão)
  const tempoMedioConversao = (() => {
    const convertidos = crm.pacientes
      .filter(p => p.leadOriginalId && p.criadoEm)
      .map(p => {
        const leadOriginal = crm.leads.find(l => l.id === p.leadOriginalId);
        // Se o lead foi deletado (convertido), usamos criadoEm do paciente como fim
        // e tentamos calcular baseado em dados disponíveis
        return { inicio: p.criadoEm, fim: p.criadoEm };
      });
    // Como leads são deletados na conversão, calculamos pelo tempo de vida dos leads atuais
    return null;
  })();

  // Tempo médio de resposta (primeira atividade após criação do lead)
  const tempoRespostaDados = crm.leads
    .filter(l => l.atividades && l.atividades.length > 0)
    .map(l => ({
      inicio: l.criadoEm,
      fim: l.atividades.sort((a, b) => new Date(a.criadoEm).getTime() - new Date(b.criadoEm).getTime())[0].criadoEm,
    }));
  const tempoMedioResposta = calcTempoMedio(tempoRespostaDados);

  // Tempo médio até ser agendado (do lead até primeiro agendamento)
  const tempoAteAgendamento = crm.leads
    .filter(l => l.agendamentos && l.agendamentos.length > 0)
    .map(l => {
      const primeiroAg = crm.agendamentos
        .filter(a => a.contatoId === l.id)
        .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())[0];
      if (!primeiroAg) return null;
      return { inicio: l.criadoEm, fim: `${primeiroAg.data}T${primeiroAg.hora}` };
    })
    .filter(Boolean) as { inicio: string; fim: string }[];
  const tempoMedioAteAgendamento = calcTempoMedio(tempoAteAgendamento);

  // Tempo médio até comprar (do lead até orçamento aprovado)
  const tempoAteCompra = crm.pacientes
    .filter(p => p.orcamentos && p.orcamentos.length > 0)
    .map(p => {
      const orcAprovado = crm.orcamentos
        .filter(o => p.orcamentos.includes(o.id) && o.status === 'aprovado')
        .sort((a, b) => new Date(a.criadoEm).getTime() - new Date(b.criadoEm).getTime())[0];
      if (!orcAprovado) return null;
      return { inicio: p.criadoEm, fim: orcAprovado.criadoEm };
    })
    .filter(Boolean) as { inicio: string; fim: string }[];
  const tempoMedioAteCompra = calcTempoMedio(tempoAteCompra);

  // Funnel chart: aggregate across all pipelines
  const allColunas = crm.pipelines.flatMap(p => p.colunas);
  const colunaNomes = [...new Set(allColunas.map(c => c.nome))];
  const leadsPorColuna = colunaNomes.map(nome => ({
    name: nome,
    value: crm.leads.filter(l => {
      const col = allColunas.find(c => c.id === l.colunaId);
      return col && col.nome === nome;
    }).length,
  }));

  // Origins pie chart
  const origensMap: Record<string, number> = {};
  crm.leads.forEach(l => {
    const origem = l.origem?.trim() || 'Não rastreável';
    origensMap[origem] = (origensMap[origem] || 0) + 1;
  });
  const origensData = Object.entries(origensMap).map(([name, value]) => ({ name, value }));

  const pieDataAgendamentos = [
    { name: 'Compareceu', value: compareceram },
    { name: 'Faltou', value: faltaram },
    { name: 'Agendado', value: agendamentosAgendados },
    { name: 'Cancelado', value: crm.agendamentos.filter((a) => a.status === 'cancelado').length },
  ].filter((d) => d.value > 0);

  const COLORS = ['hsl(221, 83%, 53%)', 'hsl(0, 84%, 60%)', 'hsl(38, 92%, 50%)', 'hsl(215, 16%, 47%)'];
  const ORIGEM_COLORS = ['hsl(221, 83%, 53%)', 'hsl(142, 71%, 45%)', 'hsl(38, 92%, 50%)', 'hsl(280, 67%, 52%)', 'hsl(0, 84%, 60%)', 'hsl(215, 16%, 47%)'];

  const stats = [
    { title: 'Total de Leads', value: totalLeads, icon: Users, color: 'text-primary' },
    { title: 'Pacientes', value: totalPacientes, icon: UserCheck, color: 'text-primary' },
    { title: 'Agendamentos', value: totalAgendamentos, icon: Calendar, color: 'text-primary' },
    { title: 'Taxa de Agendamento', value: `${taxaRendimento}%`, icon: TrendingUp, color: 'text-primary' },
    { title: 'Taxa de Conversão em Vendas', value: `${taxaConversaoVendas}%`, icon: ShoppingCart, color: 'text-primary' },
    { title: 'Taxa de Comparecimento', value: `${taxaComparecimento}%`, icon: Clock, color: 'text-primary' },
    { title: 'Orçamentos Aprovados', value: `${orcamentosAprovados}/${totalOrcamentos}`, icon: FileText, color: 'text-primary' },
  ];

  const tempoStats = [
    { title: 'Tempo Médio de Resposta', value: formatTempo(tempoMedioResposta), icon: Zap, color: 'text-orange-500', description: 'Tempo até primeira atividade' },
    { title: 'Tempo até Agendamento', value: formatTempo(tempoMedioAteAgendamento), icon: CalendarCheck, color: 'text-green-500', description: 'Da entrada do lead ao agendamento' },
    { title: 'Tempo até Compra', value: formatTempo(tempoMedioAteCompra), icon: Timer, color: 'text-purple-500', description: 'Do lead ao orçamento aprovado' },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Visão geral do Via clinic</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                <span className="text-xs text-muted-foreground">{stat.title}</span>
              </div>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {tempoStats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                <span className="text-xs text-muted-foreground">{stat.title}</span>
              </div>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">Funil de Vendas</CardTitle></CardHeader>
          <CardContent>
            {leadsPorColuna.some((d) => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={leadsPorColuna}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(221, 83%, 53%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-12">Adicione leads para ver o funil</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Status dos Agendamentos</CardTitle></CardHeader>
          <CardContent>
            {pieDataAgendamentos.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={pieDataAgendamentos} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {pieDataAgendamentos.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-12">Adicione agendamentos para ver estatísticas</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">Origens dos Leads</CardTitle></CardHeader>
          <CardContent>
            {origensData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={origensData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {origensData.map((_, i) => (
                      <Cell key={i} fill={ORIGEM_COLORS[i % ORIGEM_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-12">Adicione leads com origem para ver o gráfico</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
