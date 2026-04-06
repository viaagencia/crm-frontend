export interface Coluna {
  id: string;
  nome: string;
  ordem: number;
  tipo: 'vendas' | 'pacientes';
}

export interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status?: string;
  funnel_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Paciente {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Tarefa {
  id: string;
  name?: string;
  description?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Atividade {
  id: string;
  description?: string;
  type?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Agendamento {
  id: string;
  title?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Orcamento {
  id: string;
  title?: string;
  amount?: number;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Anotacao {
  id: string;
  content?: string;
  created_at?: string;
  updated_at?: string;
}
