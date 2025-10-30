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

// 🔥 CONFIGURAÇÃO CORS COMPLETA
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

    console.log(`📝 Gerando história para: ${projectTitle} - ${clientName}`);

    let story;
    let tokensUsed = 0;
    let mode = 'groq-ai';

    // Usa Groq AI para gerar histórias reais
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `Você é um especialista em Agile, Scrum e Product Management. 
            Gere histórias de usuário PROFISSIONAIS e DETALHADAS no formato padrão.
            Use markdown para formatação.
            Inclua sempre:
            - Título claro
            - Descrição da história no formato "Como [persona], eu quero [ação], para [benefício]"
            - Critérios de aceitação detalhados (mínimo 3)
            - Prioridade (ALTA, MÉDIA, BAIXA)
            - Estimativa em pontos de story
            - Informações técnicas quando relevante
            
            Seja específico, prático e profissional.`
          },
          {
            role: "user",
            content: `Gere uma história de usuário completa e profissional para:
            
            PROJETO: ${projectTitle}
            CLIENTE: ${clientName}
            REQUISITOS: ${description}
            
            Gere uma história bem estruturada e útil para o time de desenvolvimento.`
          }
        ],
        model: "mixtral-8x7b-32768",
        temperature: 0.7,
        max_tokens: 1500,
        stream: false
      });

      story = completion.choices[0]?.message?.content;
      tokensUsed = completion.usage?.total_tokens || 0;
      
      console.log(`✅ História gerada com Groq AI. Tokens: ${tokensUsed}`);
      
    } catch (groqError) {
      console.error('❌ Erro no Groq:', groqError.message);
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
    console.error('❌ Erro no servidor:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Função de fallback para gerar histórias simuladas (apenas se Groq falhar)
function generateFallbackStory(projectTitle, clientName, description) {
  return `
# ${projectTitle}
**Cliente:** ${clientName}
**Data:** ${new Date().toLocaleDateString('pt-BR')}
**Status:** 📋 Pendente

---

## 📋 HISTÓRIA DE USUÁRIO

**Como** ${clientName}
**Eu quero** ${description.split(' ').slice(0, 15).join(' ')}
**Para** ${description.split(' ').slice(15, 25).join(' ') || 'melhorar a eficiência do processo'}

---

## ✅ CRITÉRIOS DE ACEITAÇÃO

- [ ] **Dado que** estou logado no sistema
- [ ] **Quando** acesso a funcionalidade  
- [ ] **Então** devo conseguir realizar a ação principal

- [ ] **Dado que** os dados estão corretos
- [ ] **Quando** submeto o formulário
- [ ] **Então** o sistema deve processar com sucesso

- [ ] **Dado que** ocorre um erro
- [ ] **Quando** o sistema identifica o problema
- [ ] **Então** deve exibir mensagem clara ao usuário

---

## 🎯 PRIORIDADE

**ALTA** - Funcionalidade essencial para o negócio

---

## 📊 INFORMAÇÕES TÉCNICAS

**Estimativa:** 5 pontos
**Sprint:** Backlog
**Responsável:** Time de Desenvolvimento
**Tipo:** Funcionalidade

---

## 💡 NOTAS ADICIONAIS

${description}

---

*História gerada automaticamente por Sinapsys Tecnologia - Modo Simulação (Groq indisponível)*
  `.trim();
}

// Rota para testar a conexão com Groq
app.get('/api/test-groq', async (req, res) => {
  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: "Diga apenas 'Groq conectado com sucesso!'" }],
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
    },
    groq: 'Configurado e ativo'
  });
});

// Manipulador de erros global
app.use((error, req, res, next) => {
  console.error('💥 Erro global:', error);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: 'Algo deu errado. Tente novamente.'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('🚀 BACKEND INICIADO COM GROQ AI!');
  console.log(`📍 Porta: ${PORT}`);
  console.log(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health: http://localhost:${PORT}/api/health`);
  console.log(`🤖 Groq: ✅ CONFIGURADO E ATIVO`);
  console.log(`🌍 CORS: ✅ Habilitado para produção`);
  console.log(`🎯 Frontend: https://gerador-historias-frontend.onrender.com`);
  console.log(`💡 Teste Groq: http://localhost:${PORT}/api/test-groq`);
});