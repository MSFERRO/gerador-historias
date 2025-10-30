const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Inicializar Groq com sua API Key
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// CONFIGURAÇÃO CORS COMPLETA
app.use(cors({
  origin: [
    'https://gerador-historias-frontend.onrender.com',
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.options('*', cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Gerador de Histórias API está funcionando!',
    groqConfigured: !!process.env.GROQ_API_KEY,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rota para testar Groq
app.get('/api/test-groq', async (req, res) => {
  try {
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'Groq API Key não configurada'
      });
    }

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: "Responda apenas: Conexão Groq estabelecida com sucesso" }],
      model: "mixtral-8x7b-32768",
      max_tokens: 20
    });

    res.json({
      success: true,
      message: completion.choices[0]?.message?.content,
      groqStatus: 'Conectado e funcionando'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Falha na conexão com Groq',
      message: error.message
    });
  }
});

// Rota principal para gerar histórias
app.post('/api/generate-story', async (req, res) => {
  try {
    const { projectTitle, clientName, description } = req.body;

    if (!projectTitle || !clientName || !description) {
      return res.status(400).json({
        error: 'Todos os campos são obrigatórios',
        fields: {
          projectTitle: !projectTitle,
          clientName: !clientName, 
          description: !description
        }
      });
    }

    if (description.length < 20) {
      return res.status(400).json({
        error: 'A descrição deve ter pelo menos 20 caracteres',
        currentLength: description.length
      });
    }

    console.log(`Gerando história para: ${projectTitle} - ${clientName}`);

    let story;
    let tokensUsed = 0;
    let mode = 'groq-ai';

    if (process.env.GROQ_API_KEY) {
      try {
        const completion = await groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content: `Você é um analista de negócios senior. Gere histórias de usuário PROFISSIONAIS e FORMAL.
              
FORMATO OBRIGATÓRIO (sem emojis, texto puro):

HISTÓRIA DE USUÁRIO - [PROJETO]
================================

INFORMAÇÕES GERAIS
------------------
Projeto: [Nome]
ID: US-[número]
Cliente: [Cliente]
Data: [data]
Status: Pendente
Prioridade: Alta
Estimativa: 8 pontos

DESCRIÇÃO
---------
Como: [perfil]
Preciso: [funcionalidade]
Para: [benefício]

CRITÉRIOS DE ACEITAÇÃO
----------------------
1. [critério técnico]
2. [critério negócio]
3. [critério usabilidade]

INFORMAÇÕES TÉCNICAS
--------------------
- Frontend: React
- Backend: Node.js
- Banco: A definir

RESPONSÁVEIS
------------
Product Owner: [cliente]
Time: Sinapsys Tecnologia

---
Documento gerado por Sinapsys Tecnologia
[data]`
            },
            {
              role: "user",
              content: `Gere história profissional para:
Projeto: ${projectTitle}
Cliente: ${clientName}
Requisitos: ${description}`
            }
          ],
          model: "mixtral-8x7b-32768",
          temperature: 0.7,
          max_tokens: 1500
        });

        story = completion.choices[0]?.message?.content;
        tokensUsed = completion.usage?.total_tokens || 0;
        console.log(`História Groq. Tokens: ${tokensUsed}`);
        
      } catch (groqError) {
        console.error('Erro Groq:', groqError.message);
        story = generateFallbackStory(projectTitle, clientName, description);
        mode = 'simulação (fallback)';
      }
    } else {
      story = generateFallbackStory(projectTitle, clientName, description);
      mode = 'simulação';
    }

    res.json({
      success: true,
      story: story,
      metadata: {
        projectTitle,
        clientName,
        generatedAt: new Date().toISOString(),
        tokensUsed: tokensUsed,
        mode: mode,
        note: process.env.GROQ_API_KEY ? 'Groq AI' : 'Modo simulação'
      }
    });

  } catch (error) {
    console.error('Erro servidor:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

// Função fallback profissional
function generateFallbackStory(projectTitle, clientName, description) {
  const currentDate = new Date().toLocaleDateString('pt-BR');
  const fullDateTime = new Date().toLocaleString('pt-BR');
  const storyId = `US-${Date.now().toString().slice(-6)}`;
  
  return `
HISTÓRIA DE USUÁRIO - ${projectTitle.toUpperCase()}
==================================================

INFORMAÇÕES GERAIS
------------------
Projeto: ${projectTitle}
ID: ${storyId}
Cliente: ${clientName}
Data: ${currentDate}
Status: Pendente
Prioridade: Alta
Estimativa: 8 pontos

DESCRIÇÃO
---------
Como: ${clientName}
Preciso: ${description.split(' ').slice(0, 15).join(' ')}
Para: ${description.split(' ').slice(15, 30).join(' ') || 'otimizar processos operacionais'}

CRITÉRIOS DE ACEITAÇÃO
----------------------
1. Sistema deve permitir ${description.split(' ').slice(0, 10).join(' ')} de forma intuitiva
2. Interface responsiva e compatível com dispositivos móveis
3. Dados armazenados com segurança e backup automático
4. Relatórios de operação em tempo real
5. Tempo de resposta inferior a 3 segundos

INFORMAÇÕES TÉCNICAS
--------------------
- Arquitetura: Frontend React + Backend Node.js
- Banco de Dados: MongoDB/PostgreSQL
- API: RESTful JSON
- Autenticação: JWT
- Hospedagem: Cloud

DETALHES DO REQUISITO
---------------------
${description}

RESPONSÁVEIS
------------
Product Owner: ${clientName}
Time de Desenvolvimento: Sinapsys Tecnologia
Data de Revisão: ${new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}

---
Documento gerado por Sinapsys Tecnologia
${fullDateTime}
  `.trim();
}

app.get('*', (req, res) => {
  res.json({
    message: 'Gerador de Histórias API - Sinapsys Tecnologia',
    version: '1.0.0',
    status: 'Operacional',
    endpoints: {
      health: 'GET /api/health',
      generate: 'POST /api/generate-story',
      testGroq: 'GET /api/test-groq'
    }
  });
});

app.use((error, req, res, next) => {
  console.error('Erro global:', error);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: 'Tente novamente.'
  });
});

app.listen(PORT, () => {
  console.log('BACKEND INICIADO!');
  console.log(`Porta: ${PORT}`);
  console.log(`Groq: ${process.env.GROQ_API_KEY ? 'CONFIGURADO' : 'NAO CONFIGURADO'}`);
});
