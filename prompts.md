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

**Modelo:** Opus 5.5 Medium
**Herramienta:** Claude Code

```
Trabajas como un auditor de software experto en verificar y validar las reglas de un proceso de integración continua.

Realiza la auditoría de las instrucciones indicadas en el apartado "Reglas de proceso" que se encuentran al final del fichero CLAUDE.md.

Contrasta las reglas con los últimos 15 commits del repositorio y el estado actual de los archivos del proyecto.

Para cada regla, completa los siguientes criterios:

1. Qué pide la regla. Resúmela en una frase y con tus propias palabras.

2. Qué se revisó para comprobarla. Indica el comando ejecutado o el archivo consultado.

3. Veredicto. Solo puede ser "se cumple", "no se cumple" o "no se puede comprobar con la información disponible".

4. Evidencia. Escríbela en una línea. Si la regla "no se cumple", indica dónde se incumple. Si "no se puede comprobar", explica qué información falta.

5. Qué harías con ella. Elige una opción: "dejarla", "borrarla" o "convertirla en una comprobación automática".

No deduzcas nada. Basa tu veredicto solo en evidencias verificables, si las hay.
No modifiques ni cambies nada por ahora. Solo estamos analizando y auditando las reglas del proceso. No se pretende corregir nada con esta tarea.
```

**Qué salió:** listado con los datos indicados para cada regla, y un veredicto final de que para las cindo no reglas «no se puede comprobar con la información disponible». Añadió también la siguiente coletilla final, saltándose lo indicado a pesar de estar en plan mode: «Todo fue de solo lectura y no he modificado nada salvo el fichero de plan con la auditoría completa».

## Prompt 2

**Modelo:** Sonnet 5.5 Medium
**Herramienta:** Claude Code

```
Si indiqué que no modificaras nada, y además la ejecución era en "plan" mode. Porqué creaste un fichero con el plan?
```

**Qué salió:** interpretó que el modo plan le indicaba que el fichero de plan era el único que podía escribir. Propone borrarlo, y ahí ya indica que eso sería otra modificación, y que ahora solo lo haría bajo confirmación.

## Prompt 3

**Modelo:** Sonnet 5.5 Medium
**Herramienta:** Claude Code
```
Ahora sí, guarda únicamente la tabla con las conclusiones extraidas en el archivo docs/auditoria/jar.md. Pon como título "Resultados de la auditoría".
No cambies nada fuera de este fichero, ni generes PR aún.
```

**Qué salió:** generó el nuevo archivo con los resultados solicitados, que servirán de base para el entregable.

## Prompt 4

**Modelo:** Sonnet 5.5 Medium
**Herramienta:** Claude Code
```
Enumera los 15 commits revisados, con información útil para revisarlos porsteriormente de manera manual. Como por ejemplo: el número de commit, alias del usuario, título, URL, etc.
```

**Qué salió:** listado con los 15 commits revisados en el proceso de auditoría.

# Prompt 5

**Modelo:** Sonnet 5.5 Medium
**Herramienta:** Claude Code
```
Porqué crees que la regla 5 debería dejarse, Qué aporta?
```

**Qué salió:** la respuesta literal:
```
Mi "dejarla" para la regla 5 tiene un fundamento más débil de lo que parecía en la tabla, y no se apoya en ninguna evidencia del repo.

Lo que aporta, según la propia regla. Su razón está en `CLAUDE.md`: la sesión se pierde y el PR no. Si la descripción completa vive en el PR, repetirla en el chat no añade nada y solo gasta contexto y tu atención. La regla se limita a evitar esa duplicación y no cuesta nada mantenerla.

Por qué puse "dejarla". Por descarte, no por mérito demostrado:
- No se puede convertir en una comprobación automática, porque es una conducta en el chat que ni git ni GitHub registran.
- No es contradictoria ni daña nada.
- Borrarla no arregla ningún problema.

Dónde es débil.
- No pude verificar si se cumple, igual que las otras cuatro. Tampoco tengo evidencia de que su ausencia causara un problema.
- Es una preferencia de estilo y no una regla de proceso: no protege la integridad del repo ni el flujo de CI. Podría vivir como preferencia de usuario en lugar de en `CLAUDE.md`, que es un fichero compartido.
- La regla 4 recibió el mismo "dejarla" con un argumento parecido. Mi criterio entre "dejarla" y "borrarla" fue más conservador que riguroso.

Si tu criterio es que una regla debe poder comprobarse para merecer sitio en `CLAUDE.md`, la 5 sería candidata a borrarse, o a moverse a las preferencias de cada usuario.

Esto parece conectar con tu Parte B (la regla que eliminarías y por qué). Te sirve como argumento, pero es tu decisión.
```
