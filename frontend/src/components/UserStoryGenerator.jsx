import React, { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function UserStoryGenerator() {
  const [formData, setFormData] = useState({
    projectTitle: '',
    clientName: '',
    description: ''
  });
  const [generatedStory, setGeneratedStory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const storyRef = useRef();

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
      const API_URL = 'https://gerador-historias-backend.onrender.com';

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

  const downloadPDF = async () => {
    if (!storyRef.current) return;

    try {
      const canvas = await html2canvas(storyRef.current, {
        scale: 2,
        useCORS: true,
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = imgHeight / imgWidth;
      const imgPDFHeight = pdfWidth * ratio;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgPDFHeight);
      pdf.save(`historia-usuario-${formData.projectTitle.replace(/\s+/g, '-').toLowerCase()}.pdf`);
    } catch (error) {
      alert('Erro ao gerar PDF. Tente novamente.');
    }
  };

  const downloadTXT = () => {
    const blob = new Blob([generatedStory], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historia-usuario-${formData.projectTitle.replace(/\s+/g, '-').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: `linear-gradient(135deg, ${colors.azulEscuro} 0%, ${colors.azulClaro} 100%)`,
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header Sinapsys */}
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
          <div style={{
            background: colors.areia,
            padding: '10px 20px',
            borderRadius: '25px',
            border: `2px solid ${colors.bege}`
          }}>
            <span style={{
              color: colors.azulEscuro,
              fontWeight: 'bold',
              fontSize: '0.9rem'
            }}>
              Desenvolvido por <span style={{color: colors.azulClaro}}>Sinapsys Tecnologia</span>
            </span>
          </div>
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
                fontSize: '16px'
              }}
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
                fontSize: '16px'
              }}
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
              placeholder="Descreva o que o cliente precisa..."
              rows="6"
              style={{
                width: '100%',
                padding: '12px',
                border: `2px solid ${colors.bege}`,
                borderRadius: '8px',
                fontSize: '16px',
                resize: 'vertical'
              }}
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
              marginBottom: '20px'
            }}>
              ⚠️ {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? colors.bege : colors.azulEscuro,
              color: colors.branco,
              padding: '15px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '⏳ Gerando...' : '✨ Gerar História de Usuário'}
          </button>
        </div>

        {/* Resultado */}
        <div style={{
          background: colors.branco,
          padding: '30px',
          borderRadius: '15px',
          boxShadow: '0 8px 32px rgba(0, 63, 81, 0.1)',
          border: `2px solid ${colors.areia}`
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
                    fontSize: '14px'
                  }}
                >
                  📋 Copiar
                </button>
                <button
                  onClick={downloadTXT}
                  style={{
                    background: colors.areia,
                    color: colors.azulEscuro,
                    padding: '8px 12px',
                    border: `1px solid ${colors.bege}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  📄 TXT
                </button>
                <button
                  onClick={downloadPDF}
                  style={{
                    background: colors.azulClaro,
                    color: colors.branco,
                    padding: '8px 12px',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  📊 PDF
                </button>
              </div>
            )}
          </div>

          <div 
            ref={storyRef}
            style={{ 
              background: colors.cinzaClaro,
              padding: '20px',
              borderRadius: '8px',
              minHeight: '400px',
              maxHeight: '500px',
              overflowY: 'auto',
              border: `1px solid ${colors.bege}`
            }}
          >
            {!generatedStory && !loading && (
              <div style={{
                textAlign: 'center',
                color: colors.azulEscuro,
                opacity: 0.6,
                padding: '40px 20px'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📄</div>
                <p>Preencha o formulário e clique em "Gerar" para criar sua história de usuário</p>
              </div>
            )}

            {loading && (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  border: `3px solid ${colors.areia}`,
                  borderTop: `3px solid ${colors.azulClaro}`,
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 20px'
                }} />
                <p style={{ color: colors.azulEscuro }}>Gerando história de usuário...</p>
              </div>
            )}

            {generatedStory && (
              <pre style={{ 
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace',
                fontSize: '14px',
                lineHeight: '1.5',
                color: colors.azulEscuro,
                margin: 0
              }}>
                {generatedStory}
              </pre>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        marginTop: '30px',
        color: colors.branco
      }}>
        <p>💡 Dica: Quanto mais detalhada a descrição, melhor será a história gerada</p>
        <div style={{
          marginTop: '10px',
          padding: '8px 16px',
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '20px',
          display: 'inline-block'
        }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
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