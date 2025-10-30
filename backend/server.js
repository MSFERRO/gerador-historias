const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000;

// CORS configurado corretamente
app.use(cors({
  origin: ['https://gerador-historias-frontend.onrender.com', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());

app.get('/api/health', (req, res) => {
  console.log('âœ… Health check OK');
  res.json({ 
    status: 'OK', 
    message: 'Backend funcionando!',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/generate-story', (req, res) => {
  console.log('í³ Recebendo requisiÃ§Ã£o:', req.body);
  
  const { projectTitle, clientName, description } = req.body;
  
  const story = `
# ${projectTitle}
**HistÃ³ria gerada com sucesso!**

Backend e frontend conectados âœ…
  `;

  res.json({
    success: true,
    story: story,
    metadata: {
      projectTitle,
      clientName,
      generatedAt: new Date().toISOString()
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('íº€ Backend rodando na porta:', PORT);
});
