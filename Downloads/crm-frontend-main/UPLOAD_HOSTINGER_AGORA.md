# 🚀 UPLOAD PARA HOSTINGER - 3 PASSOS (5-10 MINUTOS)

**Build:** ✅ Compilado com sucesso
**Status:** 🟢 Pronto para upload
**Arquivos:** C:\Users\santa\Downloads\crm-frontend-main\dist\

---

## ⚡ PASSO 1: Acessar Hostinger (1 minuto)

1. Acesse: **https://hpanel.hostinger.com**
2. Faça login com suas credenciais
3. Clique: **Sites** → **viaclinic.site** → **File Manager**

**Você deve estar agora em: /public_html/**

---

## ⚠️ PASSO 2: Mostrar Arquivos Ocultos (CRÍTICO!)

Este passo é **SUPER IMPORTANTE** para o .htaccess aparecer!

1. No File Manager, clique em **⚙️ Settings** (canto superior direito)
2. Procure por: **"Show hidden files"** ou **"Mostrar arquivos ocultos"**
3. Marque a caixinha ☑️
4. Confirme

**Agora você deve ver arquivos começando com ponto (.) como `.htaccess`**

---

## 📤 PASSO 3: Upload dos Arquivos (3-5 minutos)

### Opção A: Drag & Drop (Mais Fácil)

1. No seu computador, abra a pasta:
   ```
   C:\Users\santa\Downloads\crm-frontend-main\dist\
   ```

2. Você vai ver:
   ```
   dist/
   ├── .htaccess          (arquivo oculto)
   ├── index.html
   └── assets/
       ├── index-8X1GA7ic.js
       └── index-DyW2VobZ.css
   ```

3. **Selecione TUDO** (Ctrl+A)

4. **Arraste** tudo para o File Manager (na pasta /public_html/)

5. **Espere** a barra de progresso terminar (pode levar 1-2 minutos)

### Opção B: Upload Manual (Se Drag & Drop não funcionar)

1. No File Manager, clique em **"Upload"**
2. Selecione os arquivos manualmente:
   - `index.html`
   - `.htaccess` (pode ser difícil de encontrar)
   - `assets/` (pasta inteira)
3. Clique em "Upload"
4. Espere terminar

---

## ✅ VERIFICAÇÃO RÁPIDA (2 minutos)

Depois do upload, **em /public_html/**, você deve ver:

```
/public_html/
├── .htaccess              ✅ (arquivo oculto)
├── index.html             ✅
└── assets/
    ├── index-8X1GA7ic.js  ✅
    └── index-DyW2VobZ.css ✅
```

**Se NÃO vir .htaccess:**
- Ative "Show hidden files" novamente
- Refaça o upload de dist/ ou do .htaccess manualmente

---

## 🧪 TESTE IMEDIATO (2 minutos)

Depois de fazer upload, abra:

```
https://viaclinic.site
```

### ✅ ESPERADO:
- Página carrega **sem tela branca**
- Logo "Via Clinic" aparece
- Formulário de login é visível
- Console (F12) **sem erro** "Expected a JavaScript module script..."

### ❌ PROBLEMA - Tela Branca:
1. Abra Console (F12)
2. Se vir erro "Expected a JavaScript module script..."
   - Significa .htaccess não foi copiado
   - Refaça o upload do .htaccess

---

## 🎯 TESTES FINAIS (5 minutos)

### TESTE 1: Fazer Login
```
1. Acesse https://viaclinic.site
2. Faça login com suas credenciais
3. ✅ ESPERADO: Redirecionado para página de leads
```

### TESTE 2: Leads Aparecem
```
1. Conectado, você deve ver leads na página
2. Console: [useSupabaseLeads] ✅ Carregados X leads
3. ✅ ESPERADO: Leads aparecem na página
```

### TESTE 3: Realtime (MAIS IMPORTANTE!)
```
1. Abra o CRM em 2 abas diferentes
2. Aba 1: Clique "+ Adicionar Lead"
3. Preencha dados (Nome, Telefone, Origem)
4. Clique "Salvar"
5. 
6. Aba 2: O novo lead DEVE aparecer em < 1 segundo
7. ✅ ESPERADO: Lead aparece UMA VEZ (sem duplicação!)
8. Se não aparecer em 1s → problema com realtime
9. Se aparecer 2x → problema com duplicação
```

### TESTE 4: Verificar Console
```
Abra Console (F12) e procure por:

✅ ESPERADO:
  [useSupabaseLeads] Carregando dados iniciais...
  [useSupabaseLeads] ✅ Carregados 5 leads
  [useSupabaseLeads] 📡 Criando subscription para realtime...
  [useSupabaseLeads] ✅ Subscription ativa

❌ NÃO DEVE VER:
  Failed to load module script: Expected a JavaScript module script...
  404 Not Found
  CORS error
```

---

## 🆘 TROUBLESHOOTING RÁPIDO

### ❌ Tela Branca / MIME Error
**Solução:** .htaccess não foi copiado
1. Ative "Show hidden files" em File Manager
2. Verifique se .htaccess existe em /public_html/
3. Se não existir, faça upload manual de: C:\...\dist\.htaccess
4. Recarregue página (Ctrl+Shift+R)

### ❌ 404 em Assets
**Solução:** Arquivos JS/CSS não foram copiados
1. Verifique se /public_html/assets/ existe
2. Se não, refaça upload completo de /dist/

### ❌ Leads não aparecem
**Solução:** Verifique Supabase
1. Abra Supabase Dashboard
2. Tabela "leads" deve ter dados
3. Se vazia, crie um lead manualmente via CRM

### ❌ Realtime não sincroniza
**Solução:** Verifique subscription
1. Abra Console (F12)
2. Procure por: "[useSupabaseLeads] ✅ Subscription ativa"
3. Se não houver, há erro na subscription
4. Recarregue página

---

## 📊 ARQUIVOS DO DEPLOY

| Arquivo | Tamanho | Status |
|---------|---------|--------|
| `dist/index.html` | 466 bytes | ✅ |
| `dist/.htaccess` | 1286 bytes | ✅ CRÍTICO! |
| `dist/assets/index-8X1GA7ic.js` | 1.3M | ✅ |
| `dist/assets/index-DyW2VobZ.css` | 60K | ✅ |
| **Total** | **~1.3M** | ✅ |

---

## ✅ CHECKLIST PRÉ-UPLOAD

- [x] Build compilado: ✅ 3241 módulos
- [x] .htaccess presente: ✅ dist/.htaccess
- [x] index.html presente: ✅
- [x] Assets presentes: ✅ JS + CSS
- [ ] Upload para Hostinger: ⏳ Próximo
- [ ] Show hidden files ativado: ⏳ Próximo
- [ ] Verificação de arquivo: ⏳ Próximo
- [ ] Testes manuais: ⏳ Próximo

---

## 🎉 APÓS COMPLETAR UPLOAD

1. ✅ Site acessível em https://viaclinic.site
2. ✅ Login funciona
3. ✅ Leads aparecem
4. ✅ Realtime sincroniza em < 1 segundo
5. ✅ Sem duplicação de leads
6. ✅ Console sem erros

**PRONTO! 🚀 Seu CRM está em produção com:
- ✅ Supabase (não Google Sheets)
- ✅ Realtime subscriptions
- ✅ Sem duplicação
- ✅ n8n integration funcionando**

---

## 📞 REFERÊNCIAS RÁPIDAS

| Item | Valor |
|---|---|
| **Site** | https://viaclinic.site |
| **Hostinger Panel** | https://hpanel.hostinger.com |
| **Supabase** | https://supabase.com/dashboard |
| **GitHub** | https://github.com/viaagencia/crm-frontend |
| **Arquivos** | C:\...\crm-frontend-main\dist\ |

---

## 🎯 RESUMO DOS 3 PASSOS

| Passo | O Quê | Tempo |
|-------|-------|-------|
| 1 | Acessar Hostinger | 1 min |
| 2 | Ativar "Show hidden files" | 1 min |
| 3 | Arrastar /dist/ para /public_html/ | 3-5 min |
| **TESTE** | Abrir https://viaclinic.site | 2 min |
| **TOTAL** | **Tudo pronto** | **7-10 min** |

---

**Bom sucesso! 🚀**

Qualquer dúvida, consulte:
- `FIX_DUPLICACAO_LEADS.md` - Explicação técnica
- `RESUMO_FIX_DUPLICACAO.txt` - Sumário rápido
- `DEPLOY_INSTRUCOES_COMPLETAS.md` - Guia detalhado

---

*Última atualização: 2026-04-10*
*Build: ✅ Pronto*
*Status: 🟢 Pronto para upload*
