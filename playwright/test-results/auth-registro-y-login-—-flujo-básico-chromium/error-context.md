# Page snapshot

```yaml
- main [ref=e3]:
  - generic [ref=e4]:
    - generic [ref=e5]:
      - img "Logo" [ref=e6]
      - heading "PFEPS" [level=1] [ref=e7]
      - paragraph [ref=e8]: Crear una nueva cuenta
    - generic [ref=e9]:
      - generic [ref=e10]:
        - generic [ref=e11]: Nombre Completo
        - textbox "Ej. Juan Pérez" [ref=e12]: Test User
      - generic [ref=e13]:
        - generic [ref=e14]: Identificación (Cédula)
        - textbox "Tu número de cédula" [ref=e15]: "1234567890"
      - generic [ref=e16]:
        - generic [ref=e17]: Correo electrónico
        - textbox "correo@ejemplo.com" [ref=e18]: test+1766975052535@example.com
      - generic [ref=e19]:
        - generic [ref=e20]:
          - generic [ref=e21]: Contraseña
          - button "Mostrar" [ref=e22] [cursor=pointer]
        - textbox "••••••••" [ref=e23]: Test1234!
      - button "Completar Registro" [ref=e25] [cursor=pointer]
      - paragraph [ref=e27]:
        - text: ¿Ya tienes una cuenta?
        - button "Iniciar sesión" [ref=e28] [cursor=pointer]
      - paragraph [ref=e29]: "❌ Error: La identificación (Cédula) ya está registrada."
```