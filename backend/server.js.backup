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
    message: 'Gerador de Histórias API está funcionando!',
    groqConfigured: !!process.env.GROQ_API_KEY,
    timestamp: new Date().toISOString(),
    version: '2.1'
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

// Rota principal da API - VERSÃO CORRIGIDA
app.post('/api/generate-story', async (req, res) => {
  try {
    const { projectTitle, clientName, description } = req.body;

    // ✅ ADICIONAR ESTA LINHA PARA DEFINIR descLower
    const descLower = description.toLowerCase();

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

    // FUNÇÕES DE PROCESSAMENTO CORRIGIDAS
    const extractRole = (desc) => {
      const roleMatch = desc.match(/Como\s+(um|uma)?\s+([^,\n.]+)/i);
      return roleMatch ? roleMatch[2].trim() : 'analista de sistemas';
    };

    const extractMainGoal = (desc) => {
      try {
        // Padrões mais abrangentes para capturar objetivos
        const patterns = [
          /eu\s+gostaria\s+de\s+([^.!?]+?)(?=,|\s+para|\.|\n|$)/i,
          /eu\s+quero\s+([^.!?]+?)(?=,|\s+para|\.|\n|$)/i,
          /eu\s+preciso\s+([^.!?]+?)(?=,|\s+para|\.|\n|$)/i,
          /desejo\s+([^.!?]+?)(?=,|\s+para|\.|\n|$)/i,
          /objetivo[^.!?]*?([^.!?]+?)(?=\.|\n|$)/i
        ];
        
        for (const pattern of patterns) {
          const match = desc.match(pattern);
          if (match && match[1] && match[1].trim().length > 5) {
            const result = match[1].trim();
            // Remove conectores no final
            return result.replace(/,\s*(para|que|de|a|o)$/i, '').trim();
          }
        }
        
        // Fallback: primeira frase significativa
        const sentences = desc.split(/[.!?]+/).filter(s => s.trim().length > 20);
        const firstSentence = sentences[0] || desc;
        const meaningfulPart = firstSentence.split(/,|\s+para\s+/)[0];
        
        return meaningfulPart.length > 120 
          ? meaningfulPart.substring(0, 120) + '...' 
          : meaningfulPart;
          
      } catch (error) {
        return 'automatizar processos e melhorar eficiência';
      }
    };

    const extractBenefit = (desc) => {
      try {
        const benefitPatterns = [
          /para\s+(que\s+)?([^.!?]+?)(?=\.|\n|$)/i,
          /de\s+forma\s+que\s+([^.!?]+)/i,
          /para\s+([^.!?]+?)(?=\.|\n|$)/i,
          /com\s+o\s+objetivo\s+de\s+([^.!?]+)/i
        ];
        
        for (const pattern of benefitPatterns) {
          const match = desc.match(pattern);
          if (match) {
            const benefit = match[1] ? match[1].trim() : (match[2] ? match[2].trim() : null);
            if (benefit && benefit.length > 10) {
              return benefit;
            }
          }
        }
        
        return 'otimizar processos e melhorar a eficiência operacional';
      } catch (error) {
        return 'melhorar a produtividade e eficiência';
      }
    };

    const generateAcceptanceCriteria = (desc) => {
      const criteria = [];
      const descLower = desc.toLowerCase();
      
      // Análise inteligente do conteúdo
      if (descLower.includes('documento') || descLower.includes('pdf') || descLower.includes('docx') || descLower.includes('arquivo')) {
        criteria.push('✅ **Sistema deve aceitar upload de múltiplos formatos de documento (PDF, DOCX, XLSX, etc.)**');
        criteria.push('✅ **Validação de tipos de arquivo permitidos com mensagens de erro claras**');
        criteria.push('✅ **Suporte a arquivos de diferentes tamanhos com tratamento adequado**');
      }
      
      if (descLower.includes('extrair') || descLower.includes('informação') || descLower.includes('dado') || descLower.includes('campo')) {
        criteria.push('✅ **Extrair automaticamente campos-chave dos documentos**');
        criteria.push('✅ **Identificar e processar informações estruturadas e semi-estruturadas**');
        criteria.push('✅ **Tratamento robusto de erros na extração com relatório detalhado**');
        criteria.push('✅ **Validação da qualidade dos dados extraídos**');
      }
      
      if (descLower.includes('excel') || descLower.includes('relatório') || descLower.includes('planilha') || descLower.includes('exportar')) {
        criteria.push('✅ **Gerar relatório em Excel com colunas pré-definidas e formatadas**');
        criteria.push('✅ **Formatação profissional da planilha com cabeçalhos fixos e estilos**');
        criteria.push('✅ **Exportação em formato XLSX compatível com diferentes versões do Excel**');
        criteria.push('✅ **Layout responsivo e de fácil leitura**');
      }
      
      if (descLower.includes('hyperlink') || descLower.includes('link') || descLower.includes('caminho') || descLower.includes('referência')) {
        criteria.push('✅ **Incluir hiperlink clicável para documento original**');
        criteria.push('✅ **Manter referência absoluta e funcional ao arquivo fonte**');
        criteria.push('✅ **Links funcionais em diferentes ambientes e redes**');
        criteria.push('✅ **Navegação intuitiva entre documentos e relatórios**');
      }
      
      if (descLower.includes('múltiplo') || descLower.includes('vário') || descLower.includes('lote') || descLower.includes('conjunto')) {
        criteria.push('✅ **Processamento em lote de múltiplos arquivos simultaneamente**');
        criteria.push('✅ **Barra de progresso visual durante o processamento**');
        criteria.push('✅ **Relatório consolidado do processamento em lote**');
        criteria.push('✅ **Tratamento individual de erros por arquivo**');
      }
      
      if (descLower.includes('interface') || descLower.includes('usuário') || descLower.includes('página') || descLower.includes('tela')) {
        criteria.push('✅ **Interface intuitiva, moderna e de fácil utilização**');
        criteria.push('✅ **Feedback visual claro durante todas as operações**');
        criteria.push('✅ **Design responsivo para diferentes dispositivos e tamanhos de tela**');
        criteria.push('✅ **Experiência do usuário otimizada e acessível**');
      }
      
      // Critérios padrão aprimorados
      if (criteria.length === 0) {
        criteria.push(
          '✅ **Funcionalidade implementada conforme especificação detalhada do cliente**',
          '✅ **Interface intuitiva, moderna e de fácil utilização para todos os usuários**',
          '✅ **Documentação técnica completa, atualizada e de fácil compreensão**',
          '✅ **Testes de aceitação rigorosos aprovados pelo usuário final**',
          '✅ **Performance otimizada para o volume esperado de dados e usuários**',
          '✅ **Tratamento robusto e informativo de erros em todas as situações**',
          '✅ **Segurança implementada em todas as camadas da aplicação**',
          '✅ **Manutenibilidade e escalabilidade garantidas para futuras evoluções**'
        );
      }
      
      return criteria.join('\n\n');
    };

    const generateTechnicalRequirements = (desc) => {
      const requirements = [];
      const descLower = desc.toLowerCase();
      
      if (descLower.includes('upload') || descLower.includes('envio') || descLower.includes('carregar')) {
        requirements.push('📁 **Sistema de upload de arquivos multiplataforma e seguro**');
        requirements.push('🛡️ **Validação de segurança nos uploads (antivírus, tipo MIME, tamanho)**');
        requirements.push('💾 **Armazenamento temporário seguro com limpeza automática**');
        requirements.push('⚡ **Processamento assíncrono para não bloquear a interface**');
      }
      
      if (descLower.includes('extrair') || descLower.includes('processar') || descLower.includes('analisar')) {
        requirements.push('🔍 **Módulo de extração de dados inteligente e adaptativo**');
        requirements.push('🤖 **Processamento automatizado de documentos com algoritmos avançados**');
        requirements.push('📝 **Parser para diferentes formatos de documento (PDF, DOCX, etc.)**');
        requirements.push('🎯 **Reconhecimento de padrões e estruturas de dados**');
      }
      
      if (descLower.includes('excel') || descLower.includes('relatório') || descLower.includes('planilha')) {
        requirements.push('📊 **Geração de relatórios Excel automatizada e customizável**');
        requirements.push('📈 **Formatação condicional, gráficos e elementos visuais profissionais**');
        requirements.push('🔗 **Geração de hiperlinks funcionais e referências cruzadas**');
        requirements.push('💾 **Otimização de memória para grandes volumes de dados**');
      }
      
      if (descLower.includes('interface') || descLower.includes('usuário') || descLower.includes('frontend')) {
        requirements.push('🎨 **Interface responsiva, moderna e seguindo princípios de UX/UI**');
        requirements.push('⚡ **Experiência do usuário otimizada com carregamento rápido**');
        requirements.push('📱 **Design adaptável para mobile, tablet e desktop**');
        requirements.push('♿ **Acessibilidade seguindo diretrizes WCAG 2.1**');
      }
      
      if (descLower.includes('segurança') || descLower.includes('acesso') || descLower.includes('proteção')) {
        requirements.push('🔐 **Autenticação e autorização robustas com múltiplos níveis**');
        requirements.push('📜 **Logs de auditoria detalhados para todas as operações**');
        requirements.push('🛡️ **Proteção contra ataques comuns (XSS, CSRF, SQL Injection)**');
        requirements.push('🔒 **Criptografia de dados sensíveis em repouso e em trânsito**');
      }

      return requirements.length > 0 ? 
        requirements.join('\n\n') : 
        '🔧 **Arquitetura escalável, modular e de fácil manutenção**\n\n🚀 **Performance otimizada para grande volume de dados e usuários simultâneos**\n\n🛡️ **Segurança implementada em todas as camadas da aplicação**\n\n💾 **Gerenciamento eficiente de recursos e memória**';
    };

    const generateUserStories = (desc) => {
      const stories = [];
      const descLower = desc.toLowerCase();
      
      // História principal aprimorada
      stories.push('### 📋 História Principal\n');
      stories.push(`**Como** ${extractRole(description)}`);
      stories.push(`**Quero** ${extractMainGoal(description)}`);
      stories.push(`**Para** ${extractBenefit(description)}`);
      
      // Histórias derivadas baseadas em análise semântica
      if (descLower.includes('upload') || descLower.includes('documento') || descLower.includes('arquivo')) {
        stories.push('\n### 📤 História de Upload e Gerenciamento\n');
        stories.push('**Como** usuário do sistema');
        stories.push('**Quero** fazer upload, gerenciar e organizar múltiplos documentos');
        stories.push('**Para** ter controle total sobre meus arquivos e agilizar processos');
      }
      
      if (descLower.includes('extrair') || descLower.includes('dado') || descLower.includes('informação') || descLower.includes('processar')) {
        stories.push('\n### 🔍 História de Extração e Análise\n');
        stories.push('**Como** usuário do sistema');
        stories.push('**Quero** que o sistema extraia, analise e processe informações automaticamente');
        stories.push('**Para** obter insights valiosos sem esforço manual e reduzir erros');
      }
      
      if (descLower.includes('excel') || descLower.includes('relatório') || descLower.includes('exportar') || descLower.includes('planilha')) {
        stories.push('\n### 📊 História de Relatórios e Exportação\n');
        stories.push('**Como** usuário do sistema');
        stories.push('**Quero** gerar, customizar e exportar relatórios em formatos profissionais');
        stories.push('**Para** analisar dados de forma estruturada e tomar decisões informadas');
      }
      
      if (descLower.includes('hyperlink') || descLower.includes('link') || descLower.includes('navegação') || descLower.includes('acesso')) {
        stories.push('\n### 🔗 História de Navegação e Acesso\n');
        stories.push('**Como** usuário do sistema');
        stories.push('**Quero** acessar rapidamente documentos originais através de links diretos');
        stories.push('**Para** manter o contexto completo e agilizar minha revisão');
      }

      return stories.join('\n');
    };

    // GERAR HISTÓRIA PROFISSIONAL COMPLETA COM UTF-8
    const professionalStory = `
# ${projectTitle.toUpperCase()}
**Cliente:** ${clientName}
**Data de Geração:** ${new Date().toLocaleDateString('pt-BR')}
**Status:** 📋 EM DESENVOLVIMENTO
**Versão do Documento:** 1.0
**ID do Projeto:** ${Math.random().toString(36).substr(2, 9).toUpperCase()}

---

## 🎯 HISTÓRIAS DE USUÁRIO

${generateUserStories(description)}

---

## 📋 DESCRIÇÃO DETALHADA DO PROJETO

${description}

---

## ✅ CRITÉRIOS DE ACEITAÇÃO

${generateAcceptanceCriteria(description)}

---

## 🚀 REQUISITOS TÉCNICOS E ARQUITETURA

${generateTechnicalRequirements(description)}

---

## 🎨 REQUISITOS DE INTERFACE E EXPERIÊNCIA

- **Design System:** Padrão Sinapsys Tecnologia
- **Cores Principais:** #003F51 (Azul Escuro), #21B8D5 (Azul Claro), #F7EDE5 (Areia)
- **Paleta Completa:** Cores corporativas da Sinapsys
- **Responsividade:** Mobile First com breakpoints otimizados
- **Acessibilidade:** WCAG 2.1 AA - Nível de conformidade avançado
- **Navegadores:** Chrome, Firefox, Safari, Edge (últimas 3 versões)
- **Performance:** Carregamento inicial < 3s, interações < 200ms

---

## 📊 MÉTRICAS DE SUCESSO E ENTREGAS

- [ ] Funcionalidade implementada conforme especificação detalhada
- [ ] Documentação técnica completa e aprovada
- [ ] Testes de aceitação realizados e aprovados pelo cliente
- [ ] Deploy realizado com sucesso em ambiente de produção
- [ ] Treinamento de usuários concluído com feedback positivo
- [ ] Feedback dos usuários: satisfação > 85%
- [ ] Performance: tempo de carregamento < 3 segundos
- [ ] Disponibilidade: 99.5% uptime mensal
- [ ] Segurança: zero vulnerabilidades críticas
- [ ] Manutenibilidade: documentação 100% atualizada

---

## 🔄 CRONOGRAMA E PRÓXIMOS PASSOS

### Fase 1: Planejamento e Análise (Semana 1)
- [ ] Análise técnica detalhada e arquitetura
- [ ] Definição de escopo e requisitos
- [ ] Protótipo de baixa fidelidade

### Fase 2: Desenvolvimento (Semanas 2-5)
- [ ] Desenvolvimento do backend e APIs
- [ ] Desenvolvimento do frontend e interface
- [ ] Integração de sistemas e módulos

### Fase 3: Testes e Qualidade (Semana 6)
- [ ] Testes unitários e de integração
- [ ] Testes de performance e segurança
- [ ] Validação com usuários finais

### Fase 4: Implantação (Semanas 7-8)
- [ ] Deploy em ambiente de homologação
- [ ] Treinamento de usuários e documentação
- [ ] Go-live em produção

### Fase 5: Suporte e Melhorias (Semana 9+)
- [ ] Suporte pós-implantação
- [ ] Coleta de feedback e melhorias
- [ ] Otimizações contínuas

---

## 📞 EQUIPE E CONTATOS

**Product Owner:** ${clientName}
**Analista de Requisitos:** Equipe Sinapsys Tecnologia
**Arquiteto de Software:** Especialista Backend/Frontend
**Desenvolvedor Responsável:** Full Stack Team
**QA e Testes:** Equipe de Qualidade
**Data de Revisão:** ${new Date().toLocaleDateString('pt-BR')}
**Próxima Revisão:** ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}

---

## 📝 NOTAS E OBSERVAÇÕES

- Processamento realizado com sucesso
- ${description.length} caracteres analisados
- ${Math.ceil(description.length / 6)} palavras processadas
- Documento formatado automaticamente
- Timestamp: ${new Date().toLocaleString('pt-BR')}

---

*Documento gerado automaticamente por Sinapsys Tecnologia*
*Soluções inovadoras em desenvolvimento de software*
*Gerado em: ${new Date().toLocaleString('pt-BR')}*
*Processado com tecnologia avançada - Todos os direitos reservados*
    `.trim();

    res.json({
      success: true,
      story: professionalStory,
      metadata: {
        projectTitle,
        clientName,
        generatedAt: new Date().toISOString(),
        descriptionLength: description.length,
        wordCount: Math.ceil(description.length / 6),
        processed: true,
        version: '2.1',
        features: {
          hasDocuments: descLower.includes('documento') || descLower.includes('pdf') || descLower.includes('docx') || descLower.includes('arquivo'),
          hasExtraction: descLower.includes('extrair') || descLower.includes('processar') || descLower.includes('analisar') || descLower.includes('dado'),
          hasReports: descLower.includes('excel') || descLower.includes('relatório') || descLower.includes('planilha') || descLower.includes('exportar'),
          hasLinks: descLower.includes('hyperlink') || descLower.includes('link') || descLower.includes('caminho') || descLower.includes('referência'),
          hasInterface: descLower.includes('interface') || descLower.includes('usuário') || descLower.includes('tela') || descLower.includes('página')
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
    environment: process.env.NODE_ENV || 'development',
    version: '2.1'
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

// 404 handler - CORRIGIDO
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
  console.log(`⚡ Versão: 2.1 - Processamento Profissional com UTF-8`);
  console.log('='.repeat(50));
});