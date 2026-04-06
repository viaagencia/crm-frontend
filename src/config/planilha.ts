// Configuração do Google Sheets para sincronização
// Essas URLs devem ser substituídas pelos valores reais do seu Google Apps Script

export const SHEETS_GET_URL = process.env.VITE_SHEETS_GET_URL || '';
export const SHEETS_POST_URL = process.env.VITE_SHEETS_POST_URL || '';

// Se as URLs não estiverem configuradas, a sincronização será desabilitada
export const SHEETS_ENABLED = !!(SHEETS_GET_URL && SHEETS_POST_URL);
