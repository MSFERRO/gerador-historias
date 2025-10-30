# ��� Documentação da API

## Base URL
```
http://localhost:3001
```

## Endpoints

### 1. Health Check
Verifica se o servidor está funcionando.

**Request:**
```http
GET /health
```

**Response (200):**
```json
{
  "status": "OK",
  "timestamp": "2024-10-30T10:30:00.000Z",
  "service": "User Story Generator API"
}
```

---

### 2. Gerar História de Usuário

**Request:**
```http
POST /api/story/generate
Content-Type: application/json
```

**Body:**
```json
{
  "projectTitle": "Sistema de Gestão Escolar",
  "clientName": "Colégio ABC",
  "description": "Necessito de um sistema para gerenciar matrículas, notas, frequência e comunicação com pais"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "story": "# Sistema de Gestão Escolar\n\n**Cliente:** Colégio ABC\n...",
  "metadata": {
    "projectTitle": "Sistema de Gestão Escolar",
    "clientName": "Colégio ABC",
    "generatedAt": "2024-10-30T10:30:00.000Z",
    "tokensUsed": 1250
  }
}
```

**Error Response (400):**
```json
{
  "error": "Todos os campos são obrigatórios",
  "fields": {
    "projectTitle": "ok",
    "clientName": "obrigatório",
    "description": "ok"
  }
}
```

**Error Response (401):**
```json
{
  "error": "Erro de autenticação com Groq API. Verifique sua API key."
}
```

## Rate Limiting

- **Limite:** 100 requisições por IP a cada 15 minutos
- **Headers de resposta:**
  - `X-RateLimit-Limit`: Limite máximo
  - `X-RateLimit-Remaining`: Requisições restantes
  - `X-RateLimit-Reset`: Timestamp do reset

## Exemplos

### cURL
```bash
curl -X POST http://localhost:3001/api/story/generate \
  -H "Content-Type: application/json" \
  -d '{
    "projectTitle": "App Mobile",
    "clientName": "Startup Tech",
    "description": "Aplicativo para agendamento de serviços"
  }'
```

### JavaScript
```javascript
const response = await fetch('http://localhost:3001/api/story/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    projectTitle: 'App Mobile',
    clientName: 'Startup Tech',
    description: 'Aplicativo para agendamento de serviços'
  })
});

const data = await response.json();
console.log(data.story);
```

### Python
```python
import requests

response = requests.post(
    'http://localhost:3001/api/story/generate',
    json={
        'projectTitle': 'App Mobile',
        'clientName': 'Startup Tech',
        'description': 'Aplicativo para agendamento de serviços'
    }
)

print(response.json()['story'])
```
