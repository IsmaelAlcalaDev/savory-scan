
-- First, let's check if you have any user roles assigned
SELECT ur.*, u.email 
FROM user_roles ur 
JOIN auth.users u ON ur.user_id = u.id;

-- If you don't see your user, or your user doesn't have 'admin' role,
-- replace 'your-email@example.com' with your actual email address
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users 
WHERE email = 'your-email@example.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Verify the role was assigned
SELECT ur.role, u.email, u.id
FROM user_roles ur 
JOIN auth.users u ON ur.user_id = u.id
WHERE u.email = 'your-email@example.com';
```
