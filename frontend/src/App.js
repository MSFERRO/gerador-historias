import React, { useState } from 'react';
import './App.css';

function App() {
  const [formData, setFormData] = useState({
    projectTitle: '',
    clientName: '',
    description: ''
  });
  const [story, setStory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setStory('');

    try {
      const backendUrl = 'https://gerador-historias-backend.onrender.com'; 

      const response = await fetch(`${backendUrl}/api/generate-story`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setStory(data.story);
      } else {
        setError(data.error || 'Erro ao gerar história');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(story);
    alert('História copiada para a área de transferência!');
  };

  const downloadWord = () => {
    const projectTitle = formData.projectTitle || 'documento';
    const clientName = formData.clientName || 'Não informado';
    
    // Base64 da logo Sinapsys (SVG)
    const logoBase64 = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjUwIiB2aWV3Qm94PSIwIDAgMTUwIDUwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjMDA0RjlGIi8+Cjx0ZXh0IHg9Ijc1IiB5PSIyOCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+U0lOQVBTWVM8L3RleHQ+Cjx0ZXh0IHg9Ijc1IiB5PSI0MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VGVjbm9sb2dpYTwvdGV4dD4KPC9zdmc+';

    const wordContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>História de Usuário - ${projectTitle}</title>
    <style>
        body, html {
            margin: 0;
            padding: 0;
            font-family: "Arial", sans-serif !important;
            line-height: 1.5;
            color: #000000;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
        }
        
        .logo-container {
            margin-bottom: 15px;
        }
        
        .logo {
            height: 60px;
            display: block;
            margin: 0 auto;
        }
        
        h1 {
            color: #2c3e50;
            margin: 10px 0 5px 0;
            font-size: 20px;
            font-weight: bold;
        }
        
        .project-info {
            background: #f8f9fa;
            padding: 15px;
            border-left: 4px solid #3498db;
            margin: 15px 0;
            font-size: 12px;
            border: 1px solid #ddd;
        }
        
        .content {
            margin: 25px 0;
            font-size: 12px;
        }
        
        .story-text {
            white-space: pre-wrap;
            font-family: "Arial", sans-serif !important;
            line-height: 1.4;
        }
        
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 10px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo-container">
            <img src="${logoBase64}" alt="Sinapsys Tecnologia" class="logo">
        </div>
        <h1>HISTÓRIA DE USUÁRIO</h1>
        <div class="project-info">
            <strong>Sistema:</strong> ${projectTitle}<br>
            <strong>Cliente:</strong> ${clientName}<br>
            <strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}<br>
            <strong>Status:</strong> Em Desenvolvimento
        </div>
    </div>
    
    <div class="content">
        <div class="story-text">${story}</div>
    </div>
    
    <div class="footer">
        Documento gerado pela aplicação - Sinapsys Tecnologia<br>
        ${new Date().toLocaleString('pt-BR')}
    </div>
</body>
</html>`;

    const blob = new Blob([wordContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historia-usuario-${projectTitle.replace(/[^\w\s]/gi, '').replace(/\s+/g, '-')}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="logo-container">
          <img src="/logo-sinapsys2.png" alt="Sinapsys Tecnologia" className="logo" 
               onError={(e) => {
                 e.target.style.display = 'none';
                 e.target.nextSibling.style.display = 'block';
               }} />
          <div className="logo-placeholder" style={{display: 'none'}}>
            SINAPSYS TECNOLOGIA
          </div>
          <h1>Gerador de Histórias de Usuário</h1>
        </div>
      </header>

      <main className="main-content">
        <div className="container">
          <form onSubmit={handleSubmit} className="story-form">
            <div className="form-group">
              <label htmlFor="projectTitle">Nome do Sistema/Projeto:</label>
              <input
                type="text"
                id="projectTitle"
                name="projectTitle"
                value={formData.projectTitle}
                onChange={handleChange}
                required
                placeholder="Ex: Sistema de Gestão Ágil"
              />
            </div>

            <div className="form-group">
              <label htmlFor="clientName">Cliente/Empresa:</label>
              <input
                type="text"
                id="clientName"
                name="clientName"
                value={formData.clientName}
                onChange={handleChange}
                required
                placeholder="Ex: TechSolutions Inc"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Descrição dos Requisitos:</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="6"
                placeholder="Ex: Como gerente de projetos, quero criar sprints e acompanhar o progresso da equipe em tempo real através de dashboards interativos..."
              />
            </div>

            <button type="submit" disabled={loading} className="generate-btn">
              {loading ? 'Gerando História...' : 'Gerar História de Usuário'}
            </button>
          </form>

          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}

          {story && (
            <div className="story-result">
              <div className="result-header">
                <h2>História Gerada com Sucesso! ✅</h2>
                <div className="action-buttons">
                  <button onClick={copyToClipboard} className="action-btn copy-btn">
                    📋 Copiar
                  </button>
                  <button onClick={downloadWord} className="action-btn download-btn">
                    📥 Baixar Word
                  </button>
                </div>
              </div>
              
              <div className="story-content">
                <pre>{story}</pre>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="app-footer">
        <p>Sinapsys Tecnologia - Gerador Inteligente de Histórias de Usuário</p>
      </footer>
    </div>
  );
}

export default App;