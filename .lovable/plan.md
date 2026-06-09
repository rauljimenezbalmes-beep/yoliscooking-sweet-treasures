## Objetivo
Cuando el admin desactiva todas las etiquetas de un paso (sabores, cobertura/relleno, o decoración) para un pastel, ese paso desaparece en el wizard del cliente y la barra de progreso se reajusta automáticamente al nuevo número de pasos.

## Comportamiento por paso

- **Sabores**: se oculta si no hay opciones de `flavor` resueltas.
- **Cobertura/Relleno**: se oculta si no hay opciones de `covering` resueltas (ya se valida así, solo falta no contarlo como paso).
- **Decoración**: se oculta si no hay opciones de `decoration` (ni `theme`/`color`) resueltas.
- **Detalles**: siempre visible (la fecha de entrega es obligatoria). El selector de tamaño dentro del paso ya se adapta si no hay tamaños.
- **Resumen**: siempre visible.

## Cambios técnicos (solo `src/routes/pasteles.$id.personalizar.tsx`)

1. Resolver también `flavor`, `theme`, `color` con `useResolvedWizardOptions` además de los actuales.
2. Sustituir `getSteps(isBizcocho)` por una construcción dinámica que devuelva un array `steps` con `{ key, label, render, valid }`, donde `key ∈ {"flavors","covering","decoration","details","summary"}`. Solo se añaden los pasos con contenido (regla anterior).
3. Asignar `id` numérico 1..N **después** de filtrar, para que `WizardProgress` siga recibiendo IDs consecutivos. La UI no necesita cambios.
4. `current` sigue siendo numérico 1..N sobre el array filtrado. El renderizado pasa de `current === 1 && <StepFlavors/>` etc. a `steps[current-1].render()`.
5. `stepValid` y `completed` se calculan recorriendo `steps` por su `key` (no por número fijo), para que las validaciones sigan correctas cuando faltan pasos.
6. Si por algún motivo `current` queda fuera de rango tras un cambio de datos (caso raro), forzar `setCurrent(Math.min(current, steps.length))` con un `useEffect`.

## Fuera de alcance
- No se toca el editor admin ni la base de datos.
- No se cambian los componentes de paso individuales (`StepFlavors`, `StepCovering`, etc.).
- No se cambia la lógica de precio ni el carrito.
