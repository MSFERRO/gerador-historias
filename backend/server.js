const express = require('express');
const cors = require('cors');
const path = require('path');
const { Groq } = require('groq-sdk'); // ✅ Importação direta
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ✅ CONFIGURAÇÃO GROQ - SIMPLES E DIRETA
console.log('\n=== 🚀 CONFIGURANDO GROQ IA ===');

let groq;
let groqReady = false;

// Verificação IMEDIATA da API Key
if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.startsWith('gsk_')) {
    console.log('✅ API Key detectada:', process.env.GROQ_API_KEY.substring(0, 20) + '...');
    
    try {
        groq = new Groq({
            apiKey: process.env.GROQ_API_KEY,
            timeout: 30000
        });
        console.log('✅ Groq instanciado com sucesso!');
        groqReady = true;
        
        // Teste de conexão em background
        testGroqConnection();
        
    } catch (error) {
        console.log('❌ Erro ao criar instância Groq:', error.message);
        groqReady = false;
    }
} else {
    console.log('❌ API Key não encontrada ou inválida');
    console.log('   - GROQ_API_KEY existe?', !!process.env.GROQ_API_KEY);
    if (process.env.GROQ_API_KEY) {
        console.log('   - Valor:', process.env.GROQ_API_KEY.substring(0, 10) + '...');
    }
}

// Função para testar conexão
async function testGroqConnection() {
    if (!groq) return;
    
    try {
        console.log('🔄 Testando conexão com Groq...');
        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: "Diga apenas OK" }],
            model: "llama3-8b-8192",
            max_tokens: 5,
        });
        console.log('✅ Conexão Groq: FUNCIONANDO -', completion.choices[0]?.message?.content);
    } catch (error) {
        console.log('❌ Falha na conexão Groq:', error.message);
        groqReady = false;
    }
}

// ✅ FUNÇÃO PRINCIPAL DA IA
async function generateWithAI(projectTitle, clientName, description) {
    console.log(`\n🤖 SOLICITANDO IA GROQ... (${groqReady ? 'PRONTA' : 'NÃO PRONTA'})`);
    
    if (!groqReady || !groq) {
        console.log('🔰 Usando fallback (Groq não disponível)');
        return generateFallbackStory(projectTitle, clientName, description);
    }

    try {
        console.log('🚀 Chamando API Groq...');
        
        const prompt = `Como Product Owner Sênior, gere uma história de usuário completa para:

PROJETO: ${projectTitle}
CLIENTE: ${clientName}
DESCRIÇÃO: ${description}

Formato:
- COMO [persona], QUERO [objetivo], PARA [benefício]
- Critérios de aceitação
- Cenários de teste
- Requisitos não funcionais

Use português brasileiro.`;

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "Você é um Product Owner experiente. Gere histórias de usuário profissionais e completas."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            model: "llama3-8b-8192",
            temperature: 0.7,
            max_tokens: 3000,
        });

        const aiResponse = completion.choices[0]?.message?.content;
        
        if (!aiResponse) {
            throw new Error('Resposta vazia da IA');
        }

        console.log('✅ IA respondeu com', aiResponse.length, 'caracteres');
        
        return `
SISTEMA: ${projectTitle.toUpperCase()}
CLIENTE: ${clientName}
DATA: ${new Date().toLocaleDateString('pt-BR')}
VERSÃO: 4.0 - IA Groq Powered

================================================================================
HISTÓRIA DE USUÁRIO GERADA POR IA
================================================================================

${aiResponse}

================================================================================

DOCUMENTO GERADO POR IA GROQ - SINAPSYS TECNOLOGIA
${new Date().toLocaleString('pt-BR')}
`.trim();

    } catch (error) {
        console.error('❌ Erro na IA:', error.message);
        console.log('🔰 Alternando para fallback...');
        return generateFallbackStory(projectTitle, clientName, description);
    }
}

// ✅ FALLBACK SIMPLES
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

// ✅ ROTAS DE DIAGNÓSTICO
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        groq: {
            ready: groqReady,
            configured: !!groq,
            apiKeyExists: !!process.env.GROQ_API_KEY
        },
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

app.get('/api/debug', (req, res) => {
    res.json({
        groq: {
            ready: groqReady,
            configured: !!groq,
            apiKeyExists: !!process.env.GROQ_API_KEY,
            apiKeyValid: process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.startsWith('gsk_') : false,
            apiKeyPreview: process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.substring(0, 15) + '...' : 'N/A'
        },
        system: {
            nodeEnv: process.env.NODE_ENV,
            port: PORT,
            timestamp: new Date().toISOString()
        }
    });
});

// ✅ ROTA PRINCIPAL
app.post('/api/generate-story', async (req, res) => {
    try {
        const { projectTitle, clientName, description } = req.body;

        console.log(`\n📥 NOVA REQUISIÇÃO: ${projectTitle} | Groq: ${groqReady ? 'SIM' : 'NÃO'}`);

        if (!projectTitle || !clientName || !description) {
            return res.status(400).json({ error: 'Campos obrigatórios faltando' });
        }

        const startTime = Date.now();
        const story = await generateWithAI(projectTitle, clientName, description);
        const processingTime = Date.now() - startTime;

        console.log(`✅ Gerado em ${processingTime}ms | Modo: ${groqReady ? 'IA Groq' : 'Fallback'}`);

        res.json({
            success: true,
            story: story,
            metadata: {
                processingTime: `${processingTime}ms`,
                aiGenerated: groqReady,
                mode: groqReady ? 'IA Groq' : 'Processamento Inteligente',
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('💥 Erro:', error);
        res.status(500).json({ error: 'Erro interno' });
    }
});

// ✅ SERVE FRONTEND
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend/build')));
    app.use((req, res) => {
        res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
    });
}

// ✅ INICIAR SERVIDOR
app.listen(PORT, () => {
    console.log('\n========================================');
    console.log('🚀 SERVIDOR INICIADO - SINAPSYS IA');
    console.log(`📍 Porta: ${PORT}`);
    console.log(`🌐 Ambiente: ${process.env.NODE_ENV}`);
    console.log(`🤖 Groq IA: ${groqReady ? 'PRONTA 🎯' : 'NÃO PRONTA ⚠️'}`);
    console.log(`📊 Health: http://localhost:${PORT}/api/health`);
    console.log(`🔍 Debug: http://localhost:${PORT}/api/debug`);
    console.log('========================================\n');
});