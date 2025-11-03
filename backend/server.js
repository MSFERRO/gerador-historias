const express = require('express');
const cors = require('cors');
const path = require('path');
const { Groq } = require('groq-sdk');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// ✅ DIAGNÓSTICO COMPLETO NO INÍCIO
console.log('\n🔍 DIAGNÓSTICO INICIAL:');
console.log('=== VARIÁVEIS DE AMBIENTE ===');
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('GROQ_API_KEY exists:', !!process.env.GROQ_API_KEY);

if (process.env.GROQ_API_KEY) {
    console.log('GROQ_API_KEY length:', process.env.GROQ_API_KEY.length);
    console.log('GROQ_API_KEY starts with gsk_:', process.env.GROQ_API_KEY.startsWith('gsk_'));
    console.log('GROQ_API_KEY preview:', process.env.GROQ_API_KEY.substring(0, 20) + '...');
} else {
    console.log('❌ GROQ_API_KEY: NÃO ENCONTRADA');
    console.log('Todas as variáveis:', Object.keys(process.env));
}

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ✅ CONFIGURAÇÃO GROQ - COM FALLBACK AUTOMÁTICO
let groq = null;
let groqStatus = 'NOT_CONFIGURED';

console.log('\n🚀 INICIALIZANDO GROQ...');

// Verificação FORÇADA da API Key
if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.startsWith('gsk_')) {
    console.log('✅ API Key válida detectada!');
    
    try {
        groq = new Groq({
            apiKey: process.env.GROQ_API_KEY,
            timeout: 30000
        });
        groqStatus = 'CONFIGURED';
        console.log('✅ Groq instanciado com sucesso!');
        
        // Teste de conexão IMEDIATO
        (async () => {
            try {
                console.log('🔄 Testando conexão Groq...');
                const test = await groq.chat.completions.create({
                    messages: [{ role: "user", content: "Teste" }],
                    model: "llama3-8b-8192",
                    max_tokens: 5,
                });
                groqStatus = 'WORKING';
                console.log('🎉 CONEXÃO GROQ: OK -', test.choices[0]?.message?.content);
            } catch (testError) {
                groqStatus = 'ERROR';
                console.log('❌ Erro no teste Groq:', testError.message);
            }
        })();
        
    } catch (error) {
        console.log('❌ Erro ao criar Groq:', error.message);
        groqStatus = 'INIT_ERROR';
    }
} else {
    console.log('❌ API Key INVÁLIDA ou não encontrada');
    console.log('   - Valor atual:', process.env.GROQ_API_KEY || 'UNDEFINED');
    groqStatus = 'INVALID_API_KEY';
}

console.log('📊 Status final Groq:', groqStatus);

// ✅ ROTA DE DIAGNÓSTICO COMPLETO
app.get('/api/env-check', (req, res) => {
    const envInfo = {
        groq_api_key: {
            exists: !!process.env.GROQ_API_KEY,
            value: process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.substring(0, 15) + '...' : 'NOT_FOUND',
            valid: process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.startsWith('gsk_') : false,
            length: process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.length : 0
        },
        all_env_vars: Object.keys(process.env).filter(key => 
            key.includes('GROQ') || key.includes('NODE') || key.includes('PORT')
        ),
        groq_status: groqStatus,
        groq_configured: !!groq,
        timestamp: new Date().toISOString()
    };
    
    res.json(envInfo);
});

// ✅ TESTE DIRETO DA GROQ
app.get('/api/test-groq-direct', async (req, res) => {
    if (!groq) {
        return res.json({
            status: 'GROQ_NOT_READY',
            message: 'Groq não está configurado',
            groq_status: groqStatus,
            api_key_exists: !!process.env.GROQ_API_KEY
        });
    }

    try {
        console.log('🧪 Teste direto da Groq...');
        const completion = await groq.chat.completions.create({
            messages: [{ 
                role: "user", 
                content: "Responda exatamente com: FUNCIONANDO" 
            }],
            model: "llama3-8b-8192",
            max_tokens: 10,
            temperature: 0.1
        });

        const response = completion.choices[0]?.message?.content;
        
        res.json({
            status: 'SUCCESS',
            message: 'Groq está funcionando!',
            response: response,
            groq_status: groqStatus,
            model: 'llama3-8b-8192'
        });

    } catch (error) {
        res.json({
            status: 'ERROR',
            message: 'Erro na Groq',
            error: error.message,
            groq_status: groqStatus
        });
    }
});

// ✅ FUNÇÃO IA COM FALLBACK GARANTIDO
async function generateWithAI(projectTitle, clientName, description) {
    console.log(`\n🤖 GERANDO HISTÓRIA... (Groq: ${groqStatus})`);
    
    // Se Groq não estiver PRONTO, usa fallback IMEDIATAMENTE
    if (groqStatus !== 'WORKING' || !groq) {
        console.log('🔰 Usando FALLBACK - Groq não disponível');
        return generateFallbackStory(projectTitle, clientName, description);
    }

    try {
        console.log('🚀 Chamando IA Groq...');
        
        const prompt = `Como Product Owner, gere uma história de usuário completa em português:

PROJETO: ${projectTitle}
CLIENTE: ${clientName}  
DESCRIÇÃO: ${description}

Inclua:
- COMO [persona], QUERO [ação], PARA [benefício]
- Critérios de aceitação
- Cenários de teste
- Requisitos não funcionais`;

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system", 
                    content: "Você é um Product Owner sênior. Gere histórias de usuário profissionais."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            model: "llama3-8b-8192",
            temperature: 0.7,
            max_tokens: 2000,
        });

        const aiResponse = completion.choices[0]?.message?.content;
        
        if (aiResponse && aiResponse.length > 50) {
            console.log('✅ IA respondeu com sucesso!');
            return formatAIResponse(aiResponse, projectTitle, clientName);
        } else {
            throw new Error('Resposta muito curta da IA');
        }

    } catch (error) {
        console.error('❌ Erro na IA:', error.message);
        return generateFallbackStory(projectTitle, clientName, description);
    }
}

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

DOCUMENTO GERADO POR IA GROQ - SINAPSYS TECNOLOGIA
${new Date().toLocaleString('pt-BR')}
`.trim();
}

function generateFallbackStory(projectTitle, clientName, description) {
    return `
SISTEMA: ${projectTitle.toUpperCase()}
CLIENTE: ${clientName}
DATA: ${new Date().toLocaleDateString('pt-BR')}
VERSÃO: 4.0 - Processamento Inteligente

**COMO** Gerente de Projetos
**QUERO** ${description.substring(0, 100)}...
**PARA** melhorar a eficiência operacional

DOCUMENTO GERADO POR PROCESSAMENTO INTELIGENTE
${new Date().toLocaleString('pt-BR')}
`.trim();
}

// ✅ ROTA PRINCIPAL
app.post('/api/generate-story', async (req, res) => {
    try {
        const { projectTitle, clientName, description } = req.body;

        console.log(`\n📥 REQUISIÇÃO: ${projectTitle} | Groq Status: ${groqStatus}`);

        if (!projectTitle || !clientName || !description) {
            return res.status(400).json({ error: 'Campos obrigatórios' });
        }

        const startTime = Date.now();
        const story = await generateWithAI(projectTitle, clientName, description);
        const processingTime = Date.now() - startTime;

        const usingAI = groqStatus === 'WORKING' && story.includes('IA Groq Powered');
        
        console.log(`✅ Gerado em ${processingTime}ms | IA: ${usingAI ? 'SIM' : 'NÃO'}`);

        res.json({
            success: true,
            story: story,
            metadata: {
                aiGenerated: usingAI,
                mode: usingAI ? 'IA Groq' : 'Processamento Inteligente',
                groqStatus: groqStatus,
                processingTime: `${processingTime}ms`,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('💥 Erro:', error);
        res.status(500).json({ error: 'Erro interno' });
    }
});

// ✅ HEALTH CHECK
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        groq: {
            status: groqStatus,
            ready: groqStatus === 'WORKING',
            configured: !!groq
        },
        environment: process.env.NODE_ENV
    });
});

// Serve frontend
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend/build')));
    app.use((req, res) => {
        res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
    });
}

// ✅ INICIAR SERVIDOR
app.listen(PORT, () => {
    console.log('\n========================================');
    console.log('🚀 SERVIDOR INICIADO');
    console.log(`📍 Porta: ${PORT}`);
    console.log(`🌐 Ambiente: ${process.env.NODE_ENV}`);
    console.log(`🤖 Groq Status: ${groqStatus}`);
    console.log('========================================\n');
    
    // URLs para teste
    console.log('🔗 URLs para teste:');
    console.log(`📊 Health: /api/health`);
    console.log(`🔍 Env Check: /api/env-check`);
    console.log(`🧪 Test Groq: /api/test-groq-direct`);
    console.log(`🎯 Generate: /api/generate-story`);
    console.log('');
});