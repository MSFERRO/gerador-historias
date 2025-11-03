const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000; // ✅ CORRIGIDO para porta do Render

// ✅ DEBUG DETALHADO NO INÍCIO
console.log('\n🔍 DEBUG INICIAL DO RENDER:');
console.log('   - PORT:', process.env.PORT);
console.log('   - NODE_ENV:', process.env.NODE_ENV);
console.log('   - GROQ_API_KEY exists:', !!process.env.GROQ_API_KEY);
console.log('   - GROQ_API_KEY preview:', process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.substring(0, 15) + '...' : 'N/A');
console.log('');

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ✅ MIDDLEWARE UTF-8 GARANTIDO
app.use((req, res, next) => {
  res.header('Content-Type', 'application/json; charset=utf-8');
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

// ✅ CONFIGURAÇÃO GROQ IA COM DEBUG
let groq;
console.log('🚀 CONFIGURANDO GROQ IA...');

try {
  if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.startsWith('gsk_')) {
    console.log('   - API Key válida detectada');
    groq = require('groq-sdk');
    groq = new groq({ 
      apiKey: process.env.GROQ_API_KEY
    });
    console.log('   ✅ Groq IA Configurado com Sucesso');
    console.log('   🎯 Modo: IA Groq Ativa');
  } else {
    console.log('   ❌ API Key inválida ou não encontrada');
    console.log('   ⚠️  Modo: Fallback Inteligente');
  }
} catch (error) {
  console.log('   💥 Erro na configuração Groq:', error.message);
  console.log('   🔄 Modo: Fallback Inteligente');
}

// ✅ FUNÇÃO IA COM GROQ - VERSÃO PROFISSIONAL
async function generateWithAI(projectTitle, clientName, description) {
  // Se não tiver Groq configurado, usa fallback
  if (!groq) {
    console.log('🔄 Usando fallback inteligente (Groq não disponível)');
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

    console.log('🤖 Chamando Groq IA...');
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

    console.log('✅ Resposta da IA recebida:', aiResponse.length, 'caracteres');
    return formatAIResponse(aiResponse, projectTitle, clientName);

  } catch (error) {
    console.error('❌ Erro na IA Groq:', error.message);
    console.log('🔄 Alternando para fallback inteligente...');
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

// ✅ FUNÇÃO FALLBACK INTELIGENTE - VERSÃO MELHORADA
async function generateFallbackStory(projectTitle, clientName, description) {
  const extractRole = () => {
    const desc = description.toLowerCase();
    
    // Padrões mais específicos para detectar o papel
    if (desc.includes('como gerente') || desc.includes('gerente de')) {
      const match = description.match(/como\s+(gerente\s+[^,.\n]+)/i);
      return match ? match[1] : 'Gerente de Projetos';
    }
    
    if (desc.includes('como usuário') || desc.includes('usuário')) {
      return 'Usuário do Sistema';
    }
    
    if (desc.includes('como admin') || desc.includes('administrador')) {
      return 'Administrador do Sistema';
    }
    
    if (desc.includes('como analista') || desc.includes('analista de')) {
      const match = description.match(/como\s+(analista\s+[^,.\n]+)/i);
      return match ? match[1] : 'Analista de Sistemas';
    }
    
    // Padrão genérico
    const patterns = [
      /como\s+(um|uma)?\s*([^,.\n]+?)(?=\s*,|\s+quero|\s+eu|\s+para|\.|$)/i,
      /sou\s+([^,.\n]+?)(?=\s*,|\s+e|\s+\.|$)/i,
      /atuo\s+como\s+([^,.\n]+)/i
    ];
    
    for (const pattern of patterns) {
      const match = description.match(pattern);
      if (match && match[2]) return match[2].trim();
      if (match && match[1]) return match[1].trim();
    }
    
    return 'Usuário do Sistema';
  };

  const extractMainGoal = () => {
    // Remove a parte do "COMO" para evitar repetição
    let cleanDesc = description.replace(/como\s+[^,]+,\s*/i, '');
    
    const patterns = [
      /quero\s+([^.!?]+?)(?=\s*para\s+|\s*de\s+forma\s+|\s*\.|\s*$)/i,
      /desejo\s+([^.!?]+?)(?=\s*para\s+|\s*\.|\s*$)/i,
      /preciso\s+([^.!?]+?)(?=\s*para\s+|\s*\.|\s*$)/i,
      /objetivo[^.!?]*?([^.!?]+?)(?=\s*para\s+|\s*\.|\s*$)/i,
      /necessito\s+([^.!?]+?)(?=\s*para\s+|\s*\.|\s*$)/i
    ];
    
    for (const pattern of patterns) {
      const match = cleanDesc.match(pattern);
      if (match && match[1]) {
        let result = match[1].trim();
        // Limpa caracteres finais indesejados
        result = result.replace(/[,\s]*$/g, '').trim();
        if (result.length > 10 && !result.includes('Como')) {
          return result;
        }
      }
    }
    
    // Fallback: pega a primeira frase significativa
    const sentences = cleanDesc.split(/[.!?]+/).filter(s => {
      const trimmed = s.trim();
      return trimmed.length > 20 && !trimmed.toLowerCase().includes('como');
    });
    
    if (sentences.length > 0) {
      return sentences[0].substring(0, 120).trim() + '...';
    }
    
    return 'realizar operações no sistema de forma eficiente';
  };

  const extractBenefit = () => {
    const patterns = [
      /para\s+([^.!?]+?)(?=\s*\.|\s*$|\s*Também)/i,
      /de\s+forma\s+que\s+([^.!?]+)/i,
      /com\s+o\s+objetivo\s+de\s+([^.!?]+)/i,
      /visando\s+([^.!?]+)/i,
      /a\s+fim\s+de\s+([^.!?]+)/i,
      /de\s+modo\s+a\s+([^.!?]+)/i
    ];
    
    for (const pattern of patterns) {
      const match = description.match(pattern);
      if (match && match[1]) {
        let benefit = match[1].trim();
        benefit = benefit.replace(/[,\s]*$/g, '').trim();
        if (benefit.length > 5) {
          return benefit;
        }
      }
    }
    
    // Benefícios baseados no contexto
    const descLower = description.toLowerCase();
    if (descLower.includes('relatóri') || descLower.includes('dashboard')) {
      return 'tomar decisões baseadas em dados atualizados';
    }
    if (descLower.includes('login') || descLower.includes('segurança')) {
      return 'proteger informações sensíveis do sistema';
    }
    if (descLower.includes('cadastro') || descLower.includes('registro')) {
      return 'manter os dados do sistema organizados e atualizados';
    }
    if (descLower.includes('tempo real') || descLower.includes('monitoramento')) {
      return 'acompanhar o andamento das atividades instantaneamente';
    }
    if (descLower.includes('git') || descLower.includes('commit')) {
      return 'rastrear o desenvolvimento e associar código às funcionalidades';
    }
    
    return 'otimizar processos e melhorar a eficiência operacional';
  };

  const descLower = description.toLowerCase();

  const generateCriteria = () => {
    const criteria = [];
    
    // Critérios baseados no contexto específico
    if (descLower.includes('sprint') || descLower.includes('tarefa') || descLower.includes('scrum')) {
      criteria.push('✅ Sistema deve permitir criação de sprints com datas de início e fim');
      criteria.push('✅ Deve possibilitar atribuição de tarefas aos membros da equipe');
      criteria.push('✅ Deve mostrar progresso em tempo real com indicadores visuais');
      criteria.push('✅ Deve calcular velocity e burndown automaticamente');
    }
    
    if (descLower.includes('perfil') || descLower.includes('admin') || descLower.includes('desenvolvedor')) {
      criteria.push('✅ Controle de acesso por perfis (admin, scrum master, desenvolvedor)');
      criteria.push('✅ Permissões específicas para cada tipo de usuário');
      criteria.push('✅ Interface adaptável conforme o perfil logado');
    }
    
    if (descLower.includes('relatóri') || descLower.includes('chart') || descLower.includes('velocity')) {
      criteria.push('✅ Geração de relatórios de velocity e burndown charts');
      criteria.push('✅ Exportação em múltiplos formatos (PDF, Excel, PNG)');
      criteria.push('✅ Filtros dinâmicos por período, equipe e projetos');
      criteria.push('✅ Atualização automática dos dados em tempo real');
    }
    
    if (descLower.includes('notificaç') || descLower.includes('email') || descLower.includes('alerta')) {
      criteria.push('✅ Notificações automáticas por email para conclusão de tarefas');
      criteria.push('✅ Alertas para tarefas próximas do prazo ou atrasadas');
      criteria.push('✅ Configuração de frequência e destinatários das notificações');
    }
    
    if (descLower.includes('git') || descLower.includes('commit') || descLower.includes('repositório')) {
      criteria.push('✅ Integração com repositórios Git (GitHub, GitLab, Bitbucket)');
      criteria.push('✅ Associação automática de commits às tarefas correspondentes');
      criteria.push('✅ Visualização do histórico de commits por tarefa');
    }
    
    if (descLower.includes('dashboard') || descLower.includes('tempo real') || descLower.includes('progresso')) {
      criteria.push('✅ Dashboard interativo com métricas em tempo real');
      criteria.push('✅ Gráficos atualizados automaticamente sem necessidade de refresh');
      criteria.push('✅ Visualização mobile-responsive do dashboard');
    }
    
    // Critérios universais
    criteria.push('✅ Interface responsiva e acessível (WCAG 2.1)');
    criteria.push('✅ Tempo de resposta inferior a 2 segundos para operações críticas');
    criteria.push('✅ Tratamento adequado de erros com mensagens claras ao usuário');
    criteria.push('✅ Documentação técnica da API e do código fonte');
    criteria.push('✅ Testes unitários e de integração cobrindo 80% do código');
    criteria.push('✅ Backup automático dos dados críticos');
    criteria.push('✅ Logs de auditoria para ações importantes');
    
    return criteria.join('\n');
  };

  const generateTestScenarios = () => {
    const scenarios = [];
    
    if (descLower.includes('sprint') || descLower.includes('tarefa')) {
      scenarios.push('## 🔄 Cenário Principal - Criação de Sprint');
      scenarios.push('**Dado** que o Scrum Master está logado no sistema');
      scenarios.push('**Quando** cria uma nova sprint com datas e objetivos definidos');
      scenarios.push('**Então** o sistema deve criar a sprint e disponibilizar para atribuição de tarefas');
      
      scenarios.push('\n## 📋 Cenário - Atribuição de Tarefas');
      scenarios.push('**Dado** que uma sprint está aberta no sistema');
      scenarios.push('**Quando** o Scrum Master atribui tarefas aos desenvolvedores');
      scenarios.push('**Então** os desenvolvedores recebem notificações e as tarefas aparecem em seus dashboards');
    }
    
    if (descLower.includes('dashboard') || descLower.includes('tempo real')) {
      scenarios.push('\n## 📊 Cenário - Acompanhamento em Tempo Real');
      scenarios.push('**Dado** que existem tarefas em andamento na sprint');
      scenarios.push('**Quando** um desenvolvedor atualiza o status de uma tarefa');
      scenarios.push('**Então** o dashboard deve refletir imediatamente a mudança para todos os usuários');
    }
    
    if (descLower.includes('relatóri') || descLower.includes('chart')) {
      scenarios.push('\n## 📈 Cenário - Geração de Relatórios');
      scenarios.push('**Dado** que a sprint foi concluída');
      scenarios.push('**Quando** o gerente solicita o relatório de velocity');
      scenarios.push('**Então** o sistema deve gerar o relatório com dados consistentes e opções de exportação');
    }
    
    // Cenários genéricos
    scenarios.push('\n## ⚠️ Cenário Alternativo - Dados Parciais');
    scenarios.push('**Dado** que o usuário preenche apenas campos obrigatórios');
    scenarios.push('**Quando** submete o formulário');
    scenarios.push('**Então** sistema deve processar e sugerir complementos quando aplicável');
    
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
VERSÃO: 4.0 - Processamento Inteligente Avançado

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

- **Performance:** Tempo de resposta < 2s para operações críticas
- **Segurança:** Autenticação RBAC (Role-Based Access Control)
- **Usabilidade:** Interface intuitiva seguindo princípios de UX
- **Confiabilidade:** Disponibilidade de 99.5% em produção
- **Escalabilidade:** Suporte a múltiplas equipes e projetos
- **Manutenibilidade:** Código documentado e cobertura de testes >80%

================================================================================
INFORMAÇÕES TÉCNICAS
================================================================================

- **Processamento:** Análise contextual inteligente de requisitos
- **Características detectadas:** ${[
  descLower.includes('sprint') ? 'Gestão Ágil' : '',
  descLower.includes('dashboard') ? 'Dashboards' : '',
  descLower.includes('relatóri') ? 'Relatórios' : '',
  descLower.includes('notificaç') ? 'Notificações' : '',
  descLower.includes('git') ? 'Integração Git' : '',
  descLower.includes('perfil') ? 'Controle de Acesso' : ''
].filter(Boolean).join(', ')}
- **Complexidade:** ${description.length > 200 ? 'Alta' : description.length > 100 ? 'Média' : 'Baixa'}
- **Status:** Pronto para refinamento técnico

================================================================================

DOCUMENTO GERADO POR PROCESSAMENTO INTELIGENTE
SINAPSYS TECNOLOGIA - ${new Date().toLocaleString('pt-BR')}
VERSÃO 4.0 - ANÁLISE CONTEXTUAL AVANÇADA
  `.trim();
}

// ✅ ROTAS DE DEBUG E TESTE
app.get('/api/debug', (req, res) => {
  res.json({
    status: 'OK',
    groq: {
      configured: !!groq,
      apiKeyExists: !!process.env.GROQ_API_KEY,
      apiKeyStartsWithGsk: process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.startsWith('gsk_') : false,
      apiKeyLength: process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.length : 0
    },
    environment: {
      nodeEnv: process.env.NODE_ENV,
      port: process.env.PORT,
      actualPort: PORT
    },
    timestamp: new Date().toISOString(),
    version: '4.0'
  });
});

// ✅ TESTE DE CONEXÃO GROQ
app.get('/api/test-groq', async (req, res) => {
  try {
    if (!groq) {
      return res.json({
        status: 'GROQ_NOT_READY',
        message: 'Groq não está configurado',
        reason: 'API key missing or invalid'
      });
    }

    // Teste simples com a Groq
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: "Responda apenas com a palavra 'FUNCIONANDO' em letras maiúsculas"
        }
      ],
      model: "llama3-8b-8192",
      max_tokens: 10,
      temperature: 0.1
    });

    const response = completion.choices[0]?.message?.content;
    
    res.json({
      status: 'GROQ_WORKING',
      message: 'IA Groq está funcionando!',
      testResponse: response,
      model: 'llama3-8b-8192',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.json({
      status: 'GROQ_ERROR',
      message: 'Erro na Groq',
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? 'Hidden in production' : error.stack
    });
  }
});

// ✅ HEALTH CHECK
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend Sinapsys - IA Groq Integrada',
    version: '4.0',
    timestamp: new Date().toISOString(),
    hasAI: !!groq,
    mode: groq ? 'IA Groq Ativa' : 'Processamento Inteligente',
    encoding: 'UTF-8',
    environment: process.env.NODE_ENV || 'development',
    port: PORT
  });
});

// ✅ ROTA PARA TESTE RÁPIDO
app.post('/api/test', (req, res) => {
  res.json({
    message: 'API funcionando corretamente',
    version: '4.0',
    hasAI: !!groq,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ✅ ROTA PRINCIPAL COM IA GROQ
app.post('/api/generate-story', async (req, res) => {
  try {
    const { projectTitle, clientName, description } = req.body;

    console.log(`📝 Nova solicitação recebida:`, {
      projectTitle,
      clientName,
      descriptionLength: description?.length,
      groqAvailable: !!groq
    });

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

    console.log(`🎯 Processando: ${projectTitle} - ${clientName} | Groq: ${groq ? 'SIM' : 'NÃO'}`);
    
    // ✅ GERAR COM IA GROQ OU FALLBACK
    const startTime = Date.now();
    const story = await generateWithAI(projectTitle, clientName, description);
    const processingTime = Date.now() - startTime;

    console.log(`✅ História gerada em ${processingTime}ms | Modo: ${groq ? 'IA Groq' : 'Fallback'}`);

    res.json({
      success: true,
      story: story,
      metadata: {
        projectTitle,
        clientName,
        generatedAt: new Date().toISOString(),
        descriptionLength: description.length,
        wordCount: description.split(/\s+/).length,
        processingTime: `${processingTime}ms`,
        processed: true,
        version: '4.0',
        aiGenerated: !!groq,
        mode: groq ? 'IA Groq' : 'Processamento Inteligente',
        features: {
          hasAuth: description.toLowerCase().includes('login') || description.toLowerCase().includes('autenticação'),
          hasReports: description.toLowerCase().includes('relatório') || description.toLowerCase().includes('relatorio'),
          hasCRUD: description.toLowerCase().includes('cadastro') || description.toLowerCase().includes('registro'),
          hasSearch: description.toLowerCase().includes('consulta') || description.toLowerCase().includes('buscar'),
          hasAgile: description.toLowerCase().includes('sprint') || description.toLowerCase().includes('scrum'),
          hasGit: description.toLowerCase().includes('git') || description.toLowerCase().includes('commit')
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

// ✅ SERVE FRONTEND EM PRODUÇÃO - SEM USAR *
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  // Fallback para SPA - sem usar padrão *
  app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
  });
}

// ✅ 404 HANDLER UNIFICADO - SEM USAR *
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    // Para rotas da API não encontradas
    res.status(404).json({
      error: 'Rota da API não encontrada',
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      availableRoutes: [
        'GET /api/health',
        'GET /api/debug',
        'GET /api/test-groq',
        'POST /api/generate-story',
        'POST /api/test'
      ],
      version: '4.0'
    });
  } else {
    // Para rotas não-API
    if (process.env.NODE_ENV === 'production') {
      // Em produção, serve o frontend
      res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
    } else {
      // Em desenvolvimento, retorna JSON
      res.status(404).json({
        error: 'Rota não encontrada',
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
        version: '4.0'
      });
    }
  }
});

// ✅ ERROR HANDLING MIDDLEWARE
app.use((error, req, res, next) => {
  console.error('🔥 Error middleware:', error);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Entre em contato com o suporte técnico',
    timestamp: new Date().toISOString(),
    version: '4.0'
  });
});

// ✅ INICIAR SERVIDOR
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 BACKEND SINAPSYS - VERSÃO 4.0 INICIADO');
  console.log(`📍 Porta: ${PORT}`);
  console.log(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🤖 Modo: ${groq ? 'IA GROQ ATIVA 🎯' : 'PROCESSAMENTO INTELIGENTE ⚡'}`);
  console.log(`📊 Health: https://seu-backend.onrender.com/api/health`);
  console.log(`🔍 Debug: https://seu-backend.onrender.com/api/debug`);
  console.log(`🧪 Teste Groq: https://seu-backend.onrender.com/api/test-groq`);
  console.log(`⚡ Versão: 4.0 - IA Groq Integrada`);
  console.log('='.repeat(60) + '\n');
});