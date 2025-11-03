// server.js - VERSÃO TESTE SIMPLES
const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware básico
app.use(express.json());

// ✅ ROTA DE TESTE MUITO SIMPLES
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 SERVIDOR FUNCIONANDO!',
    timestamp: new Date().toISOString(),
    port: PORT,
    nodeEnv: process.env.NODE_ENV
  });
});

// ✅ HEALTH CHECK
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    message: 'Servidor online',
    timestamp: new Date().toISOString()
  });
});

// ✅ TESTE DE VARIÁVEIS DE AMBIENTE
app.get('/api/env', (req, res) => {
  res.json({
    GROQ_API_KEY: process.env.GROQ_API_KEY ? 'EXISTS' : 'NOT_FOUND',
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV,
    allVars: Object.keys(process.env)
  });
});

// ✅ INICIAR SERVIDOR COM DEBUG
app.listen(PORT, () => {
  console.log('========================================');
  console.log('🚀 SERVIDOR TESTE INICIADO');
  console.log(`📍 Porta: ${PORT}`);
  console.log(`🌐 Ambiente: ${process.env.NODE_ENV}`);
  console.log(`🔑 GROQ_API_KEY: ${process.env.GROQ_API_KEY ? 'EXISTS' : 'NOT_FOUND'}`);
  console.log('========================================');
  console.log('📊 URLs para teste:');
  console.log(`   http://localhost:${PORT}/`);
  console.log(`   http://localhost:${PORT}/api/health`);
  console.log(`   http://localhost:${PORT}/api/env`);
});