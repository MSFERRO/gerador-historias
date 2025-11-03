const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// ✅ CONFIGURAÇÃO OPENAI
console.log('\n🔧 CONFIGURANDO OPENAI GPT-4o-mini...');

let openai;
let aiStatus = 'NOT_CONFIGURED';
const ACTIVE_MODEL = 'gpt-4o-mini';

if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-')) {
    console.log('✅ OpenAI API Key detectada');
    
    try {
        openai = new OpenAI({ 
            apiKey: process.env.OPENAI_API_KEY,
            timeout: 30000
        });
        aiStatus = 'CONFIGURED';
        console.log('✅ OpenAI configurado | Modelo:', ACTIVE_MODEL);
        
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
        console.log('❌ Erro configuração OpenAI:', error.message);
    }
} else {
    console.log('❌ OpenAI API Key não encontrada');
}

console.log('📊 Status AI:', aiStatus);

// ✅ FUNÇÃO IA COM FORMATAÇÃO MELHORADA
async function generateWithAI(projectTitle, clientName, description) {
    console.log(`\n🤖 SOLICITANDO IA... (Status: ${aiStatus})`);
    
    if (!openai || aiStatus !== 'WORKING') {
        console.log('🔰 Usando fallback - OpenAI não disponível');
        return generateFallbackStory(projectTitle, clientName, description);
    }

    try {
        console.log('🚀 Chamando OpenAI...');
        
        const prompt = `Como Product Owner Sênior, gere uma história de usuário completa em português no formato EXATO abaixo:

PROJETO: ${projectTitle}
CLIENTE: ${clientName}
DESCRIÇÃO: ${description}

**FORMATO EXATO - USE DUAS QUEBRAS DE LINHA ENTRE SEÇÕES:**

HISTÓRIA DE USUÁRIO - ${projectTitle.toUpperCase()}
Cliente: ${clientName}
Data: ${new Date().toLocaleDateString('pt-BR')}
Status: Em Desenvolvimento

HISTÓRIA DE USUÁRIO
COMO: [persona específica]
QUERO: [objetivo claro e detalhado]
PARA: [benefício mensurável]

DESCRIÇÃO DETALHADA
[Descrição completa dos requisitos em parágrafos bem estruturados]

CRITÉRIOS DE ACEITAÇÃO
• [Critério 1 - funcionalidade principal]
• [Critério 2 - aspectos técnicos] 
• [Critério 3 - experiência do usuário]
• [Critério 4 - segurança e proteção]
• [Critério 5 - performance e velocidade]

REQUISITOS TÉCNICOS
• Backend Node.js/Express
• Interface React responsiva
• API RESTful
• Armazenamento seguro de dados
• Validação e tratamento de erros
• Processamento inteligente de documentos

CENÁRIOS DE TESTE
[Cenários BDD formatados com Given-When-Then]

REQUISITOS NÃO FUNCIONAIS
• Performance: [requisitos de desempenho]
• Segurança: [medidas de segurança]
• Usabilidade: [facilidade de uso]
• Confiabilidade: [disponibilidade e estabilidade]

**INSTRUÇÕES CRÍTICAS:**
- USE \\n\\n (DUAS QUEBRAS DE LINHA) ENTRE CADA SEÇÃO PRINCIPAL
- Use bullets (•) para listas, não asteriscos
- Formatação limpa e profissional
- Não mencione OpenAI, GPT, IA ou versões do sistema
- Seja específico e detalhado`;

        const completion = await openai.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "Você é um Product Owner sênior especializado em documentação de requisitos. Gere histórias de usuário profissionais em português com formatação limpa para documentos Word. Use DUAS quebras de linha entre seções. Não mencione OpenAI, GPT, IA ou versões do sistema."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            model: ACTIVE_MODEL,
            temperature: 0.7,
            max_tokens: 4000,
        });

        const aiResponse = completion.choices[0]?.message?.content;
        
        if (aiResponse && aiResponse.length > 100) {
            console.log('✅ OpenAI respondeu!', aiResponse.length, 'caracteres');
            
            // Limpar e formatar resposta
            const cleanResponse = aiResponse
                .replace(/\*\*/g, '') // Remove markdown bold
                .replace(/\*/g, '•')  // Substitui asteriscos por bullets
                .trim();
                
            return cleanResponse + `\n\nDocumento gerado pela aplicação - Sinapsys Tecnologia\n${new Date().toLocaleString('pt-BR')}`;
        }
        
        throw new Error('Resposta muito curta');
        
    } catch (error) {
        console.error('❌ Erro OpenAI:', error.message);
        return generateFallbackStory(projectTitle, clientName, description);
    }
}

// ✅ FALLBACK ATUALIZADO
function generateFallbackStory(projectTitle, clientName, description) {
    const extractRole = () => {
        if (description.toLowerCase().includes('como gerente')) return 'Gerente de Projetos';
        if (description.toLowerCase().includes('como analista')) return 'Analista de Sistemas';
        if (description.toLowerCase().includes('como usuário')) return 'Usuário do Sistema';
        if (description.toLowerCase().includes('como admin')) return 'Administrador do Sistema';
        return 'Usuário do Sistema';
    };

    const extractGoal = () => {
        const match = description.match(/quero\s+([^.!?]+)/i);
        return match ? match[1].trim() : description.substring(0, 100) + '...';
    };

    return `HISTÓRIA DE USUÁRIO - ${projectTitle.toUpperCase()}
Cliente: ${clientName}
Data: ${new Date().toLocaleDateString('pt-BR')}
Status: Em Desenvolvimento

HISTÓRIA DE USUÁRIO
COMO: ${extractRole()}
QUERO: ${extractGoal()}
PARA: melhorar eficiência operacional e otimizar processos

DESCRIÇÃO DETALHADA
${description}

CRITÉRIOS DE ACEITAÇÃO
• Funcionalidade implementada conforme especificado
• Interface intuitiva e responsiva
• Processamento robusto e seguro
• Performance adequada para o uso
• Documentação técnica disponível

REQUISITOS TÉCNICOS
• Backend Node.js/Express
• Processamento de documentos inteligente
• Interface React responsiva
• API RESTful
• Armazenamento seguro de dados
• Validação e tratamento de erros

CENÁRIOS DE TESTE
• Cenário principal: fluxo básico da funcionalidade
• Cenário alternativo: situações excepcionais
• Cenário de erro: tratamento de exceções

REQUISITOS NÃO FUNCIONAIS
• Performance: tempo de resposta adequado
• Segurança: proteção de dados e acesso
• Usabilidade: interface clara e intuitiva
• Confiabilidade: disponibilidade do sistema

Documento gerado pela aplicação - Sinapsys Tecnologia
${new Date().toLocaleString('pt-BR')}`;
}

// ✅ ROTAS DA API
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
            messages: [{ role: "user", content: "Responda com: SISTEMA FUNCIONANDO" }],
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

        if (!projectTitle || !clientName || !description) {
            return res.status(400).json({ 
                success: false,
                error: 'Todos os campos são obrigatórios' 
            });
        }

        if (description.length < 10) {
            return res.status(400).json({
                success: false,
                error: 'Descrição muito curta',
                minLength: 10
            });
        }

        const startTime = Date.now();
        const story = await generateWithAI(projectTitle, clientName, description);
        const processingTime = Date.now() - startTime;

        const usingAI = !story.includes('Processamento Inteligente');
        console.log(`✅ Gerado em ${processingTime}ms | OpenAI: ${usingAI ? 'SIM' : 'NÃO'}`);

        res.json({
            success: true,
            story: story,
            metadata: {
                aiGenerated: usingAI,
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

// ✅ ROTA PARA DOWNLOAD DE WORD - CORRIGIDA
app.post('/api/generate-word-document', async (req, res) => {
    try {
        const { projectTitle, clientName, storyContent } = req.body;

        if (!projectTitle || !storyContent) {
            return res.status(400).json({
                success: false,
                error: 'Título do projeto e conteúdo da história são obrigatórios'
            });
        }

        // Base64 da logo Sinapsys (SVG)
        const logoBase64 = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjUwIiB2aWV3Qm94PSIwIDAgMTUwIDUwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjMDA0RjlGIi8+Cjx0ZXh0IHg9Ijc1IiB5PSIyOCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+U0lOQVBTWVM8L3RleHQ+Cjx0ZXh0IHg9Ijc1IiB5PSI0MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VGVjbm9sb2dpYTwvdGV4dD4KPC9zdmc+';

        const wordContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>História de Usuário - ${projectTitle}</title>
    <style>
        body, html {
            margin: 0;
            padding: 20px;
            font-family: "Arial", sans-serif;
            line-height: 1.6;
            color: #000000;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
        }
        
        .logo-container {
            margin-bottom: 15px;
        }
        
        .logo {
            height: 60px;
            display: block;
            margin: 0 auto;
        }
        
        h1 {
            color: #2c3e50;
            margin: 10px 0 5px 0;
            font-size: 20px;
            font-weight: bold;
        }
        
        .project-info {
            background: #f8f9fa;
            padding: 15px;
            border-left: 4px solid #3498db;
            margin: 15px 0;
            font-size: 12px;
            border: 1px solid #ddd;
        }
        
        .content {
            margin: 25px 0;
            font-size: 12px;
        }
        
        .story-section {
            margin-bottom: 25px;
            page-break-inside: avoid;
        }
        
        .section-title {
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 10px;
            font-size: 14px;
            border-bottom: 1px solid #3498db;
            padding-bottom: 5px;
        }
        
        .section-content {
            margin-left: 15px;
            white-space: pre-wrap;
            font-family: "Arial", sans-serif;
            line-height: 1.5;
        }
        
        .criteria-list, .requirements-list {
            margin: 10px 0;
            padding-left: 20px;
        }
        
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 10px;
        }
        
        @page {
            margin: 1in;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo-container">
            <img src="${logoBase64}" alt="Sinapsys Tecnologia" class="logo">
        </div>
        <h1>HISTÓRIA DE USUÁRIO</h1>
        <div class="project-info">
            <strong>Sistema:</strong> ${projectTitle}<br>
            <strong>Cliente:</strong> ${clientName || 'Não informado'}<br>
            <strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}<br>
            <strong>Status:</strong> Em Desenvolvimento
        </div>
    </div>
    
    <div class="content">
        ${formatStoryForWord(storyContent)}
    </div>
    
    <div class="footer">
        Documento gerado pela aplicação - Sinapsys Tecnologia<br>
        ${new Date().toLocaleString('pt-BR')}
    </div>
</body>
</html>`;

        // Configurar headers para download
        res.setHeader('Content-Type', 'application/msword');
        res.setHeader('Content-Disposition', `attachment; filename="historia-usuario-${projectTitle.replace(/[^\w\s]/gi, '').replace(/\s+/g, '-')}.doc"`);
        res.setHeader('Content-Length', Buffer.byteLength(wordContent, 'utf8'));
        
        res.send(wordContent);

    } catch (error) {
        console.error('💥 Erro ao gerar documento Word:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao gerar documento Word'
        });
    }
});

// ✅ FUNÇÃO AUXILIAR PARA FORMATAR HISTÓRIA PARA WORD
function formatStoryForWord(storyText) {
    const sections = storyText.split('\n\n');
    let html = '';
    
    sections.forEach(section => {
        if (section.trim()) {
            const lines = section.split('\n');
            const firstLine = lines[0].trim();
            
            // Pular seções já tratadas no cabeçalho
            if (firstLine.includes('HISTÓRIA DE USUÁRIO -') || 
                firstLine.includes('Cliente:') || 
                firstLine.includes('Data:') || 
                firstLine.includes('Status:') ||
                firstLine.includes('Documento gerado')) {
                return;
            }
            
            // Identificar seções principais
            if (firstLine.includes('HISTÓRIA DE USUÁRIO') ||
                firstLine.includes('DESCRIÇÃO DETALHADA') ||
                firstLine.includes('CRITÉRIOS DE ACEITAÇÃO') ||
                firstLine.includes('REQUISITOS TÉCNICOS') ||
                firstLine.includes('CENÁRIOS DE TESTE') ||
                firstLine.includes('REQUISITOS NÃO FUNCIONAIS')) {
                
                const content = lines.slice(1).join('<br>').replace(/\•/g, '•');
                html += `
                <div class="story-section">
                    <div class="section-title">${firstLine}</div>
                    <div class="section-content">${content}</div>
                </div>`;
            } else {
                // Seção sem título específico
                html += `
                <div class="story-section">
                    <div class="section-content">${section.replace(/\n/g, '<br>').replace(/\•/g, '•')}</div>
                </div>`;
            }
        }
    });
    
    return html;
}

// ✅ ROTA RAIZ
app.get('/', (req, res) => {
    res.json({
        message: '🚀 SINAPSYS BACKEND API - ONLINE',
        version: '1.0',
        endpoints: {
            health: '/api/health',
            testAI: '/api/test-ai',
            generateStory: '/api/generate-story (POST)',
            generateWordDocument: '/api/generate-word-document (POST)'
        },
        aiStatus: aiStatus,
        timestamp: new Date().toISOString()
    });
});

// ✅ INICIAR SERVIDOR
app.listen(PORT, () => {
    console.log('\n========================================');
    console.log('🚀 SINAPSYS BACKEND API - ONLINE');
    console.log(`📍 Porta: ${PORT}`);
    console.log(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🤖 AI Status: ${aiStatus}`);
    console.log(`🔗 URL: http://localhost:${PORT}`);
    console.log('========================================\n');
});