# Mariz de trazabilidad

**Scenarios del requisito:** 3
**Scenarios cubiertos:** 3

| Scenario | Test que lo cubre | Estado | Qué test faltó |
|---|---|---|---|
| Responsable identificable: al obtener una tarea cuyo responsable es "Ada Lovelace", su `assignee` trae el nombre y las iniciales. | `Tasks \| responsable / el responsable trae su nombre y sus iniciales`<br>`Tasks \| responsable / en la lista, el responsable también trae su nombre y sus iniciales` | ✅ Cubierto | |
| La tarea no filtra datos de cuenta: en cualquier tarea, suelta o dentro de la lista, el `assignee` no incluye el email ni otro dato de acceso. | `Tasks \| responsable / la tarea suelta no filtra el email ni más datos de la cuenta`<br>`Tasks \| responsable / la lista no filtra el email ni más datos de la cuenta`<br>`Tasks \| responsable / la tarea recién creada no filtra el email ni más datos de la cuenta` | ✅ Cubierto | |
| Responsable sin nombre: si la cuenta se registró sin nombre, su nombre llega nulo y sus iniciales siguen llegando. | `Tasks \| responsable / un responsable sin nombre llega con nombre nulo e iniciales`<br>`Tasks \| responsable / en la lista, un responsable sin nombre llega con nombre nulo e iniciales` | ✅ Cubierto | |

## Test generados

Inicialmente, se generaron 7 tests en total en `backend/tests/functional/tasks/assignee.spec.ts`:

- `el responsable trae su nombre y sus iniciales`: 🟢 verde
- `en la lista, el responsable también trae su nombre y sus iniciales`: 🟢 verde
- `la tarea suelta no filtra el email ni más datos de la cuenta`: 🟢 verde
- `la lista no filtra el email ni más datos de la cuenta`: 🔴 rojo
- `la tarea recién creada no filtra el email ni más datos de la cuenta`: 🔴 rojo
- `un responsable sin nombre llega con nombre nulo e iniciales`: 🟢 verde
- `en la lista, un responsable sin nombre llega con nombre nulo e iniciales`: 🟢 verde

Posteriormente, se añadieron 2 tests más para completar el scenario 2:

- `la tarea tras cambiar su estado no filtra el email ni más datos de la cuenta`: 🔴 rojo
- `la tarea tras cambiar su fecha no filtra el email ni más datos de la cuenta`: 🟢 verde

## Parte B

1. **Cuántos scenarios creías cubiertos antes de mirar, y cuántos lo estaban**

    Antes de mirar: 3 de 3. Y al terminar: 3 de 3.

    La respuesta del segundo prompt ya indicó que todos los scenarios estaban cubiertos en los 7 tests generados. Y después de revisar los tests, soy de la misma opinión. Creo que los 7 tests cubren lo descrito en los 3 scenarios.

2. **El scenario en el que no supiste si faltaba un test o faltaba la regla en la spec**

    Revisando los scenarios del requisito directamente en la spec, y compararlos con los tests generados inicialmente, me dió la impresión que los 3 scenarios estaban bien cubiertos.

    Posteriormente, tras preguntar mediante un nuevo prompt, se sugerió incrementar los tests del scenario 2 para hacerlo más completo y cubrir los endpoints de `PATCH` y `PUT`. Entendí en el redactado del ejercicio que no era necesario revisar el código, simplemente comparar specs vs. tests, y analizar la posible cobertura.

3. **Algo que el scenario no determinaba y tuviste que decidir al escribir el test**

    Creo que no entendí el apartodo de los tests que faltan y delegué la generación en vez de escribirlos.
    En cualquier caso, revisando los 2 tests generados, probablemente habría tenido bastantes dudas al dedicir los parámetros necesarios y sus respectivos valores en los test de los endpoints `PATCH` y `PUT`.
