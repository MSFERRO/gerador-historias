const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// Middlewares SIMPLIFICADOS
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ✅ CONFIGURAÇÃO OPENAI RÁPIDA
console.log('🔧 Iniciando servidor...');

let openai;
let aiStatus = 'NOT_CONFIGURED';
const ACTIVE_MODEL = 'gpt-4o-mini';

// Configuração rápida da OpenAI (sem async)
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-')) {
    try {
        openai = new OpenAI({ 
            apiKey: process.env.OPENAI_API_KEY,
            timeout: 25000 // Reduzido para 25 segundos
        });
        aiStatus = 'CONFIGURED';
        console.log('✅ OpenAI configurado | Modelo:', ACTIVE_MODEL);
        
        // Teste de conexão EM SEGUNDO PLANO (não bloqueia o startup)
        setTimeout(async () => {
            try {
                console.log('🔄 Testando conexão OpenAI em background...');
                const test = await openai.chat.completions.create({
                    messages: [{ role: "user", content: "Teste" }],
                    model: ACTIVE_MODEL,
                    max_tokens: 5,
                });
                aiStatus = 'WORKING';
                console.log('🎉 CONEXÃO OPENAI: OK');
            } catch (error) {
                aiStatus = 'ERROR';
                console.log('❌ Erro no teste OpenAI:', error.message);
            }
        }, 1000);
        
    } catch (error) {
        console.log('❌ Erro configuração OpenAI:', error.message);
    }
} else {
    console.log('❌ OpenAI API Key não encontrada');
}

// ✅ LOGO EM BASE64 (FIXA)
const LOGO_BASE64 = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjUwIiB2aWV3Qm94PSIwIDAgMTUwIDUwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjMDA0RjlGIi8+Cjx0ZXh0IHg9Ijc1IiB5PSIyOCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+U0lOQVBTWVM8L3RleHQ+Cjx0ZXh0IHg9Ijc1IiB5PSI0MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VGVjbm9sb2dpYTwvdGV4dD4KPC9zdmc+';

// ✅ FUNÇÃO IA OTIMIZADA
async function generateWithAI(projectTitle, clientName, description) {
    if (!openai || aiStatus !== 'WORKING') {
        return generateFallbackStory(projectTitle, clientName, description);
    }

    try {
        const prompt = `Como Product Owner, gere história de usuário em português:

HISTÓRIA DE USUÁRIO - ${projectTitle.toUpperCase()}  
Cliente: ${clientName}  
Data: ${new Date().toLocaleDateString('pt-BR')}  
Status: Em Desenvolvimento  

HISTÓRIA DE USUÁRIO  
COMO: [persona]  
QUERO: [objetivo]  
PARA: [benefício]  

DESCRIÇÃO DETALHADA  
${description}  

CRITÉRIOS DE ACEITAÇÃO  
• Funcionalidade principal  
• Experiência do usuário  
• Segurança  
• Performance  

REQUISITOS TÉCNICOS  
• Backend Node.js/Express  
• Interface React  
• API RESTful  

CENÁRIOS DE TESTE  
• Cenário principal  

REQUISITOS NÃO FUNCIONAIS  
• Performance  
• Segurança  
• Usabilidade  

Use bullets (•) e quebras de linha.`;

        const completion = await openai.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "Gere histórias de usuário profissionais em português com formatação simples."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            model: ACTIVE_MODEL,
            temperature: 0.7,
            max_tokens: 2000, // Reduzido
        });

        const aiResponse = completion.choices[0]?.message?.content;
        
        if (aiResponse) {
            return cleanAndFormatResponse(aiResponse) + `\n\nDocumento gerado pela aplicação - Sinapsys Tecnologia\n${new Date().toLocaleString('pt-BR')}`;
        }
        
        throw new Error('Resposta vazia');
        
    } catch (error) {
        console.error('❌ Erro OpenAI:', error.message);
        return generateFallbackStory(projectTitle, clientName, description);
    }
}

// ✅ FUNÇÃO DE LIMPEZA SIMPLIFICADA
function cleanAndFormatResponse(text) {
    return text
        .replace(/\*\*/g, '')
        .replace(/\*/g, '•')
        .replace(/- /g, '• ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

// ✅ FALLBACK RÁPIDO
function generateFallbackStory(projectTitle, clientName, description) {
    return `HISTÓRIA DE USUÁRIO - ${projectTitle.toUpperCase()}  
Cliente: ${clientName}  
Data: ${new Date().toLocaleDateString('pt-BR')}  
Status: Em Desenvolvimento  

HISTÓRIA DE USUÁRIO  
COMO: Usuário do Sistema  
QUERO: ${description.substring(0, 100)}  
PARA: melhorar eficiência operacional  

DESCRIÇÃO DETALHADA  
${description}  

CRITÉRIOS DE ACEITAÇÃO  
• Funcionalidade implementada conforme especificado  
• Interface intuitiva e responsiva  
• Processamento seguro  

REQUISITOS TÉCNICOS  
• Backend Node.js/Express  
• Interface React responsiva  
• API RESTful  

CENÁRIOS DE TESTE  
• Cenário principal: fluxo básico  

REQUISITOS NÃO FUNCIONAIS  
• Performance: tempo de resposta adequado  
• Segurança: proteção de dados  
• Usabilidade: interface intuitiva  

Documento gerado pela aplicação - Sinapsys Tecnologia
${new Date().toLocaleString('pt-BR')}`;
}

// ✅ ROTAS OTIMIZADAS

// Health check RÁPIDO
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK',
        aiStatus: aiStatus,
        timestamp: new Date().toISOString()
    });
});

// Rota principal OTIMIZADA
app.post('/api/generate-story', async (req, res) => {
    try {
        const { projectTitle, clientName, description } = req.body;

        if (!projectTitle || !clientName || !description) {
            return res.status(400).json({ 
                success: false,
                error: 'Todos os campos são obrigatórios' 
            });
        }

        const startTime = Date.now();
        const story = await generateWithAI(projectTitle, clientName, description);
        const processingTime = Date.now() - startTime;

        console.log(`✅ História gerada em ${processingTime}ms`);

        res.json({
            success: true,
            story: story,
            processingTime: `${processingTime}ms`
        });

    } catch (error) {
        console.error('💥 Erro:', error.message);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

// Download Word SIMPLIFICADO
app.post('/api/generate-word-document', async (req, res) => {
    try {
        const { projectTitle, clientName, storyContent } = req.body;

        if (!projectTitle || !storyContent) {
            return res.status(400).json({
                success: false,
                error: 'Dados obrigatórios'
            });
        }

        const wordContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>História de Usuário - ${projectTitle}</title>
    <style>
        body { margin: 25px; font-family: Arial; line-height: 1.6; }
        .header { margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
        .logo { height: 60px; }
        h1 { color: #2c3e50; margin: 10px 0; font-size: 20px; }
        .project-info { background: #f8f9fa; padding: 15px; margin: 15px 0; font-size: 12px; }
        .content { margin: 25px 0; font-size: 12px; white-space: pre-wrap; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <img src="${LOGO_BASE64}" alt="Sinapsys" class="logo">
        <h1>HISTÓRIA DE USUÁRIO</h1>
        <div class="project-info">
            <strong>Sistema:</strong> ${projectTitle}<br>
            <strong>Cliente:</strong> ${clientName || 'Não informado'}<br>
            <strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}<br>
            <strong>Status:</strong> Em Desenvolvimento
        </div>
    </div>
    
    <div class="content">
        ${storyContent.replace(/\n/g, '<br>')}
    </div>
    
    <div class="footer">
        Documento gerado pela aplicação - Sinapsys Tecnologia<br>
        ${new Date().toLocaleString('pt-BR')}
    </div>
</body>
</html>`;

        res.setHeader('Content-Type', 'application/msword');
        res.setHeader('Content-Disposition', `attachment; filename="historia-${projectTitle.replace(/[^\w\s]/gi, '').replace(/\s+/g, '-')}.doc"`);
        
        res.send(wordContent);

    } catch (error) {
        console.error('Erro Word:', error.message);
        res.status(500).json({ success: false, error: 'Erro ao gerar documento' });
    }
});

// Rota raiz SIMPLES
app.get('/', (req, res) => {
    res.json({
        message: '🚀 SINAPSYS API - ONLINE',
        aiStatus: aiStatus,
        endpoints: ['/api/health', '/api/generate-story (POST)', '/api/generate-word-document (POST)']
    });
});

// ✅ INICIAR SERVIDOR RÁPIDO
app.listen(PORT, '0.0.0.0', () => {
    console.log('========================================');
    console.log('🚀 SERVIDOR INICIADO NA PORTA:', PORT);
    console.log('🤖 Status AI:', aiStatus);
    console.log('========================================\n');
});

// Health check para o Render
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});