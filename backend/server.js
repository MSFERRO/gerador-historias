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
  console.log('✅ Health check OK');
  res.json({ 
    status: 'OK', 
    message: 'Backend funcionando!',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/generate-story', (req, res) => {
  console.log('� Recebendo requisição:', req.body);
  
  const { projectTitle, clientName, description } = req.body;
  
  const story = `
# ${projectTitle}
**História gerada com sucesso!**

Backend e frontend conectados ✅
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
  console.log('� Backend rodando na porta:', PORT);
});
