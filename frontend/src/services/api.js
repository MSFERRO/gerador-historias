// Configuração da API
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://seu-backend.onrender.com'  // URL do backend em produção
  : 'http://localhost:3001';            // URL do backend em desenvolvimento

export const generateUserStory = async (data) => {
  try {
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
    throw new Error('Erro ao conectar com o servidor: ' + error.message);
  }
};

export default { generateUserStory };
