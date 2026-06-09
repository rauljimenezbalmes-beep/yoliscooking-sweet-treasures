## Editar pasteles del carrito

### Flujo
Botón "Editar" en cada item del carrito → abre el wizard pre-rellenado con la configuración guardada → al confirmar, actualiza el item existente (mismo `id`, mismo `addedAt`) en vez de crear uno nuevo.

### Cambios

**1. `src/data/cart-store.ts`**
- Nueva función `updateCartItem(id, customization, price)`:
  - Actualiza el item en `state` localmente y emite.
  - Si hay sesión y el `id` es UUID, hace `supabase.from("cart_items").update({ customization, price }).eq("id", id).eq("user_id", currentUserId)`.

**2. `src/context/CustomizationContext.tsx`**
- Aceptar prop opcional `initial?: Partial<CustomizationState>` para hidratar el estado inicial desde un item existente.

**3. `src/routes/pasteles.$id.personalizar.tsx`**
- Añadir `validateSearch` con `zodValidator` para search param `edit?: string` (id del item).
- Si `edit` está presente, buscar el item con `useCart()` y pasar su `customization` como `initial` al `CustomizationProvider`.
- Cabecera: cuando hay `edit`, mostrar "Editando tu pastel" en lugar de "Personalizando".
- Botón final: "Guardar cambios" en modo edición, "Añadir al carrito" si no.
- En `handleNext` paso final: si hay `edit`, llamar `updateCartItem(editId, customization, price)` + toast "Pastel actualizado"; si no, `addToCart` como ahora.

**4. `src/routes/carrito.tsx`**
- En cada item, añadir Link "Editar" junto a "Eliminar":
  ```tsx
  <Link to="/pasteles/$id/personalizar" params={{ id: it.customization.productId }} search={{ edit: it.id }}>Editar</Link>
  ```

### Detalles técnicos
- Instalar `@tanstack/zod-adapter` si no está (zod ya está).
- El item conserva `addedAt` porque solo actualizamos `customization` y `price`.
- Las validaciones del wizard (sabores, cobertura, fecha mínima de entrega) se aplican igual al editar. Si la fecha guardada quedó por debajo del mínimo, el usuario tendrá que actualizarla para guardar.

### Fuera de alcance
- Modal de edición in-place.
- Historial de versiones del item.
- Cambios en el admin o en los pasos del wizard.
