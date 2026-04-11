# 🚀 Guia de Deploy no Hostinger

## ✅ Pré-requisitos

- ✅ Código no GitHub
- ✅ Build local funcionando (`npm run build`)
- ✅ Acesso ao Hostinger File Manager
- ✅ Supabase configurado e funcionando

---

## 📋 Passo a Passo

### 1. **Gerar Build Local**

```bash
npm run build
```

Isso cria a pasta `/dist` com:
- `index.html`
- `.htaccess` (importantíssimo!)
- `assets/` (JS + CSS)

### 2. **Acessar Hostinger File Manager**

1. Entre no Hostinger (https://hpanel.hostinger.com)
2. Vá para **Sites** → **viaclinic.site** → **File Manager**
3. Navegue até `/public_html/`

### 3. **Backup (Opcional)**

Se quiser manter a versão anterior:
```
Renomear: public_html → public_html_backup
```

### 4. **Upload dos Arquivos**

**Opção A: Upload Manual via File Manager**
1. Abra File Manager
2. Crie pasta `/public_html/`
3. Faça upload de todos os arquivos do `/dist`:
   - ✅ `index.html`
   - ✅ `.htaccess` (arquivo oculto - mostrar arquivos ocultos!)
   - ✅ `assets/` (pasta completa)

**Opção B: Via Git (Recomendado)**
Se Hostinger tem webhook do GitHub:
1. Faça push para GitHub
2. Hostinger faz deploy automático (se configurado)

### 5. **Verificar .htaccess**

⚠️ **IMPORTANTE**: O arquivo `.htaccess` deve estar em `/public_html/`

```bash
# Via SSH/Terminal Hostinger:
ls -la /public_html/ | grep htaccess
```

Se não existir, fazer upload manual.

---

## 🧪 Testes Após Deploy

### 1. **Acessar o Site**
```
https://viaclinic.site
```

### 2. **Verificar Console do Navegador** (F12)

❌ **NÃO deve ter:**
```
Failed to load module script: Expected a JavaScript module script but the server responded with a MIME type of 'text/html'
```

✅ **Deve ter:**
- Supabase logs: `[useSupabaseLeads] ✅ Carregados X leads`
- Nenhuma tela branca
- App carrega normalmente

### 3. **Verificar Network** (F12 → Network)

✅ **Todos os arquivos devem ter status 200:**
- `/index.html` → 200
- `/assets/index-xxx.js` → 200 (NÃO 404 ou 301)
- `/assets/index-xxx.css` → 200 (NÃO 404 ou 301)

❌ **Se ver:**
- 301 (Redirect) → Problema no `.htaccess`
- 404 (Not Found) → Arquivo não foi copiado
- MIME error → Assets estão sendo servidos como HTML

### 4. **Testar Funcionalidades**

1. Login funciona?
2. Leads aparecem do Supabase?
3. Pode criar novo lead?
4. Realtime funciona (abrir 2 abas)?
5. Console sem erros?

---

## 🔧 Troubleshooting

### ❌ Tela Branca / MIME Type Error

**Causa:** `.htaccess` não está correto ou não existe

**Solução:**
1. Verificar se `.htaccess` existe em `/public_html/`
2. Se não existir, fazer upload manual:
   ```
   Pegar: /dist/.htaccess
   Fazer upload para: /public_html/
   ```

### ❌ Recurso não encontrado (404)

**Causa:** Arquivo não foi copiado para `/public_html/`

**Solução:**
1. Deletar conteúdo de `/public_html/`
2. Fazer upload completo de `/dist/`
3. Verificar que `/assets/` foi copiada (dentro de `/public_html/`)

### ❌ Supabase não conecta

**Causa:** Variáveis de ambiente incorretas

**Solução:**
1. Verificar `.env.production`:
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```
2. Fazer novo build: `npm run build`
3. Fazer novo deploy

### ❌ CORS Error

**Causa:** Supabase não está permitindo requisições do domínio

**Solução:**
1. Ir ao Supabase Dashboard
2. Settings → Security
3. Verificar CORS headers
4. Adicionar: `https://viaclinic.site`

---

## 📊 Estrutura esperada em /public_html/

```
/public_html/
├── index.html              ← Arquivo principal
├── .htaccess               ← Regras de rewrite (CRÍTICO!)
└── assets/
    ├── index-xxx.js        ← Bundle JavaScript
    └── index-xxx.css       ← Styles
```

---

## ✅ Checklist Final

- [ ] Build local gerado (`npm run build`)
- [ ] Arquivo `.htaccess` copiado para `dist/`
- [ ] Conteúdo de `/dist` copiado para `/public_html/`
- [ ] `.htaccess` existe em `/public_html/`
- [ ] Site carrega sem tela branca
- [ ] Console sem MIME errors
- [ ] Network mostra status 200 para assets
- [ ] Supabase carrega dados
- [ ] Realtime funciona (teste com 2 abas)

---

## 🔗 Links Úteis

- 🏠 Site: https://viaclinic.site
- 📊 Supabase: https://supabase.com/dashboard
- 📁 Hostinger: https://hpanel.hostinger.com
- 📚 Documentação Vite: https://vitejs.dev/guide/

---

## 📞 Suporte

Se tiver dúvidas:
1. Verificar Console (F12 → Console)
2. Verificar Network (F12 → Network)
3. Verificar Application (F12 → Application → Cookies/Storage)

---

**Última atualização:** 2026-04-11
