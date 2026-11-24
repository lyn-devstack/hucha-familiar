# Hucha Familiar: notas para Claude Code

App React + TypeScript + Vite con Supabase para llevar las cuentas compartidas de un hogar en dos monedas (USD y EUR).

- Interfaz en **español**; código, nombres y comentarios en **inglés**.
- Toda la lógica de dinero va en `src/lib/ledger.ts` y `src/lib/money.ts`, siempre en **céntimos enteros** y **con tests** en `ledger.test.ts`.
- La UI solo habla con la interfaz `Repo` (`src/data/repo.ts`). Cualquier cambio de datos tiene que funcionar en `SupabaseRepo` y en `LocalRepo` (demo).
- Si cambias el modelo de datos, actualiza a la vez `src/types.ts`, `src/constants.ts` y `supabase/schema.sql` (tipos permitidos en los `CHECK`).
- La usuaria principal usa la app desde el móvil: botones grandes, poco texto y nada de jerga.
- Antes de dar algo por terminado: `npm run lint && npm test && npm run build`.
