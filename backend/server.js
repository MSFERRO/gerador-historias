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

// Middleware para requisições preflight
app.options('*', cors());

// Middlewares
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

// Rota principal para gerar histórias COM GROQ AI
app.post('/api/generate-story', async (req, res) => {
  try {
    const { projectTitle, clientName, description } = req.body;

    // Validação dos campos
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

    // Usa Groq AI para gerar histórias reais
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `Você é um analista de negócios senior especializado em documentação ágil.
            Gere histórias de usuário PROFISSIONAIS, FORMAL e BEM ESTRUTURADAS.
            
            FORMATO OBRIGATÓRIO (sem emojis, sem markdown, texto puro):
            
            HISTÓRIA DE USUÁRIO - [PROJETO]
            =================================
            
            INFORMAÇÕES GERAIS
            -----------------
            Projeto: [Nome do Projeto]
            ID: US-[número]
            Cliente: [Nome do Cliente] 
            Data: [data]
            Status: Pendente
            Prioridade: Alta
            Estimativa: 8 pontos
            
            DESCRIÇÃO
            ---------
            Como: [perfil do usuário]
            Preciso: [funcionalidade desejada]
            Para: [benefício/objetivo]
            
            CRITÉRIOS DE ACEITAÇÃO
            ---------------------
            1. [critério técnico específico]
            2. [critério de negócio]
            3. [critério de usabilidade]
            
            INFORMAÇÕES TÉCNICAS
            -------------------
            - Frontend: React
            - Backend: Node.js
            - Banco de Dados: A definir
            - API: REST
            
            OBSERVAÇÕES
            -----------
            [detalhes adicionais relevantes]
            
            RESPONSÁVEIS
            ------------
            Product Owner: [cliente]
            Time: Sinapsys Tecnologia
            
            ---
            Documento gerado por Sinapsys Tecnologia
            [data completa]`
          },
          {
            role: "user",
            content: `Gere uma história de usuário profissional para:
            Projeto: ${projectTitle}
            Cliente: ${clientName}
            Requisitos: ${description}
            
            Use formato formal sem emojis.`
          }
        ],
        model: "mixtral-8x7b-32768",
        temperature: 0.7,
        max_tokens: 1500,
        stream: false
      });

      story = completion.choices[0]?.message?.content;
      tokensUsed = completion.usage?.total_tokens || 0;
      
      console.log(`História gerada com Groq AI. Tokens: ${tokensUsed}`);
      
    } catch (groqError) {
      console.error('Erro no Groq:', groqError.message);
      // Fallback para modo simulação se Groq falhar
      story = generateFallbackStory(projectTitle, clientName, description);
      mode = 'simulação (fallback)';
    }

    // Resposta de sucesso
    res.json({
      success: true,
      story: story,
      metadata: {
        projectTitle,
        clientName,
        generatedAt: new Date().toISOString(),
        tokensUsed: tokensUsed,
        mode: mode,
        note: 'História gerada com Groq AI'
      }
    });

  } catch (error) {
    console.error('Erro no servidor:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

// FUNÇÃO DE FALLBACK PROFISSIONAL SEM EMOJIS
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
Para: ${description.split(' ').slice(15, 30).join(' ') || 'otimizar processos e melhorar eficiência operacional'}

CRITÉRIOS DE ACEITAÇÃO
----------------------
1. O sistema deve permitir ${description.split(' ').slice(0, 10).join(' ')} de forma intuitiva
2. A interface deve ser responsiva e compatível com dispositivos móveis
3. Os dados devem ser armazenados com segurança e backup automático
4. Deve gerar relatórios de operação em tempo real
5. O tempo de resposta deve ser inferior a 3 segundos para ações críticas

INFORMAÇÕES TÉCNICAS
--------------------
- Arquitetura: Frontend React com Backend Node.js
- Banco de Dados: MongoDB/PostgreSQL
- API: RESTful JSON
- Autenticação: JWT
- Hospedagem: Cloud

DETALHES DO REQUISITO
---------------------
${description}

OBSERVAÇÕES
-----------
- O projeto segue metodologia ágil Scrum
- Entregas incrementais a cada 2 semanas
- Revisões periódicas com o cliente
- Ambiente de homologação disponível para testes

RESPONSÁVEIS
------------
Product Owner: ${clientName}
Scrum Master: [A definir]
Time de Desenvolvimento: Sinapsys Tecnologia
Data de Revisão: ${new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}

---
Documento gerado por Sinapsys Tecnologia
${fullDateTime}
  `.trim();
}

// Rota para testar a conexão com Groq
app.get('/api/test-groq', async (req, res) => {
  try {
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

// Rota de fallback
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

// Manipulador de erros global
app.use((error, req, res, next) => {
  console.error('Erro global:', error);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: 'Algo deu errado. Tente novamente.'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('BACKEND INICIADO COM GROQ AI!');
  console.log(`Porta: ${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Health: http://localhost:${PORT}/api/health`);
  console.log(`Groq: ${process.env.GROQ_API_KEY ? 'CONFIGURADO' : 'NAO CONFIGURADO'}`);
  console.log(`Frontend: https://gerador-historias-frontend.onrender.com`);
});