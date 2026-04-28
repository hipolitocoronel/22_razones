import { Coffee, Utensils, Wine, Sunrise, UtensilsCrossed, Sparkles } from 'lucide-vue-next'

export const CATEGORIES = [
  { value: 'merienda',  label: 'Merienda',  icon: Coffee,           color: '#D97706', bg: 'bg-amber-100',   text: 'text-amber-700',  border: 'border-amber-200'  },
  { value: 'cena',      label: 'Cena',       icon: Utensils,         color: '#7C3AED', bg: 'bg-violet-100',  text: 'text-violet-700', border: 'border-violet-200' },
  { value: 'bar',       label: 'Bar',        icon: Wine,             color: '#2563EB', bg: 'bg-blue-100',    text: 'text-blue-700',   border: 'border-blue-200'   },
  { value: 'brunch',    label: 'Brunch',     icon: Sunrise,          color: '#EA580C', bg: 'bg-orange-100',  text: 'text-orange-700', border: 'border-orange-200' },
  { value: 'almuerzo',  label: 'Almuerzo',   icon: UtensilsCrossed,  color: '#16A34A', bg: 'bg-green-100',   text: 'text-green-700',  border: 'border-green-200'  },
  { value: 'otro',      label: 'Otro',       icon: Sparkles,         color: '#78716C', bg: 'bg-stone-100',   text: 'text-stone-600',  border: 'border-stone-200'  },
]

export function getCategory(value) {
  return CATEGORIES.find(c => c.value === value) ?? CATEGORIES[0]
}
