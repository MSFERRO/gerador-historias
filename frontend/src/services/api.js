const API_BASE_URL = 'https://gerador-historias-backend.onrender.com';

export const generateUserStory = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/generate-story`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error('Erro no servidor');
    return await response.json();
  } catch (error) {
    throw new Error('Erro ao conectar: ' + error.message);
  }
};

export default { generateUserStory };
