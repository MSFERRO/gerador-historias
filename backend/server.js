const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ✅ MIDDLEWARE UTF-8 GARANTIDO
app.use((req, res, next) => {
  res.header('Content-Type', 'application/json; charset=utf-8');
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

// ✅ CONFIGURAÇÃO GROQ IA
let groq;
try {
  if (process.env.GROQ_API_KEY) {
    groq = require('groq-sdk');
    groq = new groq({ apiKey: process.env.GROQ_API_KEY });
    console.log('🚀 Groq IA Configurado - Modo IA Ativo');
  } else {
    console.log('⚠️  Groq API Key não encontrada - Modo Inteligente Ativo');
  }
} catch (error) {
  console.log('❌ Erro ao carregar Groq SDK - Modo Inteligente Ativo');
}

// ✅ FUNÇÃO IA COM GROQ - VERSÃO PROFISSIONAL
async function generateWithAI(projectTitle, clientName, description) {
  // Se não tiver Groq configurado, usa fallback
  if (!groq) {
    return await generateFallbackStory(projectTitle, clientName, description);
  }

  try {
    const prompt = `
# CONTEXTO:
Você é um Product Owner Sênior e Especialista em Análise de Requisitos com 15 anos de experiência.

# TAREFA:
Analise os requisitos abaixo e gere uma HISTÓRIA DE USUÁRIO PROFISSIONAL e COMPLETA seguindo o padrão:

"COMO [persona], QUERO [ação/objetivo], PARA [benefício/valor]"

# DADOS DO PROJETO:
- **Sistema/Projeto:** ${projectTitle}
- **Cliente/Empresa:** ${clientName}
- **Descrição dos Requisitos:** ${description}

# INSTRUÇÕES DETALHADAS:

## 1. ESTRUTURA DA HISTÓRIA:
- Persona: Identifique o papel específico do usuário
- Objetivo: Ação principal que o usuário deseja realizar
- Benefício: Valor ou resultado esperado

## 2. CRITÉRIOS DE ACEITAÇÃO (Mínimo 5):
- Funcionais: O que o sistema deve fazer
- Técnicos: Requisitos de qualidade
- UX/UI: Experiência do usuário
- Segurança: Aspectos de proteção
- Performance: Desempenho esperado

## 3. CENÁRIOS DE TESTE (Mínimo 3):
- Cenário principal (fluxo feliz)
- Cenário alternativo (fluxos excepcionais)
- Cenário de erro (tratamento de exceções)

## 4. REQUISITOS NÃO FUNCIONAIS:
- Performance, segurança, usabilidade, confiabilidade

## 5. OBSERVAÇÕES TÉCNICAS:
- Considerações para desenvolvimento
- Dependências técnicas
- Riscos identificados

# FORMATAÇÃO DE SAÍDA:
Use formatação profissional com seções claras, marcadores e estrutura organizada.
Destaque informações importantes.

Use português brasileiro claro e técnico.
    `;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Você é um Product Owner Sênior especializado em metodologias ágeis. 
          Sua missão é transformar requisitos em histórias de usuário profissionais, 
          completas e prontas para desenvolvimento.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama3-8b-8192",
      temperature: 0.7,
      max_tokens: 4096,
      top_p: 0.9,
      stream: false,
    });

    const aiResponse = completion.choices[0]?.message?.content;
    
    if (!aiResponse || aiResponse.length < 100) {
      throw new Error('Resposta da IA muito curta');
    }

    return formatAIResponse(aiResponse, projectTitle, clientName);

  } catch (error) {
    console.error('❌ Erro na IA Groq:', error.message);
    return await generateFallbackStory(projectTitle, clientName, description);
  }
}

// ✅ FORMATA A RESPOSTA DA IA
function formatAIResponse(aiContent, projectTitle, clientName) {
  return `
SISTEMA: ${projectTitle.toUpperCase()}
CLIENTE: ${clientName}
DATA: ${new Date().toLocaleDateString('pt-BR')}
VERSÃO: 4.0 - IA Groq Powered

================================================================================
HISTÓRIA DE USUÁRIO GERADA POR IA
================================================================================

${aiContent}

================================================================================
INFORMAÇÕES TÉCNICAS
================================================================================

- **Gerado por:** Groq IA (Modelo LLaMA 3)
- **Timestamp:** ${new Date().toLocaleString('pt-BR')}
- **Processamento:** Análise contextual profunda
- **Status:** Pronto para desenvolvimento

================================================================================
PRÓXIMOS PASSOS RECOMENDADOS
================================================================================

1. ✅ Revisão da história com stakeholders
2. ✅ Refinamento com equipe de desenvolvimento  
3. ✅ Estimativa de esforço (story points)
4. ✅ Planejamento de sprint
5. ✅ Definição de critérios de done

================================================================================

DOCUMENTO GERADO POR IA GROQ - SINAPSYS TECNOLOGIA
${new Date().toLocaleString('pt-BR')}
VERSÃO 4.0 - PROCESSAMENTO POR INTELIGÊNCIA ARTIFICIAL
  `.trim();
}

// ✅ FUNÇÃO FALLBACK INTELIGENTE
async function generateFallbackStory(projectTitle, clientName, description) {
  const extractRole = () => {
    const patterns = [
      /como\s+(um|uma)?\s+([^,.\n]+)/i,
      /como\s+([^,.\n]+)/i,
      /sou\s+([^,.\n]+)/i,
      /atuo\s+como\s+([^,.\n]+)/i
    ];
    
    for (const pattern of patterns) {
      const match = description.match(pattern);
      if (match && match[2]) return match[2].trim();
      if (match && match[1]) return match[1].trim();
    }
    return 'Analista de Negócios';
  };

  const extractMainGoal = () => {
    const patterns = [
      /eu\s+gostaria\s+de\s+([^.!?]+)/i,
      /eu\s+quero\s+([^.!?]+)/i,
      /eu\s+preciso\s+([^.!?]+)/i,
      /desejo\s+([^.!?]+)/i,
      /objetivo[^.!?]*?([^.!?]+)/i,
      /necessito\s+([^.!?]+)/i
    ];
    
    for (const pattern of patterns) {
      const match = description.match(pattern);
      if (match && match[1]) {
        let result = match[1].trim();
        result = result.replace(/,\s*(para|que|de|a|o)\s*$/i, '').trim();
        if (result.length > 5) return result;
      }
    }
    
    const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 10);
    return sentences[0]?.substring(0, 150) || description.substring(0, 100) + '...';
  };

  const extractBenefit = () => {
    const patterns = [
      /para\s+([^.!?]+)/i,
      /de\s+forma\s+que\s+([^.!?]+)/i,
      /com\s+o\s+objetivo\s+de\s+([^.!?]+)/i,
      /visando\s+([^.!?]+)/i,
      /a\s+fim\s+de\s+([^.!?]+)/i
    ];
    
    for (const pattern of patterns) {
      const match = description.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    return 'otimizar processos e melhorar a eficiência operacional';
  };

  const descLower = description.toLowerCase();

  const generateCriteria = () => {
    const criteria = [];
    
    // Critérios baseados no contexto
    if (descLower.includes('login') || descLower.includes('autenticação') || descLower.includes('senha')) {
      criteria.push('✅ Sistema deve validar credenciais de forma segura');
      criteria.push('✅ Deve implementar timeout de sessão');
      criteria.push('✅ Precisa ter recuperação de senha');
      criteria.push('✅ Deve registrar tentativas de acesso');
    }
    
    if (descLower.includes('relatório') || descLower.includes('relatorio') || descLower.includes('pdf') || descLower.includes('excel')) {
      criteria.push('✅ Relatório deve conter dados consistentes e atualizados');
      criteria.push('✅ Exportação em múltiplos formatos (PDF, Excel)');
      criteria.push('✅ Filtros dinâmicos e personalizáveis');
      criteria.push('✅ Performance otimizada para grandes volumes');
    }
    
    if (descLower.includes('cadastro') || descLower.includes('registro') || descLower.includes('incluir')) {
      criteria.push('✅ Validação de campos obrigatórios');
      criteria.push('✅ Prevenção de duplicidade');
      criteria.push('✅ Confirmação de operação bem-sucedida');
      criteria.push('✅ Mensagens de erro claras e objetivas');
    }
    
    if (descLower.includes('consulta') || descLower.includes('buscar') || descLower.includes('pesquisar')) {
      criteria.push('✅ Interface de busca intuitiva e rápida');
      criteria.push('✅ Filtros avançados e combináveis');
      criteria.push('✅ Paginação para grandes resultados');
      criteria.push('✅ Ordenação por múltiplos critérios');
    }
    
    // Critérios universais
    criteria.push('✅ Interface responsiva e acessível');
    criteria.push('✅ Tempo de resposta inferior a 3 segundos');
    criteria.push('✅ Tratamento adequado de erros e exceções');
    criteria.push('✅ Documentação técnica atualizada');
    criteria.push('✅ Testes automatizados cobrindo fluxos críticos');
    
    return criteria.join('\n');
  };

  const generateTestScenarios = () => {
    const scenarios = [];
    
    scenarios.push('## 🔄 Cenário Principal - Fluxo Feliz');
    scenarios.push('**Dado** que o usuário acessa o sistema com credenciais válidas');
    scenarios.push('**Quando** executa a funcionalidade principal com dados corretos');
    scenarios.push('**Então** deve obter o resultado esperado com confirmação');
    
    scenarios.push('\n## ⚠️ Cenário Alternativo - Dados Parciais');
    scenarios.push('**Dado** que o usuário preenche apenas campos obrigatórios');
    scenarios.push('**Quando** submete o formulário');
    scenarios.push('**Então** sistema deve processar e sugerir complementos');
    
    scenarios.push('\n## ❌ Cenário de Exceção - Dados Inválidos');
    scenarios.push('**Dado** que o usuário insere informações inconsistentes');
    scenarios.push('**Quando** tenta prosseguir com a operação');
    scenarios.push('**Então** deve receber mensagens específicas de correção');
    
    return scenarios.join('\n');
  };

  return `
SISTEMA: ${projectTitle.toUpperCase()}
CLIENTE: ${clientName}
DATA: ${new Date().toLocaleDateString('pt-BR')}
VERSÃO: 4.0 - Processamento Inteligente

================================================================================
HISTÓRIA DE USUÁRIO
================================================================================

**COMO** ${extractRole()}
**QUERO** ${extractMainGoal()}
**PARA** ${extractBenefit()}

================================================================================
DESCRIÇÃO DETALHADA
================================================================================

${description}

================================================================================
CRITÉRIOS DE ACEITAÇÃO
================================================================================

${generateCriteria()}

================================================================================
CENÁRIOS DE TESTE
================================================================================

${generateTestScenarios()}

================================================================================
REQUISITOS NÃO FUNCIONAIS
================================================================================

- **Performance:** Tempo de resposta < 3s para 95% das requisições
- **Segurança:** Autenticação e autorização implementadas
- **Usabilidade:** Interface intuitiva seguindo heurísticas de Nielsen
- **Confiabilidade:** Disponibilidade de 99.5% em produção
- **Manutenibilidade:** Código documentado e testado

================================================================================
INFORMAÇÕES TÉCNICAS
================================================================================

- **Processamento:** Análise inteligente de padrões
- **Características detectadas:** ${descLower.includes('login') ? 'Autenticação' : ''} ${descLower.includes('relatório') ? 'Relatórios' : ''} ${descLower.includes('cadastro') ? 'Cadastros' : ''}
- **Status:** Pronto para refinamento técnico

================================================================================

DOCUMENTO GERADO POR PROCESSAMENTO INTELIGENTE
SINAPSYS TECNOLOGIA - ${new Date().toLocaleString('pt-BR')}
VERSÃO 4.0 - ANÁLISE DE PADRÕES AVANÇADA
  `.trim();
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend Sinapsys - IA Groq Integrada',
    version: '4.0',
    timestamp: new Date().toISOString(),
    hasAI: !!groq,
    mode: groq ? 'IA Groq Ativa' : 'Processamento Inteligente',
    encoding: 'UTF-8'
  });
});

// Rota para teste rápido
app.post('/api/test', (req, res) => {
  res.json({
    message: 'API funcionando corretamente',
    version: '4.0',
    hasAI: !!groq,
    timestamp: new Date().toISOString()
  });
});

// ✅ ROTA PRINCIPAL COM IA GROQ
app.post('/api/generate-story', async (req, res) => {
  try {
    const { projectTitle, clientName, description } = req.body;

    // Validações
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

    if (description.length < 10) {
      return res.status(400).json({
        error: 'A descrição deve ter pelo menos 10 caracteres',
        currentLength: description.length,
        minimumRequired: 10
      });
    }

    console.log(`📝 Processando solicitação: ${projectTitle} - ${clientName}`);
    
    // ✅ GERAR COM IA GROQ OU FALLBACK
    const story = await generateWithAI(projectTitle, clientName, description);

    res.json({
      success: true,
      story: story,
      metadata: {
        projectTitle,
        clientName,
        generatedAt: new Date().toISOString(),
        descriptionLength: description.length,
        wordCount: description.split(/\s+/).length,
        processed: true,
        version: '4.0',
        aiGenerated: !!groq,
        mode: groq ? 'IA Groq' : 'Processamento Inteligente',
        features: {
          hasAuth: description.toLowerCase().includes('login') || description.toLowerCase().includes('autenticação'),
          hasReports: description.toLowerCase().includes('relatório') || description.toLowerCase().includes('relatorio'),
          hasCRUD: description.toLowerCase().includes('cadastro') || description.toLowerCase().includes('registro'),
          hasSearch: description.toLowerCase().includes('consulta') || description.toLowerCase().includes('buscar')
        }
      }
    });

  } catch (error) {
    console.error('💥 Erro no servidor:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message,
      timestamp: new Date().toISOString(),
      version: '4.0',
      hasAI: !!groq
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
    availableRoutes: [
      'GET /api/health',
      'POST /api/generate-story',
      'POST /api/test'
    ],
    version: '4.0'
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('🔥 Error middleware:', error);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Entre em contato com o suporte técnico',
    timestamp: new Date().toISOString(),
    version: '4.0'
  });
});

// Serve frontend em produção
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
  });
}

// Iniciar servidor
app.listen(PORT, () => {
  console.log('🚀 BACKEND SINAPSYS - VERSÃO 4.0 INICIADO');
  console.log(`📍 Porta: ${PORT}`);
  console.log(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🤖 Modo: ${groq ? 'IA GROQ ATIVA 🎯' : 'PROCESSAMENTO INTELIGENTE ⚡'}`);
  console.log(`📊 Health: http://localhost:${PORT}/api/health`);
  console.log(`⚡ Versão: 4.0 - IA Groq Integrada`);
  console.log('='.repeat(60));
});
EOF