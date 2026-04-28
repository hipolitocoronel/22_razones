# Meriendas — Diario de salidas del 22

Aplicación web personal (mobile-first) para registrar las salidas a merendar con mi novia. Cada 22 de mes visitamos un lugar nuevo y lo registramos acá.

---

## Workflow obligatorio antes de tocar cualquier archivo

Antes de implementar cualquier cambio de UI, diseño o flujo:

1. **Leer `ui-ux-pro-max`** — ejecutar el design system search para la pantalla o componente en cuestión:
   ```bash
   # Design system completo (SIEMPRE primero)
   python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<contexto>" --design-system

   # Guías UX específicas
   python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<tema>" --domain ux

   # Guías de stack Vue
   python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<tema>" --stack vue
   ```

2. **Aplicar `clean-code`** — antes de dar tarea por terminada, verificar el checklist del skill:
   - ¿La función hace una sola cosa?
   - ¿Importa algún archivo dependiente que también deba actualizarse?
   - ¿Hay código duplicado extraíble?

3. **Pre-delivery checklist** (del skill `ui-ux-pro-max`):
   - [ ] Sin emojis como iconos de UI — usar SVG (Lucide)
   - [ ] Touch targets ≥ 44×44px en todos los elementos interactivos
   - [ ] `cursor-pointer` en todos los elementos clickeables
   - [ ] Transiciones 150–300ms
   - [ ] Focus states visibles (`focus-visible:ring-2`)
   - [ ] `aria-label` en botones sin texto
   - [ ] `role="alert"` en mensajes de error
   - [ ] `storeToRefs()` al destructurar stores de Pinia
   - [ ] Skeleton / loading state en vistas asíncronas
   - [ ] Empty states con CTA útil
   - [ ] Feedback de éxito tras acciones importantes (toast)

---

## Stack tecnológico

- **Vue 3 + Vite** — Composition API, `<script setup>` en todos los componentes
- **Supabase** — auth, PostgreSQL, storage para fotos
- **Tailwind CSS v4** — estilos (usar `@reference "tailwindcss"` en `<style scoped>` con `@apply`)
- **Vue Router** — navegación con lazy loading en todas las rutas
- **Pinia** — estado global; siempre usar `storeToRefs()` al destructurar
- **Leaflet** — mapa interactivo con pins
- **Lucide Vue Next** — iconos SVG (nunca emojis como iconos de UI)

---

## Diseño / UX

**La app se usa principalmente en celular** (en un café, al momento de registrar la visita).

- Navegación: **bottom nav** fijo con 5 ítems (Inicio, Mapa, + central, Ranking, Wishlist)
- Color base: paleta amber/warm — fondo `bg-amber-50`, primario `amber-600`
- Touch targets: mínimo `min-h-[44px] min-w-[44px]` en todo lo interactivo
- Transiciones: `transition-all duration-150` o `duration-200`
- Active states: `active:scale-95` o `active:scale-[0.98]`
- Formularios: sticky submit button (`sticky bottom-20`), validación inline, `inputmode` correcto
- Skeleton loaders en toda vista que cargue datos async

---

## Alcance del proyecto

### Entidades de base de datos

**`places`** — nombre, dirección, coordenadas, tipo, links, amenities

**`visits`** — fecha, place_id, score (1–5), qué pedimos, precio, notas, come_back, special_moment, suggested_by, mood, weather

**`wishlist`** — nombre, dirección, source, votes

**`tags`** — etiquetas libres por lugar

### Vistas

| Ruta | Vista |
|---|---|
| `/` | Timeline con racha de meses |
| `/mapa` | Mapa Leaflet con pins |
| `/visitas/nueva` | Formulario nueva visita |
| `/visitas/:id` | Detalle de visita |
| `/ranking` | Ranking por puntuación promedio |
| `/wishlist` | Lugares pendientes con votación |

### Features pendientes

- Estadísticas (barrio más visitado, precio promedio, etc.)
- "En este día, hace X meses..." en el home
- Subida de fotos (Supabase storage)
- Notificación cercana al 22

---

## Autenticación

App privada para dos usuarios. Auth con Supabase email/password. RLS habilitado en todas las tablas con policy `authenticated only`.

---

## Skills del proyecto

| Skill | Cuándo usarla | Cómo invocarla |
|---|---|---|
| **`ui-ux-pro-max`** | **Antes de cualquier cambio de UI/UX** — design system, guías de accesibilidad, touch, animaciones | `/ui-ux-pro-max` |
| **`clean-code`** | Antes de cerrar cualquier tarea — revisar calidad, dependencias, duplicados | `/clean-code` |
| `init` | Regenerar este CLAUDE.md si cambia el alcance | `/init` |
| `review` | Revisar conjuntos de cambios antes de mergear | `/review` |
| `security-review` | Auditar cambios que toquen auth, RLS o archivos | `/security-review` |
| `simplify` | Simplificar código que creció demasiado | `/simplify` |
| `claude-api` | Si se integra la API de Claude (sugerencias de lugares, etc.) | `/claude-api` |
| `update-config` | Cambios en settings, hooks, permisos del entorno | `/update-config` |
| `fewer-permission-prompts` | Reducir prompts repetitivos de permisos | `/fewer-permission-prompts` |

> **Regla:** `ui-ux-pro-max` y `clean-code` son CRÍTICOS y se aplican en **cada tarea** de UI o código, no solo cuando se pide explícitamente.

---

## Convenciones de código

- `<script setup>` en todos los componentes
- `storeToRefs()` siempre que se desestructure un store de Pinia
- Llamadas a Supabase solo en `/src/services/` o stores
- Validación de formularios: inline por campo, `role="alert"` en errores
- Iconos: solo `lucide-vue-next`, nunca emojis en UI interactiva
- Variables de entorno en `.env` (nunca commitear)

---

## Comandos

```bash
npm run dev      # Desarrollo
npm run build    # Build
npm run preview  # Preview del build
```

## Variables de entorno

```
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```
