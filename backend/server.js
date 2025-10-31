const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ✅ MIDDLEWARE PARA UTF-8 E HEADERS
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

// Rota principal da API - VERSÃO CORRIGIDA
app.post('/api/generate-story', async (req, res) => {
  try {
    const { projectTitle, clientName, description } = req.body;

    // ✅ DEFINIR descLower NO ESCOPO PRINCIPAL
    const descLower = description.toLowerCase();

    if (!projectTitle || !clientName || !description) {
      return res.status(400).json({
        error: 'Todos os campos são obrigatórios'
      });
    }

    if (description.length < 10) {
      return res.status(400).json({
        error: 'A descrição deve ter pelo menos 10 caracteres'
      });
    }

    // Funções de processamento SIMPLIFICADAS
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

    // ✅ Gerar história PROFISSIONAL mas SIMPLES
    const professionalStory = `
# ${projectTitle.toUpperCase()}
**Cliente:** ${clientName}
**Data:** ${new Date().toLocaleDateString('pt-BR')}
**Status:** � EM DESENVOLVIMENTO

---

## � HISTÓRIA DE USUÁRIO

**COMO** ${extractRole()}
**QUERO** ${extractMainGoal()}
**PARA** melhorar a eficiência operacional

---

## � DESCRIÇÃO COMPLETA

${description}

---

## ✅ CRITÉRIOS DE ACEITAÇÃO

${descLower.includes('documento') || descLower.includes('pdf') ? '- ✅ **Upload de múltiplos formatos de documento**\n' : ''}
${descLower.includes('extrair') || descLower.includes('informação') ? '- ✅ **Extração automática de campos-chave**\n' : ''}
${descLower.includes('excel') || descLower.includes('relatório') ? '- ✅ **Geração de relatórios Excel**\n' : ''}
${descLower.includes('link') || descLower.includes('hyperlink') ? '- ✅ **Hiperlinks para documentos originais**\n' : ''}
- ✅ **Interface intuitiva e responsiva**
- ✅ **Processamento robusto e seguro**

---

## �️ REQUISITOS TÉCNICOS

- � Backend Node.js/Express
- � Processamento de documentos
- � Interface moderna
- � Segurança implementada

---

*Documento gerado por Sinapsys Tecnologia - v2.1*
*${new Date().toLocaleString('pt-BR')}*
    `.trim();

    // ✅ HEADER UTF-8 EXPLÍCITO
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

// ✅ CORREÇÃO: REMOVER ROTA CURINGA PROBLEMÁTICA
// Serve frontend se estiver na mesma aplicação (APENAS para produção)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  // ✅ ROTA CORRIGIDA: SEM '*' APENAS PARA FRONTEND
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
  });
}

// ✅ 404 handler CORRIGIDO (SEM '*')
app.use((req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
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
  console.log('� BACKEND SINAPSYS - VERSÃO 2.1 CORRIGIDA');
  console.log(`� Porta: ${PORT}`);
  console.log(`✅ Health: http://localhost:${PORT}/api/health`);
});
