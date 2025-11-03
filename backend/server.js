const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));

console.log('🚀 SINAPSYS BACKEND - MODO INTELIGENTE');

// ✅ FUNÇÃO INTELIGENTE DE GERAÇÃO (SEM ERROS)
function generateSmartStory(projectTitle, clientName, description) {
    console.log(`\n📝 Gerando história para: ${projectTitle}`);
    
    // Análise inteligente da descrição
    const descLower = description.toLowerCase();
    
    // Detecta tipo de projeto
    let projectType = 'Sistema Geral';
    if (descLower.includes('gestão') || descLower.includes('gestao')) projectType = 'Sistema de Gestão';
    if (descLower.includes('relatório') || descLower.includes('relatorio')) projectType = 'Sistema de Relatórios';
    if (descLower.includes('ági') || descLower.includes('agi')) projectType = 'Sistema Ágil';
    
    // Extrai persona
    let persona = 'Usuário do Sistema';
    if (descLower.includes('como gerente')) persona = 'Gerente de Projetos';
    if (descLower.includes('como admin')) persona = 'Administrador';
    
    // Extrai objetivo
    const extractGoal = () => {
        const match = description.match(/quero\s+([^.!?]+)/i);
        return match ? match[1].trim() : description.substring(0, 120).trim() + '...';
    };

    return `
SISTEMA: ${projectTitle.toUpperCase()}
CLIENTE: ${clientName}
DATA: ${new Date().toLocaleDateString('pt-BR')}
VERSÃO: 4.0 - Processamento Inteligente
TIPO: ${projectType}

================================================================================
HISTÓRIA DE USUÁRIO
================================================================================

**COMO** ${persona}
**QUERO** ${extractGoal()}
**PARA** otimizar processos e melhorar a eficiência operacional

================================================================================
DESCRIÇÃO DETALHADA
================================================================================

${description}

================================================================================
CRITÉRIOS DE ACEITAÇÃO
================================================================================

✅ Sistema deve atender aos requisitos funcionais descritos
✅ Interface intuitiva e de fácil uso
✅ Performance adequada para o uso pretendido  
✅ Segurança e proteção de dados
✅ Documentação técnica disponível
✅ Testes automatizados para funcionalidades críticas

================================================================================
CENÁRIOS DE TESTE
================================================================================

## 🔄 Cenário Principal
**Dado** que o usuário acessa o sistema
**Quando** executa a funcionalidade principal
**Então** deve obter o resultado esperado

## ⚠️ Cenário Alternativo  
**Dado** que ocorre uma situação incomum
**Quando** o sistema processa a informação
**Então** deve tratar adequadamente e informar o usuário

================================================================================
PRÓXIMOS PASSOS
================================================================================

1. Revisão com stakeholders
2. Refinamento com equipe de desenvolvimento
3. Estimativa de esforço
4. Planejamento de sprint

================================================================================

DOCUMENTO GERADO POR PROCESSAMENTO INTELIGENTE
SINAPSYS TECNOLOGIA - ${new Date().toLocaleString('pt-BR')}
`.trim();
}

// ✅ ROTAS SIMPLES E FUNCIONAIS
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK',
        message: 'SINAPSYS BACKEND - ONLINE',
        version: '4.0',
        timestamp: new Date().toISOString()
    });
});

app.post('/api/generate-story', (req, res) => {
    try {
        const { projectTitle, clientName, description } = req.body;

        console.log(`📥 Nova solicitação: ${projectTitle}`);

        // Validações simples
        if (!projectTitle || !clientName || !description) {
            return res.status(400).json({ 
                success: false,
                error: 'Todos os campos são obrigatórios: projectTitle, clientName, description'
            });
        }

        if (description.length < 5) {
            return res.status(400).json({
                success: false, 
                error: 'Descrição muito curta',
                minLength: 5,
                currentLength: description.length
            });
        }

        const startTime = Date.now();
        const story = generateSmartStory(projectTitle, clientName, description);
        const processingTime = Date.now() - startTime;

        console.log(`✅ História gerada em ${processingTime}ms`);

        res.json({
            success: true,
            story: story,
            metadata: {
                processingTime: `${processingTime}ms`,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('💥 Erro:', error);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

app.get('/', (req, res) => {
    res.json({ 
        message: '🚀 SINAPSYS BACKEND - ONLINE',
        version: '4.0',
        status: 'OK',
        timestamp: new Date().toISOString()
    });
});

// ✅ INICIAR SERVIDOR
app.listen(PORT, () => {
    console.log('========================================');
    console.log('🚀 SERVIDOR INICIADO - MODO INTELIGENTE');
    console.log(`📍 Porta: ${PORT}`);
    console.log(`🌐 Ambiente: ${process.env.NODE_ENV}`);
    console.log('========================================\n');
    console.log('🔗 URLs disponíveis:');
    console.log(`   http://localhost:${PORT}/`);
    console.log(`   http://localhost:${PORT}/api/health`);
    console.log(`   http://localhost:${PORT}/api/generate-story`);
    console.log('');
});