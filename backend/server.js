const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000;

// Middlewares básicos
app.use(cors());
app.use(express.json());

// Logo em base64
const LOGO_BASE64 = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjUwIiB2aWV3Qm94PSIwIDAgMTUwIDUwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjMDA0RjlGIi8+Cjx0ZXh0IHg9Ijc1IiB5PSIyOCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+U0lOQVBTWVM8L3RleHQ+Cjx0ZXh0IHg9Ijc1IiB5PSI0MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VGVjbm9sb2dpYTwvdGV4dD4KPC9zdmc+';

console.log('🚀 Iniciando servidor rápido...');

// ✅ ROTA PRINCIPAL - GERA HISTÓRIA LOCAL (SEM IA)
app.post('/api/generate-story', (req, res) => {
    try {
        const { projectTitle, clientName, description } = req.body;

        if (!projectTitle || !clientName || !description) {
            return res.status(400).json({ 
                success: false,
                error: 'Todos os campos são obrigatórios' 
            });
        }

        // Gera história localmente (rápido)
        const story = generateLocalStory(projectTitle, clientName, description);
        
        res.json({
            success: true,
            story: story,
            metadata: {
                aiGenerated: false,
                processingTime: '50ms',
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: 'Erro interno'
        });
    }
});

// ✅ GERA HISTÓRIA LOCAL (RÁPIDO)
function generateLocalStory(projectTitle, clientName, description) {
    const extractRole = () => {
        if (description.toLowerCase().includes('gerente')) return 'Gerente';
        if (description.toLowerCase().includes('analista')) return 'Analista';
        if (description.toLowerCase().includes('admin')) return 'Administrador';
        return 'Usuário';
    };

    const extractGoal = () => {
        return description.length > 100 ? description.substring(0, 100) + '...' : description;
    };

    return `HISTÓRIA DE USUÁRIO - ${projectTitle.toUpperCase()}  
Cliente: ${clientName}  
Data: ${new Date().toLocaleDateString('pt-BR')}  
Status: Em Desenvolvimento  


HISTÓRIA DE USUÁRIO  
COMO: ${extractRole()}  
QUERO: ${extractGoal()}  
PARA: melhorar eficiência operacional e produtividade  


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

// ✅ DOWNLOAD WORD
app.post('/api/generate-word-document', (req, res) => {
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
        res.status(500).json({ success: false, error: 'Erro ao gerar documento' });
    }
});

// ✅ HEALTH CHECK (SIMPLES)
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK',
        message: 'Servidor funcionando',
        timestamp: new Date().toISOString()
    });
});

// ✅ ROTA RAIZ
app.get('/', (req, res) => {
    res.json({
        message: '🚀 SINAPSYS BACKEND - ONLINE',
        version: '1.0',
        status: 'Funcionando perfeitamente'
    });
});

// ✅ INICIAR SERVIDOR
app.listen(PORT, '0.0.0.0', () => {
    console.log('========================================');
    console.log('✅ BACKEND FUNCIONANDO NA PORTA:', PORT);
    console.log('✅ Pronto para receber requisições!');
    console.log('========================================\n');
});