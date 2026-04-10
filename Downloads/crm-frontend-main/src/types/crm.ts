export interface Atividade {
  id: string;
  tipo: 'ligacao' | 'mensagem';
  status: 'atendida' | 'nao_atendida' | 'respondida' | 'nao_respondida';
  observacao?: string;
  criadoEm: string;
}

export interface Lead {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  origem: string;
  pipelineId: string;
  colunaId: string;
  criadoEm: string;
  tarefas: Tarefa[];
  anotacoes: Anotacao[];
  agendamentos: string[];
  orcamentos: string[];
  atividades: Atividade[];
}

export interface Paciente {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  leadOriginalId?: string;
  colunaId: string;
  criadoEm: string;
  ultimoProcedimento?: string;
  tarefas: Tarefa[];
  anotacoes: Anotacao[];
  agendamentos: string[];
  orcamentos: string[];
  atividades: Atividade[];
}

export interface Coluna {
  id: string;
  nome: string;
  ordem: number;
  tipo: 'vendas' | 'pacientes';
}

export interface Pipeline {
  id: string;
  nome: string;
  colunas: Coluna[];
  criadoEm: string;
}

export interface Tarefa {
  id: string;
  titulo: string;
  status: 'pendente' | 'em_andamento' | 'concluida';
  prazo?: string;
  dataHora?: string;
  criadoEm: string;
}

export interface Anotacao {
  id: string;
  texto: string;
  criadoEm: string;
}

export interface Agendamento {
  id: string;
  contatoId: string;
  contatoTipo: 'lead' | 'paciente';
  contatoNome: string;
  data: string;
  hora: string;
  tipo: string;
  status: 'agendado' | 'compareceu' | 'faltou' | 'cancelado';
  observacoes?: string;
}

export interface Procedimento {
  id: string;
  nome: string;
  valor: number;
}

export interface Orcamento {
  id: string;
  contatoId: string;
  contatoTipo: 'lead' | 'paciente';
  procedimentos: Procedimento[];
  valorTotal: number;
  status: 'pendente' | 'aprovado' | 'reprovado' | 'negociacao';
  criadoEm: string;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  cargo: 'recepcao' | 'vendedor' | 'gestor';
  ativo: boolean;
}

export const PIPELINE_PADRAO: Pipeline = {
  id: 'pipeline-padrao',
  nome: 'Funil Principal',
  colunas: [
    { id: 'novo-lead', nome: 'Novo Lead', ordem: 0, tipo: 'vendas' },
    { id: 'contato-feito', nome: 'Contato Feito', ordem: 1, tipo: 'vendas' },
    { id: 'agendado', nome: 'Agendado', ordem: 2, tipo: 'vendas' },
    { id: 'compareceu', nome: 'Compareceu', ordem: 3, tipo: 'vendas' },
    { id: 'negociacao', nome: 'Negociação', ordem: 4, tipo: 'vendas' },
    { id: 'fechado', nome: 'Fechado', ordem: 5, tipo: 'vendas' },
    { id: 'perdido', nome: 'Perdido', ordem: 6, tipo: 'vendas' },
  ],
  criadoEm: new Date().toISOString(),
};

export const COLUNAS_PACIENTES_PADRAO: Coluna[] = [
  { id: 'em-tratamento', nome: 'Em Tratamento', ordem: 0, tipo: 'pacientes' },
  { id: 'aguardando-retorno', nome: 'Aguardando Retorno', ordem: 1, tipo: 'pacientes' },
  { id: 'retorno-agendado', nome: 'Retorno Agendado', ordem: 2, tipo: 'pacientes' },
  { id: 'tratamento-concluido', nome: 'Tratamento Concluído', ordem: 3, tipo: 'pacientes' },
  { id: 'inativo', nome: 'Inativo', ordem: 4, tipo: 'pacientes' },
];
