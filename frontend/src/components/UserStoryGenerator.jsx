import React, { useState, useRef } from 'react';

export default function UserStoryGenerator() {
  const [formData, setFormData] = useState({
    projectTitle: '',
    clientName: '',
    description: ''
  });
  const [generatedStory, setGeneratedStory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Cores Sinapsys Tecnologia
  const colors = {
    azulEscuro: '#003F51',
    azulClaro: '#21B8D5',
    areia: '#F7EDE5',
    bege: '#E0C4AD',
    branco: '#FFFFFF',
    cinzaClaro: '#F8FAFC'
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleGenerate = async () => {
    if (!formData.projectTitle || !formData.clientName || !formData.description) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    if (formData.description.length < 20) {
      setError('A descrição deve ter pelo menos 20 caracteres');
      return;
    }

    setLoading(true);
    setError('');
    setGeneratedStory('');

    try {
      const API_URL = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3001' 
        : 'https://gerador-historias-backend.onrender.com';

      const response = await fetch(`${API_URL}/api/generate-story`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setGeneratedStory(data.story);
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor. Verifique se o backend está rodando.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedStory);
    alert('História copiada para a área de transferência!');
  };

  const downloadTXT = () => {
    if (!generatedStory) {
      alert('Gere uma história primeiro antes de baixar o TXT.');
      return;
    }

    const blob = new Blob([generatedStory], { type: 'text/plain; charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historia-usuario-${formData.projectTitle.replace(/\s+/g, '-').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadWord = () => {
    if (!generatedStory) {
      alert('Gere uma história primeiro antes de baixar o Word.');
      return;
    }

    try {
      // Extrair informações da história gerada
      const getStoryPart = (startMarker, endMarker) => {
        const startIndex = generatedStory.indexOf(startMarker);
        if (startIndex === -1) return '';
        const contentStart = startIndex + startMarker.length;
        const endIndex = endMarker ? generatedStory.indexOf(endMarker, contentStart) : generatedStory.length;
        return generatedStory.substring(contentStart, endIndex).trim();
      };

      // Criar conteúdo HTML para Word
      const wordContent = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" 
              xmlns:w="urn:schemas-microsoft-com:office:word" 
              xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="utf-8">
          <title>História de Usuário - ${formData.projectTitle}</title>
          <style>
            body { 
              font-family: 'Arial', sans-serif; 
              margin: 40px; 
              line-height: 1.6;
              color: #333;
            }
            h1 { 
              color: #003F51; 
              border-bottom: 2px solid #21B8D5; 
              padding-bottom: 10px;
              font-size: 24px;
              margin-bottom: 20px;
            }
            h2 { 
              color: #003F51; 
              margin-top: 30px;
              font-size: 18px;
              border-left: 4px solid #21B8D5;
              padding-left: 10px;
            }
            .header-info { 
              background: #F8FAFC; 
              padding: 20px; 
              border-left: 4px solid #003F51; 
              margin: 20px 0; 
              border-radius: 4px;
            }
            .section { 
              margin: 25px 0; 
            }
            .criteria-list { 
              margin: 15px 0; 
              padding-left: 20px;
            }
            .criteria-list li {
              margin: 8px 0;
            }
            .footer { 
              margin-top: 50px; 
              text-align: center; 
              color: #666; 
              font-style: italic;
              border-top: 1px solid #ddd;
              padding-top: 20px;
            }
            .story-part {
              background: #f9f9f9;
              padding: 15px;
              border-radius: 5px;
              margin: 10px 0;
            }
          </style>
        </head>
        <body>
          <h1>HISTÓRIA DE USUÁRIO - ${formData.projectTitle.toUpperCase()}</h1>
          
          <div class="header-info">
            <strong>Cliente:</strong> ${formData.clientName}<br>
            <strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}<br>
            <strong>Status:</strong> Em Desenvolvimento
          </div>

          <div class="section">
            <h2>HISTÓRIA DE USUÁRIO</h2>
            <div class="story-part">
              <strong>COMO:</strong> ${getStoryPart('COMO:', 'QUERO:') || 'analista'}<br><br>
              <strong>QUERO:</strong> ${getStoryPart('QUERO:', 'PARA:') || 'automatizar processos'}<br><br>
              <strong>PARA:</strong> ${getStoryPart('PARA:', '================================================================================') || 'melhorar eficiência'}
            </div>
          </div>

          <div class="section">
            <h2>DESCRIÇÃO DETALHADA</h2>
            <div class="story-part">
              ${formData.description.replace(/\n/g, '<br>')}
            </div>
          </div>

          <div class="section">
            <h2>CRITÉRIOS DE ACEITAÇÃO</h2>
            <ul class="criteria-list">
              ${getStoryPart('CRITÉRIOS DE ACEITAÇÃO', '================================================================================')
                .split('\n')
                .filter(line => line.trim() && line.includes('-'))
                .map(line => `<li>${line.replace('-', '').trim()}</li>`)
                .join('') || '<li>Funcionalidade implementada conforme especificado</li><li>Interface intuitiva e responsiva</li><li>Processamento robusto e seguro</li>'
              }
            </ul>
          </div>

          <div class="section">
            <h2>REQUISITOS TÉCNICOS</h2>
            <ul class="criteria-list">
              <li>Backend Node.js/Express</li>
              <li>Processamento de documentos inteligente</li>
              <li>Interface React responsiva</li>
              <li>API RESTful</li>
              <li>Armazenamento seguro de dados</li>
              <li>Validação e tratamento de erros</li>
            </ul>
          </div>

          <div class="footer">
            Documento gerado automaticamente em ${new Date().toLocaleString('pt-BR')}
          </div>
        </body>
        </html>
      `;

      // Criar blob e download
      const blob = new Blob([wordContent], { 
        type: 'application/msword' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `historia-usuario-${formData.projectTitle.replace(/\s+/g, '-').toLowerCase()}.doc`;
      a.click();
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Erro ao gerar Word:', error);
      alert('Erro ao gerar documento Word. Tente novamente.');
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: `linear-gradient(135deg, ${colors.azulEscuro} 0%, ${colors.azulClaro} 100%)`,
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header Sinapsys - SEM "Desenvolvido por" */}
      <div style={{
        background: colors.branco,
        padding: '20px',
        borderRadius: '15px',
        marginBottom: '30px',
        boxShadow: '0 8px 32px rgba(0, 63, 81, 0.1)',
        border: `2px solid ${colors.azulClaro}`
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <div>
            <h1 style={{
              color: colors.azulEscuro,
              fontSize: '2.5rem',
              margin: '0',
              fontWeight: 'bold'
            }}>
              🚀 Gerador de Histórias de Usuário
            </h1>
            <p style={{
              color: colors.azulEscuro,
              fontSize: '1.1rem',
              margin: '5px 0 0 0',
              opacity: 0.8
            }}>
              Transforme requisitos em histórias de usuário profissionais
            </p>
          </div>
          {/* REMOVIDO: "Desenvolvido por Sinapsys Tecnologia" do header */}
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '30px',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Formulário */}
        <div style={{
          background: colors.branco,
          padding: '30px',
          borderRadius: '15px',
          boxShadow: '0 8px 32px rgba(0, 63, 81, 0.1)',
          border: `2px solid ${colors.areia}`
        }}>
          <h2 style={{
            color: colors.azulEscuro,
            margin: '0 0 25px 0',
            fontSize: '1.8rem'
          }}>
            📋 Informações do Projeto
          </h2>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: 'bold',
              color: colors.azulEscuro
            }}>
              Título do Projeto *
            </label>
            <input
              type="text"
              name="projectTitle"
              value={formData.projectTitle}
              onChange={handleInputChange}
              placeholder="Ex: Sistema de Gestão de Vendas"
              style={{
                width: '100%',
                padding: '12px',
                border: `2px solid ${colors.bege}`,
                borderRadius: '8px',
                fontSize: '16px',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = colors.azulClaro}
              onBlur={(e) => e.target.style.borderColor = colors.bege}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: 'bold',
              color: colors.azulEscuro
            }}>
              Nome do Cliente *
            </label>
            <input
              type="text"
              name="clientName"
              value={formData.clientName}
              onChange={handleInputChange}
              placeholder="Ex: Tech Solutions LTDA"
              style={{
                width: '100%',
                padding: '12px',
                border: `2px solid ${colors.bege}`,
                borderRadius: '8px',
                fontSize: '16px',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = colors.azulClaro}
              onBlur={(e) => e.target.style.borderColor = colors.bege}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: 'bold',
              color: colors.azulEscuro
            }}>
              Descrição dos Requisitos *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Descreva detalhadamente o que o cliente precisa, funcionalidades desejadas, objetivos do projeto..."
              rows="6"
              style={{
                width: '100%',
                padding: '12px',
                border: `2px solid ${colors.bege}`,
                borderRadius: '8px',
                fontSize: '16px',
                resize: 'vertical',
                transition: 'all 0.3s ease',
                fontFamily: 'Arial, sans-serif'
              }}
              onFocus={(e) => e.target.style.borderColor = colors.azulClaro}
              onBlur={(e) => e.target.style.borderColor = colors.bege}
            />
            <small style={{ color: colors.azulEscuro, opacity: 0.7 }}>
              {formData.description.length} caracteres {formData.description.length < 20 ? '(mínimo: 20)' : '✓'}
            </small>
          </div>

          {error && (
            <div style={{
              background: '#FEE2E2',
              color: '#DC2626',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px',
              border: '1px solid #FECACA'
            }}>
              ⚠️ {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? colors.bege : `linear-gradient(135deg, ${colors.azulEscuro} 0%, ${colors.azulClaro} 100%)`,
              color: colors.branco,
              padding: '15px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: loading ? 'none' : '0 4px 15px rgba(33, 184, 213, 0.3)'
            }}
            onMouseOver={(e) => !loading && (e.target.style.transform = 'translateY(-2px)')}
            onMouseOut={(e) => !loading && (e.target.style.transform = 'translateY(0)')}
          >
            {loading ? (
              <>
                <span style={{marginRight: '10px'}}>⏳</span>
                Gerando História...
              </>
            ) : (
              <>
                <span style={{marginRight: '10px'}}>✨</span>
                Gerar História de Usuário
              </>
            )}
          </button>
        </div>

        {/* Resultado */}
        <div style={{
          background: colors.branco,
          padding: '30px',
          borderRadius: '15px',
          boxShadow: '0 8px 32px rgba(0, 63, 81, 0.1)',
          border: `2px solid ${colors.areia}`,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h2 style={{
              color: colors.azulEscuro,
              margin: '0',
              fontSize: '1.8rem'
            }}>
              📝 História Gerada
            </h2>
            {generatedStory && (
              <div style={{display: 'flex', gap: '10px'}}>
                <button
                  onClick={copyToClipboard}
                  style={{
                    background: colors.azulEscuro,
                    color: colors.branco,
                    padding: '8px 12px',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                  onMouseOver={(e) => e.target.style.background = colors.azulClaro}
                  onMouseOut={(e) => e.target.style.background = colors.azulEscuro}
                >
                  📋 Copiar
                </button>
                <button
                  onClick={downloadTXT}
                  style={{
                    background: colors.azulClaro,
                    color: colors.branco,
                    padding: '8px 12px',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                  onMouseOver={(e) => e.target.style.background = colors.azulEscuro}
                  onMouseOut={(e) => e.target.style.background = colors.azulClaro}
                >
                  📄 TXT
                </button>
                <button
                  onClick={downloadWord}
                  style={{
                    background: colors.areia,
                    color: colors.azulEscuro,
                    padding: '8px 12px',
                    border: `1px solid ${colors.bege}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                  onMouseOver={(e) => e.target.style.background = colors.bege}
                  onMouseOut={(e) => e.target.style.background = colors.areia}
                >
                  📝 Word
                </button>
              </div>
            )}
          </div>

          <div style={{ 
            background: colors.cinzaClaro,
            padding: '20px',
            borderRadius: '8px',
            flex: '1',
            minHeight: '400px',
            maxHeight: '500px',
            overflowY: 'auto',
            border: `1px solid ${colors.bege}`,
            fontFamily: 'Arial, sans-serif'
          }}>
            {!generatedStory && !loading && (
              <div style={{
                textAlign: 'center',
                color: colors.azulEscuro,
                opacity: 0.6,
                padding: '60px 20px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '20px', opacity: 0.5 }}>
                  📄
                </div>
                <p style={{
                  fontSize: '1.1rem',
                  margin: '0',
                  lineHeight: '1.6',
                  textAlign: 'center'
                }}>
                  Preencha o formulário ao lado e clique em 
                  <strong style={{color: colors.azulClaro}}> "Gerar História de Usuário" </strong>
                  para criar sua história profissional
                </p>
              </div>
            )}

            {loading && (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  border: `4px solid ${colors.areia}`,
                  borderTop: `4px solid ${colors.azulClaro}`,
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  marginBottom: '20px'
                }} />
                <p style={{
                  color: colors.azulEscuro,
                  fontSize: '1.1rem',
                  margin: '0 0 10px 0'
                }}>
                  Gerando história de usuário...
                </p>
                <p style={{
                  color: colors.azulEscuro,
                  opacity: 0.7,
                  fontSize: '0.9rem',
                  margin: 0
                }}>
                  Processando sua descrição...
                </p>
              </div>
            )}

            {generatedStory && (
              <pre style={{ 
                whiteSpace: 'pre-wrap',
                fontFamily: 'Arial, sans-serif',
                fontSize: '14px',
                lineHeight: '1.5',
                color: colors.azulEscuro,
                margin: 0,
                background: 'transparent',
                border: 'none',
                padding: 0
              }}>
                {generatedStory}
              </pre>
            )}
          </div>
        </div>
      </div>

      {/* Footer - MANTIDO "Desenvolvido por Sinapsys Tecnologia" apenas aqui */}
      <div style={{
        textAlign: 'center',
        marginTop: '40px',
        padding: '20px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '15px',
        backdropFilter: 'blur(10px)'
      }}>
        <p style={{
          color: colors.branco,
          margin: '0',
          fontSize: '1rem',
          opacity: 0.9
        }}>
          💡 <strong>Dica Profissional:</strong> Quanto mais detalhada e específica for a descrição, 
          mais precisa e útil será a história de usuário gerada
        </p>
        <div style={{
          marginTop: '15px',
          padding: '10px 20px',
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '25px',
          display: 'inline-block'
        }}>
          <span style={{
            color: colors.branco,
            fontSize: '0.9rem',
            fontWeight: 'bold'
          }}>
            🧠 Desenvolvido por <span style={{color: colors.areia}}>Sinapsys Tecnologia</span>
          </span>
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}