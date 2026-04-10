import { useLocalStorage } from './useLocalStorage';

const DEFAULT_ORIGENS = ['Instagram', 'Google', 'Tráfego Pago', 'Indicação', 'Google Sheets'];

export function useOrigemOptions() {
  const [origens, setOrigens] = useLocalStorage<string[]>('crm-origens', DEFAULT_ORIGENS);

  const addOrigem = (nome: string) => {
    const trimmed = nome.trim();
    if (!trimmed || origens.includes(trimmed)) return;
    setOrigens(prev => [...prev, trimmed]);
  };

  const removeOrigem = (nome: string) => {
    setOrigens(prev => prev.filter(o => o !== nome));
  };

  return { origens, addOrigem, removeOrigem };
}
