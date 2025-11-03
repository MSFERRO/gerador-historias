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
      const backendUrl = process.env.NODE_ENV === 'production' 
        ? 'https://seu-backend.onrender.com' 
        : 'http://localhost:3001';

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
    const blob = new Blob([story], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historia-usuario-${formData.projectTitle || 'documento'}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="logo-container">
          <img src="/logo-sinapsys2.png" alt="Sinapsys Tecnologia" className="logo" />
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