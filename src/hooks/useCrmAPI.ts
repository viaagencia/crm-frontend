import { useState, useCallback } from 'react';
import { Lead, Paciente, Tarefa, Atividade, Anotacao, Pipeline } from '@/types/crm';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface CrmAPIContextType {
  // Leads
  getLeads: () => Promise<Lead[]>;
  createLead: (lead: Omit<Lead, 'id' | 'criadoEm'>) => Promise<Lead>;
  updateLead: (id: string, updates: Partial<Lead>) => Promise<Lead>;
  deleteLead: (id: string) => Promise<void>;

  // Pacientes
  getPacientes: () => Promise<Paciente[]>;
  createPaciente: (paciente: Omit<Paciente, 'id' | 'criadoEm'>) => Promise<Paciente>;
  updatePaciente: (id: string, updates: Partial<Paciente>) => Promise<Paciente>;
  deletePaciente: (id: string) => Promise<void>;

  // Tarefas
  getTarefas: () => Promise<Tarefa[]>;
  getTarefasByContato: (contatoId: string) => Promise<Tarefa[]>;
  createTarefa: (tarefa: Omit<Tarefa, 'id' | 'criadoEm'>) => Promise<Tarefa>;
  updateTarefa: (id: string, updates: Partial<Tarefa>) => Promise<Tarefa>;
  deleteTarefa: (id: string) => Promise<void>;

  // Atividades
  getAtividades: () => Promise<Atividade[]>;
  getAtividadesByContato: (contatoId: string) => Promise<Atividade[]>;
  createAtividade: (atividade: Omit<Atividade, 'id' | 'criadoEm'>) => Promise<Atividade>;
  updateAtividade: (id: string, updates: Partial<Atividade>) => Promise<Atividade>;
  deleteAtividade: (id: string) => Promise<void>;

  // Anotações
  getAnotacoes: () => Promise<Anotacao[]>;
  getAnotacoesByContato: (contatoId: string) => Promise<Anotacao[]>;
  createAnotacao: (anotacao: Omit<Anotacao, 'id' | 'criadoEm'>) => Promise<Anotacao>;
  updateAnotacao: (id: string, updates: Partial<Anotacao>) => Promise<Anotacao>;
  deleteAnotacao: (id: string) => Promise<void>;

  // Funis
  getFunis: () => Promise<Pipeline[]>;
  createFunil: (funil: Omit<Pipeline, 'id' | 'criadoEm'>) => Promise<Pipeline>;
  updateFunil: (id: string, updates: Partial<Pipeline>) => Promise<Pipeline>;
  deleteFunil: (id: string) => Promise<void>;

  // Estado
  loading: boolean;
  error: string | null;
}

export function useCrmAPI(usuarioId: string): CrmAPIContextType {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((err: unknown) => {
    const message = err instanceof Error ? err.message : 'Erro ao comunicar com o servidor';
    setError(message);
    console.error('CRM API Error:', message);
  }, []);

  // LEADS
  const getLeads = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/leads`);
      if (!res.ok) throw new Error('Erro ao buscar leads');
      return await res.json();
    } catch (err) {
      handleError(err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createLead = useCallback(
    async (lead: Omit<Lead, 'id' | 'criadoEm'>) => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/leads`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...lead, usuarioId }),
        });
        if (!res.ok) throw new Error('Erro ao criar lead');
        return await res.json();
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [usuarioId]
  );

  const updateLead = useCallback(
    async (id: string, updates: Partial<Lead>) => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/leads/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
        if (!res.ok) throw new Error('Erro ao atualizar lead');
        return await res.json();
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteLead = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/leads/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erro ao deletar lead');
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // PACIENTES
  const getPacientes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/pacientes`);
      if (!res.ok) throw new Error('Erro ao buscar pacientes');
      return await res.json();
    } catch (err) {
      handleError(err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createPaciente = useCallback(
    async (paciente: Omit<Paciente, 'id' | 'criadoEm'>) => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/pacientes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...paciente, usuarioId }),
        });
        if (!res.ok) throw new Error('Erro ao criar paciente');
        return await res.json();
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [usuarioId]
  );

  const updatePaciente = useCallback(
    async (id: string, updates: Partial<Paciente>) => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/pacientes/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
        if (!res.ok) throw new Error('Erro ao atualizar paciente');
        return await res.json();
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deletePaciente = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/pacientes/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erro ao deletar paciente');
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // TAREFAS
  const getTarefas = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/tarefas`);
      if (!res.ok) throw new Error('Erro ao buscar tarefas');
      return await res.json();
    } catch (err) {
      handleError(err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getTarefasByContato = useCallback(async (contatoId: string) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/tarefas/contato/${contatoId}`);
      if (!res.ok) throw new Error('Erro ao buscar tarefas');
      return await res.json();
    } catch (err) {
      handleError(err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createTarefa = useCallback(
    async (tarefa: Omit<Tarefa, 'id' | 'criadoEm'>) => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/tarefas`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...tarefa, usuarioId }),
        });
        if (!res.ok) throw new Error('Erro ao criar tarefa');
        return await res.json();
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [usuarioId]
  );

  const updateTarefa = useCallback(
    async (id: string, updates: Partial<Tarefa>) => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/tarefas/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
        if (!res.ok) throw new Error('Erro ao atualizar tarefa');
        return await res.json();
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteTarefa = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/tarefas/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erro ao deletar tarefa');
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ATIVIDADES
  const getAtividades = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/atividades`);
      if (!res.ok) throw new Error('Erro ao buscar atividades');
      return await res.json();
    } catch (err) {
      handleError(err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getAtividadesByContato = useCallback(async (contatoId: string) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/atividades/contato/${contatoId}`);
      if (!res.ok) throw new Error('Erro ao buscar atividades');
      return await res.json();
    } catch (err) {
      handleError(err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createAtividade = useCallback(
    async (atividade: Omit<Atividade, 'id' | 'criadoEm'>) => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/atividades`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...atividade, usuarioId }),
        });
        if (!res.ok) throw new Error('Erro ao criar atividade');
        return await res.json();
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [usuarioId]
  );

  const updateAtividade = useCallback(
    async (id: string, updates: Partial<Atividade>) => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/atividades/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
        if (!res.ok) throw new Error('Erro ao atualizar atividade');
        return await res.json();
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteAtividade = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/atividades/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erro ao deletar atividade');
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ANOTAÇÕES
  const getAnotacoes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/anotacoes`);
      if (!res.ok) throw new Error('Erro ao buscar anotações');
      return await res.json();
    } catch (err) {
      handleError(err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getAnotacoesByContato = useCallback(async (contatoId: string) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/anotacoes/contato/${contatoId}`);
      if (!res.ok) throw new Error('Erro ao buscar anotações');
      return await res.json();
    } catch (err) {
      handleError(err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createAnotacao = useCallback(
    async (anotacao: Omit<Anotacao, 'id' | 'criadoEm'>) => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/anotacoes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...anotacao, usuarioId }),
        });
        if (!res.ok) throw new Error('Erro ao criar anotação');
        return await res.json();
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [usuarioId]
  );

  const updateAnotacao = useCallback(
    async (id: string, updates: Partial<Anotacao>) => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/anotacoes/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
        if (!res.ok) throw new Error('Erro ao atualizar anotação');
        return await res.json();
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteAnotacao = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/anotacoes/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erro ao deletar anotação');
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // FUNIS
  const getFunis = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/funis`);
      if (!res.ok) throw new Error('Erro ao buscar funis');
      return await res.json();
    } catch (err) {
      handleError(err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createFunil = useCallback(
    async (funil: Omit<Pipeline, 'id' | 'criadoEm'>) => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/funis`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...funil, usuarioId }),
        });
        if (!res.ok) throw new Error('Erro ao criar funil');
        return await res.json();
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [usuarioId]
  );

  const updateFunil = useCallback(
    async (id: string, updates: Partial<Pipeline>) => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/funis/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
        if (!res.ok) throw new Error('Erro ao atualizar funil');
        return await res.json();
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteFunil = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/funis/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erro ao deletar funil');
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    getLeads, createLead, updateLead, deleteLead,
    getPacientes, createPaciente, updatePaciente, deletePaciente,
    getTarefas, getTarefasByContato, createTarefa, updateTarefa, deleteTarefa,
    getAtividades, getAtividadesByContato, createAtividade, updateAtividade, deleteAtividade,
    getAnotacoes, getAnotacoesByContato, createAnotacao, updateAnotacao, deleteAnotacao,
    getFunis, createFunil, updateFunil, deleteFunil,
    loading,
    error,
  };
}
