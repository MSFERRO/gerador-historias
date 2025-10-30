const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// CORS para todas as origens (simplificado)
app.use(cors());
app.use(express.json());

let groq;
if (process.env.GROQ_API_KEY) {
  groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend funcionando!',
    groqConfigured: !!process.env.GROQ_API_KEY,
    timestamp: new Date().toISOString()
  });
});

// Rota de histÃ³rias - SIMPLIFICADA E FUNCIONAL
app.post('/api/generate-story', async (req, res) => {
  try {
    console.log('í³ Recebendo requisiÃ§Ã£o:', req.body);
    
    const { projectTitle, clientName, description } = req.body;

    if (!projectTitle || !clientName || !description) {
      return res.status(400).json({
        error: 'Todos os campos sÃ£o obrigatÃ³rios'
      });
    }

    // Resposta SIMPLES para testar a conexÃ£o
    const story = `
# ${projectTitle}
**Cliente:** ${clientName}

## í³‹ HistÃ³ria de UsuÃ¡rio

**Como** usuÃ¡rio do sistema
**Eu quero** ${description.substring(0, 50)}...
**Para** melhorar a eficiÃªncia operacional

---

## âœ… ConexÃ£o Backend-Frontend: âœ… FUNCIONANDO!

*Backend e frontend conectados com sucesso!*
    `;

    res.json({
      success: true,
      story: story,
      metadata: {
        projectTitle,
        clientName,
        generatedAt: new Date().toISOString(),
        mode: 'test'
      }
    });

  } catch (error) {
    console.error('âŒ Erro:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

// Rota raiz
app.get('/', (req, res) => {
  res.json({ message: 'Gerador de HistÃ³rias API' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('íº€ Backend rodando na porta:', PORT);
});
