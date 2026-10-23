# PrimeraAplicación

Aplicación web desarrollada con **Angular 22** (standalone components) que incluye una pantalla de **inicio de sesión**, un **menú principal** y un **flujo de registro por pasos**, conectados a una **API REST** con autenticación mediante **tokens** e **interceptor HTTP**. Incluye **internacionalización (i18n)** en español e inglés, **pruebas unitarias, de integración, de contrato, E2E y de accesibilidad**, y **despliegue con Docker + Nginx**.

> **Nota importante:** el login y el registro hacen solicitudes reales a la API (`POST /api/users/login` y `POST /api/users`). En desarrollo debes arrancar la aplicación con el proxy (`pnpm start -- --proxy-config proxy.conf.json`); si usas solo `pnpm start`, las peticiones a `/api` no llegarán al backend. Consulta [API y proxy](#api-y-proxy).

> **Estado del proyecto:** esta es la entrega de la **Parte 7** (pruebas y dockerización). La suite de Vitest pasa completa (**45 pruebas en 16 archivos**), pero quedan pendientes funcionales y de accesibilidad importantes, además de varios ajustes de configuración (ver [Estado actual y pendientes](#estado-actual-y-pendientes)).

---

## Tabla de contenido

- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Uso](#uso)
  - [Servidor de desarrollo](#servidor-de-desarrollo)
  - [Inicio de sesión y navegación](#inicio-de-sesión-y-navegación)
  - [Flujo de registro](#flujo-de-registro)
  - [Pruebas unitarias](#pruebas-unitarias)
  - [Pruebas E2E y accesibilidad](#pruebas-e2e-y-accesibilidad)
  - [Docker](#docker)
  - [Compilación](#compilación)
- [API y proxy](#api-y-proxy)
  - [Configuración del proxy](#configuración-del-proxy)
  - [Endpoints utilizados](#endpoints-utilizados)
  - [Autenticación y tokens](#autenticación-y-tokens)
- [Pruebas implementadas](#pruebas-implementadas)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Rutas](#rutas)
- [Funcionalidades](#funcionalidades)
  - [Pantalla de bienvenida (`/bienvenido`)](#pantalla-de-bienvenida-bienvenido)
  - [Pantalla principal (`/principal`)](#pantalla-principal-principal)
  - [Flujo de registro (`/registro`)](#flujo-de-registro-registro)
  - [Servicios](#servicios)
  - [Internacionalización](#internacionalización)
- [Estado actual y pendientes](#estado-actual-y-pendientes)
- [Scripts disponibles](#scripts-disponibles)
- [Recursos estáticos](#recursos-estáticos)
- [Solución de problemas](#solución-de-problemas)

---

## Requisitos

- **Node.js** 20 o superior (recomendado 22+)
- **pnpm** (el proyecto usa `pnpm@12.11.2` como gestor de paquetes)
- **Acceso a la API** en `http://developer.jquiroz.net:3005` para el flujo real
- **Docker** (opcional, solo para las imágenes de despliegue y pruebas)

```bash
npm install -g pnpm
```

## Instalación

Clona el repositorio e instala las dependencias:

```bash
git clone <URL-del-repositorio>
cd primeraAplicacion
pnpm install
```

## Uso

### Servidor de desarrollo

Para que el inicio de sesión y el registro funcionen contra la API, inicia el servidor **con el archivo de proxy**:

```bash
pnpm start -- --proxy-config proxy.conf.json
```

o, de forma equivalente:

```bash
pnpm ng serve --proxy-config proxy.conf.json
```

Abre el navegador en **http://localhost:4200/**. La ruta raíz `/` redirige automáticamente a `/bienvenido`.

Si ejecutas solo `pnpm start`, la interfaz funciona, pero las llamadas a `/api` **no se redirigen al backend**.

La aplicación se recarga automáticamente al modificar los archivos fuente.

### Inicio de sesión y navegación

1. Abre **http://localhost:4200/bienvenido** (o simplemente `/`).
2. Ingresa un correo y una contraseña válidos.
3. Si la API responde correctamente, se guardan los tokens (si vienen en la respuesta) y se navega automáticamente a `/principal`.
4. Si la solicitud falla, se muestra una alerta con el error y se permanece en `/bienvenido`.

También puedes abrir `/principal` directamente escribiendo la URL, ya que **todavía no existen guards** que protejan las rutas.

Para regresar a la pantalla de inicio de sesión, usa la tarjeta **Cerrar sesión** del menú principal o cambia la URL a `/bienvenido`.

### Flujo de registro

1. En `/principal`, haz clic en la tarjeta **Registro** (o abre `/registro`).
2. Completa los pasos:
   - **Personal** (`/personal`)
   - **Cuenta** (`/cuenta`)
   - **Dirección** (`/direccion`)
   - **Fotografía** (`/fotografia`)
3. Al enviar los tres primeros formularios, sus pasos se marcan como completados.
4. El botón **Registrar** de `/registro` se habilita cuando los pasos 1, 2 y 3 están completos.
5. Al pulsarlo se envía `POST /api/users` y, si todo sale bien, se muestra la alerta `Registro exitoso` y se limpian los datos temporales.

> **Limitación actual:** solo el formulario **personal** guarda sus datos en `localStorage`. Los formularios de **cuenta** y **dirección** todavía no lo hacen, por lo que el cuerpo enviado a la API contiene esos campos vacíos. Ver [Estado actual y pendientes](#estado-actual-y-pendientes).

> El paso de **fotografía** no es obligatorio para registrar y actualmente no sube ninguna imagen.

### Pruebas unitarias

Modo interactivo (watch):

```bash
pnpm test
```

Una sola ejecución:

```bash
pnpm test --watch=false
```

> No uses `pnpm test -- --watch=false`: pnpm agrega un `--` adicional y Angular rechaza la opción.

Resultado actual verificado: **16 archivos de prueba y 45 pruebas exitosas**. Incluyen pruebas unitarias, de componentes, de integración, de contrato, del interceptor y del servicio de progreso.

### Pruebas E2E y accesibilidad

Cypress está configurado con `baseUrl: http://localhost:4200`. Las pruebas E2E simulan el backend con `cy.intercept()`, por lo que no necesitan credenciales reales, pero **sí requieren el servidor de desarrollo en ejecución**:

```bash
pnpm start -- --proxy-config proxy.conf.json
```

En otra terminal:

```bash
pnpm cypress:open     # interfaz gráfica
pnpm cypress:run      # modo headless
pnpm e2e              # alias de ng e2e, abre Cypress en modo interactivo
```

Archivos disponibles:

- `cypress/e2e/spec.cy.ts`: flujo completo login → personal → cuenta → dirección → fotografía → registro exitoso.
- `cypress/e2e/accesibilidad.cy.ts`: labels, `alt` de imágenes, navegación con Tab y botón nativo.

> Las pruebas E2E usan respuestas simuladas de la API y no validan el contenido real enviado al backend. La prueba de accesibilidad inyecta `axe-core` pero **no ejecuta `cy.checkA11y()`**, por lo que todavía no comprueba violaciones de accesibilidad.

### Docker

La aplicación se compila en modo **estático** (`outputMode: "static"`) y se sirve con **Nginx**, que también actúa como proxy de `/api`.

Imagen de producción:

```bash
docker build -t p06-conexion-api .
docker run -d -p 4201:80 --name p06-app p06-conexion-api
```

Abre **http://localhost:4201**. Para detener y eliminar el contenedor:

```bash
docker stop p06-app
docker rm p06-app
```

Imagen de pruebas unitarias:

```bash
docker build -f Dockerfile.test -t primeraaplicacion-tests .
docker run --rm primeraaplicacion-tests
```

`Dockerfile.test` ejecuta `ng test --watch=false`, por lo que corre la suite de Vitest (incluidas las pruebas de integración y contrato), pero **no ejecuta las pruebas Cypress**.

> El `Dockerfile` usa `npm install --legacy-peer-deps` en lugar de `pnpm install --frozen-lockfile`, por lo que no respeta estrictamente `pnpm-lock.yaml`. Es una mejora pendiente para asegurar builds reproducibles.

### Compilación

```bash
pnpm build
```

Los artefactos se generan en `dist/primeraAplicacion/browser/`. Con la configuración actual (`outputMode: "static"`) se prerenderizan las ocho rutas y **no se genera `dist/primeraAplicacion/server/server.mjs`**.

Para una compilación en modo desarrollo con recarga de cambios:

```bash
pnpm watch
```

> El script `pnpm serve:ssr:primeraAplicacion` apunta a `dist/primeraAplicacion/server/server.mjs`, que ya no se genera con `outputMode: "static"`. Si se quiere volver a usar SSR, hay que restaurar `outputMode: "server"`; ver [Estado actual y pendientes](#estado-actual-y-pendientes).

---

## API y proxy

### Configuración del proxy

El archivo `proxy.conf.json` redirige las solicitudes que comienzan con `/api`:

```json
{
  "/api": {
    "target": "http://developer.jquiroz.net:3005",
    "secure": false,
    "changeOrigin": true
  }
}
```

- `target`: servidor real de la API (puerto `3005`).
- `secure: false`: no valida el certificado SSL en desarrollo.
- `changeOrigin: true`: ajusta el encabezado `Host` al servidor de destino.

El proxy se activa al arrancar con `--proxy-config proxy.conf.json`. Actualmente **no está enlazado** en `angular.json` ni en un script de `package.json`, por lo que `pnpm start` por sí solo no lo utiliza. En Docker, la equivalencia la hace `nginx.conf`.

### Endpoints utilizados

| Método | Ruta                 | Uso                                             |
| ------ | -------------------- | ----------------------------------------------- |
| `POST` | `/api/users/login`   | Iniciar sesión con `email` y `password`         |
| `POST` | `/api/users`         | Registrar un usuario con los datos de los pasos |
| `POST` | `/api/users/refresh` | Renovar el access token con el refresh token    |

La URL base se define en `src/app/services/servAPI/api.ts` como `'/api'` (ruta relativa), precisamente para pasar por el proxy y evitar problemas de CORS.

### Autenticación y tokens

- `Api.login()` guarda `accessToken` y `refreshToken` en `localStorage` si la respuesta los incluye.
- Claves usadas: `auth_access_token` y `auth_refresh_token`.
- `authInterceptor` agrega `Authorization: Bearer <token>` a las solicitudes salientes, excepto a las de login.
- Si una solicitud responde con **401**, el interceptor intenta renovar el token con `/api/users/refresh`. Si no hay refresh token o la renovación falla, limpia los tokens y redirige a `/bienvenido`.
- El servicio expone `getToken()`, `getRefreshToken()`, `limpiarTokens()` y `refrescarToken()`.

> El botón **Cerrar sesión** del menú principal todavía no llama a `limpiarTokens()`: solo navega a `/bienvenido`.

---

## Pruebas implementadas

| Tipo                     | Archivo(s)                                                                                                                              | Cobertura actual                                                              |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Unitarias de componente  | `bienvenido.spec.ts`                                                                                                                    | Validación de correo, formulario, renderizado y mensajes de error             |
| Componentes (smoke)      | `principal.spec.ts`, `personal.spec.ts`, `cuenta.spec.ts`, `direccion.spec.ts`, `fotografia.spec.ts`, `registro.spec.ts`, `app.spec.ts` | Principalmente solo verifican que el componente se crea                       |
| Integración              | `src/app/integracion.spec.ts`                                                                                                           | Login exitoso, login fallido y construcción del payload de registro           |
| Contrato                 | `api.spec.ts`                                                                                                                           | Estructura de la petición/respuesta de login y almacenamiento de tokens       |
| Interceptor HTTP         | `auth-interceptor.spec.ts`                                                                                                              | Login sin token, ausencia de token, token presente y clonación de la petición |
| Servicio compartido      | `progreso.spec.ts`                                                                                                                      | Paso inicial, pasos completados, actualización y estado síncrono              |
| Servicios de formularios | `personal.spec.ts`, `cuenta.spec.ts`, `direccion.spec.ts`, `registro.spec.ts`                                                           | Solo creación del servicio                                                    |
| E2E                      | `cypress/e2e/spec.cy.ts`                                                                                                                | Flujo completo con API simulada                                               |
| Accesibilidad            | `cypress/e2e/accesibilidad.cy.ts`                                                                                                       | Labels, `alt`, Tab y botón nativo; sin `checkA11y()`                          |

Las pruebas de **Vitest** se ejecutan con `pnpm test --watch=false` y actualmente pasan todas. Las de **Cypress** no forman parte de esa suite y no se ejecutan en la imagen Docker de pruebas.

---

## Estructura del proyecto

```text
primeraAplicacion/
├── public/                                    # Recursos estáticos servidos tal cual
│   ├── favicon.ico
│   ├── iconos/                                # Iconos SVG de la interfaz
│   │   ├── account-avatar-profile-user-6-svgrepo-com.svg
│   │   ├── add.svg
│   │   ├── AvisoPrivacidad.svg
│   │   ├── Background.svg
│   │   ├── Cerrar sesion.svg
│   │   ├── CorreoElectronico.svg
│   │   ├── Fotografiia.svg
│   │   ├── Notificaciones.svg
│   │   ├── Pantera.svg
│   │   ├── Registro.svg
│   │   ├── retroceder.svg
│   │   ├── Usuario.svg
│   │   └── Visualizar.svg
│   └── lenguajes/                             # Traducciones i18n
│       ├── es.json                            # Español
│       └── en.json                            # Inglés
├── src/
│   ├── app/
│   │   ├── componentes/
│   │   │   ├── bienvenido/                    # Inicio de sesión conectado a la API
│   │   │   ├── principal/                     # Menú principal con tarjetas
│   │   │   ├── registro/                      # Flujo de registro y envío a la API
│   │   │   ├── personal/                      # Paso 1: datos personales
│   │   │   ├── cuenta/                        # Paso 2: datos de cuenta
│   │   │   ├── direccion/                     # Paso 3: dirección
│   │   │   └── fotografia/                    # Paso 4: fotografía
│   │   │       # Cada carpeta contiene: <nombre>.ts, .html, .css y .spec.ts
│   │   ├── interceptor/
│   │   │   ├── auth-interceptor.ts            # Agrega el token y renueva sesión
│   │   │   └── auth-interceptor.spec.ts
│   │   ├── services/
│   │   │   ├── servAPI/
│   │   │   │   ├── api.ts                     # Login, registro y manejo de tokens
│   │   │   │   └── api.spec.ts
│   │   │   ├── registro.ts                    # Definición de los pasos del registro
│   │   │   ├── personal.ts                    # Campos del formulario personal
│   │   │   ├── cuenta.ts                      # Campos del formulario de cuenta
│   │   │   ├── direccion.ts                   # Campos del formulario de dirección
│   │   │   ├── progreso.ts                    # Estado del progreso del registro
│   │   │   └── *.spec.ts
│   │   ├── integracion.spec.ts                # Pruebas de integración
│   │   ├── app.ts                             # Componente raíz
│   │   ├── app.html                           # Plantilla raíz (<router-outlet />)
│   │   ├── app.css
│   │   ├── app.config.ts                      # Configuración del cliente (router, HTTP, i18n)
│   │   ├── app.config.server.ts               # Configuración del servidor (SSR)
│   │   ├── app.routes.ts                      # Definición de rutas del cliente
│   │   ├── app.routes.server.ts               # Modo de renderizado del servidor
│   │   └── app.spec.ts
│   ├── main.ts                                # Punto de entrada del navegador
│   ├── main.server.ts                         # Punto de entrada del servidor
│   ├── server.ts                              # Servidor Express (SSR)
│   ├── index.html                             # Documento HTML principal
│   └── styles.css                             # Estilos globales
├── cypress/
│   ├── e2e/
│   │   ├── spec.cy.ts                         # Flujo E2E completo
│   │   └── accesibilidad.cy.ts                # Pruebas de accesibilidad
│   ├── fixtures/
│   ├── support/
│   │   ├── commands.ts
│   │   ├── component.ts
│   │   ├── component-index.html
│   │   └── e2e.ts
│   └── tsconfig.json
├── .dockerignore
├── .vscode/                                   # Configuración de VS Code
├── angular.json                               # Configuración de Angular CLI
├── cypress.config.ts                          # Configuración de Cypress
├── Dockerfile                                 # Build + Nginx
├── Dockerfile.test                            # Imagen para Vitest
├── jasmine-vitest-20261023T073159545Z.md      # Reporte de migración Jasmine → Vitest
├── nginx.conf                                 # Servidor y proxy de producción
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── proxy.conf.json                            # Proxy de desarrollo hacia la API
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.spec.json
├── .prettierrc                                # Configuración de formato de código
└── README.md
```

> Las carpetas `node_modules/`, `dist/`, `.angular/cache/` y `cypress/downloads/` se generan automáticamente y no forman parte del código fuente.

---

## Rutas

| Ruta          | Componente   | Descripción                                  |
| ------------- | ------------ | -------------------------------------------- |
| `/`           | —            | Redirige a `/bienvenido`                     |
| `/bienvenido` | `Bienvenido` | Pantalla de inicio de sesión                 |
| `/principal`  | `Principal`  | Menú principal con tarjetas de opciones      |
| `/registro`   | `Registro`   | Flujo de registro, progreso y envío a la API |
| `/personal`   | `Personal`   | Paso 1: formulario de datos personales       |
| `/cuenta`     | `Cuenta`     | Paso 2: formulario de datos de la cuenta     |
| `/direccion`  | `Direccion`  | Paso 3: formulario de dirección              |
| `/fotografia` | `Fotografia` | Paso 4: instrucciones para la fotografía     |

No hay **guards** de autenticación: cualquier ruta puede abrirse directamente escribiendo la URL.

---

## Funcionalidades

### Pantalla de bienvenida (`/bienvenido`)

- Formulario reactivo con los campos **correo electrónico** y **contraseña**.
- Validaciones:
  - Campos obligatorios.
  - Formato de correo mediante expresión regular.
- Botón con icono para **mostrar/ocultar la contraseña**.
- Mensajes de error de validación traducidos al idioma activo.
- Casilla **Recuérdame** (solo visual, no se persiste).
- Botones para cambiar entre **Español** e **Inglés**.
- Al enviar un formulario válido:
  - Se llama a `Api.login()` con `{ email, password }`.
  - Si la API responde bien, se guardan los tokens (si vienen en la respuesta) y se navega a `/principal`.
  - Si hay error, se muestra una alerta con el mensaje devuelto por la API o un mensaje genérico según el código HTTP (`400`, `401`, `500`).
- Si el formulario es inválido, se marcan todos los campos como tocados.
- No hay indicador de carga ni bloqueo del botón mientras se espera la respuesta.
- El formulario **no se envía al presionar Enter**; hay que hacer clic en el botón.

### Pantalla principal (`/principal`)

Menú con seis tarjetas:

| Tarjeta             | Acción                                        |
| ------------------- | --------------------------------------------- |
| Mi cuenta           | Sin acción (pendiente)                        |
| Registro            | Navega a `/registro`                          |
| Notificaciones      | Sin acción (pendiente)                        |
| ChatBot             | Sin acción (pendiente)                        |
| Aviso de privacidad | Sin acción (pendiente)                        |
| Cerrar sesión       | Navega a `/bienvenido` (no limpia los tokens) |

También incluye el selector de idioma **Español / English**.

### Flujo de registro (`/registro`)

La pantalla `/registro` muestra una barra de progreso con cuatro pasos. Cada paso se puede abrir haciendo clic en su tarjeta:

| Paso | Tarjeta    | Ruta          | Contenido                                                                 |
| ---- | ---------- | ------------- | ------------------------------------------------------------------------- |
| 1    | Personal   | `/personal`   | Nombre, apellidos, fecha de nacimiento, género y nacionalidad             |
| 2    | Cuenta     | `/cuenta`     | Teléfono, correo, nombre de usuario, usuario, contraseña, ocupación y rol |
| 3    | Dirección  | `/direccion`  | Código postal, estado, ciudad, colonia, calle, números y referencia       |
| 4    | Fotografía | `/fotografia` | Instrucciones para tomar o subir una fotografía                           |

Comportamiento de los pasos:

- Los formularios se generan dinámicamente a partir de la definición de campos de cada servicio (`PersonalService`, `CuentaService`, `DireccionService`).
- Todos los campos obligatorios usan `Validators.required`; el correo de la cuenta añade una validación de formato.
- El botón de envío se deshabilita mientras el formulario sea inválido y los errores se muestran al tocar cada campo.
- Al enviar un formulario válido se marca el paso como completado, se avanza el paso actual y se navega al siguiente:
  - `/personal` → `/cuenta`
  - `/cuenta` → `/direccion`
  - `/direccion` → `/fotografia`
  - `/fotografia` (botón **Continuar**) → `/registro`
- Cada pantalla de paso incluye un botón para **regresar** a `/registro`.
- Los círculos de la barra de progreso se muestran completados (✓) o como paso actual según el estado de `ProgresoService`.

Envío del registro:

- El botón **Registrar** se habilita solo cuando los pasos **0, 1 y 2** están completos (el paso de fotografía no se exige).
- `registrar()` recupera `datosFormularioPersonal`, `datosFormularioCuenta` y `datosFormularioDireccion` de `localStorage` y construye el objeto que espera la API.
- Envía `POST /api/users` mediante `Api.registrarUsuario()`.
- Mientras la solicitud está en curso, el botón se deshabilita y se muestra `REGISTRANDO...` (clave de traducción **aún no definida** en los JSON).
- Si la API responde bien: alerta `Registro exitoso` y se eliminan las claves temporales de `localStorage`.
- Si falla: se muestra el mensaje de error dentro de la tarjeta, con textos fijos en español.
- No se reinicia el progreso ni se navega a otra pantalla tras un registro exitoso.

> El progreso vive en memoria (`ProgresoService`). Al recargar la página se reinicia, aunque los datos personales permanezcan en `localStorage`.

### Servicios

| Servicio           | Responsabilidad                                                             |
| ------------------ | --------------------------------------------------------------------------- |
| `Api`              | Login, registro de usuarios, refresh de tokens y almacenamiento de tokens.  |
| `RegistroService`  | Devuelve la definición de los cuatro pasos del registro y su navegación.    |
| `PersonalService`  | Define los campos del formulario de datos personales.                       |
| `CuentaService`    | Define los campos del formulario de cuenta (incluye el patrón de correo).   |
| `DireccionService` | Define los campos del formulario de dirección.                              |
| `ProgresoService`  | Mantiene el paso actual y los pasos completados mediante `BehaviorSubject`. |

`ProgresoService` expone `pasoActual$`, `pasosCompletados$`, `establecerPasoActual()`, `completarPaso()` y `obtenerPasosCompletados()`.

`authInterceptor` se registra globalmente en `app.config.ts` con `provideHttpClient(withInterceptors([authInterceptor]))`.

### Internacionalización

- Se usa `@ngx-translate/core` con `@ngx-translate/http-loader`.
- Los archivos de traducción viven en `public/lenguajes/` y se cargan desde `/lenguajes/<idioma>.json`.
- Idioma por defecto: **español** (`es`), con `es` como idioma de respaldo.
- Para agregar un idioma:
  1. Crea `public/lenguajes/<codigo>.json` con las mismas claves.
  2. Añade un botón que llame a `cambiarIdioma('<codigo>')` en las plantillas.
- Claves disponibles: `TITLE`, `LOGIN`, `EMAIL`, `PASSWORD`, `REMEMBER_ME`, `ACCESS`, `FORGOT_PASSWORD`, `REQUIERED`, `MY_ACCOUNT`, `REGISTER`, `NOTIFICATIONS`, `CHATBOT`, `PRIVACY_NOTICE`, `LOGOUT`, `REG`, `PERSONAL`, `ACCOUNT`, `ADDRESS`, `PICTURE`, `NAME`, `LAST_NAME`, `SL`, `DATEOFBIRTH`, `GENDER`, `NATIONALITY`, `PHONE_NUMBER`, `USER_NAME`, `USER`, `OCCUPATION`, `ROLE`, `ZIP_CODE`, `STATE`, `CITY_TOWN`, `COLOGNE`, `STREET`, `OUTER_NUMBER`, `INSIDE_NUMBER`, `REFERENCE`, `CONTINUE`.
- **Falta** la clave `REGISTRANDO`, usada en `/registro` mientras se envía la solicitud; hasta que se agregue, se mostrará el nombre de la clave.
- El selector de idioma aparece en `/bienvenido`, `/principal` y `/registro`. Los pasos del flujo no lo incluyen, aunque conservan el idioma elegido.
- La clave `REQUIERED` está escrita así (con error ortográfico) en el código y en los JSON; si se renombra, hay que actualizarla en las plantillas.
- Textos aún sin traducir: las alertas y los errores de login/registro, y las indicaciones de `/fotografia`, están escritos directamente en español.

---

## Estado actual y pendientes

Funcionalidad, configuración o cobertura que **todavía falta** o está incompleta:

### Pendientes funcionales

- **Persistencia de cuenta y dirección:** `personal.ts` guarda sus datos en `localStorage`, pero `cuenta.ts` y `direccion.ts` **no** guardan `datosFormularioCuenta` ni `datosFormularioDireccion`. Por eso `POST /api/users` se envía con esos campos vacíos.
- **Cierre de sesión real:** la tarjeta **Cerrar sesión** solo navega a `/bienvenido`; no llama a `Api.limpiarTokens()` ni invalida la sesión.
- **Guards de rutas:** `/principal`, `/registro` y los pasos pueden abrirse sin autenticación.
- **Carga de fotografía:** `/fotografia` solo muestra instrucciones; no hay `<input type="file">`, vista previa ni subida al servidor. El PDF de la práctica lo deja como trabajo futuro.
- **Envío final del registro:** no hay resumen ni confirmación visual más allá de la alerta; además, no se reinicia el progreso y se puede volver a pulsar **Registrar** con los datos ya borrados.
- **Estado del formulario:** al regresar a un paso, los campos no se rellenan con lo que ya se había capturado.
- **Tarjetas del menú principal:** _Mi cuenta_, _Notificaciones_, _ChatBot_ y _Aviso de privacidad_ no tienen acción.
- **Enter en el login:** el formulario no responde al envío con la tecla Enter, limitación detectada en las pruebas de accesibilidad.

### Pendientes de accesibilidad

- Las pruebas de accesibilidad **no ejecutan `cy.checkA11y()`**; solo verifican labels, `alt`, Tab y que el botón sea nativo. Las violaciones detectadas por `axe-core` no se corrigen ni se comprueban automáticamente.
- La navegación por teclado solo se valida hasta el primer campo; no se cubre el resto del formulario.
- Los mensajes de error y las alertas no están anunciados mediante regiones accesibles.

### Pendientes de configuración y despliegue

- **Proxy no configurado por defecto:** hay que recordar `--proxy-config proxy.conf.json`; no está en `angular.json` ni en un script de `package.json`.
- **SSR deshabilitado de hecho:** `outputMode` cambió a `"static"` para Docker, por lo que no se genera `server.mjs` y el script `serve:ssr:primeraAplicacion` queda inservible. Falta eliminarlo, ajustarlo o restaurar un modo SSR real.
- **Reproducibilidad de Docker:** `Dockerfile` y `Dockerfile.test` usan `npm install --legacy-peer-deps` en lugar de `pnpm install --frozen-lockfile`.
- **Pruebas Cypress fuera de Docker/CI:** las imágenes solo ejecutan Vitest; no hay un paso automatizado para E2E ni para accesibilidad.
- **E2E con backend simulado:** `cy.intercept()` evita depender de la API real, pero no valida el contrato real ni el contenido completo del payload.

### Pendientes de traducción y pruebas

- **Traducciones:** falta `REGISTRANDO`; los mensajes de error de login/registro y las indicaciones de fotografía están fijos en español. El selector de idioma no está en los pasos.
- **Cobertura de pruebas:** varios componentes y servicios solo tienen la prueba `should create`; no hay pruebas de comportamiento para cuenta, dirección, fotografía ni para el envío completo del registro.
- **Pruebas de contrato:** solo cubren la respuesta de login; no cubren `POST /api/users` ni `POST /api/users/refresh`.

---

## Scripts disponibles

| Comando                                        | Descripción                                                   |
| ---------------------------------------------- | ------------------------------------------------------------- |
| `pnpm start` / `pnpm ng serve`                 | Inicia el servidor de desarrollo (sin proxy) en el 4200       |
| `pnpm start -- --proxy-config proxy.conf.json` | Inicia el servidor con proxy hacia la API                     |
| `pnpm build`                                   | Compila la aplicación en modo estático                        |
| `pnpm watch`                                   | Compila en modo desarrollo y observa cambios                  |
| `pnpm test`                                    | Ejecuta Vitest en modo watch                                  |
| `pnpm test --watch=false`                      | Ejecuta Vitest una sola vez                                   |
| `pnpm e2e`                                     | Abre Cypress en modo interactivo                              |
| `pnpm cypress:open`                            | Abre la interfaz gráfica de Cypress                           |
| `pnpm cypress:run`                             | Ejecuta Cypress en modo headless                              |
| `pnpm serve:ssr:primeraAplicacion`             | Intenta servir SSR (script obsoleto con `outputMode: static`) |

Generación de componentes con Angular CLI:

```bash
pnpm ng generate component componentes/nombre-componente
```

Para ver todos los esquemas disponibles:

```bash
pnpm ng generate --help
```

---

## Recursos estáticos

Todo lo que se coloque en `public/` se sirve desde la raíz del sitio:

- Iconos: `/iconos/<nombre>.svg`
- Traducciones: `/lenguajes/<idioma>.json`

Esto está configurado en `angular.json` dentro de `projects.primeraAplicacion.architect.build.options.assets`. Actualmente no existe una carpeta `public/imagenes/`; si necesitas imágenes, créala y referencia los archivos como `/imagenes/<archivo>`.

---

## Solución de problemas

- **El login falla o devuelve 404:** inicia con `pnpm start -- --proxy-config proxy.conf.json` y verifica que la API en `http://developer.jquiroz.net:3005` esté disponible.
- **`/api` devuelve HTML de Angular:** no se está usando el proxy. Revisa el comando de arranque o configura el proxy en `angular.json`.
- **No redirige a `/principal` después de iniciar sesión:** revisa la pestaña Network; si `POST /api/users/login` falla, se muestra una alerta con el error y no se navega.
- **El registro envía teléfono, correo, cuenta o dirección vacíos:** es el pendiente conocido de `cuenta.ts` y `direccion.ts`; aún no guardan sus datos en `localStorage`.
- **El botón "Registrar" está deshabilitado:** deben completarse los pasos de personal, cuenta y dirección sin recargar, porque el progreso vive en memoria.
- **Se perdió el progreso del registro:** es el comportamiento esperado; se reinicia al recargar la página.
- **Aparece literalmente "REGISTRANDO...":** falta esa clave en `public/lenguajes/es.json` y `en.json`.
- **Cerrar sesión no elimina la sesión:** la tarjeta solo navega a `/bienvenido`; los tokens siguen en `localStorage`.
- **`pnpm test -- --watch=false` falla con "Unknown option":** usa `pnpm test --watch=false` o `pnpm exec ng test --watch=false`.
- **Las pruebas E2E no conectan con la app:** inicia primero `pnpm start -- --proxy-config proxy.conf.json`; Cypress espera `http://localhost:4200`.
- **La prueba de accesibilidad no reporta violaciones:** `cy.injectAxe()` está, pero no se llama a `cy.checkA11y()`.
- **`pnpm serve:ssr:primeraAplicacion` falla:** con `outputMode: "static"` no existe `dist/primeraAplicacion/server/server.mjs`; usa Docker/Nginx o restaura el modo SSR.
- **Docker no refleja el lockfile:** los Dockerfile usan `npm install`; cámbialo a `pnpm install --frozen-lockfile` si necesitas builds reproducibles.
- **Puerto ocupado:** usa otro puerto, por ejemplo `pnpm start -- --port 4300 --proxy-config proxy.conf.json`, o para Docker `-p 4202:80`.

---

## Recursos adicionales

- [Angular CLI](https://angular.dev/tools/cli)
- [Angular SSR](https://angular.dev/guide/ssr)
- [ngx-translate](https://github.com/ngx-translate/core)
- [Vitest](https://vitest.dev/)
- [Cypress](https://www.cypress.io/)
- [cypress-axe](https://github.com/component-driven/cypress-axe)
- [Docker](https://docs.docker.com/)
- [Nginx](https://nginx.org/en/docs/)
