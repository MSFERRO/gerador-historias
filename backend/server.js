const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Gerador de Histórias API está funcionando!',
    groqConfigured: !!process.env.GROQ_API_KEY,
    timestamp: new Date().toISOString(),
    version: '2.0'
  });
});

// Test route for Groq
app.get('/api/test-groq', (req, res) => {
  res.json({
    groqAvailable: !!process.env.GROQ_API_KEY,
    message: process.env.GROQ_API_KEY ? 'Groq API configurada' : 'Groq API não configurada',
    timestamp: new Date().toISOString()
  });
});

// Rota principal da API - VERSÃO PROFISSIONAL
app.post('/api/generate-story', async (req, res) => {
  try {
    const { projectTitle, clientName, description } = req.body;

    if (!projectTitle || !clientName || !description) {
      return res.status(400).json({
        error: 'Todos os campos são obrigatórios',
        fields: {
          projectTitle: !projectTitle,
          clientName: !clientName, 
          description: !description
        }
      });
    }

    if (description.length < 10) {
      return res.status(400).json({
        error: 'A descrição deve ter pelo menos 10 caracteres',
        currentLength: description.length
      });
    }

    // FUNÇÕES DE PROCESSAMENTO PROFISSIONAL
    const extractRole = (desc) => {
      const roleMatch = desc.match(/Como\s+(um|uma)?\s+([^,\n.]+)/i);
      return roleMatch ? roleMatch[2].trim() : 'analista de sistemas';
    };

    const extractMainGoal = (desc) => {
      // Procura por padrões comuns de "eu quero/gostaria/preciso"
      const patterns = [
        /eu\s+gostaria\s+de\s+([^,\n.]+?)(?=,|\s+para|$)/i,
        /eu\s+quero\s+([^,\n.]+?)(?=,|\s+para|$)/i,
        /eu\s+preciso\s+([^,\n.]+?)(?=,|\s+para|$)/i,
        /para\s+que\s+eu\s+possa\s+([^,\n.]+)/i
      ];
      
      for (const pattern of patterns) {
        const match = desc.match(pattern);
        if (match) return match[1].trim();
      }
      
      // Fallback: pega as primeiras palavras relevantes
      const sentences = desc.split(/[.!?]+/);
      const firstSentence = sentences[0] || desc;
      const words = firstSentence.split(' ').slice(0, 25).join(' ');
      return words.length > 80 ? words.substring(0, 80) + '...' : words;
    };

    const extractBenefit = (desc) => {
      const benefitPatterns = [
        /para\s+(que\s+)?([^.\n]+?)(?=\.|\n|$)/i,
        /de\s+forma\s+que\s+([^.\n]+)/i,
        /para\s+([^.\n]+?)(?=\.|\n|$)/i
      ];
      
      for (const pattern of benefitPatterns) {
        const match = desc.match(pattern);
        if (match) return match[1] ? match[1].trim() : match[2].trim();
      }
      
      return 'otimizar processos e melhorar a eficiência operacional';
    };

    const generateAcceptanceCriteria = (desc) => {
      const criteria = [];
      const descLower = desc.toLowerCase();
      
      // Análise de documentos
      if (descLower.includes('documento') || descLower.includes('pdf') || descLower.includes('docx')) {
        criteria.push('✅ **Sistema deve aceitar upload de múltiplos formatos de documento (PDF, DOCX, etc.)**');
        criteria.push('✅ **Validação de tipos de arquivo permitidos com mensagens de erro claras**');
        criteria.push('✅ **Suporte a arquivos de até 50MB por upload**');
      }
      
      // Extração de dados
      if (descLower.includes('extrair') || descLower.includes('informação') || descLower.includes('dado')) {
        criteria.push('✅ **Extrair automaticamente campos-chave dos documentos**');
        criteria.push('✅ **Identificar e processar informações estruturadas e semi-estruturadas**');
        criteria.push('✅ **Tratamento de erros na extração com relatório detalhado**');
      }
      
      // Relatórios Excel
      if (descLower.includes('excel') || descLower.includes('relatório') || descLower.includes('planilha')) {
        criteria.push('✅ **Gerar relatório em Excel com colunas pré-definidas**');
        criteria.push('✅ **Formatação profissional da planilha com cabeçalhos fixos**');
        criteria.push('✅ **Exportação em formato XLSX compatível com Excel 2010+**');
      }
      
      // Links e navegação
      if (descLower.includes('hyperlink') || descLower.includes('link') || descLower.includes('caminho')) {
        criteria.push('✅ **Incluir hiperlink clicável para documento original**');
        criteria.push('✅ **Manter referência absoluta ao arquivo fonte**');
        criteria.push('✅ **Links funcionais em ambiente de rede corporativa**');
      }
      
      // Processamento em lote
      if (descLower.includes('múltiplo') || descLower.includes('vário') || descLower.includes('lote')) {
        criteria.push('✅ **Processamento em lote de múltiplos arquivos**');
        criteria.push('✅ **Barra de progresso durante o processamento**');
        criteria.push('✅ **Relatório consolidado do processamento em lote**');
      }
      
      // Interface do usuário
      if (descLower.includes('interface') || descLower.includes('usuário') || descLower.includes('página')) {
        criteria.push('✅ **Interface intuitiva e de fácil utilização**');
        criteria.push('✅ **Feedback visual durante todas as operações**');
        criteria.push('✅ **Design responsivo para diferentes dispositivos**');
      }
      
      // Critérios padrão
      if (criteria.length === 0) {
        criteria.push(
          '✅ **Funcionalidade implementada conforme especificação do cliente**',
          '✅ **Interface intuitiva e de fácil utilização**',
          '✅ **Documentação técnica completa e atualizada**',
          '✅ **Testes de aceitação aprovados pelo usuário**',
          '✅ **Performance adequada para o volume esperado**',
          '✅ **Tratamento de erros robusto e informativo**'
        );
      }
      
      return criteria.join('\n\n');
    };

    const generateTechnicalRequirements = (desc) => {
      const requirements = [];
      const descLower = desc.toLowerCase();
      
      if (descLower.includes('upload') || descLower.includes('envio')) {
        requirements.push('📁 **Sistema de upload de arquivos multiplataforma**');
        requirements.push('🛡️ **Validação de segurança nos uploads (antivírus, tipo MIME)**');
        requirements.push('💾 **Armazenamento temporário seguro**');
      }
      
      if (descLower.includes('extrair') || descLower.includes('processar')) {
        requirements.push('🔍 **Módulo de extração de dados inteligente**');
        requirements.push('🤖 **Processamento automatizado de documentos**');
        requirements.push('📝 **Parser para diferentes formatos de documento**');
      }
      
      if (descLower.includes('excel') || descLower.includes('relatório')) {
        requirements.push('📊 **Geração de relatórios Excel automatizada**');
        requirements.push('📈 **Formatação condicional e profissional**');
        requirements.push('🔗 **Geração de hiperlinks funcionais**');
      }
      
      if (descLower.includes('interface') || descLower.includes('usuário')) {
        requirements.push('🎨 **Interface responsiva e moderna**');
        requirements.push('⚡ **Experiência do usuário otimizada**');
        requirements.push('📱 **Design adaptável para mobile e desktop**');
      }
      
      if (descLower.includes('segurança') || descLower.includes('acesso')) {
        requirements.push('🔐 **Autenticação e autorização robustas**');
        requirements.push('📜 **Logs de auditoria detalhados**');
        requirements.push('🛡️ **Proteção contra ataques comuns (XSS, CSRF)**');
      }

      return requirements.length > 0 ? 
        requirements.join('\n\n') : 
        '🔧 **Arquitetura escalável e de fácil manutenção**\n\n🚀 **Performance otimizada para grande volume de dados**\n\n🛡️ **Segurança implementada em todas as camadas**';
    };

    const generateUserStories = (desc) => {
      const stories = [];
      const descLower = desc.toLowerCase();
      
      stories.push('### 📋 História Principal\n');
      stories.push(`**Como** ${extractRole(description)}`);
      stories.push(`**Quero** ${extractMainGoal(description)}`);
      stories.push(`**Para** ${extractBenefit(description)}`);
      
      // Histórias derivadas baseadas na descrição
      if (descLower.includes('upload') || descLower.includes('documento')) {
        stories.push('\n### 📤 História de Upload\n');
        stories.push('**Como** usuário do sistema');
        stories.push('**Quero** fazer upload de múltiplos documentos de uma vez');
        stories.push('**Para** agilizar o processo de envio de arquivos');
      }
      
      if (descLower.includes('extrair') || descLower.includes('dado')) {
        stories.push('\n### 🔍 História de Extração\n');
        stories.push('**Como** usuário do sistema');
        stories.push('**Quero** que o sistema extraia automaticamente informações dos documentos');
        stories.push('**Para** evitar digitação manual e reduzir erros');
      }
      
      if (descLower.includes('excel') || descLower.includes('relatório')) {
        stories.push('\n### 📊 História de Relatório\n');
        stories.push('**Como** usuário do sistema');
        stories.push('**Quero** gerar relatórios em Excel automaticamente');
        stories.push('**Para** analisar os dados de forma estruturada');
      }
      
      return stories.join('\n');
    };

    // GERAR HISTÓRIA PROFISSIONAL COMPLETA
    const professionalStory = `
# ${projectTitle.toUpperCase()}
**Cliente:** ${clientName}
**Data de Geração:** ${new Date().toLocaleDateString('pt-BR')}
**Status:** 📋 EM DESENVOLVIMENTO
**Versão do Documento:** 1.0

---

## 🎯 HISTÓRIA DE USUÁRIO PRINCIPAL

${generateUserStories(description)}

---

## 📋 DESCRIÇÃO DETALHADA

${description}

---

## ✅ CRITÉRIOS DE ACEITAÇÃO

${generateAcceptanceCriteria(description)}

---

## 🚀 REQUISITOS TÉCNICOS

${generateTechnicalRequirements(description)}

---

## 🎨 REQUISITOS DE INTERFACE

- **Design System:** Padrão Sinapsys Tecnologia
- **Cores Principais:** #003F51 (Azul Escuro), #21B8D5 (Azul Claro)
- **Responsividade:** Mobile First
- **Acessibilidade:** WCAG 2.1 AA
- **Navegadores:** Chrome, Firefox, Safari, Edge (últimas 2 versões)

---

## 📊 MÉTRICAS DE SUCESSO

- [ ] Funcionalidade implementada conforme especificado
- [ ] Documentação técnica atualizada
- [ ] Testes de aceitação aprovados
- [ ] Deploy em ambiente de produção
- [ ] Treinamento de usuários concluído
- [ ] Feedback positivo dos usuários (> 80% satisfação)
- [ ] Performance: carregamento < 3 segundos
- [ ] Disponibilidade: 99.5% uptime

---

## 🔄 PRÓXIMOS PASSOS

1. **Análise técnica detalhada** (Semana 1)
2. **Prototipagem da interface** (Semana 2)
3. **Desenvolvimento do backend** (Semanas 3-4)
4. **Desenvolvimento do frontend** (Semanas 5-6)
5. **Testes de integração** (Semana 7)
6. **Deploy em ambiente de homologação** (Semana 8)
7. **Treinamento de usuários** (Semana 9)
8. **Go-live produção** (Semana 10)

---

## 📞 CONTATOS

**Product Owner:** ${clientName}
**Analista de Requisitos:** Equipe Sinapsys
**Desenvolvedor Responsável:** Full Stack Team
**Data de Revisão:** ${new Date().toLocaleDateString('pt-BR')}

---

*Documento gerado automaticamente por Sinapsys Tecnologia*
*Gerado em: ${new Date().toLocaleString('pt-BR')}*
*Processado com sucesso - ${description.length} caracteres analisados*
    `.trim();

    res.json({
      success: true,
      story: professionalStory,
      metadata: {
        projectTitle,
        clientName,
        generatedAt: new Date().toISOString(),
        descriptionLength: description.length,
        processed: true,
        version: '2.0',
        features: {
          hasDocuments: description.toLowerCase().includes('documento'),
          hasExtraction: description.toLowerCase().includes('extrair'),
          hasReports: description.toLowerCase().includes('excel') || description.toLowerCase().includes('relatório'),
          hasLinks: description.toLowerCase().includes('link') || description.toLowerCase().includes('hyperlink')
        }
      }
    });

  } catch (error) {
    console.error('Erro no servidor:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message,
      timestamp: new Date().toISOString(),
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Rota para teste rápido
app.post('/api/quick-test', (req, res) => {
  const { test } = req.body;
  res.json({
    message: 'Teste rápido funcionando!',
    received: test,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve frontend se estiver na mesma aplicação (para produção)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
  });
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error middleware:', error);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Entre em contato com o suporte',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
    availableRoutes: [
      'GET /api/health',
      'GET /api/test-groq',
      'POST /api/generate-story',
      'POST /api/quick-test'
    ]
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('🚀 BACKEND PROFISSIONAL INICIADO!');
  console.log(`📍 Porta: ${PORT}`);
  console.log(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Health: http://localhost:${PORT}/api/health`);
  console.log(`🤖 Groq: ${process.env.GROQ_API_KEY ? 'CONFIGURADO' : 'NÃO CONFIGURADO'}`);
  console.log(`⚡ Versão: 2.0 - Processamento Profissional`);
  console.log('=' .repeat(50));
});