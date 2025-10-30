// Configura√ß√£o da API
const API_BASE_URL = 'https://gerador-historias-backend.onrender.com';

export const generateUserStory = async (data) => {
  try {
    console.log('Ì≥§ Enviando para backend:', API_BASE_URL);
    const response = await fetch(`${API_BASE_URL}/api/generate-story`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Erro na resposta do servidor');
    }

    return await response.json();
  } catch (error) {
    console.error('‚ùå Erro na API:', error);
    throw new Error('Erro ao conectar com o servidor: ' + error.message);
  }
};

export default { generateUserStory };
