const API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-6'

const SYSTEM = `Sos un asistente gastronómico que conoce Corrientes capital, Argentina.
Tu tarea: sugerir cafés, restaurantes o bares nuevos en Corrientes capital para una pareja que registra sus salidas.
Basate en los lugares que ya visitaron (y los scores) y los pendientes, para sugerir opciones afines.
Respondé SOLO con un JSON array válido de 3 objetos, sin texto adicional, sin markdown, sin fences.
Formato estricto: [{"name": "Nombre", "category": "merienda|cena|bar|brunch|almuerzo|otro", "reason": "Explicación breve en español"}]`

export async function suggestPlaces({ visitedPlaces = [], pendingPlaces = [] }) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('Falta configurar la API key de Claude')

  const visitedText = visitedPlaces.length
    ? visitedPlaces.map(p => `- ${p.name}${p.avgScore ? ` (${p.avgScore}/5)` : ''}`).join('\n')
    : '(ninguno)'
  const pendingText = pendingPlaces.length
    ? pendingPlaces.map(p => `- ${p.name}`).join('\n')
    : '(ninguno)'

  const userMsg = `Lugares que fuimos y nos gustaron:\n${visitedText}\n\nLugares que queremos ir:\n${pendingText}\n\nSugerime 3 lugares nuevos en Corrientes capital.`

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      system: SYSTEM,
      messages: [{ role: 'user', content: userMsg }],
    }),
  })

  if (!res.ok) {
    const err = await res.text().catch(() => '')
    throw new Error(`Error al pedir sugerencias (${res.status}): ${err.slice(0, 120)}`)
  }

  const data = await res.json()
  const text = data?.content?.[0]?.text?.trim() ?? ''
  const cleaned = text.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim()

  try {
    const parsed = JSON.parse(cleaned)
    if (!Array.isArray(parsed)) throw new Error('Respuesta inválida')
    return parsed
  } catch {
    throw new Error('No pudimos interpretar la respuesta de Claude')
  }
}
