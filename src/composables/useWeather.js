const WEATHER_MAP = {
  0:  { emoji: '☀️', description: 'Soleado' },
  1:  { emoji: '🌤', description: 'Mayormente soleado' },
  2:  { emoji: '⛅', description: 'Parcialmente nublado' },
  3:  { emoji: '☁️', description: 'Nublado' },
  45: { emoji: '🌫', description: 'Niebla' },
  48: { emoji: '🌫', description: 'Niebla' },
  51: { emoji: '🌦', description: 'Llovizna' },
  53: { emoji: '🌦', description: 'Llovizna' },
  55: { emoji: '🌦', description: 'Llovizna' },
  61: { emoji: '🌧', description: 'Lluvia' },
  63: { emoji: '🌧', description: 'Lluvia' },
  65: { emoji: '🌧', description: 'Lluvia fuerte' },
  71: { emoji: '🌨', description: 'Nieve' },
  73: { emoji: '🌨', description: 'Nieve' },
  75: { emoji: '🌨', description: 'Nieve fuerte' },
  80: { emoji: '🌦', description: 'Chaparrones' },
  81: { emoji: '🌧', description: 'Chaparrones' },
  82: { emoji: '🌧', description: 'Chaparrones fuertes' },
  95: { emoji: '⛈', description: 'Tormenta' },
  96: { emoji: '⛈', description: 'Tormenta' },
  99: { emoji: '⛈', description: 'Tormenta fuerte' },
}

export function mapWeatherCode(code) {
  return WEATHER_MAP[code] ?? { emoji: '🌡', description: 'Clima' }
}

export function useWeather() {
  async function fetchWeather(lat, lng, date) {
    if (lat == null || lng == null || !date) return null
    try {
      const today = new Date().toISOString().split('T')[0]
      const isFuture = date >= today
      const base = isFuture
        ? 'https://api.open-meteo.com/v1/forecast'
        : 'https://archive-api.open-meteo.com/v1/archive'
      const url = `${base}?latitude=${lat}&longitude=${lng}&start_date=${date}&end_date=${date}&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
      const res = await fetch(url)
      if (!res.ok) return null
      const data = await res.json()
      const d = data?.daily
      if (!d || !d.weather_code?.length) return null
      const code = d.weather_code[0]
      const { emoji, description } = mapWeatherCode(code)
      return {
        description,
        emoji,
        tempMax: d.temperature_2m_max[0],
        tempMin: d.temperature_2m_min[0],
      }
    } catch {
      return null
    }
  }

  return { fetchWeather, mapWeatherCode }
}
