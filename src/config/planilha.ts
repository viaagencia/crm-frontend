// ============================================================
//  CONFIGURAÇÃO DA PLANILHA DO GOOGLE SHEETS
//  Para trocar a planilha, basta alterar as URLs abaixo.
// ============================================================

// URL do método GET — busca leads da planilha (colunas: Nome, Número, Origem)
export const SHEETS_GET_URL =
  'https://script.google.com/macros/s/AKfycbxbsKHZQmBuMZHjsAUZI7-9xYVOkM5VqkIAcc3-2DC4VurClOkjjVg6tId-wSu-tC9-iA/exec';

// URL do método POST — envia ações ao Google Apps Script
// Ações suportadas: criar lead, apagar lead por número, atualizar etapa
export const SHEETS_POST_URL =
  'https://script.google.com/macros/s/AKfycbwznXmCz-TAFiY2nmVIF7pDONI0u4J4TTvkeH_oGKtlOAuxg90isFgKz2BiYYLu19DLtg/exec';
