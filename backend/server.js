const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));

console.log('🚀 SINAPSYS BACKEND - MODO INTELLIGENTE');

// ✅ FUNÇÃO INTELIGENTE DE GERAÇÃO
async function generateSmartStory(projectTitle, clientName, description) {
    console.log(`\n📝 Gerando história inteligente para: ${projectTitle}`);
    
    // Análise inteligente da descrição
    const descLower = description.toLowerCase();
    
    // Detecta o tipo de projeto
    let projectType = 'Sistema Geral';
    if (descLower.includes('login') || descLower.includes('autenticação')) projectType = 'Sistema de Autenticação';
    if (descLower.includes('relatório') || descLower.includes('relatorio')) projectType = 'Sistema de Relatórios';
    if (descLower.includes('cadastro') || descLower.includes('registro')) projectType = 'Sistema de Cadastro';
    if (descLower.includes('e-commerce') || descLower.includes('loja')) projectType = 'E-commerce';
    if (descLower.includes('app') || descLower.includes('mobile')) projectType = 'Aplicativo Mobile';
    
    // Extrai persona
    let persona = 'Usuário do Sistema';
    if (descLower.includes('como gerente')) persona = 'Gerente de Projetos';
    if (descLower.includes('como admin')) persona = 'Administrador do Sistema';
    if (descLower.includes('como usuário')) persona = 'Usuário Final';
    if (descLower.includes('como analista')) persona = 'Analista de Dados';
    
    // Gera critérios baseados no contexto
    const criteria = generateCriteria(descLower);
    const testScenarios = generateTestScenarios(descLower);
    
    return `
SISTEMA: ${projectTitle.toUpperCase()}
CLIENTE: ${clientName}
DATA: ${new Date().toLocaleDateString('pt-BR')}
VERSÃO: 4.0 - Processamento Inteligente
TIPO: ${projectType}

================================================================================
HISTÓRIA DE USUÁRIO ANALISADA
================================================================================

**COMO** ${persona}
**QUERO** ${extractMainGoal(description)}
**PARA** ${extractBenefit(description)}

================================================================================
DESCRIÇÃO DETALHADA
================================================================================

${description}

================================================================================
CRITÉRIOS DE ACEITAÇÃO
================================================================================

${criteria}

================================================================================
CENÁRIOS DE TESTE
================================================================================

${testScenarios}

================================================================================
REQUISITOS NÃO FUNCIONAIS
================================================================================

- **Performance:** Tempo de resposta < 3s para operações principais
- **Segurança:** Autenticação e autorização adequadas
- **Usabilidade:** Interface intuitiva seguindo princípios de UX
- **Confiabilidade:** Disponibilidade mínima de 99%
- **Manutenibilidade:** Código bem documentado e testado

================================================================================
INFORMAÇÕES TÉCNICAS
================================================================================

- **Processamento:** Análise contextual inteligente
- **Complexidade:** ${description.length > 200 ? 'Alta' : 'Média'}
- **Status:** Pronto para refinamento técnico

================================================================================

DOCUMENTO GERADO POR PROCESSAMENTO INTELIGENTE
SINAPSYS TECNOLOGIA - ${new Date().toLocaleString('pt-BR')}
`.trim();
}

// Funções auxiliares
function extractMainGoal(description) {
    const match = description.match(/quero\s+([^.!?]+)/i);
    if (match) return match[1].trim();
    return description.substring(0, 120).trim() + '...';
}

function extractBenefit(description) {
    const match = description.match(/para\s+([^.!?]+)/i);
    if (match) return match[1].trim();
    return 'otimizar processos e melhorar a eficiência operacional';
}

function generateCriteria(descLower) {
    const criteria = [];
    
    if (descLower.includes('login') || descLower.includes('senha')) {
        criteria.push('✅ Validação segura de credenciais');
        criteria.push('✅ Proteção contra tentativas de força bruta');
        criteria.push('✅ Recuperação de senha via email');
        criteria.push('✅ Logs de auditoria de acesso');
    }
    
    if (descLower.includes('relatório') || descLower.includes('relatorio')) {
        criteria.push('✅ Dados consistentes e atualizados');
        criteria.push('✅ Exportação em múltiplos formatos (PDF, Excel)');
        criteria.push('✅ Filtros dinâmicos e personalizáveis');
        criteria.push('✅ Performance otimizada para grandes volumes');
    }
    
    if (descLower.includes('cadastro') || descLower.includes('registro')) {
        criteria.push('✅ Validação de campos obrigatórios');
        criteria.push('✅ Prevenção de duplicidade de registros');
        criteria.push('✅ Confirmação de operações bem-sucedidas');
        criteria.push('✅ Mensagens de erro claras e objetivas');
    }
    
    // Critérios universais
    criteria.push('✅ Interface responsiva e acessível');
    criteria.push('✅ Tratamento adequado de erros e exceções');
    criteria.push('✅ Documentação técnica disponível');
    criteria.push('✅ Testes automatizados para fluxos críticos');
    
    return criteria.join('\n');
}

function generateTestScenarios(descLower) {
    const scenarios = [];
    
    scenarios.push('## 🔄 Cenário Principal - Fluxo Feliz');
    scenarios.push('**Dado** que o usuário acessa o sistema adequadamente');
    scenarios.push('**Quando** executa a funcionalidade principal com dados válidos');
    scenarios.push('**Então** deve obter o resultado esperado com confirmação');
    
    if (descLower.includes('login')) {
        scenarios.push('\n## 🔐 Cenário - Autenticação');
        scenarios.push('**Dado** que o usuário possui credenciais válidas');
        scenarios.push('**Quando** realiza o login no sistema');
        scenarios.push('**Então** deve acessar a área restrita com sucesso');
    }
    
    scenarios.push('\n## ⚠️ Cenário Alternativo');
    scenarios.push('**Dado** que o usuário preenche dados parciais');
    scenarios.push('**Quando** tenta prosseguir com a operação');
    scenarios.push('**Então** deve receber orientações para complementar');
    
    scenarios.push('\n## ❌ Cenário de Exceção');
    scenarios.push('**Dado** que ocorre uma condição de erro');
    scenarios.push('**Quando** o sistema identifica a exceção');
    scenarios.push('**Então** deve apresentar mensagem clara e opções de recuperação');
    
    return scenarios.join('\n');
}

// ✅ ROTAS
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK',
        message: 'SINAPSYS - Modo Inteligente',
        version: '4.0',
        timestamp: new Date().toISOString()
    });
});

app.post('/api/generate-story', async (req, res) => {
    try {
        const { projectTitle, clientName, description } = req.body;

        console.log(`📥 Nova solicitação: ${projectTitle}`);

        if (!projectTitle || !clientName || !description) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
        }

        const startTime = Date.now();
        const story = await generateSmartStory(projectTitle, clientName, description);
        const processingTime = Date.now() - startTime;

        console.log(`✅ História gerada em ${processingTime}ms`);

        res.json({
            success: true,
            story: story,
            metadata: {
                processingTime: `${processingTime}ms`,
                mode: 'Processamento Inteligente',
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('💥 Erro:', error);
        res.status(500).json({ error: 'Erro interno' });
    }
});

app.get('/', (req, res) => {
    res.json({ 
        message: '🚀 SINAPSYS BACKEND - ONLINE',
        version: '4.0',
        mode: 'Processamento Inteligente',
        timestamp: new Date().toISOString()
    });
});

// ✅ INICIAR SERVIDOR
app.listen(PORT, () => {
    console.log('========================================');
    console.log('🚀 SERVIDOR INICIADO - MODO INTELLIGENTE');
    console.log(`📍 Porta: ${PORT}`);
    console.log(`🌐 Ambiente: ${process.env.NODE_ENV}`);
    console.log('========================================\n');
});