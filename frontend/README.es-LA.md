# Frontend
Este documento proporciona una visión general de la estructura del frontend, los paquetes y los componentes utilizados en el proyecto.

# Índice
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Paquetes](#paquetes)
- [Instalación](#instalación)
- [Ejecutar la aplicación](#ejecutar-la-aplicación)
- [Variables de Entorno](#variables-de-entorno)
- [Pruebas](#pruebas)

## Estructura del Proyecto

```
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── constants/
│   ├── context/
│   ├── hooks/
│   ├── services/
│   ├── test/
│   ├── utils/
│   ├── app.css
│   ├── app.tsx
│   ├── index.css
│   └── index.tsx
├── .env
├── .env.example
├── .gitignore
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── README.es-LA.md
├── README.md
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── vitest.config.ts
```

## Paquetes
- `axios`: Cliente HTTP basado en promesas para realizar solicitudes API al backend.
- `eslint`: Utilidad de linting para JavaScript y TypeScript, utilizada para hacerr cumplir la calidad y consistencia del código en la base de código del frontend.
- `qrcode.react`: Biblioteca para generar códigos QR, utilizada para mostrar los códigos de las tarjetas de regalo en un formato escaneable.
- `socket.io-client`: Biblioteca para aplicaciones web en tiempo real, que permite la comunicación bidireccional con el servidor backend para actualizaciones en tiempo real sobre el estado de los pedidos y la entrega de tarjetas de regalo.
- `react`: Biblioteca de JavaScript para construir interfaces de usuario, utilizada para crear los componentes  del frontend y gestionar el estado.
- `react-dom`: Paquete para trabajar con el DOM en aplicaciones React.
- `react-router-dom`: Biblioteca para enrutamiento en aplicaciones React, utilizada para gestionar la navegación entre diferentes páginas (por ejemplo, inicio, estado del pedido).
- `typescript`: Soporte para el lenguaje TypeScript, proporcionando verificación de tipos y mejorando la experiencia del desarrollador.
- `vite`: Herramienta de construcción que proporciona un servidor de desarrollo rápido y un proceso de construcción optimizado para aplicaciones React.
- `vitest`: Framework de pruebas para proyectos Vite, utilizado para escribir y ejecutar pruebas unitarias.

> La lista completa de dependencias está disponible en `package.json`.

## Instalación
1. Clonar el repositorio (si no se ha hecho ya).
2. Navegar al directorio `frontend`:

```bash
cd frontend
```
3. Instalar las dependencias:

```bash
npm install
```

## Ejecutar la aplicación
- Modo de desarrollo:

```bash
npm run dev
```

- Build para producción:

```bash
npm run build
```

La build estará en la carpeta `dist`, que se puede servir en cualquier servidor de archivos estáticos.


## Variables de Entorno
Crear un archivo `.env` en la raíz del directorio `frontend` basado en el archivo `.env.example`. Establecer las siguientes variables de entorno:

| Variable | Descripción | Ejemplo |
| --- | --- | --- |
| `VITE_API_BASE_URL` | URL base para las solicitudes API al backend. | `http://localhost:3000/api` |
| `VITE_SOCKET_IO_URL` | URL para la conexión de Socket.io al backend. | `http://localhost:3000` |

## Pruebas
Para ejecutar las pruebas unitarias, usar el siguiente comando:

```bash
npm run test
```

> Esto ejecutará las pruebas utilizando Vitest, mostrando los resultados en la consola. La configuración de los tests se encuentra en `src/test` y `vitest.config.ts`. Los tests están ubicados en el directorio `__tests__` dentro del directorio de los componentes o hooks que están siendo probados.