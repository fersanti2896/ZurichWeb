# Zurich Web

Frontend del sistema Zurich desarrollado con Angular 19, Angular Material, TailwindCSS y NGXS.

Este proyecto consume un backend REST y maneja autenticación, roles, permisos, administración de clientes, pólizas y perfil de usuario.

---

## Tecnologías

- Angular 19
- Angular Material
- TailwindCSS
- NGXS
- RxJS
- TypeScript 5
- Autenticación JWT

---

## Requisitos

Antes de ejecutar el proyecto asegúrate de tener instalado:

- Node.js (v18 o superior recomendado)
- Angular CLI 19
- Git

---

## Rama de trabajo

La rama que debe utilizarse para trabajar en local es:

```text
development
```

### Clonar el repositorio 
 ```text
git clone https://github.com/fersanti2896/ZurichWeb.git
cd zurich-web
git checkout development
```

### Instalar las dependencias
 ```text
npm install
```

### Configuración de variables de entorno
 ```text

export const environment = {
  production: false,
  apiUrl: 'https://localhost:44308/api'
};
```


### Ejecutar el proyecto 
 ```text
    npm serve
```

### Credenciales
Administrador

 ```text
Email: fersanti2896@gmail.com
Password: Fersa169*
```

El administrador puede:
- Gestionar clientes
- Administrar pólizas
- Aprobar solicitudes de cancelación de pólizas
- Editar información de un cliente


Cliente

 ```text
Email: wendys@gmail.com
Password: Fersa169*
```

El cliente puede:
- Visualizar sus pólizas
- Solicitar cancelaciones
- Editar su información personal (dirección y teléfono)
