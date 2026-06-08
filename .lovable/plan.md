## Objetivo

Implementar el Paso 2 del wizard de personalización **solo cuando el producto sea de la categoría "Tartas"**. En ese caso el cliente elige una única cobertura entre 6 opciones. Para "Bizcochos" y "Tartas de Época" el Paso 2 sigue mostrando el placeholder actual.

## Cambios

### 1. Nuevo componente `src/components/customization/steps/StepCovering.tsx`

- Título: "Elige la cobertura" + descripción corta.
- Selección **única** (radio): al pulsar una opción se guarda en `state.covering` mediante `update("covering", value)`.
- Opciones (ya existen en `src/data/customization.ts` → `COVERINGS`):
  - Sin cobertura
  - Chocolate negro
  - Chocolate blanco
  - Almíbar de naranja
  - Almíbar de limón
  - Chocolate con leche
- Reutiliza `SelectableCard` con `selected={state.covering === opt}`.

### 2. `src/routes/pasteles.$id.personalizar.tsx`

- Importar `StepCovering`.
- Calcular `isTarta = product.category === "Tartas"`.
- En `stepValid[2]`:
  - Si `isTarta`: `state.covering !== ""` (obligatorio elegir una).
  - Si no: `true` (placeholder, como ahora).
- En el render del paso 2:
  - Si `isTarta`: `<StepCovering />`.
  - Si no: el `StepPlaceholder` actual sin cambios.

### Fuera de alcance

- No se toca Paso 1 (Sabores) ni Pasos 3-5.
- No se cambian precios, ni el catálogo, ni los textos de las coberturas (se usan tal cual están en `COVERINGS`).
- Bizcochos y Tartas de Época mantienen el placeholder "Próximamente" en el Paso 2.
