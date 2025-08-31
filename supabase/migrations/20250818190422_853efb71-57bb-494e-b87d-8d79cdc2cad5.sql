
-- Primero, veamos qué usuarios existen
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC;

-- Luego, asigna el rol de admin al usuario más reciente (reemplaza con tu email real)
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users 
WHERE email = 'tu-email@ejemplo.com'  -- CAMBIA ESTO POR TU EMAIL REAL
ON CONFLICT (user_id, role) DO NOTHING;

-- Verifica que se asignó correctamente
SELECT ur.role, u.email 
FROM user_roles ur 
JOIN auth.users u ON ur.user_id = u.id;
```
