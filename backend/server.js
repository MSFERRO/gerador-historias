const express = require('express');
const cors = require('cors');
const path = require('path');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ✅ CONFIGURAÇÃO OPENAI
console.log('\n🔧 CONFIGURANDO OPENAI GPT-4o-mini...');

let openai;
let aiStatus = 'NOT_CONFIGURED';
const ACTIVE_MODEL = 'gpt-4o-mini';

// ✅ VERIFICAÇÃO DA API KEY
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-')) {
    console.log('✅ OpenAI API Key detectada:', process.env.OPENAI_API_KEY.substring(0, 12) + '...');
    
    try {
        openai = new OpenAI({ 
            apiKey: process.env.OPENAI_API_KEY,
            timeout: 30000
        });
        aiStatus = 'CONFIGURED';
        console.log('✅ OpenAI instanciado com sucesso!');
        console.log('🤖 Modelo:', ACTIVE_MODEL);
        
        // Teste de conexão
        (async () => {
            try {
                console.log('🔄 Testando conexão OpenAI...');
                const test = await openai.chat.completions.create({
                    messages: [{ role: "user", content: "Teste de conexão" }],
                    model: ACTIVE_MODEL,
                    max_tokens: 5,
                });
                aiStatus = 'WORKING';
                console.log('🎉 CONEXÃO OPENAI: OK -', test.choices[0]?.message?.content);
            } catch (error) {
                aiStatus = 'ERROR';
                console.log('❌ Erro no teste OpenAI:', error.message);
            }
        })();
        
    } catch (error) {
        console.log('❌ Erro ao criar OpenAI:', error.message);
    }
} else {
    console.log('❌ OpenAI API Key não encontrada ou inválida');
    console.log('💡 Chave no .env:', process.env.OPENAI_API_KEY ? 'EXISTE' : 'NÃO EXISTE');
}

console.log('📊 Status AI:', aiStatus);

// ✅ FUNÇÃO IA COM OPENAI
async function generateWithAI(projectTitle, clientName, description) {
    console.log(`\n🤖 SOLICITANDO IA... (Status: ${aiStatus})`);
    
    if (!openai || aiStatus !== 'WORKING') {
        console.log('🔰 Usando fallback - OpenAI não disponível');
        return generateFallbackStory(projectTitle, clientName, description);
    }

    try {
        console.log('🚀 Chamando OpenAI...');
        
        const prompt = `Como Product Owner Sênior, gere uma história de usuário completa em português:

PROJETO: ${projectTitle}
CLIENTE: ${clientName}
DESCRIÇÃO: ${description}

Formato profissional com:
- COMO [persona], QUERO [objetivo], PARA [benefício]
- Critérios de aceitação detalhados
- Cenários de teste BDD
- Requisitos não funcionais

Seja detalhado e use markdown.`;

        const completion = await openai.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "Você é um Product Owner experiente. Gere histórias de usuário profissionais em português."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            model: ACTIVE_MODEL,
            temperature: 0.7,
            max_tokens: 2000,
        });

        const aiResponse = completion.choices[0]?.message?.content;
        
        if (aiResponse && aiResponse.length > 100) {
            console.log('✅ OpenAI respondeu!', aiResponse.length, 'caracteres');
            return `
SISTEMA: ${projectTitle.toUpperCase()}
CLIENTE: ${clientName}
DATA: ${new Date().toLocaleDateString('pt-BR')}
VERSÃO: 4.0 - OpenAI GPT-4o-mini

================================================================================
HISTÓRIA DE USUÁRIO GERADA POR IA
================================================================================

${aiResponse}

================================================================================

DOCUMENTO GERADO POR OPENAI GPT - SINAPSYS TECNOLOGIA
${new Date().toLocaleString('pt-BR')}
`.trim();
        }
        
        throw new Error('Resposta muito curta');
        
    } catch (error) {
        console.error('❌ Erro OpenAI:', error.message);
        return generateFallbackStory(projectTitle, clientName, description);
    }
}

// ✅ FALLBACK
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

// ✅ ROTAS COM INFO DA IA
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK',
        ai: {
            provider: 'OpenAI',
            status: aiStatus,
            ready: aiStatus === 'WORKING',
            configured: !!openai,
            model: ACTIVE_MODEL
        },
        timestamp: new Date().toISOString()
    });
});

app.get('/api/test-ai', async (req, res) => {
    if (!openai) {
        return res.json({
            status: 'ERROR',
            message: 'OpenAI não configurado',
            aiStatus: aiStatus
        });
    }

    try {
        const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: "Responda com: IA FUNCIONANDO" }],
            model: ACTIVE_MODEL,
            max_tokens: 10,
        });

        res.json({
            status: 'SUCCESS',
            message: 'OpenAI está funcionando!',
            response: completion.choices[0]?.message?.content,
            aiStatus: aiStatus
        });

    } catch (error) {
        res.json({
            status: 'ERROR',
            message: 'Erro na OpenAI',
            error: error.message
        });
    }
});

// ✅ ROTA PRINCIPAL
app.post('/api/generate-story', async (req, res) => {
    try {
        const { projectTitle, clientName, description } = req.body;

        console.log(`\n📥 REQUISIÇÃO: ${projectTitle}`);
        console.log('   OpenAI Status:', aiStatus);

        const startTime = Date.now();
        const story = await generateWithAI(projectTitle, clientName, description);
        const processingTime = Date.now() - startTime;

        const usingAI = story.includes('OpenAI GPT');
        console.log(`✅ Gerado em ${processingTime}ms | OpenAI: ${usingAI ? 'SIM' : 'NÃO'}`);

        res.json({
            success: true,
            story: story,
            metadata: {
                aiGenerated: usingAI,
                mode: usingAI ? 'OpenAI GPT' : 'Processamento Inteligente',
                processingTime: `${processingTime}ms`,
                aiStatus: aiStatus
            }
        });

    } catch (error) {
        console.error('💥 Erro:', error);
        res.status(500).json({ error: 'Erro interno' });
    }
});

app.get('/', (req, res) => {
    res.json({ 
        message: '🚀 SINAPSYS OPENAI BACKEND',
        aiStatus: aiStatus,
        model: ACTIVE_MODEL
    });
});

app.listen(PORT, () => {
    console.log('\n========================================');
    console.log('🚀 SINAPSYS OPENAI - ONLINE');
    console.log(`📍 Porta: ${PORT}`);
    console.log(`🌐 Ambiente: ${process.env.NODE_ENV}`);
    console.log(`🤖 AI Status: ${aiStatus}`);
    console.log(`🧠 Modelo: ${ACTIVE_MODEL}`);
    console.log('========================================\n');
});