const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Inicializar Groq apenas se a API key estiver configurada
let groq;
if (process.env.GROQ_API_KEY) {
  groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
  });
}

// Middlewares
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Gerador de Histórias API está funcionando!',
    groqConfigured: !!process.env.GROQ_API_KEY,
    timestamp: new Date().toISOString()
  });
});

// Rota principal da API
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

    // Se Groq não estiver configurado, usar simulação
    if (!groq) {
      const simulatedStory = `
# ${projectTitle}
**Cliente:** ${clientName}
**Data:** ${new Date().toLocaleDateString('pt-BR')}

---

## ��� História de Usuário

**Como** usuário do sistema
**Eu quero** ${description.split(' ').slice(0, 10).join(' ')}
**Para** melhorar a eficiência do processo

---

## ✅ Critérios de Aceitação

1. **Dado que** estou logado no sistema
   **Quando** acesso a funcionalidade
   **Então** devo conseguir realizar a ação

2. **Dado que** os dados estão corretos
   **Quando** submeto o formulário  
   **Então** o sistema deve processar com sucesso

---

## ��� Prioridade

**ALTA** - Funcionalidade essencial para o negócio

*⚠️ MODO SIMULAÇÃO - Configure GROQ_API_KEY para usar IA real*
      `;

      return res.json({
        success: true,
        story: simulatedStory,
        metadata: {
          projectTitle,
          clientName,
          generatedAt: new Date().toISOString(),
          tokensUsed: 0,
          mode: 'simulation'
        }
      });
    }

    // USANDO GROQ API REAL
    const systemPrompt = `Você é um especialista em engenharia de software e metodologias ágeis. 
Sua tarefa é criar histórias de usuário PROFISSIONAIS seguindo os critérios INVEST:

I – Independente: A história deve ser independente de outras
N – Negociável: Deve ser um lembrete para conversa, não contrato fixo
V – Valiosa: Deve entregar valor claro ao usuário final
E – Estimável: A equipe deve conseguir estimar o esforço
S – Pequena: Deve caber em uma sprint (2-4 semanas)
T – Testável: Com critérios de aceitação claros

Formato: "Como [usuário], eu quero [ação], para [benefício]"

Responda SEMPRE em PORTUGUÊS.`;

    const userPrompt = `Crie uma história de usuário COMPLETA e PROFISSIONAL baseada nestas informações:

PROJETO: ${projectTitle}
CLIENTE: ${clientName}
DESCRIÇÃO: ${description}

INSTRUÇÕES ESPECÍFICAS:

1. Siga RIGOROSAMENTE o formato INVEST
2. Inclua critérios de aceitação DETALHADOS (4-6 itens)
3. Considere: suporte multilíngue (PT/EN/ES), contexto de rede interna, integração com sistemas existentes
4. Seja ESPECÍFICO e PRÁTICO
5. Formate em Markdown

ENTREGUE:
- Título da história
- História no formato "Como... eu quero... para..."
- Descrição detalhada
- Critérios de aceitação (Dado que... Quando... Então...)
- Prioridade (Alta/Média/Baixa) com justificativa
- Estimativa (Story Points: 1-13)
- Notas técnicas relevantes`;

    console.log('��� Enviando para Groq API...');
    
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 2000,
      top_p: 1,
      stream: false
    });

    const generatedStory = chatCompletion.choices[0]?.message?.content || '';

    console.log('✅ História gerada com sucesso pela IA');

    res.json({
      success: true,
      story: generatedStory,
      metadata: {
        projectTitle,
        clientName,
        generatedAt: new Date().toISOString(),
        tokensUsed: chatCompletion.usage?.total_tokens || 0,
        mode: 'groq_ai'
      }
    });

  } catch (error) {
    console.error('❌ Erro ao gerar história:', error);
    
    if (error.message?.includes('API key')) {
      return res.status(401).json({ 
        error: 'Erro de autenticação com Groq API. Verifique sua API key.'
      });
    }

    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('��� BACKEND INICIADO!');
  console.log(`��� Porta: ${PORT}`);
  console.log(`��� Health: http://localhost:${PORT}/api/health`);
  console.log(`��� Groq API: ${process.env.GROQ_API_KEY ? '✅ CONFIGURADA' : '❌ NÃO CONFIGURADA (modo simulação)'}`);
  if (!process.env.GROQ_API_KEY) {
    console.log('��� Dica: Configure GROQ_API_KEY no arquivo .env para usar IA real');
  }
});
