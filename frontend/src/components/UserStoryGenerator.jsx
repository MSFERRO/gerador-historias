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
    if (!storyRef.current || !generatedStory) {
      alert('Gere uma história primeiro antes de baixar o PDF.');
      return;
    }

    try {
      // Criar elemento temporário para o PDF
      const tempDiv = document.createElement('div');
      tempDiv.style.cssText = `
        position: fixed;
        left: -10000px;
        top: -10000px;
        width: 800px;
        background: white;
        padding: 40px;
        font-family: Arial, sans-serif;
        color: #003F51;
        line-height: 1.6;
      `;

      // Cabeçalho profissional
      const header = `
        <div style="
          border-bottom: 3px solid #21B8D5;
          padding-bottom: 15px;
          margin-bottom: 25px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        ">
          <div>
            <h1 style="color: #003F51; margin: 0; font-size: 24px; font-weight: bold;">
              SINAPSYS TECNOLOGIA
            </h1>
            <p style="color: #666; margin: 5px 0 0 0; font-size: 14px;">
              Gerador de Histórias de Usuário - Documento Profissional
            </p>
          </div>
          <div style="
            background: #003F51;
            color: white;
            padding: 8px 15px;
            border-radius: 5px;
            font-size: 12px;
            font-weight: bold;
            border: 2px solid #21B8D5;
          ">
            🧠 SINAPSYS
          </div>
        </div>
      `;

      // Informações do projeto
      const projectInfo = `
        <div style="
          background: #F8FAFC;
          border-left: 4px solid #003F51;
          padding: 20px;
          margin-bottom: 25px;
          border-radius: 0 8px 8px 0;
        ">
          <div style="font-size: 12px; color: #666; margin-bottom: 8px; font-weight: bold;">
            📋 INFORMAÇÕES DO PROJETO
          </div>
          <div style="font-size: 18px; font-weight: bold; color: #003F51; margin-bottom: 5px;">
            ${formData.projectTitle || 'Não informado'}
          </div>
          <div style="font-size: 14px; color: #666; margin-bottom: 5px;">
            <strong>Cliente:</strong> ${formData.clientName || 'Não informado'}
          </div>
          <div style="font-size: 12px; color: #999;">
            <strong>Gerado em:</strong> ${new Date().toLocaleString('pt-BR')}
          </div>
        </div>
      `;

      // Processar o conteúdo da história para HTML
      const processStoryForPDF = (story) => {
        return story
          .replace(/\n/g, '<br>')
          .replace(/# (.*?)(?=\n|$)/g, '<h1 style="color: #003F51; border-bottom: 2px solid #21B8D5; padding-bottom: 8px; margin: 25px 0 15px 0; font-size: 20px;">$1</h1>')
          .replace(/## (.*?)(?=\n|$)/g, '<h2 style="color: #003F51; background: #F7EDE5; padding: 10px 15px; border-radius: 5px; margin: 20px 0 15px 0; font-size: 16px;">$1</h2>')
          .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #003F51;">$1</strong>')
          .replace(/\-\-\-/g, '<hr style="border: 1px dashed #21B8D5; margin: 25px 0; opacity: 0.5;">')
          .replace(/\- \[ \] (.*?)(?=\n|$)/g, '<div style="margin: 8px 0; padding-left: 20px;">◻️ $1</div>')
          .replace(/\- \[x\] (.*?)(?=\n|$)/g, '<div style="margin: 8px 0; padding-left: 20px;">✅ <strong>$1</strong></div>')
          .replace(/✅ (.*?)(?=\n|$)/g, '<div style="margin: 10px 0; padding: 8px 12px; background: #F0F9FF; border-left: 3px solid #21B8D5; border-radius: 0 5px 5px 0;">✅ $1</div>')
          .replace(/📁 |🔍 |📊 |🔧 /g, '<span style="font-size: 16px; margin-right: 5px;">$&</span>');
      };

      const storyContent = processStoryForPDF(generatedStory);

      tempDiv.innerHTML = header + projectInfo + `
        <div style="font-size: 14px; color: #333;">
          ${storyContent}
        </div>
        
        <div style="
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #E0C4AD;
          font-size: 11px;
          color: #666;
          text-align: center;
          background: #F7EDE5;
          padding: 15px;
          border-radius: 5px;
        ">
          <strong>Documento confidencial - Sinapsys Tecnologia</strong><br>
          © ${new Date().getFullYear()} - Todos os direitos reservados<br>
          <em>Gerado automaticamente pelo Sistema de Gestão de Histórias de Usuário</em>
        </div>
      `;

      document.body.appendChild(tempDiv);

      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#FFFFFF',
        width: 800,
        height: tempDiv.scrollHeight,
        windowWidth: 800,
        windowHeight: tempDiv.scrollHeight
      });

      document.body.removeChild(tempDiv);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = imgHeight / imgWidth;
      let imgPDFHeight = pdfWidth * ratio;
      
      // Se a imagem for muito alta, ajusta para caber
      if (imgPDFHeight > pdfHeight * 3) {
        imgPDFHeight = pdfHeight * 3;
      }
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgPDFHeight);
      
      // Adicionar rodapé profissional em todas as páginas
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
        pdf.text(`Doc. ${new Date().getTime()}`, 15, pdfHeight - 10);
      }
      
      const fileName = `historia-usuario-${formData.projectTitle.replace(/\s+/g, '-').toLowerCase()}-sinapsys.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente.');
    }
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
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
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
              fontFamily: 'Arial, sans-serif'
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
