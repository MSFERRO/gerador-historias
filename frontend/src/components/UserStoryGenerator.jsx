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
      const API_URL = process.env.NODE_ENV === 'development' ? '' : 'https://gerador-historias-backend.onrender.com';

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
        logging: false,
        backgroundColor: '#FFFFFF',
        onclone: function(clonedDoc) {
          // Adiciona cabeçalho profissional ao conteúdo clonado
          const storyElement = clonedDoc.querySelector('[ref="storyRef"]');
          if (storyElement) {
            // Cria container do cabeçalho
            const headerDiv = clonedDoc.createElement('div');
            headerDiv.style.cssText = `
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              background: #003F51;
              color: white;
              padding: 12px 20px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              box-sizing: border-box;
              z-index: 1000;
              border-bottom: 2px solid #21B8D5;
            `;
            
            // Texto do cabeçalho
            const headerText = clonedDoc.createElement('div');
            headerText.style.cssText = `
              font-family: Arial, sans-serif;
              font-size: 16px;
              font-weight: bold;
              line-height: 1.2;
            `;
            headerText.innerHTML = 'SINAPSYS TECNOLOGIA<br><span style="font-size: 10px; font-weight: normal;">Gerador de Histórias de Usuário</span>';
            
            // Logo (substitua pela URL do seu logo quando tiver)
            const logoImg = clonedDoc.createElement('div');
            logoImg.style.cssText = `
              width: 120px;
              height: 30px;
              background: #21B8D5;
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 10px;
              font-weight: bold;
              border-radius: 4px;
            `;
            logoImg.innerHTML = 'LOGO SINAPSYS';
            
            headerDiv.appendChild(headerText);
            headerDiv.appendChild(logoImg);
            
            // Ajusta o padding do conteúdo para o cabeçalho
            storyElement.style.paddingTop = '70px';
            storyElement.style.position = 'relative';
            storyElement.style.minHeight = 'calc(400px + 70px)';
            storyElement.insertBefore(headerDiv, storyElement.firstChild);

            // Adiciona informações do projeto no conteúdo
            const projectInfo = clonedDoc.createElement('div');
            projectInfo.style.cssText = `
              margin-bottom: 20px;
              padding: 15px;
              background: #F8FAFC;
              border-left: 4px solid #003F51;
              font-family: Arial, sans-serif;
            `;
            projectInfo.innerHTML = `
              <div style="font-size: 12px; color: #666; margin-bottom: 5px;">INFORMAÇÕES DO PROJETO</div>
              <div style="font-size: 14px; font-weight: bold; color: #003F51;">${formData.projectTitle}</div>
              <div style="font-size: 12px; color: #666;">Cliente: ${formData.clientName}</div>
              <div style="font-size: 10px; color: #999;">Gerado em: ${new Date().toLocaleString('pt-BR')}</div>
            `;

            // Insere as informações do projeto após o cabeçalho
            const content = storyElement.querySelector('pre') || storyElement;
            if (content) {
              storyElement.insertBefore(projectInfo, content);
            }
          }
        }
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = imgHeight / imgWidth;
      const imgPDFHeight = pdfWidth * ratio;
      
      // Adiciona a imagem ao PDF
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgPDFHeight);
      
      // Adiciona rodapé profissional
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(100);
        
        // Linha do rodapé
        pdf.setDrawColor(200, 200, 200);
        pdf.line(10, pdfHeight - 15, pdfWidth - 10, pdfHeight - 15);
        
        // Textos do rodapé
        pdf.text('Sinapsys Tecnologia - Soluções em Desenvolvimento', pdfWidth / 2, pdfHeight - 10, { align: 'center' });
        pdf.text(`Página ${i} de ${totalPages}`, pdfWidth - 15, pdfHeight - 10, { align: 'right' });
        pdf.text(`Documento confidencial - ${new Date().getFullYear()}`, 15, pdfHeight - 10);
      }
      
      pdf.save(`historia-usuario-${formData.projectTitle.replace(/\s+/g, '-').toLowerCase()}-sinapsys.pdf`);
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
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
              placeholder="Descreva detalhadamente o que o cliente precisa, funcionalidades desejadas, objetivos do projeto..."
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
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => !loading && (e.target.style.background = colors.azulClaro)}
            onMouseOut={(e) => !loading && (e.target.style.background = colors.azulEscuro)}
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
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => e.target.style.background = colors.azulClaro}
                  onMouseOut={(e) => e.target.style.background = colors.azulEscuro}
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
                    fontSize: '14px',
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => e.target.style.background = colors.bege}
                  onMouseOut={(e) => e.target.style.background = colors.areia}
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
                    fontSize: '14px',
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => e.target.style.background = colors.azulEscuro}
                  onMouseOut={(e) => e.target.style.background = colors.azulClaro}
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
              flex: '1',
              minHeight: '400px',
              maxHeight: '500px',
              overflowY: 'auto',
              border: `1px solid ${colors.bege}`,
              fontFamily: 'Arial, sans-serif',
              fontSize: '14px',
              lineHeight: '1.5',
              color: colors.azulEscuro
            }}
          >
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
                  lineHeight: '1.6'
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
                  Processando com IA...
                </p>
              </div>
            )}

            {generatedStory && (
              <pre style={{ 
                whiteSpace: 'pre-wrap',
                fontFamily: 'Arial, sans-serif',
                fontSize: '13px',
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

      {/* Footer */}
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
          mais precisa e útil será a história de usuário gerada pela IA
        </p>
        <div style={{
          marginTop: '15px',
          padding: '10px',
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '8px',
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