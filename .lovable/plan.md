## Objetivo

Dar permisos de administrador al usuario con correo `janet_jimenez_96@hotmail.com`.

## Pasos

1. Verificar que existe un usuario registrado con ese correo en la base de datos (tabla `auth.users`). Si no existe, pedirle a esa persona que se registre primero en la web (`/auth`) antes de continuar.
2. Insertar una fila en la tabla `user_roles` con ese `user_id` y el rol `admin`, usando `ON CONFLICT DO NOTHING` para que sea seguro re-ejecutarlo.
3. Confirmar que el usuario ya aparece como admin (al iniciar sesión verá la pestaña "Admin" en la cabecera y podrá entrar a `/admin/pasteles`).

## Detalles técnicos

SQL aproximado a ejecutar:

```sql
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'janet_jimenez_96@hotmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
```

No se cambia código ni esquema, solo datos.
