const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend Sinapsys - Versão Profissional',
    version: '3.0',
    timestamp: new Date().toISOString()
  });
});

// Rota principal - VERSÃO TEXTO LIMPO
app.post('/api/generate-story', async (req, res) => {
  try {
    const { projectTitle, clientName, description } = req.body;

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

    // Funções de processamento
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

    // ✅ TEXTO 100% LIMPO - SEM EMOJIS, SEM ASTERISCOS
    const cleanStory = `
SISTEMA: ${projectTitle.toUpperCase()}
CLIENTE: ${clientName}
DATA: ${new Date().toLocaleDateString('pt-BR')}
STATUS: EM DESENVOLVIMENTO

================================================================================

HISTÓRIA DE USUÁRIO

COMO: ${extractRole()}
QUERO: ${extractMainGoal()}
PARA: melhorar a eficiência operacional

================================================================================

DESCRIÇÃO DETALHADA

${description}

================================================================================

CRITÉRIOS DE ACEITAÇÃO

${descLower.includes('documento') || descLower.includes('pdf') ? '- Upload de múltiplos formatos de documento\n' : ''}
${descLower.includes('extrair') || descLower.includes('informação') ? '- Extração automática de campos-chave\n' : ''}
${descLower.includes('excel') || descLower.includes('relatório') ? '- Geração de relatórios Excel\n' : ''}
${descLower.includes('link') || descLower.includes('hyperlink') ? '- Hiperlinks para documentos originais\n' : ''}
- Interface intuitiva e responsiva
- Processamento robusto e seguro
- Validação de dados integrada
- Segurança implementada em todas as camadas

================================================================================

REQUISITOS TÉCNICOS

- Backend Node.js/Express
- Processamento de documentos inteligente
- Interface React responsiva
- API RESTful
- Armazenamento seguro de dados
- Validação e tratamento de erros

================================================================================

INFORMAÇÕES DO PROJETO

- Data de geração: ${new Date().toLocaleString('pt-BR')}
- Caracteres processados: ${description.length}
- Palavras processadas: ${Math.ceil(description.length / 6)}

================================================================================

Documento gerado automaticamente
${new Date().toLocaleString('pt-BR')}
    `.trim();

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.json({
      success: true,
      story: cleanStory,
      metadata: {
        projectTitle,
        clientName,
        generatedAt: new Date().toISOString(),
        descriptionLength: description.length,
        processed: true,
        version: '3.0'
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

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.originalUrl
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('��� BACKEND SINAPSYS - VERSÃO PROFISSIONAL 3.0');
  console.log(`��� Porta: ${PORT}`);
});
