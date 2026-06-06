## Problema

`/pasteles/red-velvet/personalizar` muestra la **ficha del pastel** en lugar del **wizard de personalización**, aunque el archivo `src/routes/pasteles.$id.personalizar.tsx` existe y está registrado en `routeTree.gen.ts`.

En el routing plano de TanStack Router, cuando existen a la vez:

```
src/routes/pasteles.$id.tsx            ← se convierte en LAYOUT padre
src/routes/pasteles.$id.personalizar.tsx ← hijo
```

El archivo `pasteles.$id.tsx` pasa a comportarse como layout y debería renderizar `<Outlet />` para que el hijo aparezca. Como hoy renderiza la ficha completa sin `<Outlet />`, al navegar al hijo el layout monta la ficha y el wizard nunca llega a verse.

## Solución

Convertir la ficha en una hoja `index` para que `pasteles.$id.tsx` deje de ser layout. Resultado:

```
src/routes/pasteles.$id.index.tsx         ← /pasteles/$id (ficha actual, sin cambios de contenido)
src/routes/pasteles.$id.personalizar.tsx  ← /pasteles/$id/personalizar (wizard)
```

Sin layout intermedio, cada URL renderiza su componente directamente y el problema desaparece.

## Pasos concretos

1. **Renombrar** `src/routes/pasteles.$id.tsx` → `src/routes/pasteles.$id.index.tsx`.
2. **Actualizar** dentro de ese archivo la línea:
   - `createFileRoute("/pasteles/$id")` → `createFileRoute("/pasteles/$id/")`
   - Nada más cambia: misma UI, mismo `useProduct`, mismo botón "Personalizar mi pastel".
3. **No tocar** `pasteles.$id.personalizar.tsx` ni el contenido del wizard ya implementado (Paso 1 Sabores + placeholders).
4. **No editar** `src/routeTree.gen.ts`; se regenera solo en el siguiente build.
5. **Verificar en el preview**:
   - `/pasteles/red-velvet` → sigue mostrando la ficha del Red Velvet con su botón.
   - Pulsar "Personalizar mi pastel" → navega a `/pasteles/red-velvet/personalizar` y se ve el wizard con el Paso 1 (los 9 sabores que pediste).

## Fuera de alcance

- No se toca el catálogo (`/mis-pasteles`), el carrito, ni los demás pasos del wizard.
- No se renombran sabores ni se cambia la lógica del Paso 1 (ya coincide con tu lista: Crema pastelera, Yema quemada, Trufa, Chocolate blanco, Nocilla, Crema de pistacho, Crema de lotus, Nata, Crema de naranja).
