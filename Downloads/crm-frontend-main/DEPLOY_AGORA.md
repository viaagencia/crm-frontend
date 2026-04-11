# 🚀 DEPLOY IMEDIATO - INSTRUÇÕES EXATAS

## ⚡ Problema Resolvido

✅ **Erro "Expected a JavaScript module script but the server responded with a MIME type of 'text/html'"**

**Causa:** Arquivo `.htaccess` faltava na pasta public_html

**Solução:** Agora o arquivo `.htaccess` está no repositório e é automaticamente copiado para `/dist` durante o build

---

## 📋 O Que Você Tem Agora

```
/dist/ (pronto para deploy)
├── index.html           ✅
├── .htaccess            ✅ (CRÍTICO!)
└── assets/
    ├── index-xxx.js     ✅
    └── index-xxx.css    ✅
```

---

## 🔄 Passo 1: Verificar Build Local (OPCional - já está feito)

```bash
npm run build
```

Saída esperada:
```
✓ 3241 modules transformed.
✓ built in 7.78s
```

---

## 📁 Passo 2: Preparar Arquivos para Upload

Copiar TUDO da pasta `/dist`:

```
C:\Users\santa\Downloads\crm-frontend-main\dist\
```

---

## 🔗 Passo 3: Acessar Hostinger File Manager

1. Acesse: https://hpanel.hostinger.com
2. Vá para: **Sites** → **viaclinic.site** → **File Manager**
3. Navegue para: `/public_html/`

---

## 📤 Passo 4: Upload dos Arquivos (Opção A - Manual)

### Via Drag & Drop:

1. **Deletar conteúdo antigo** (opcional):
   ```
   Selecionar tudo em /public_html/
   Clicar em Delete
   ```

2. **Upload dos arquivos do /dist:**
   - Arrastar pasta `/dist` para File Manager
   - Ou clicar em "Upload" e selecionar arquivos

### ⚠️ IMPORTANTE: Mostrar Arquivos Ocultos!

O `.htaccess` começa com ponto (é arquivo oculto):

1. No File Manager, clicar em **⚙️ Settings** (canto superior direito)
2. Ativar: ☑️ **"Show hidden files"**
3. Agora você verá `.htaccess`

---

## 📤 Passo 5: Upload dos Arquivos (Opção B - GitHub Webhook)

Se Hostinger tem webhook configurado:

1. Push já foi feito para GitHub ✅
2. Hostinger deve fazer deploy automático
3. Ir a: https://hpanel.hostinger.com/websites/viaclinic.site/deployments
4. Esperar o build completar

---

## ✅ Verificação Após Upload

### 1. Acessar o Site

```
https://viaclinic.site
```

**Resultado esperado:**
- ✅ Página carrega (sem tela branca)
- ✅ Logo "Via Clinic" aparece
- ✅ Login form visível

**Se ver tela branca:**
- Abrir DevTools (F12)
- Ver Console para erros
- Se tiver erro "Expected a JavaScript module script...", o `.htaccess` não foi copiado

---

### 2. Verificar Console (F12 → Console)

**❌ NÃO deve ter:**
```
Failed to load module script: Expected a JavaScript module script...
Module not found
404 Not Found
```

**✅ DEVE ter:**
```
[useSupabaseLeads] ✅ Carregados X leads
[useSupabaseLeads] 📡 Subscription ativa
```

---

### 3. Verificar Network (F12 → Network)

Clicar em cada arquivo e verificar **Status**:

| Arquivo | Status Esperado |
|---|---|
| `/` (index.html) | 200 ✅ |
| `/assets/index-xxx.js` | 200 ✅ |
| `/assets/index-xxx.css` | 200 ✅ |

❌ **NÃO deve ter:**
- 301 (Redirect) → Problema no `.htaccess`
- 404 (Not Found) → Arquivo não foi copiado
- Erro de MIME

---

## 🧪 Testes Funcionais

Após verificar que a página carrega:

### 1. Login
- [ ] Tela de login funciona
- [ ] Pode fazer login

### 2. Leads
- [ ] Leads aparecem (vindo do Supabase)
- [ ] Console mostra: `[useSupabaseLeads] ✅ Carregados X leads`

### 3. Realtime (IMPORTANTE)
- [ ] Abrir 2 abas do CRM
- [ ] Em uma aba: Criar novo lead
- [ ] **Na outra aba: Lead aparece em < 1 segundo** ✅
- [ ] Mover lead entre colunas
- [ ] **Mudança aparece em ambas as abas instantaneamente** ✅

### 4. Supabase
- [ ] Sem erros de conexão
- [ ] Sem erros de CORS
- [ ] Dados carregam corretamente

---

## 🆘 Se Tiver Erro

### Erro: "Expected a JavaScript module script..."

**Solução:**
1. Verificar se `.htaccess` existe em `/public_html/`
2. Se não existir, fazer upload manual do arquivo:
   ```
   Pegar: /dist/.htaccess
   Fazer upload para: /public_html/
   ```
3. Recarregar página (Ctrl+Shift+R)

### Erro: 404 em Assets

**Solução:**
1. Verificar se pasta `/assets` existe em `/public_html/`
2. Se não existir, fazer upload completo de `/dist/`

### Erro: CORS (Supabase)

**Solução:**
1. Ir ao Supabase Dashboard
2. Settings → Security → CORS
3. Adicionar: `https://viaclinic.site`

---

## 📊 Estrutura Final em /public_html

```
/public_html/
├── index.html              ← Arquivo principal da aplicação
├── .htaccess               ← CRÍTICO! Redireciona rotas para index.html
└── assets/
    ├── index-T-A3YpyX.js   ← Bundle JavaScript (pode ter hash diferente)
    └── index-DyW2VobZ.css  ← Styles (pode ter hash diferente)
```

---

## ✅ Checklist Final

- [ ] Build realizado localmente (`npm run build`)
- [ ] Conteúdo de `/dist` copiado para `/public_html`
- [ ] `.htaccess` existe em `/public_html` (mostrar arquivos ocultos!)
- [ ] Site abre sem tela branca
- [ ] Console sem erro de MIME
- [ ] Network mostra status 200 para assets
- [ ] Leads aparecem (vindos do Supabase)
- [ ] Realtime funciona (teste com 2 abas)
- [ ] Pode criar/editar/deletar leads
- [ ] Nenhuma referência ao Google Sheets

---

## 🎯 Resumo das Mudanças

| O Que | Antes | Agora |
|---|---|---|
| **Fonte de dados** | Google Sheets | ✅ Supabase |
| **Atualização** | 30s polling | ✅ Realtime (< 1s) |
| **Deploy** | Manual via dist | ✅ Com .htaccess correto |
| **Erro MIME** | ❌ Sim | ✅ Resolvido |
| **Tela branca** | ❌ Sim | ✅ Resolvida |

---

## 📞 Precisa de Ajuda?

Se tiver problemas:

1. **Verificar Console** (F12 → Console)
2. **Verificar Network** (F12 → Network)
3. **Verificar se .htaccess existe** em /public_html
4. **Limpar cache** (Ctrl+Shift+R)

---

**Status:** ✅ Pronto para deploy!

Última atualização: 2026-04-11
