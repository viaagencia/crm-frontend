# 🚀 Configuração de Produção - viaclinic.site

Data: 10 de Abril de 2026  
Domínio: https://viaclinic.site  
Status: Frontend pronto para deploy

---

## ✅ ETAPAS CONCLUÍDAS (AUTOMÁTICO)

### ✅ ETAPA 1 - FRONTEND VITE
- [x] vite.config.ts verificado
- [x] `base: "./"` configurado ✅
- [x] Sem base: "/" ✅

### ✅ ETAPA 2 - REBUILD
- [x] npm install ✅
- [x] npm run build ✅
- [x] 3258 modules transformed ✅
- [x] CSS compilado (60.81 KB) ✅
- [x] Sem diretivas @tailwind ✅

### ✅ ETAPA 3 - ESTRUTURA DIST
- [x] dist/index.html (466 bytes)
- [x] dist/assets/index-DyW2VobZ.css (60 KB)
- [x] dist/assets/index-DeWYvFcJ.js (1.6 MB)

### ✅ ETAPA 4 - SPA CONFIGURATION
- [x] dist/.htaccess criado ✅
- [x] RewriteEngine configurado ✅
- [x] React Router routes configuradas ✅

---

## 📋 PRÓXIMAS ETAPAS (MANUAL)

### 📁 ETAPA 5 - FAZER UPLOAD PARA HOSTINGER

**1. Limpar /public_html:**
```bash
Remover:
- index.html (antigo)
- pasta assets/ (antiga)
- .builds/
- default.php
- Qualquer outro arquivo
```

**2. Upload dos arquivos:**

Fazer upload de DENTRO da pasta dist:
```
C:\Users\santa\Downloads\crm-frontend-main\dist\
    ├── index.html → /public_html/
    ├── .htaccess → /public_html/
    └── assets/ → /public_html/assets/
```

**Estrutura final em /public_html:**
```
/public_html/
├── .htaccess ✅ (ESSENCIAL para React Router)
├── index.html ✅
└── assets/ ✅
    ├── index-DyW2VobZ.css
    └── index-DeWYvFcJ.js
```

**⚠️ IMPORTANTE:**
- Suba DENTRO do dist, não a pasta dist inteira
- Mantenha o .htaccess na raiz de /public_html
- Não misture arquivos antigos com novos

---

### 🔐 ETAPA 6 - CONFIGURAR SUPABASE AUTH

**1. Acesse o Painel do Supabase:**
   - https://supabase.com/dashboard

**2. Vá para: Authentication → URL Configuration**

**3. Atualize:**

#### Site URL:
```
https://viaclinic.site
```

#### Redirect URLs (copie e cole exatamente):
```
https://viaclinic.site
https://viaclinic.site/**
```

**4. Clique em "Save"**

---

### 🔐 ETAPA 7 - CONFIGURAR GOOGLE OAUTH

**1. Acesse Google Cloud Console:**
   - https://console.cloud.google.com/

**2. Vá para: APIs & Services → Credentials**

**3. Encontre o OAuth 2.0 Client (seu app)**

**4. Clique para editar**

**5. Atualize:**

#### Authorized JavaScript origins (adicione):
```
https://viaclinic.site
```

#### Authorized redirect URIs (adicione):
```
https://viaclinic.site/google-callback
```

**6. Clique em "Save"**

**7. Copie:**
- Client ID
- Client Secret

**8. Atualize no .env da sua aplicação (se necessário):**
```
VITE_GOOGLE_CLIENT_ID=seu_novo_client_id
```

---

### 🧪 ETAPA 8 - VALIDAÇÃO FINAL

Após fazer upload de todos os arquivos, teste:

**1. Site abre:**
```
✅ Abra: https://viaclinic.site
✅ Deve carregar sem erros de 404
✅ CSS deve estar aplicado (estilizado)
```

**2. Testar Login com Email:**
```
✅ Clique em "Login"
✅ Digite email e senha
✅ Login deve funcionar
✅ Deve redirecionar para dashboard
```

**3. Testar Login com Google:**
```
✅ Clique em "Login com Google"
✅ Popup do Google deve abrir
✅ Selecione conta Google
✅ Deve redirecionar para viaclinic.site/google-callback
✅ Depois deve ir para dashboard
```

**4. Testar Rotas (React Router):**
```
✅ Clique em links de navegação (Leads, Agendamentos, etc)
✅ URL muda corretamente
✅ Recarregue a página (F5)
✅ Não deve dar erro 404
✅ Conteúdo deve carregar normalmente
```

**5. Testar em Diferentes URLs:**
```
✅ https://viaclinic.site/
✅ https://viaclinic.site/agendamentos
✅ https://viaclinic.site/leads
✅ https://viaclinic.site/perfil
```

---

## 📋 CHECKLIST DE DEPLOYMENT

### Antes de fazer upload:
- [ ] Verificou vite.config.ts (base: "./")
- [ ] Rodou npm run build com sucesso
- [ ] Verificou que dist/ contém todos os arquivos
- [ ] CSS foi compilado (sem @tailwind)
- [ ] .htaccess foi criado em dist/

### Durante o upload:
- [ ] Limpou /public_html completamente
- [ ] Fez upload de DENTRO da pasta dist
- [ ] .htaccess está em /public_html
- [ ] index.html está em /public_html
- [ ] assets/ está em /public_html/assets

### Após o upload:
- [ ] Acessou https://viaclinic.site
- [ ] Página carregou com CSS
- [ ] Login com email funciona
- [ ] Login com Google funciona
- [ ] Rotas não quebram ao recarregar

### Configurações externas:
- [ ] Supabase URL Configuration atualizada
- [ ] Google OAuth URLs atualizadas
- [ ] DNS apontado para Hostinger
- [ ] SSL/HTTPS funcionando

---

## 🔧 RESUMO TÉCNICO

### Domínio
```
https://viaclinic.site
```

### Tecnologia
```
Frontend: React + Vite
Autenticação: Supabase Auth
OAuth: Google
Hospedagem: Hostinger (/public_html)
```

### Arquivos para Upload
```
C:\Users\santa\Downloads\crm-frontend-main\dist\

Conteúdo:
- index.html (0.47 KB)
- .htaccess (214 bytes)
- assets/index-DyW2VobZ.css (60.81 KB)
- assets/index-DeWYvFcJ.js (1,624.09 KB)
```

### Configurações Externas
```
1. Supabase Auth URLs
2. Google OAuth Credentials
3. DNS e SSL no Hostinger
```

---

## ❓ TROUBLESHOOTING

### Problema: CSS não carrega
**Solução:**
- Verifique que assets/ está em /public_html/
- Limpe cache do navegador (Ctrl+Shift+Delete)
- Verifique o console do navegador

### Problema: Login quebra
**Solução:**
- Verifique Supabase URL Configuration
- Verifique Google OAuth Credentials
- Verifique console do navegador para erros

### Problema: Rotas quebram ao recarregar
**Solução:**
- Verifique .htaccess em /public_html
- Verifique se mod_rewrite está ativado
- Reinicie o servidor Hostinger

### Problema: 404 em assets
**Solução:**
- Verifique que index.html usa caminhos ./assets/
- Verifique que assets/ está na raiz de /public_html
- Verifique vite.config.ts tem base: "./"

---

## 🎉 Pronto para Produção!

✅ Frontend: **PRONTO**
✅ Build: **GERADO**
✅ Deploy: **PRONTO PARA UPLOAD**

Próximo passo: Fazer upload dos arquivos para Hostinger e configurar Supabase + Google OAuth!

---

**Gerado em:** 10 de Abril de 2026  
**Versão:** Tailwind CSS Compilado  
**Status:** Pronto para Deploy em viaclinic.site
