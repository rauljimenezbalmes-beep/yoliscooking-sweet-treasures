## Objetivo
Cambiar el texto del paso 2 en el wizard de personalización para que muestre **"Cobertura"** cuando el producto sea de la categoría **Bizcochos**, y mantenga **"Relleno"** para las demás categorías.

## Cambio

### `src/routes/pasteles.$id.personalizar.tsx`

- Actualmente `STEPS` es una constante estática:
  ```tsx
  const STEPS: WizardStep[] = [
    { id: 1, label: "Sabores" },
    { id: 2, label: "Relleno" },
    { id: 3, label: "Decoración" },
    { id: 4, label: "Texto" },
    { id: 5, label: "Resumen" },
  ];
  ```
- Convertir `STEPS` en una función `getSteps(isBizcocho: boolean): WizardStep[]` que devuelva el mismo array pero con el paso 2 como `"Cobertura"` si `isBizcocho` es `true`, o `"Relleno"` si es `false`.
- En `PersonalizarPage`, usar `const steps = getSteps(isBizcocho)` y pasar `steps` en lugar de `STEPS` al componente `WizardProgress`.

## Fuera de alcance
- No se modifica la lógica de validación (`stepValid`), ni los componentes de paso (`StepCovering`, `StepPlaceholder`), ni el resto del wizard.