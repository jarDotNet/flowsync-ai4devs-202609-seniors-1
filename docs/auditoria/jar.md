# Auditoría de las «Reglas de proceso» de CLAUDE.md

## Expectativas antes de empezar

| Regla | Expectativa |
|---|---|
| R1 — Rama por unidad de trabajo | No |
| R2 — Commit por petición | No |
| R3 — Documentación sincronizada con cambios | Ni idea |
| R4 — Abrir un único PR con revisión adversarial | No |
| R5 — Responder PR solo con su URL | Ni idea |

## Resultados de la auditoría

| Regla | Qué pide la regla | Qué se revisó | Veredicto | Evidencia | Qué haría |
|---|---|---|---|---|---|
| R1 | Trabajar en una rama por unidad de trabajo, crear `feat/<slug>` solo desde `main` o `sN/*`, y no commitear nunca en `main` ni en `sN/*`. | `git log` (padres y merges), `git branch -a --contains`, `git reflog`, `gh pr list --search <sha>` | No se puede comprobar con la información disponible | Git no guarda en qué rama nació un commit. Los 15 están en `s5/start` y `s4/end` en historia lineal y sin merges, y ningún PR los tiene como cabeza. Eso es compatible tanto con commits directos como con rebase o fast-forward desde otra rama. Faltaría el reflog o la protección de rama del repo de origen. | Convertirla en una comprobación automática (protección de rama en `main` y `s*/*`, o hook `pre-commit` que rechace esas ramas) |
| R2 | Cerrar cada petición con un commit hecho con la skill `/commit`. | `.claude/skills/commit/SKILL.md` (formato `tipo(scope): descripción`), asuntos de los 15 commits | No se puede comprobar con la información disponible | 14 de 15 siguen `tipo(scope):`. `a3bb962` es `docs:` sin scope. Ni el commit ni el repo registran si se usó la skill ni qué petición cerraba cada commit: haría falta el transcript de cada sesión. | Convertirla en una comprobación automática (hook `commit-msg` que valide el formato convencional) |
| R3 | Si un commit toca rutas, controladores, validadores o transformers de una capability, ese mismo commit debe llevar el diff regenerado de `.adonisjs/` y `docs/capabilities/<nombre>/README.md` al día. | `git log --name-only` de los 15 commits, `git show cbe9617` | No se puede comprobar con la información disponible | Desde que existe la regla (`160fbc7`), el único commit afectado es `cbe9617`: cambia 3 controladores e incluye `docs/capabilities/tasks/README.md`, así que la parte del README se cumple. No trae diff de `.adonisjs/`, y saber si debía traerlo exige regenerar con `npm run dev` o `npm test`, que escriben y no se ejecutaron. `4e03d1f` (transformer sin README) es anterior a la regla y al propio README (`7662fb1`). | Convertirla en una comprobación automática (en CI: regenerar `.adonisjs/` y fallar si `git diff --exit-code` no sale limpio; avisar si cambia `app/{controllers,validators,transformers}` sin cambiar `docs/capabilities/`) |
| R4 | Abrir un único PR con descripción completa al terminar la unidad de trabajo y pasar el subagente `adversarial-reviewer` sobre él como último paso. | `gh pr list --state all` y `--search <sha>`, `gh pr view 120`, `.claude/agents/adversarial-reviewer.md` | No se puede comprobar con la información disponible | Ningún PR de `upstream` contiene como propios los commits de la ventana. El #120 (`feat/tests-responsable-tarea`) tiene otros SHA (`8b092cd`, `647e7ae`) y está cerrado. El pase del revisor no deja huella en el repo. Faltaría el repo o los PRs donde se integraron estos commits y el registro de la sesión del revisor. | Dejarla |
| R5 | Al abrir el PR, responder en el chat solo con su URL, sin repetir el resumen. | No hay artefacto en el repo que lo registre | No se puede comprobar con la información disponible | Es una conducta en el chat de la sesión. Ni git ni GitHub la registran: haría falta el transcript. | Dejarla |

## Parte B

### 1. **Regla en la que más me equivoqué:**

Mis expectativas iniciales fueron todas "No" o "Ni idea", mientras que los veredictos finales fueron todos "no se puede comprobar", por lo que no considero que ninguna expectativa quede totalmente refutada.

La más propensa a una posible equipocación quizás sea la **R2** sobre Commit por petición usando el skill `/commit`. Revisando los 15 commits listados, puede haber indicios indirectos de commits hechos con Calude y con formato convencional. De los 15 commits, 12 llevan `Co-Authored-By: Claude…`. Y 14 de 15 siguen el formato `tipo(scope):` que pide la skill.

En cualquier caso, ni siquiera estos indicios prueban que se usara la skill `/commit`, ni que fuera un commit por petición.

### 2. **Regla que no se puede comprobar con la información disponible:**

En la **R4**, no hay forma de verificar si el `adversarial-reviewer` se ejecutó en local, ya que esa información no queda registrada en el repo ni es accesible desde una PR. Para resolverlo, se debería incluir como paso automatizado en el pipeline de CI y publicar los errores resultantes como comentarios en la propia PR.

### 3. **Regla que eliminaría y por qué:**

Aunque Claude decidió dejarla, yo eliminaría la **R5**, que muestra en el chat solo la URL de la PR generada. En un flujo de CI, esta regla aporta poco valor: la información relevante ya debería estar incluida en la propia PR, por lo que repetirla en el chat resulta redundante. Su único beneficio sería evitar duplicar el mensaje que ya aparece en la PR, pero mostrar únicamente el enlace lo veo más como una comodidad que como una necesidad o algo que sea relevante en un flujo de CI.
