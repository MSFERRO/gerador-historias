# Ì∫Ä Quick Start Guide

## Instala√ß√£o R√°pida (5 minutos)

### 1. Pr√©-requisitos
```bash
node --version  # Deve ser >= 18
npm --version   # Deve ser >= 9
```

### 2. Obter API Key
1. Acesse: https://console.groq.com
2. Fa√ßa cadastro gratuito
3. Crie uma API Key
4. Copie a chave

### 3. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
nano .env  # ou vim/notepad
# Cole sua GROQ_API_KEY
```

### 4. Setup Frontend
```bash
cd ../frontend
npm install
```

### 5. Executar

**Terminal 1:**
```bash
cd backend
npm run dev
# Aguarde: "Ì∫Ä Servidor rodando na porta 3001"
```

**Terminal 2:**
```bash
cd frontend
npm start
# Abrir√° automaticamente http://localhost:3000
```

### 6. Testar
1. Abra http://localhost:3000
2. Preencha:
   - **Projeto:** Sistema de E-commerce
   - **Cliente:** Loja Virtual ABC
   - **Descri√ß√£o:** Preciso de um sistema de carrinho de compras com pagamento integrado
3. Clique em "Gerar"
4. Veja a m√°gica acontecer! ‚ú®

## ÌæØ Primeiros Passos

### Teste o Backend
```bash
curl http://localhost:3001/health
# Deve retornar: {"status":"OK",...}
```

### Teste a API
```bash
curl -X POST http://localhost:3001/api/story/generate \
  -H "Content-Type: application/json" \
  -d '{
    "projectTitle": "App de Delivery",
    "clientName": "Food Express",
    "description": "Sistema de pedidos online com rastreamento em tempo real"
  }'
```

## ‚ùì Problemas Comuns

### Porta 3001 ocupada
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <pid> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

### Erro "GROQ_API_KEY n√£o configurada"
```bash
cd backend
cat .env  # Verifique se a chave est√° presente
```

### Frontend n√£o abre automaticamente
- Abra manualmente: http://localhost:3000

## Ìæì Pr√≥ximos Passos

- Leia a [documenta√ß√£o completa](README.md)
- Veja a [documenta√ß√£o da API](docs/API.md)
- Configure para [deploy](docs/DEPLOYMENT.md)

---

Ì≤° **Dica:** Mantenha os dois terminais abertos durante o desenvolvimento!
