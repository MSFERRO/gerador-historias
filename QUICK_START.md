# � Quick Start Guide

## Instalação Rápida (5 minutos)

### 1. Pré-requisitos
```bash
node --version  # Deve ser >= 18
npm --version   # Deve ser >= 9
```

### 2. Obter API Key
1. Acesse: https://console.groq.com
2. Faça cadastro gratuito
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
# Aguarde: "� Servidor rodando na porta 3001"
```

**Terminal 2:**
```bash
cd frontend
npm start
# Abrirá automaticamente http://localhost:3000
```

### 6. Testar
1. Abra http://localhost:3000
2. Preencha:
   - **Projeto:** Sistema de E-commerce
   - **Cliente:** Loja Virtual ABC
   - **Descrição:** Preciso de um sistema de carrinho de compras com pagamento integrado
3. Clique em "Gerar"
4. Veja a mágica acontecer! ✨

## � Primeiros Passos

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

## ❓ Problemas Comuns

### Porta 3001 ocupada
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <pid> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

### Erro "GROQ_API_KEY não configurada"
```bash
cd backend
cat .env  # Verifique se a chave está presente
```

### Frontend não abre automaticamente
- Abra manualmente: http://localhost:3000

## � Próximos Passos

- Leia a [documentação completa](README.md)
- Veja a [documentação da API](docs/API.md)
- Configure para [deploy](docs/DEPLOYMENT.md)

---

� **Dica:** Mantenha os dois terminais abertos durante o desenvolvimento!
