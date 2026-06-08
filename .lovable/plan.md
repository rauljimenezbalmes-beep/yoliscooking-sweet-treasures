## Cambio

Mover el Paso 2 (Cobertura) de **Tartas** a **Bizcochos**.

### `src/routes/pasteles.$id.personalizar.tsx`

- Reemplazar `isTarta = product.category === "Tartas"` por `isBizcocho = product.category === "Bizcochos"`.
- `stepValid[2]`: `isBizcocho ? state.covering !== "" : true`.
- En el render del paso 2: si `isBizcocho` → `<StepCovering />`; en caso contrario (Tartas y Tartas de Época) → `<StepPlaceholder title="Relleno" ... />`.

### Fuera de alcance

- No se toca `StepCovering.tsx` ni `COVERINGS` (mismas 6 opciones).
- No se modifican otros pasos, precios ni catálogo.
- Tartas y Tartas de Época mantienen el placeholder "Próximamente" en el Paso 2.
