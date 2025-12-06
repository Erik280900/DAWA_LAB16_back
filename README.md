# Sistema de Gestión de Tareas y Proyectos - Backend

Backend API REST construido con Node.js, Express y MySQL para un sistema completo de gestión de tareas y proyectos colaborativo.

## 🚀 Características

### ✨ Funcionalidades Principales
- **Autenticación y Autorización**: JWT, registro, login, gestión de perfiles
- **Gestión de Proyectos**: CRUD completo, miembros, permisos
- **Sistema de Tareas**: Estados (Kanban), prioridades, fechas límite, asignaciones
- **Etiquetas**: Categorización y organización visual
- **Comentarios**: Colaboración en tiempo real
- **Roles de Usuario**: Admin y usuarios regulares

### 🔒 Seguridad
- Autenticación JWT
- Rate limiting
- Validación de datos
- CORS configurado
- Helmet para headers de seguridad
- Protección contra ataques comunes

## 📋 Requisitos Previos

- Node.js (v16 o superior)
- MySQL (v8.0 o superior)
- NPM o Yarn

## 🛠️ Instalación

1. **Clonar el repositorio e instalar dependencias:**
```bash
cd backend
npm install
```

2. **Configurar variables de entorno:**
El archivo `.env` ya está configurado con valores por defecto. Ajusta según tu entorno:

```env
# Servidor
PORT=4000
NODE_ENV=development

# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_NAME=proyectodawa
DB_USER=root
DB_PASS=

# JWT
JWT_SECRET=mi_super_secreto_jwt_2024_proyecto_dawa
JWT_EXPIRES_IN=7d

# CORS
FRONTEND_URL=http://localhost:3000
```

3. **Configurar la base de datos:**
```bash
# Crear base de datos en MySQL
mysql -u root -p
CREATE DATABASE proyectodawa;
exit
```

4. **Ejecutar script SQL:**
```bash
# Ejecutar el archivo proyectoDAWA.sql en tu base de datos
mysql -u root -p proyectodawa < proyectoDAWA.sql
```

5. **Instalar dependencias adicionales (si es necesario):**
```bash
npm install bcryptjs jsonwebtoken cors morgan helmet express-rate-limit nodemon
```

## 🚦 Ejecución

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm start
```

El servidor estará disponible en `http://localhost:4000`

## 📡 API Endpoints

### 🔐 Autenticación (`/api/auth`)
```
POST   /register          # Registro de usuario
POST   /login            # Login
GET    /profile          # Obtener perfil (requiere auth)
PUT    /profile          # Actualizar perfil (requiere auth)
PUT    /change-password  # Cambiar contraseña (requiere auth)
```

### 📁 Proyectos (`/api/projects`)
```
GET    /                    # Listar proyectos del usuario
POST   /                    # Crear proyecto
GET    /:id                 # Obtener proyecto específico
PUT    /:id                 # Actualizar proyecto (owner/admin)
DELETE /:id                 # Eliminar proyecto (owner/admin)
POST   /:id/members         # Agregar miembro (owner/admin)
DELETE /:id/members/:userId # Remover miembro (owner/admin)
GET    /:id/search-users    # Buscar usuarios para agregar
```

### ✅ Tareas (`/api/tasks`)
```
GET    /project/:projectId  # Obtener tareas del proyecto
POST   /project/:projectId  # Crear tarea en proyecto
GET    /:id                # Obtener tarea específica
PUT    /:id                # Actualizar tarea
DELETE /:id                # Eliminar tarea
PUT    /:id/assign-users   # Asignar/desasignar usuarios
PUT    /:id/assign-tags    # Asignar/desasignar etiquetas
```

### 💬 Comentarios (`/api/comments`)
```
GET    /task/:taskId  # Obtener comentarios de tarea
POST   /task/:taskId  # Crear comentario en tarea
PUT    /:id          # Actualizar comentario (solo autor)
DELETE /:id          # Eliminar comentario (solo autor)
```

### 🏷️ Etiquetas (`/api/tags`)
```
GET    /     # Listar todas las etiquetas
POST   /     # Crear etiqueta
GET    /:id  # Obtener etiqueta específica
PUT    /:id  # Actualizar etiqueta
DELETE /:id  # Eliminar etiqueta (si no está en uso)
```

### 🔍 Utilidad (`/api`)
```
GET /health  # Estado de la API
```

## 🗃️ Estructura de la Base de Datos

### Tablas Principales
- `users` - Usuarios del sistema
- `roles` - Roles de usuario (admin, user)
- `projects` - Proyectos
- `tasks` - Tareas
- `tags` - Etiquetas
- `comments` - Comentarios en tareas

### Tablas de Relación
- `project_members` - Miembros de proyectos
- `task_assignees` - Asignados a tareas
- `task_tags` - Etiquetas de tareas

## 📂 Estructura del Proyecto

```
backend/
├── config/
│   └── database.js      # Configuración Sequelize
├── controllers/         # Lógica de negocio
│   ├── authController.js
│   ├── projectController.js
│   ├── taskController.js
│   ├── commentController.js
│   └── tagController.js
├── middleware/          # Middlewares personalizados
│   ├── auth.js         # Autenticación JWT
│   └── rateLimiter.js  # Rate limiting
├── models/             # Modelos Sequelize
│   ├── index.js        # Configuración de modelos
│   ├── User.js
│   ├── Role.js
│   ├── Project.js
│   ├── Task.js
│   ├── Tag.js
│   ├── Comment.js
│   └── [tablas de relación]
├── routes/             # Definición de rutas
│   ├── index.js        # Router principal
│   ├── auth.js
│   ├── projects.js
│   ├── tasks.js
│   ├── comments.js
│   └── tags.js
├── .env                # Variables de entorno
├── .gitignore         # Archivos ignorados
├── package.json       # Dependencias y scripts
├── proyectoDAWA.sql   # Script de base de datos
└── server.js          # Punto de entrada
```

## 🔧 Scripts Disponibles

```bash
npm start        # Iniciar en producción
npm run dev      # Iniciar en desarrollo (con nodemon)
npm test         # Ejecutar tests (pendiente)
```

## 🌍 Variables de Entorno

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `PORT` | Puerto del servidor | `4000` |
| `NODE_ENV` | Entorno de ejecución | `development` |
| `DB_HOST` | Host de MySQL | `localhost` |
| `DB_PORT` | Puerto de MySQL | `3306` |
| `DB_NAME` | Nombre de la base de datos | `proyectodawa` |
| `DB_USER` | Usuario de MySQL | `root` |
| `DB_PASS` | Contraseña de MySQL | `` |
| `JWT_SECRET` | Secreto para JWT | *requerido* |
| `JWT_EXPIRES_IN` | Tiempo de expiración JWT | `7d` |
| `FRONTEND_URL` | URL del frontend | `http://localhost:3000` |
| `BCRYPT_ROUNDS` | Rounds de bcrypt | `12` |

## 🔄 Respuestas de la API

### Formato de Respuesta Exitosa
```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": {
    // Datos específicos de la respuesta
  }
}
```

### Formato de Respuesta de Error
```json
{
  "success": false,
  "message": "Descripción del error"
}
```

## 🛡️ Seguridad

### Rate Limiting
- General: 100 requests por 15 minutos
- Autenticación: 5 intentos por 15 minutos

### Autenticación
- JWT con expiración configurable
- Middleware de protección en rutas privadas
- Verificación de roles para acciones administrativas

### Validaciones
- Validación de entrada en todos los endpoints
- Sanitización de datos
- Verificación de permisos por recurso

## 🚀 Próximas Funcionalidades

- [ ] WebSockets para actualizaciones en tiempo real
- [ ] Notificaciones push
- [ ] Filtros avanzados de tareas
- [ ] Reportes y estadísticas
- [ ] API de archivos adjuntos
- [ ] Integración con servicios externos

## 📝 Logs

El servidor utiliza Morgan para logging:
- Desarrollo: formato `dev`
- Producción: formato `combined`

## 🔧 Troubleshooting

### Error de Conexión a MySQL
1. Verificar que MySQL esté ejecutándose
2. Confirmar credenciales en `.env`
3. Verificar que la base de datos `proyectodawa` exista

### Error de JWT
1. Verificar que `JWT_SECRET` esté configurado
2. Confirmar que el token se envíe como `Bearer TOKEN`

### Error de CORS
1. Verificar `FRONTEND_URL` en `.env`
2. Confirmar que el frontend esté en la URL correcta

---

**Backend listo para conectar con el frontend Next.js** ✅

El backend está completamente configurado y listo para ser consumido por el frontend de Next.js en el puerto 3000.