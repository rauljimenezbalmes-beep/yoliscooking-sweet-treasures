## Problema

Al abrir las pestañas (Tamaños, Coberturas, Decoración, Temas…) en el editor del pastel, la app crashea con:

> Rendered fewer hooks than expected. This may be caused by an accidental early return statement.

Origen: `src/components/admin/ProductWizardEditor.tsx` → `TypeSection` (línea 67). Hace un `return` temprano cuando los datos están cargando (línea 80) **antes** de llamar al hook `useProduct(productId)` (línea 85). Esto viola las Reglas de Hooks de React: en el primer render se llaman menos hooks que en los siguientes, y React rompe todo el subárbol — por eso ninguna pestaña funciona.

## Cambio

En `src/components/admin/ProductWizardEditor.tsx`, dentro de `TypeSection`:

1. Mover `const product = useProduct(productId)` y `const basePrice = product?.price ?? 0` **arriba**, justo después de los demás hooks (`useWizardOptions`, `useProductWizardRows`, `useToggleGlobalForProduct`).
2. Dejar el `if (loadingGlobals || loadingOverrides) return …` después de todos los hooks.
3. No tocar nada más: la lógica, UI y resto de pestañas se mantienen igual.

## Verificación

- Abrir `/admin/pasteles/<id>` y comprobar que las 6 pestañas (Sabores, Coberturas, Decoración, Temas, Colores, Tamaños) se renderizan sin errores en consola.
- Confirmar que el input de precio por tamaño sigue funcionando.
