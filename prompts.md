# Prompts

Aquí van **todos los prompts que lanzaste** para hacer el ejercicio, en el orden en que los
lanzaste, con el modelo y la herramienta de cada uno.

Esto no es papeleo. Lo que se revisa es **cómo pediste las cosas**, no solo lo que salió: un
resultado flojo con un prompt bueno y un resultado flojo con un prompt vago necesitan feedback
distinto, y sin este archivo no se distinguen.

## Cómo rellenarlo

- Un apartado `## Prompt N` por cada prompt.
- **Pega el prompt tal cual lo lanzaste**, dentro del bloque de código, aunque ocupe diez líneas
  y aunque tenga faltas. No lo reescribas para que quede bien: el que arreglaste mentalmente
  después no es el que lanzaste.
- Incluye también los que **no funcionaron**. Suelen ser los más útiles de leer.
- `Modelo` y `Herramienta` en todos. Si cambiaste de una a otra a mitad, se nota aquí.

Borra el ejemplo de abajo cuando escribas el primero.

---

## Prompt 1

**Modelo:** Opus 5.5 (medium)
**Herramienta:** Claude Code

```
El código actual en el repositorio, ya implementa de punta a punta la épica de Cuentas y acceso, tanto de backend como de frontend. Esto incluye registro de usuarios, inicio y cierre de sesión, persistencia de la sesión y protección de acceso sin sesión iniciada. No incluyas nada de las épicas Gestión de tareas y Actividad del equipo.

Revisa en el backend: rutas, controladores, modelos, validaciones y middlewares.
Revisa en el frontend: pantallas de acceso, estado de la sesión y protección de rutas.

Con esta información, lista las specs de lo que el sistema hace hoy siguiendo el siguiente formato:

- Arriba, un ## Purpose de una o dos frases: para qué existe esta capability.

- Debajo, ## Requirements, y colgando de él ### Requirement: en los que el sistema SHALL hacer algo.

- Bajo cada requisito, al menos un #### Scenario: de cuatro almohadillas, con dos viñetas: **WHEN** y **THEN**. No hay casilla para el GIVEN: la precondición se mete dentro del WHEN.

- Usa RFC-2119 y el estándar del IETF (BCP 14). Usa MUST / SHALL, SHOULD, MAY o MUST NOT en mayúsculas y inglés.

- Todo en castellano, salvo las mayúsculas de la RFC.

Debes aplicar SIEMPRE las siguientes 3 reglas:

1. Nada de ADDED, MODIFIED ni REMOVED. Eso es el vocabulario de un delta, y esto no es un delta: es la verdad actual del sistema.

2. Solo comportamiento observable desde fuera. Ni un nombre de clase, ni un nombre de archivo, ni una ruta de código. En la API, observable es la petición y la respuesta. En la pantalla, observable es lo que una persona ve y puede hacer.

3. No toques el código. Ni siquiera para arreglar lo que encuentres.
```

**Qué salió:** el agente exploró el backend y el frontend y gemero las specs agrupadas por Registro de cuentas, Inicio y cierre de sesión, Persistencia de sesión y Protección de acceso. Además, identificó tres rarezas.

(opcional, una línea) funcionó a la primera / tuve que insistir / me inventó una ruta que no existe.

## Prompt 2

**Modelo:** Sonnet 5.5 (medium)
**Herramienta:** Claude Code

```
Guarda el listado de specs en el archivo docs/spec-viva/jar.md, bajo el título # Spec viva: cuentas y acceso. A continuación, añade el apartado B del README con el título de los 3 puntos a completar. En el primer punto, indica cuántos requisitos escribiste.

```

**Qué salió:** el agente creó el archivo con las specs y el punto B solicitado, pero ejecuto el ´/commit´ y preparó la PR porque lo leyó en el README.

## Prompt 3

**Modelo:** Sonnet 5.5 (medium)
**Herramienta:** Claude Code

```
Elimina # Spec viva: cuentas y acceso del título. No prepares ninguna PR si nodifiques nada más

```

**Qué salió:** Eliminó el título de la parte A del documento que yo le indiqué, ya que al generar las specs ya venia incluido un título para cada tipo de Spec generada.
