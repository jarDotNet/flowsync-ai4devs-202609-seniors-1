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

**Modelo:** Sonnet 5.5 (medium)
**Herramienta:** Claude Code

```
Lee los escenarios del requisito «Lo que cada tarea muestra de su responsable» de la spec que está en openspec/specs/tasks/spec.md. Genera los tests en backend/tests/functional/tasks/, siguiendo el estilo de los que ya hay en backend/tests/functional/auth/. No toques nada fuera de backend/tests/. No abras PR aún.
```

**Qué salió:** escribió 7 tests para los 3 escenarios del requisito, y ejecutó los tests: Salen 5 tests en verde y 2 en rojo.

## Prompt 2

**Modelo:** Sonnet 5.5 (medium)
**Herramienta:** Claude Code

```
Ahora lee de nuevo los scenarios del requisito «Lo que cada tarea muestra de su responsable» y los tests generados en backend/tests/functional/tasks/assignee.spec.ts y genera una tabla de trazabilidad en docs/verificacion/jar.md. La matriz debe mapear, scenario a scenario, si el requisito está cubierto por los tests.
El formato DEBE ser el siguiente:
1. Encima, dos números: cuántos scenarios tiene el requisito y cuántos resultaron cubiertos.
2. A continuación, una tabla con una fila por scenario y cuatro columnas.
Las columnas son las siguientes:
- Columna 1: Scenario, en una línea. Qué se espera y en qué situación.
- Columna 2: Test que lo cubre, con el nombre exacto que aparece en la suite. Sin el nombre concreto, la columna va vacía.
- Columna 3: Estado, Cubierto · No cubierto.
- Columna 4: Qué test faltó, de momento vacía.

No cambies nada fuera de este fichero, ni generes PR aún.
```

**Qué salió:** creó la matriz, indicando: 3 scenarios, 3 cubiertos. Remarcando que hay 2 tests en rojo y que «Cubierto» significa que hay un test que verifica el scenario, no que pase.

## Prompt 3

**Modelo:** Sonnet 5.5 (medium)
**Herramienta:** Claude Code

```
 De los tests generados en backend/tests/functional/tasks/assignee.spec.ts, crees que hay alguno que falta para cubrir los 3 escenarios del requerimiento «Lo que cada tarea muestra de su responsable» ? No generes nada, solo ofrece una respuesta
```

**Qué salió:** sugirió añadir un test adicional al scenario 2: «La tarea no filtra datos de cuenta», para cubrir los casos de `PATCH`y `PUT`sobre `/tasks/:id/status`.

## Prompt 4

**Modelo:** Sonnet 5.5 (medium)
**Herramienta:** Claude Code

```
Genera los 2 tests sugeridos y añádelos a backend/tests/functional/tasks/assignee.spec.ts.
No toques nada más ni crees la PR aún.
```

**Qué salió:** generó 2 nuevos tests. De los cuales, uno falla y el otro pasa.
