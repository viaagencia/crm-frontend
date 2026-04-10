# 🚀 Guia de Deployment - Hostinger (viaclinic.site)

**Status da Validação Local:** ✅ TODOS OS ARQUIVOS VALIDADOS

---

## ✅ Validação Completa Realizada

### Arquivo: dist/index.html
```html
✅ Linha 8: <script type="module" src="./assets/index-DeWYvFcJ.js"></script>
✅ Linha 9: <link rel="stylesheet" href="./assets/index-DyW2VobZ.css">
✅ Caminhos: RELATIVOS (./assets/)
✅ Tamanho: 466 bytes
```

### Arquivo: dist/.htaccess
```apache
✅ RewriteEngine On
✅ RewriteBase /
✅ RewriteRule ^index\.html$ - [L]
✅ RewriteCond %{REQUEST_FILENAME} !-f
✅ RewriteCond %{REQUEST_FILENAME} !-d
✅ RewriteRule . /index.html [L]
✅ Tamanho: 214 bytes
```

### Estrutura: dist/
```
✅ dist/.htaccess (214 bytes)
✅ dist/index.html (466 bytes)
✅ dist/assets/index-DeWYvFcJ.js (1.6 MB)
✅ dist/assets/index-DyW2VobZ.css (60 KB)
✅ TOTAL: 4 arquivos, 1.7 MB
```

---

## 🔧 PASSO A PASSO - DEPLOYMENT NA HOSTINGER

### PASSO 1: Acessar File Manager da Hostinger

1. Abra https://hpanel.hostinger.com/
2. Faça login com suas credenciais
3. Clique em **"File Manager"**
4. Navegue para: **/home/[seu-user]/domains/viaclinic.site/public_html/**

---

### PASSO 2: Limpar Arquivos Antigos (IMPORTANTE!)

**❌ DELETE os seguintes arquivos:**
- [ ] `index.html` (antigo)
- [ ] Pasta `assets/` (antiga)
- [ ] `.builds/` (se existir)
- [ ] `default.php` (se existir)
- [ ] Qualquer outro arquivo que não seja necessário

**✅ MANTENHA apenas:**
- `.htaccess` (novo que vamos criar)
- E os novos arquivos que vamos fazer upload

**⚠️ IMPORTANTE:**
- Certifique-se de que `/public_html/` fica vazio ou apenas com arquivos novos
- Não misture arquivos antigos com novos!

---

### PASSO 3: Fazer Upload dos Arquivos

**Arquivo 1: index.html**
```
Local: C:\Users\santa\Downloads\crm-frontend-main\dist\index.html
Destino: /public_html/index.html
Tamanho: 466 bytes
```

**Arquivo 2: .htaccess**
```
Local: C:\Users\santa\Downloads\crm-frontend-main\dist\.htaccess
Destino: /public_html/.htaccess
Tamanho: 214 bytes
```

**Pasta 3: assets/ (completa)**
```
Local: C:\Users\santa\Downloads\crm-frontend-main\dist\assets\
Destino: /public_html/assets/

Contém:
  - index-DeWYvFcJ.js (1.6 MB)
  - index-DyW2VobZ.css (60 KB)
```

**Como fazer upload no File Manager:**

1. Clique em **"Upload"** no File Manager
2. Selecione os arquivos:
   - ✅ index.html
   - ✅ .htaccess
3. Clique em **"Upload"**
4. Aguarde a pasta assets/ ser criada (upload da pasta)
   - Se a pasta não aparecer, crie manualmente:
     1. Clique em **"New Folder"**
     2. Nome: `assets`
     3. Faça upload dos 2 arquivos para dentro de `assets/`

---

### PASSO 4: Validar Estrutura Final em /public_html

Após o upload, verificar se a estrutura está assim:

```
/public_html/
├── .htaccess ✅ (CRÍTICO - sem isso React Router quebra!)
├── index.html ✅
└── assets/ ✅
    ├── index-DeWYvFcJ.js ✅
    └── index-DyW2VobZ.css ✅
```

**No File Manager da Hostinger você deve ver:**
```
/public_html/
  📄 .htaccess
  📄 index.html
  📁 assets/
```

---

### PASSO 5: Verificar Permissões (Se Necessário)

1. Clique com botão direito em **`.htaccess`**
2. Clique em **"Change Permissions"**
3. Defina como: **644** ou **755**
4. Aplique

---

### PASSO 6: Limpar Cache (IMPORTANTE!)

Hostinger às vezes cacheia arquivos. Para limpar:

1. No painel Hostinger, vá em **"Settings"**
2. Procure por **"Caching"** ou **"Cache"**
3. Clique em **"Clear All Cache"** ou **"Flush Cache"**
4. Aguarde 1-2 minutos

---

### PASSO 7: Teste de Acesso

Abra seu navegador e teste:

1. **URL Principal:**
   ```
   https://viaclinic.site/
   ```
   ✅ Deve carregar a página
   ✅ Deve ver CSS aplicado (interface estilizada)
   ✅ Deve ver React funcionando (verifique console)

2. **Teste de Rotas:**
   ```
   https://viaclinic.site/agendamentos
   https://viaclinic.site/leads
   https://viaclinic.site/pacientes
   ```
   ✅ Não deve dar erro 404
   ✅ Deve carregar conteúdo
   ✅ Recarregue (F5) - não deve quebrar

3. **Teste de Assets:**
   - Abra DevTools (F12)
   - Clique em **"Console"**
   - ✅ Não deve haver erros em vermelho
   - ✅ Arquivos CSS/JS devem estar carregados

---

## ❌ Problema: Erro 404

Se receber erro 404:

### Causa 1: .htaccess não está em /public_html
**Solução:**
- Crie o arquivo `.htaccess` manualmente:
  1. No File Manager, clique em **"New File"**
  2. Nome: `.htaccess`
  3. Cole o conteúdo (veja abaixo)
  4. Salve

### Conteúdo do .htaccess:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### Causa 2: Arquivos assets/ não estão em /public_html/assets/
**Solução:**
- Verifique se a pasta `assets/` existe em `/public_html/`
- Se não existir, crie:
  1. Clique em **"New Folder"**
  2. Nome: `assets`
  3. Faça upload dos 2 arquivos (.js e .css) para dentro

### Causa 3: index.html tem caminhos absolutos
**Solução:**
- Verify em index.html (via File Manager → Edit):
  ```html
  ✅ CORRETO: src="./assets/index-DeWYvFcJ.js"
  ❌ ERRADO: src="/assets/index-DeWYvFcJ.js"
  ```

---

## 🧪 Checklist Final

### Antes do Upload:
- [ ] Localizei os arquivos em C:\Users\santa\Downloads\crm-frontend-main\dist\
- [ ] Arquivo .htaccess existe
- [ ] Arquivo index.html existe
- [ ] Pasta assets/ existe com 2 arquivos

### Durante o Upload:
- [ ] Limpei /public_html de arquivos antigos
- [ ] Fiz upload de index.html
- [ ] Fiz upload de .htaccess
- [ ] Fiz upload de assets/ com seus 2 arquivos

### Após o Upload:
- [ ] Verifiquei estrutura em File Manager:
  - [ ] .htaccess em /public_html/
  - [ ] index.html em /public_html/
  - [ ] assets/ em /public_html/ com 2 arquivos
- [ ] Acessei https://viaclinic.site
- [ ] Página carregou COM CSS (estilizada)
- [ ] Cliquei em links (mudou URL)
- [ ] Recarreguei página (não deu 404)
- [ ] Abri DevTools → Console (sem erros)
- [ ] Testei rotas adicionais (/agendamentos, /leads, etc)

---

## 📞 Troubleshooting

### "Página em branco"
**Causa:** Assets não carregando
**Solução:** 
- Verifique DevTools → Network
- CSS/JS devem estar com status 200
- Se 404, a pasta assets/ está errada

### "Erro 404 ao clicar em links"
**Causa:** .htaccess não está funcando
**Solução:**
- Verifique se .htaccess está em /public_html/
- Limpe cache do servidor
- Reinicie servidor Hostinger

### "CSS não está sendo aplicado"
**Causa:** Caminho do CSS está errado
**Solução:**
- Verifique em DevTools se CSS carregou
- Verifique se arquivo CSS existe em assets/
- Verify caminho em index.html: `./assets/index-DyW2VobZ.css`

### "JavaScript não executa"
**Causa:** JS não carregando ou erro de sintaxe
**Solução:**
- Abra DevTools → Console
- Veja erro específico
- Verifique se .js está em assets/
- Verifique caminho em index.html: `./assets/index-DeWYvFcJ.js`

---

## 📋 Resumo Técnico

**Domínio:** https://viaclinic.site  
**Diretório:** /public_html/  
**Framework:** React + Vite  
**Router:** React Router + .htaccess  
**Autenticação:** Supabase + Google OAuth  

**Arquivos a Subir:**
```
- .htaccess (SPA support)
- index.html (React root)
- assets/index-DeWYvFcJ.js (React app)
- assets/index-DyW2VobZ.css (Tailwind CSS)
```

**Tamanho Total:** 1.7 MB

---

## ✨ Status

- ✅ Frontend: Buildado e validado
- ✅ Arquivos: Estrutura correta
- ✅ .htaccess: Criado e validado
- ✅ CSS/JS: Compilado
- ✅ Caminhos: Relativos (corretos)
- ⏳ Deploy: Aguardando seu upload

**PRÓXIMO PASSO: Fazer upload dos arquivos para Hostinger seguindo os passos acima!**

---

**Gerado em:** 10 de Abril de 2026  
**Validação:** ✅ COMPLETA
