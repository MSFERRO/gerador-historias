<<<<<<< HEAD
# ��� Gerador de Histórias de Usuário com IA

Sistema completo para gerar histórias de usuário profissionais a partir de requisitos do cliente usando IA (Groq).

![Status](https://img.shields.io/badge/status-active-success.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## ��� Características

- ✅ Geração automática de histórias de usuário com IA
- ✅ Interface intuitiva e responsiva
- ✅ Integração com Groq API (Llama 3.3 70B)
- ✅ Exportação para TXT/MD
- ✅ Cópia para área de transferência
- ✅ Critérios de aceitação detalhados
- ✅ Estimativas e priorização automática

## ��� Tecnologias

**Frontend:**
- React 18
- Tailwind CSS
- Lucide React (ícones)
- Axios

**Backend:**
- Node.js + Express
- Groq SDK
- CORS, Helmet
- Rate Limiting

## ��� Como Executar

### Pré-requisitos
```bash
node --version  # >= 18.0.0
npm --version   # >= 9.0.0
```

### 1. Obter API Key do Groq
1. Acesse: https://console.groq.com
2. Crie uma conta gratuita
3. Vá em "API Keys" → "Create API Key"
4. Copie a chave gerada

### 2. Configurar Backend
```bash
cd backend
npm install
cp .env.example .env
# Edite .env e adicione: GROQ_API_KEY=sua_chave_aqui
```

### 3. Configurar Frontend
```bash
cd frontend
npm install
cp .env.example .env
```

### 4. Executar

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm start
```

### 5. Acessar
- ��� Frontend: http://localhost:3000
- ��� Backend API: http://localhost:3001
- ❤️ Health Check: http://localhost:3001/health

## ��� Estrutura do Projeto
```
user-story-generator/
├── backend/
│   ├── src/
│   │   ├── config/          # Configurações (Groq)
│   │   ├── controllers/     # Lógica de negócio
│   │   ├── routes/          # Rotas da API
│   │   ├── middlewares/     # Middlewares
│   │   └── server.js        # Entry point
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   ├── services/        # API calls
│   │   ├── App.jsx
│   │   └── index.js
│   ├── public/
│   └── package.json
└── docs/                    # Documentação
```

## ��� API Endpoints

### Health Check
```http
GET /health
```

### Gerar História
```http
POST /api/story/generate
Content-Type: application/json

{
  "projectTitle": "Sistema de Vendas",
  "clientName": "Empresa XYZ",
  "description": "Sistema para gerenciar vendas e estoque"
}
```

## ��� Troubleshooting

**Backend não inicia:**
- Verifique se a porta 3001 está livre
- Confirme GROQ_API_KEY no arquivo .env

**Frontend não conecta:**
- Certifique-se que o backend está rodando
- Verifique REACT_APP_API_URL no .env

**Erro de API Key:**
- Verifique se a chave do Groq está correta
- Confirme que tem créditos disponíveis

## ��� Exemplo de Uso

1. Preencha o título do projeto
2. Adicione o nome do cliente
3. Descreva os requisitos (mínimo 20 caracteres)
4. Clique em "Gerar História de Usuário"
5. Aguarde a IA processar (5-10 segundos)
6. Copie ou baixe o resultado

## ��� Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:
- Reportar bugs
- Sugerir novas features
- Enviar pull requests

## ��� Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

## ���‍��� Autor

**MSFERRO**
- GitHub: [@MSFERRO](https://github.com/MSFERRO)

## ��� Agradecimentos

- [Groq](https://groq.com) - API de IA ultrarrápida
- [Llama 3.3](https://ai.meta.com/llama/) - Modelo de linguagem
- Comunidade Open Source

---
=======
# user-story-generator
Gerador de Histórias de Usuário com IA usando Groq API
>>>>>>> 9359b5f885c56b53a93e6b47346911a738e03d52
