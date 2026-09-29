# Spec: registro-de-cuentas

## Purpose
Permite que una persona sin cuenta cree una en FlowSync con su email y una contraseña, y entre en la aplicación sin tener que iniciar sesión a continuación.

## Requirements

### Requirement: Alta de cuenta vía API
El sistema SHALL aceptar `POST /api/v1/auth/signup` con un cuerpo JSON que contenga `fullName`, `email`, `password` y `passwordConfirmation`. Si el alta sale bien, SHALL crear la cuenta y responder con `{ data: { user, token } }`, donde `user` trae `id`, `fullName`, `email`, `createdAt`, `updatedAt` e `initials`, y `token` es un token de acceso ya válido.

#### Scenario: Alta correcta
- **WHEN** no existe ninguna cuenta con el email `ada@example.com` y se envía un signup con ese email, `fullName: "Ada Lovelace"` y una contraseña de 8 a 32 caracteres que coincide con la confirmación
- **THEN** la respuesta es un 200 con `data.user.email = "ada@example.com"`, `data.user.fullName = "Ada Lovelace"`, `data.user.initials = "AL"` y un `data.token` que ya sirve para autenticar peticiones

#### Scenario: La respuesta no expone la contraseña
- **WHEN** un signup termina bien
- **THEN** `data.user` MUST NOT incluir la contraseña ni ningún derivado de ella

### Requirement: El nombre completo es opcional pero hay que enviar el campo
El sistema SHALL aceptar `fullName: null` como alta válida. El campo `fullName` MUST aparecer en el cuerpo: si falta, la petición se rechaza.

#### Scenario: Alta sin nombre
- **WHEN** se envía un signup válido con `fullName: null`
- **THEN** la cuenta se crea, `data.user.fullName` es `null` y `data.user.initials` se calcula a partir del email

#### Scenario: Falta el campo del nombre
- **WHEN** se envía un signup sin la clave `fullName`
- **THEN** la respuesta es un 422 con un error de regla `required` sobre el campo `fullName`

### Requirement: Validación de los datos de alta
El sistema MUST rechazar el alta con un 422 y un cuerpo `{ errors: [...] }`, en el que cada error indica `field`, `rule` y `message`, si se cumple cualquiera de estas condiciones: el email no tiene formato válido o pasa de 254 caracteres; la contraseña tiene menos de 8 o más de 32 caracteres; la confirmación no coincide con la contraseña; o falta algún campo obligatorio. Si el alta se rechaza, el sistema MUST NOT crear la cuenta.

#### Scenario: Email con formato inválido
- **WHEN** se envía un signup con `email: "no-es-un-email"`
- **THEN** la respuesta es un 422 con un error de regla `email` sobre el campo `email` y no se crea ninguna cuenta

#### Scenario: Contraseña demasiado corta
- **WHEN** se envía un signup con una contraseña de 7 caracteres
- **THEN** la respuesta es un 422 con un error de regla `minLength` sobre `password`

#### Scenario: Contraseña demasiado larga
- **WHEN** se envía un signup con una contraseña de 33 caracteres
- **THEN** la respuesta es un 422 con un error de regla `maxLength` sobre `password`

#### Scenario: La confirmación no coincide
- **WHEN** se envía un signup en el que `passwordConfirmation` es distinta de `password`
- **THEN** la respuesta es un 422 con un error de regla `sameAs` sobre `passwordConfirmation`

### Requirement: Email único
El sistema MUST NOT permitir dos cuentas con el mismo email.

#### Scenario: Email ya registrado
- **WHEN** ya existe una cuenta con `ada@example.com` y se envía un signup con ese mismo email
- **THEN** la respuesta es un 422 con un error de regla `database.unique` sobre `email`, y la cuenta que ya existía no cambia

### Requirement: Iniciales de la cuenta
El sistema SHALL devolver en `initials` las iniciales de la cuenta, en mayúsculas. Si el nombre tiene al menos dos palabras, SHALL usar la primera letra de las dos primeras. Si tiene una sola palabra, SHALL usar sus dos primeras letras. Si no hay nombre, SHALL usar la primera letra de la parte local del email y la primera del dominio.

#### Scenario: Nombre de una sola palabra
- **WHEN** se crea una cuenta con `fullName: "ada"`
- **THEN** `initials` es `"AD"`

#### Scenario: Sin nombre
- **WHEN** se crea una cuenta con `fullName: null` y `email: "ada@example.com"`
- **THEN** `initials` es `"AE"`

### Requirement: Pantalla de registro
El sistema SHALL ofrecer una pantalla "Crea tu cuenta" con cuatro campos: "Nombre completo (opcional)", "Email", "Contraseña" (con la ayuda "Entre 8 y 32 caracteres.") y "Repite la contraseña". También SHALL mostrar un botón "Crear cuenta" y un enlace a la pantalla de inicio de sesión.

#### Scenario: Registro correcto desde la pantalla
- **WHEN** una persona sin sesión rellena el formulario con datos válidos y pulsa "Crear cuenta"
- **THEN** queda con la sesión iniciada y llega a su perfil sin pasar por el inicio de sesión

#### Scenario: Nombre vacío o solo con espacios
- **WHEN** una persona deja el nombre vacío, o solo con espacios, y completa el resto del registro
- **THEN** la cuenta se crea sin nombre

#### Scenario: Las contraseñas no coinciden en pantalla
- **WHEN** la persona escribe dos contraseñas distintas y pulsa "Crear cuenta"
- **THEN** aparece "Las contraseñas no coinciden." bajo "Repite la contraseña" y no se envía ninguna petición al servidor

#### Scenario: Email ya registrado en pantalla
- **WHEN** la persona intenta registrarse con un email que ya tiene cuenta
- **THEN** aparece "Ese email ya está registrado. Inicia sesión en su lugar." bajo el campo Email

#### Scenario: Errores de validación en castellano
- **WHEN** el servidor rechaza el registro por la validación de uno o más campos
- **THEN** cada campo afectado muestra debajo su mensaje en castellano (por ejemplo, "la contraseña debe tener al menos 8 caracteres.") y los datos escritos se conservan

#### Scenario: Envío en curso
- **WHEN** la persona pulsa "Crear cuenta" y el servidor todavía no ha respondido
- **THEN** el botón muestra "Creando cuenta…" y no se puede volver a pulsar

---

# Spec: inicio-y-cierre-de-sesion

## Purpose
Permite que una persona con cuenta se identifique con email y contraseña para recibir una sesión, consulte los datos de su cuenta y cierre la sesión cuando termine.

## Requirements

### Requirement: Inicio de sesión vía API
El sistema SHALL aceptar `POST /api/v1/auth/login` con `email` y `password`. Si las credenciales son correctas, SHALL emitir un token de acceso nuevo y responder con `{ data: { user, token } }`, con la misma forma que el alta.

#### Scenario: Credenciales correctas
- **WHEN** existe una cuenta con `ada@example.com` y se envía un login con ese email y su contraseña
- **THEN** la respuesta es un 200 con los datos de la cuenta en `data.user` y un `data.token` nuevo

#### Scenario: Cada inicio de sesión emite un token distinto
- **WHEN** la misma cuenta inicia sesión dos veces
- **THEN** recibe dos tokens distintos, y ambos siguen siendo válidos a la vez

### Requirement: Rechazo de credenciales incorrectas
El sistema MUST rechazar con un 400 cualquier login cuyo email no pertenezca a ninguna cuenta o cuya contraseña no sea la de la cuenta. La respuesta MUST NOT distinguir entre esos dos casos.

#### Scenario: Contraseña incorrecta
- **WHEN** existe la cuenta `ada@example.com` y se envía un login con una contraseña equivocada
- **THEN** la respuesta es un 400 y no se emite ningún token

#### Scenario: Email desconocido
- **WHEN** se envía un login con un email que no tiene cuenta
- **THEN** la respuesta es un 400, igual que con una contraseña incorrecta

### Requirement: Validación de los datos de login
El sistema MUST rechazar con un 422 los logins en los que falte el email o la contraseña, o en los que el email no tenga formato válido o pase de 254 caracteres. En el login, la contraseña no tiene restricción de longitud.

#### Scenario: Email mal formado en el login
- **WHEN** se envía un login con `email: "ada"`
- **THEN** la respuesta es un 422 con un error de regla `email` sobre `email`

### Requirement: Consulta de la cuenta con sesión
El sistema SHALL responder a `GET /api/v1/account/profile`, cuando lleva un `Authorization: Bearer <token>` válido, con `{ data: { id, fullName, email, createdAt, updatedAt, initials } }` de la cuenta dueña del token.

#### Scenario: Perfil con token válido
- **WHEN** se pide el perfil con el token que devolvió un login de `ada@example.com`
- **THEN** la respuesta es un 200 con los datos de esa cuenta

### Requirement: Cierre de sesión vía API
El sistema SHALL aceptar `POST /api/v1/account/logout` con un token válido. SHALL invalidar solo ese token y responder `{ message: "Logged out successfully" }`, sin el envoltorio `data`. Los demás tokens de la misma cuenta MUST seguir siendo válidos.

#### Scenario: Logout invalida el token usado
- **WHEN** se hace logout con un token válido y después se pide el perfil con ese mismo token
- **THEN** el logout responde 200 y la petición del perfil responde 401

#### Scenario: Logout no afecta a otras sesiones
- **WHEN** una cuenta tiene dos tokens y cierra sesión con uno de ellos
- **THEN** el otro token sigue sirviendo para pedir el perfil

### Requirement: Pantalla de inicio de sesión
El sistema SHALL ofrecer una pantalla "Inicia sesión" con los campos "Email" y "Contraseña", un botón "Entrar" y un enlace "Crea una" hacia el registro.

#### Scenario: Inicio de sesión correcto desde la pantalla
- **WHEN** una persona sin sesión escribe credenciales correctas y pulsa "Entrar"
- **THEN** queda con la sesión iniciada y llega a su perfil

#### Scenario: Credenciales incorrectas en pantalla
- **WHEN** la persona escribe un email o una contraseña que no son correctos y pulsa "Entrar"
- **THEN** aparece un aviso general con "El email o la contraseña no son correctos." y sigue en la pantalla de inicio de sesión

#### Scenario: Servidor inalcanzable
- **WHEN** la persona pulsa "Entrar" y el servidor no responde
- **THEN** aparece el aviso "No se pudo conectar con el servidor. Comprueba que el backend está arrancado."

#### Scenario: Envío en curso
- **WHEN** la persona pulsa "Entrar" y el servidor todavía no ha respondido
- **THEN** el botón muestra "Entrando…" y no se puede volver a pulsar

### Requirement: Pantalla de perfil
El sistema SHALL mostrar a la persona con sesión sus iniciales, su nombre completo (o "Sin nombre" si no tiene), su email y "Miembro desde" con la fecha de alta en formato largo en castellano. También SHALL mostrar un botón "Cerrar sesión".

#### Scenario: Perfil sin nombre
- **WHEN** una persona que se registró sin nombre entra en su perfil
- **THEN** ve "Sin nombre" como título, las iniciales calculadas a partir de su email y su email debajo

### Requirement: Cierre de sesión desde la pantalla
Cuando la persona pulse "Cerrar sesión", el sistema SHALL terminar la sesión en ese navegador y llevarla a la pantalla de inicio de sesión. La sesión MUST cerrarse en el navegador aunque el servidor no confirme el logout.

#### Scenario: Cerrar sesión
- **WHEN** una persona con sesión pulsa "Cerrar sesión" en su perfil
- **THEN** el botón muestra "Cerrando sesión…", la persona acaba en la pantalla de inicio de sesión sin ningún aviso de error, y al recargar no vuelve a tener sesión

#### Scenario: Servidor caído al cerrar sesión
- **WHEN** una persona pulsa "Cerrar sesión" y el servidor no está disponible
- **THEN** la persona queda igualmente sin sesión en ese navegador y llega a la pantalla de inicio de sesión

---

# Spec: persistencia-de-sesion

## Purpose
Mantiene la sesión entre recargas y reaperturas del navegador, y comprueba contra el servidor que sigue siendo válida antes de darla por buena.

## Requirements

### Requirement: La sesión sobrevive a recargas
Cuando una persona inicie sesión o se registre, el sistema SHALL guardar su sesión en el navegador y restaurarla automáticamente al recargar o volver a abrir la aplicación.

#### Scenario: Recarga con sesión
- **WHEN** una persona con sesión recarga la página de su perfil
- **THEN** sigue en su perfil con sus datos, sin tener que volver a iniciar sesión

### Requirement: Comprobación de la sesión al arrancar
Al arrancar con una sesión guardada, el sistema SHALL comprobarla contra el servidor y mostrar un indicador de carga mientras lo hace. Hasta tener la respuesta, MUST NOT mostrar contenido protegido ni redirigir a la persona.

#### Scenario: Arranque con sesión guardada
- **WHEN** la aplicación se abre con una sesión guardada y el servidor todavía no ha respondido
- **THEN** se ve un indicador de carga en lugar de cualquier pantalla

### Requirement: Sesión rechazada por el servidor
Si el servidor responde con un 401 a la sesión guardada, el sistema SHALL descartarla del todo, llevar a la persona a la pantalla de inicio de sesión y mostrarle "Tu sesión ha caducado. Vuelve a iniciar sesión.".

#### Scenario: Token invalidado en otro sitio
- **WHEN** la sesión guardada corresponde a un token que ya se ha invalidado y la persona recarga la aplicación
- **THEN** acaba en la pantalla de inicio de sesión con el aviso "Tu sesión ha caducado. Vuelve a iniciar sesión.", y al recargar otra vez sigue sin sesión

### Requirement: Fallo pasajero al restaurar la sesión
Si la sesión guardada no se puede comprobar porque el servidor no responde o devuelve un error que no es un 401, el sistema SHALL tratar a la persona como si no tuviera sesión y mostrarle el motivo en la pantalla de inicio de sesión. La sesión guardada MUST NOT borrarse, para que se restaure en cuanto el servidor vuelva a responder.

#### Scenario: Servidor caído al recargar
- **WHEN** una persona con sesión guardada recarga la aplicación mientras el servidor no responde
- **THEN** llega a la pantalla de inicio de sesión con el aviso "No se pudo conectar con el servidor. Comprueba que el backend está arrancado."

#### Scenario: Recuperación tras el corte
- **WHEN** después de ese corte el servidor vuelve a responder y la persona recarga
- **THEN** su sesión se restaura y llega a su perfil sin volver a iniciar sesión

### Requirement: Los tokens no caducan solos
Un token de acceso SHALL seguir siendo válido hasta que se cierre la sesión con él. El sistema no le pone fecha de caducidad.

#### Scenario: Token antiguo
- **WHEN** se usa un token emitido hace tiempo con el que nunca se ha cerrado sesión
- **THEN** el servidor lo acepta

---

# Spec: proteccion-de-acceso

## Purpose
Garantiza que solo las personas con sesión válida acceden a los datos y pantallas de su cuenta, y que quien ya tiene sesión no vuelve a pasar por el acceso.

## Requirements

### Requirement: Endpoints de cuenta protegidos
El sistema MUST rechazar con un 401 cualquier petición a `GET /api/v1/account/profile` o `POST /api/v1/account/logout` que no lleve un `Authorization: Bearer` con un token válido.

#### Scenario: Sin token
- **WHEN** se pide el perfil sin cabecera `Authorization`
- **THEN** la respuesta es un 401 y no incluye datos de ninguna cuenta

#### Scenario: Token inventado o ya invalidado
- **WHEN** se pide el perfil con un token que el sistema no emitió o que ya se invalidó con un logout
- **THEN** la respuesta es un 401

### Requirement: Endpoints de acceso públicos
El sistema SHALL aceptar peticiones a `POST /api/v1/auth/signup` y `POST /api/v1/auth/login` sin autenticación.

#### Scenario: Login sin token
- **WHEN** se envía un login sin cabecera `Authorization`
- **THEN** la petición se procesa con normalidad

### Requirement: Respuestas siempre en JSON
La API SHALL responder en JSON a todas las peticiones, también a los errores, sea cual sea la cabecera `Accept` que envíe el cliente.

#### Scenario: Cliente que pide HTML
- **WHEN** se pide el perfil sin token con `Accept: text/html`
- **THEN** la respuesta es un 401 con el cuerpo en JSON

### Requirement: Pantallas protegidas
El sistema MUST NOT mostrar el perfil a una persona sin sesión. Si alguien sin sesión intenta entrar en una pantalla protegida, SHALL redirigirlo a la pantalla de inicio de sesión.

#### Scenario: Acceso directo al perfil sin sesión
- **WHEN** una persona sin sesión abre la dirección `/profile`
- **THEN** acaba en la pantalla de inicio de sesión

### Requirement: Pantallas de acceso solo sin sesión
Si una persona con sesión intenta abrir la pantalla de inicio de sesión o la de registro, el sistema SHALL redirigirla a su perfil.

#### Scenario: Con sesión abre el login
- **WHEN** una persona con sesión abre la dirección `/login` o `/register`
- **THEN** acaba en su perfil

### Requirement: Direcciones desconocidas
El sistema SHALL redirigir cualquier dirección que no exista hacia el perfil, que a su vez aplica la protección de acceso.

#### Scenario: Dirección desconocida sin sesión
- **WHEN** una persona sin sesión abre `/cualquier-cosa`
- **THEN** acaba en la pantalla de inicio de sesión

#### Scenario: Dirección desconocida con sesión
- **WHEN** una persona con sesión abre `/cualquier-cosa`
- **THEN** acaba en su perfil

---

# B. Las tres listas

## 1. Requisitos escritos y comprobados

- Requisitos escritos por el agente: **25**
- Requisitos comprobados abriendo el código: **3**
  -  Alta de cuenta vía API
  -  El nombre completo es opcional pero hay que enviar el campo
  - Validación de los datos de alta
  

## 2. Incoherencias que aparecieron al escribirla

- En el prompt inicial se indicó esta regla: ´Solo comportamiento observable desde fuera. Ni un nombre de clase, ni un nombre de archivo, ni una ruta de código.´. Pero en las specs generadas se incluye nombres como ´fullName´ o ´database.unique´, y rutas de API.
- En el alta: la spec indica un 200 al responder porque es lo que indica el código, pero realmente debería ser un 201.
- Hay un escenario para evitar crear una cuenta con un email ya registrado. Pero el valor del email no se normaliza, y es posible crear cuentas distintar para ´Ada@example.com´ y ´ada@example.com´.
- En el caso de las Iniciales: la spec dice que se usa la inicial de cada palabra. La API no recorta el nombre, así que "Ada  Lovelace" (doble espacio) da "AD" y " " da una cadena vacía.
-  Tipo del nombre: el requisito "Validación de los datos de alta" lista las causas de rechazo y no incluye un ´fullName´ que no sea texto. Si el cuerpo trae ´fullName: 5´ (número, no texto), la API responde 422 con la regla ´string´, y la spec no lo recoge. Desde la pantalla no se puede reproducir, porque siempre envía texto. Igualmente, un nombre como 5 se acepta sin ninguna restricción de contenido. La spec habla de "nombre de una o varias palabras" al describir las iniciales, pero nada obliga a que sea un nombre. Y de hecho, es posible crear una nueva cuenta en ese caso.
- Nombre vacío: con ´fullName: ""´ la validación pasa y la cuenta se guarda con nombre vacío. El requisito "El nombre completo es opcional" solo habla de ´null´ y de omitir el campo. Además, la pantalla de perfil muestra "Sin nombre" solo cuando el nombre es ´null´.


## 3. Lo que no supe decidir si era un bug o el contrato

- El formato del email no distingue entre mayúsculas y minúsculas, por lo que es posible crear dos cuentas con un email idéntico, como por ejemplo ´ADA@example.com´ y ´ada@example.com´. Esto debería considerarse un bug.
- Con ´fullname´ "" no sé muy bien qué pasa. Porque la pantalla lo indica como opcional y es posible crear cuentas con este campo vacío, pero desde el front se convierte en `null`. No queda claro si deberían considerarse como un nombre válido o si realmente tendrían que ser valores iguales, ambos como `null`.
- La contraseña permite espacios en blanco, y una contraseña con 8 carácteres en blanco se considera válida al crear una nueva cuenta. No creo que se haya considerado este caso, ni que sea un requerimiento que pueda considerarse válido. 

