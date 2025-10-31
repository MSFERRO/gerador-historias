const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ‚úÖ MIDDLEWARE PARA UTF-8 E HEADERS
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend Sinapsys - Deploy Funcionando!',
    version: '2.1',
    timestamp: new Date().toISOString()
  });
});

// Rota principal da API - VERS√ÉO CORRIGIDA
app.post('/api/generate-story', async (req, res) => {
  try {
    const { projectTitle, clientName, description } = req.body;

    // ‚úÖ DEFINIR descLower NO ESCOPO PRINCIPAL
    const descLower = description.toLowerCase();

    if (!projectTitle || !clientName || !description) {
      return res.status(400).json({
        error: 'Todos os campos s√£o obrigat√≥rios'
      });
    }

    if (description.length < 10) {
      return res.status(400).json({
        error: 'A descri√ß√£o deve ter pelo menos 10 caracteres'
      });
    }

    // Fun√ß√µes de processamento SIMPLIFICADAS
    const extractRole = () => {
      const match = description.match(/como\s+([^,.\n]+)/i);
      return match ? match[1].trim() : 'analista';
    };

    const extractMainGoal = () => {
      const patterns = [
        /eu\s+gostaria\s+de\s+([^.!?]+)/i,
        /eu\s+quero\s+([^.!?]+)/i
      ];
      
      for (const pattern of patterns) {
        const match = description.match(pattern);
        if (match && match[1]) return match[1].trim();
      }
      return description.split(/[.!?]/)[0] || description;
    };

    // ‚úÖ Gerar hist√≥ria PROFISSIONAL mas SIMPLES
    const professionalStory = `
# ${projectTitle.toUpperCase()}
**Cliente:** ${clientName}
**Data:** ${new Date().toLocaleDateString('pt-BR')}
**Status:** Ì∫Ä EM DESENVOLVIMENTO

---

## ÌæØ HIST√ìRIA DE USU√ÅRIO

**COMO** ${extractRole()}
**QUERO** ${extractMainGoal()}
**PARA** melhorar a efici√™ncia operacional

---

## Ì≥ã DESCRI√á√ÉO COMPLETA

${description}

---

## ‚úÖ CRIT√âRIOS DE ACEITA√á√ÉO

${descLower.includes('documento') || descLower.includes('pdf') ? '- ‚úÖ **Upload de m√∫ltiplos formatos de documento**\n' : ''}
${descLower.includes('extrair') || descLower.includes('informa√ß√£o') ? '- ‚úÖ **Extra√ß√£o autom√°tica de campos-chave**\n' : ''}
${descLower.includes('excel') || descLower.includes('relat√≥rio') ? '- ‚úÖ **Gera√ß√£o de relat√≥rios Excel**\n' : ''}
${descLower.includes('link') || descLower.includes('hyperlink') ? '- ‚úÖ **Hiperlinks para documentos originais**\n' : ''}
- ‚úÖ **Interface intuitiva e responsiva**
- ‚úÖ **Processamento robusto e seguro**

---

## Ìª†Ô∏è REQUISITOS T√âCNICOS

- Ì¥ß Backend Node.js/Express
- Ì≥ä Processamento de documentos
- Ìæ® Interface moderna
- Ì¥í Seguran√ßa implementada

---

*Documento gerado por Sinapsys Tecnologia - v2.1*
*${new Date().toLocaleString('pt-BR')}*
    `.trim();

    // ‚úÖ HEADER UTF-8 EXPL√çCITO
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.json({
      success: true,
      story: professionalStory,
      metadata: {
        projectTitle,
        clientName,
        generatedAt: new Date().toISOString(),
        descriptionLength: description.length,
        processed: true,
        version: '2.1'
      }
    });

  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

// ‚úÖ CORRE√á√ÉO: REMOVER ROTA CURINGA PROBLEM√ÅTICA
// Serve frontend se estiver na mesma aplica√ß√£o (APENAS para produ√ß√£o)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  // ‚úÖ ROTA CORRIGIDA: SEM '*' APENAS PARA FRONTEND
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
  });
}

// ‚úÖ 404 handler CORRIGIDO (SEM '*')
app.use((req, res) => {
  res.status(404).json({
    error: 'Rota n√£o encontrada',
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
    availableRoutes: ['GET /api/health', 'POST /api/generate-story']
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Contate o suporte'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('Ì∫Ä BACKEND SINAPSYS - VERS√ÉO 2.1 CORRIGIDA');
  console.log(`Ì≥ç Porta: ${PORT}`);
  console.log(`‚úÖ Health: http://localhost:${PORT}/api/health`);
});
