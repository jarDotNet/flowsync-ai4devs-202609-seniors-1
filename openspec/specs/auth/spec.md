# auth Specification

## Purpose

Cuentas y acceso de FlowSync: registro de personas, inicio y cierre de sesión, consulta del perfil propio y protección de las pantallas que requieren sesión. Describe el comportamiento actual del sistema, tanto de la API como de la interfaz web.

## Requirements

### Requirement: Registro de cuenta por API

El sistema SHALL permitir crear una cuenta mediante una petición `POST /api/v1/auth/signup` con nombre completo (puede ser nulo), email, contraseña y confirmación de contraseña, y SHALL responder con los datos del usuario creado y un token de acceso, dentro de la clave `data`.

#### Scenario: Registro correcto

- **WHEN** se envía un registro con un email no registrado, una contraseña de entre 8 y 32 caracteres y una confirmación idéntica
- **THEN** la respuesta contiene `data.user` con los datos públicos del usuario y `data.token` con un token de acceso utilizable de inmediato

#### Scenario: Registro sin nombre

- **WHEN** se envía un registro válido con el nombre completo a `null`
- **THEN** la cuenta se crea y `data.user.fullName` es `null`

#### Scenario: Email ya registrado

- **WHEN** se envía un registro con un email que ya pertenece a otra cuenta
- **THEN** la respuesta es 422 con un error sobre el campo `email` y no se crea ninguna cuenta ni token

#### Scenario: La confirmación no coincide

- **WHEN** se envía un registro cuya confirmación de contraseña difiere de la contraseña
- **THEN** la respuesta es 422 con un error sobre el campo `passwordConfirmation`

#### Scenario: Contraseña fuera de longitud

- **WHEN** se envía un registro con una contraseña de menos de 8 o de más de 32 caracteres
- **THEN** la respuesta es 422 con un error sobre el campo `password`

#### Scenario: Email con formato inválido o demasiado largo

- **WHEN** se envía un registro con un email que no tiene formato de email o supera los 254 caracteres
- **THEN** la respuesta es 422 con un error sobre el campo `email`

#### Scenario: Faltan campos obligatorios

- **WHEN** se envía un registro sin email, sin contraseña o sin confirmación
- **THEN** la respuesta es 422 con un error de campo requerido por cada campo ausente

### Requirement: Inicio de sesión por API

El sistema SHALL permitir iniciar sesión mediante una petición `POST /api/v1/auth/login` con email y contraseña, y SHALL responder con los datos del usuario y un nuevo token de acceso, dentro de la clave `data`.

#### Scenario: Credenciales correctas

- **WHEN** se envía el email y la contraseña de una cuenta existente
- **THEN** la respuesta contiene `data.user` y un `data.token` nuevo

#### Scenario: Cada inicio de sesión genera un token distinto

- **WHEN** la misma persona inicia sesión dos veces
- **THEN** cada respuesta incluye un token diferente y ambos permiten acceder a la cuenta

#### Scenario: Credenciales incorrectas

- **WHEN** se envía un email inexistente o una contraseña que no corresponde a la cuenta
- **THEN** la respuesta es 400 y no se entrega ningún token

#### Scenario: Petición mal formada

- **WHEN** se envía un email con formato inválido o se omite el email o la contraseña
- **THEN** la respuesta es 422 con un error sobre el campo afectado

### Requirement: Datos públicos del usuario

El sistema SHALL representar a un usuario únicamente con su identificador, nombre completo, email, fecha de creación, fecha de última actualización e iniciales, y SHALL NOT exponer nunca su contraseña.

#### Scenario: Iniciales de un nombre con varias palabras

- **WHEN** un usuario tiene el nombre completo "Ada Lovelace"
- **THEN** sus iniciales son "AL"

#### Scenario: Iniciales sin nombre

- **WHEN** un usuario no tiene nombre completo y su email empieza por "ada"
- **THEN** sus iniciales son las dos primeras letras de la parte local del email, en mayúsculas ("AD")

#### Scenario: La contraseña no se devuelve

- **WHEN** cualquier respuesta incluye datos de un usuario
- **THEN** no aparece ningún campo con la contraseña ni con su versión cifrada

### Requirement: Consulta del perfil propio por API

El sistema SHALL devolver los datos del usuario autenticado mediante una petición `GET /api/v1/account/profile` con la cabecera `Authorization: Bearer <token>`.

#### Scenario: Token válido

- **WHEN** se solicita el perfil con un token vigente
- **THEN** la respuesta es 200 y `data` contiene los datos públicos del usuario dueño del token

#### Scenario: Sin token

- **WHEN** se solicita el perfil sin cabecera de autorización
- **THEN** la respuesta es 401

#### Scenario: Token desconocido o revocado

- **WHEN** se solicita el perfil con un token que no existe o que ya fue invalidado
- **THEN** la respuesta es 401

### Requirement: Cierre de sesión por API

El sistema SHALL invalidar el token usado al recibir una petición autenticada `POST /api/v1/account/logout`, sin afectar a los demás tokens de la misma cuenta.

#### Scenario: Cierre correcto

- **WHEN** se envía el cierre de sesión con un token vigente
- **THEN** la respuesta es 200 con un mensaje de confirmación y ese token deja de ser válido

#### Scenario: El token invalidado ya no sirve

- **WHEN** tras cerrar sesión se usa el mismo token para consultar el perfil
- **THEN** la respuesta es 401

#### Scenario: Otras sesiones siguen activas

- **WHEN** una cuenta tiene dos tokens y se cierra sesión con uno de ellos
- **THEN** el otro token sigue permitiendo consultar el perfil

#### Scenario: Cierre sin sesión

- **WHEN** se envía el cierre de sesión sin token o con un token inválido
- **THEN** la respuesta es 401

### Requirement: Respuestas siempre en JSON

El sistema SHALL responder en formato JSON a todas las peticiones, incluidos los errores, aunque la petición no declare que acepta JSON.

#### Scenario: Error sin cabecera Accept

- **WHEN** se solicita el perfil sin token y sin cabecera `Accept`
- **THEN** la respuesta de error 401 es JSON y no una redirección ni una página HTML

### Requirement: Pantalla de inicio de sesión

La interfaz SHALL ofrecer una pantalla "Inicia sesión" con los campos Email y Contraseña, un botón "Entrar" y un enlace "Crea una" hacia el registro.

#### Scenario: Inicio de sesión correcto

- **WHEN** la persona introduce credenciales válidas y pulsa "Entrar"
- **THEN** el botón muestra "Entrando…" y deshabilitado mientras dura el envío, y después la persona llega a su perfil con la sesión iniciada

#### Scenario: Credenciales incorrectas

- **WHEN** la persona envía un email o contraseña que no corresponden a ninguna cuenta
- **THEN** ve el aviso "El email o la contraseña no son correctos." y permanece en la pantalla con el botón de nuevo habilitado

#### Scenario: Error de validación en un campo

- **WHEN** el servidor rechaza un campo concreto, como un email con formato inválido
- **THEN** el mensaje en castellano aparece bajo ese campo, no como aviso general

#### Scenario: Navegar al registro

- **WHEN** la persona pulsa "Crea una"
- **THEN** pasa a la pantalla de registro

### Requirement: Pantalla de registro

La interfaz SHALL ofrecer una pantalla "Crea tu cuenta" con los campos Nombre completo (opcional), Email, Contraseña con la indicación "Entre 8 y 32 caracteres" y Repite la contraseña, un botón "Crear cuenta" y un enlace "Inicia sesión" hacia el acceso.

#### Scenario: Registro correcto

- **WHEN** la persona completa los campos obligatorios con datos válidos y pulsa "Crear cuenta"
- **THEN** el botón muestra "Creando cuenta…" deshabilitado mientras dura el envío, y después la persona queda con la sesión iniciada y llega a su perfil

#### Scenario: Registro sin nombre

- **WHEN** la persona deja el nombre vacío o solo con espacios y envía un registro válido
- **THEN** la cuenta se crea sin nombre

#### Scenario: Las contraseñas no coinciden

- **WHEN** la persona escribe contraseñas distintas y pulsa "Crear cuenta"
- **THEN** ve "Las contraseñas no coinciden." bajo el campo de repetición, sin que se envíe nada al servidor

#### Scenario: Email ya registrado

- **WHEN** el email introducido ya pertenece a una cuenta
- **THEN** ve "Ese email ya está registrado. Inicia sesión en su lugar." bajo el campo Email

#### Scenario: Errores de contraseña y email traducidos

- **WHEN** el servidor rechaza la contraseña por longitud, o el email por formato
- **THEN** ve bajo el campo un mensaje en castellano que indica el límite incumplido ("al menos 8 caracteres", "no puede superar los 32 caracteres") o "Introduce una dirección de email válida."

#### Scenario: Navegar al acceso

- **WHEN** la persona pulsa "Inicia sesión"
- **THEN** pasa a la pantalla de inicio de sesión

### Requirement: Mensajes de error comprensibles

La interfaz SHALL mostrar los errores de acceso en castellano, y SHALL NOT mostrar mensajes técnicos del servidor.

#### Scenario: Servidor inaccesible

- **WHEN** la persona envía un formulario de acceso y el servidor no responde
- **THEN** ve "No se pudo conectar con el servidor. Comprueba que el backend está arrancado."

#### Scenario: Error interno del servidor

- **WHEN** el servidor responde con un error interno
- **THEN** ve "Algo ha ido mal en el servidor. Inténtalo de nuevo en un momento."

#### Scenario: Error de validación sobre un campo que no se muestra

- **WHEN** el servidor rechaza un campo que la pantalla actual no pinta
- **THEN** el mensaje se muestra como aviso general en la parte superior del formulario

### Requirement: Pantalla de perfil

La interfaz SHALL mostrar a la persona con sesión iniciada su perfil: sus iniciales, su nombre completo (o "Sin nombre" si no tiene), su email, la fecha "Miembro desde" en formato de fecha larga en castellano y un botón "Cerrar sesión".

#### Scenario: Perfil con nombre

- **WHEN** una persona con nombre "Ada Lovelace" abre su perfil
- **THEN** ve las iniciales "AL", el nombre "Ada Lovelace", su email y la fecha de alta, por ejemplo "3 de octubre de 2026"

#### Scenario: Perfil sin nombre

- **WHEN** una persona sin nombre abre su perfil
- **THEN** ve "Sin nombre" como título

### Requirement: Cierre de sesión desde la interfaz

La interfaz SHALL permitir cerrar la sesión con el botón "Cerrar sesión", y la sesión SHALL quedar cerrada para la persona aunque el servidor no pueda confirmarlo.

#### Scenario: Cierre correcto

- **WHEN** la persona pulsa "Cerrar sesión"
- **THEN** el botón muestra "Cerrando sesión…" deshabilitado y la persona llega a la pantalla de inicio de sesión

#### Scenario: Servidor caído al cerrar sesión

- **WHEN** la persona pulsa "Cerrar sesión" y el servidor falla o no responde
- **THEN** igualmente llega a la pantalla de inicio de sesión sin ver ningún error

#### Scenario: La sesión cerrada no se recupera

- **WHEN** tras cerrar sesión la persona recarga la página
- **THEN** sigue sin sesión y se le muestra el inicio de sesión

### Requirement: Protección de pantallas según la sesión

La interfaz SHALL restringir el perfil a personas con sesión iniciada, y SHALL restringir el inicio de sesión y el registro a personas sin sesión.

#### Scenario: Perfil sin sesión

- **WHEN** una persona sin sesión intenta abrir el perfil
- **THEN** es llevada a la pantalla de inicio de sesión

#### Scenario: Acceso o registro con sesión

- **WHEN** una persona con sesión intenta abrir el inicio de sesión o el registro
- **THEN** es llevada a su perfil

#### Scenario: Dirección desconocida

- **WHEN** cualquier persona abre una dirección que no existe
- **THEN** es llevada al perfil y, si no tiene sesión, de ahí al inicio de sesión

#### Scenario: Comprobando una sesión guardada

- **WHEN** la persona abre la aplicación con una sesión guardada y aún se está comprobando con el servidor
- **THEN** ve un indicador de carga a pantalla completa y no es redirigida hasta conocer el resultado

### Requirement: Persistencia de la sesión entre visitas

La interfaz SHALL mantener la sesión de la persona al recargar la página o volver más tarde, mientras el servidor siga aceptando su sesión.

#### Scenario: Recarga con sesión vigente

- **WHEN** una persona con sesión iniciada recarga la página
- **THEN** sigue con la sesión iniciada y permanece en el perfil sin pasar por el inicio de sesión

#### Scenario: Sesión rechazada por el servidor

- **WHEN** la persona abre la aplicación con una sesión que el servidor ya no reconoce
- **THEN** llega al inicio de sesión con el aviso "Tu sesión ha caducado. Vuelve a iniciar sesión." y la sesión guardada se descarta

#### Scenario: Servidor caído al restaurar la sesión

- **WHEN** la persona abre la aplicación con una sesión guardada y el servidor no responde
- **THEN** llega al inicio de sesión con un aviso que explica el fallo, y al recargar con el servidor de nuevo disponible recupera su sesión

#### Scenario: El aviso desaparece al entrar

- **WHEN** la persona, tras ver un aviso de sesión perdida, inicia sesión correctamente
- **THEN** el aviso deja de mostrarse
