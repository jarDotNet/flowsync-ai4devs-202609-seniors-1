import User from '#models/user'
import Task from '#models/task'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

/**
 * Lo que cada tarea muestra de su responsable. Cubre los tres scenarios del
 * requisito «Lo que cada tarea muestra de su responsable» de
 * `openspec/specs/tasks/spec.md`: responsable identificable, la tarea no filtra
 * datos de cuenta y responsable sin nombre.
 */
test.group('Tasks | responsable', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  const HOY = '2026-10-04'

  async function sesion(client: any, email: string) {
    const response = await client.post('/api/v1/auth/login').json({ email, password: 'secreto123' })

    return response.body().data.token as string
  }

  async function tareaDe(fullName: string | null, email: string) {
    const user = await User.create({ fullName, email, password: 'secreto123' })
    const task = await Task.create({
      title: 'Revisar el informe',
      status: 'pending',
      assigneeId: user.id,
    })

    return { user, task }
  }

  test('el responsable trae su nombre y sus iniciales', async ({ client, assert }) => {
    const { task } = await tareaDe('Ada Lovelace', 'ada@example.com')
    const token = await sesion(client, 'ada@example.com')

    const response = await client
      .get(`/api/v1/tasks/${task.id}`)
      .qs({ today: HOY })
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
    assert.equal(response.body().data.assignee.fullName, 'Ada Lovelace')
    assert.equal(response.body().data.assignee.initials, 'AL')
  })

  test('en la lista, el responsable también trae su nombre y sus iniciales', async ({
    client,
    assert,
  }) => {
    await tareaDe('Ada Lovelace', 'ada@example.com')
    const token = await sesion(client, 'ada@example.com')

    const response = await client.get('/api/v1/tasks').header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
    const [tarea] = response.body().data
    assert.equal(tarea.assignee.fullName, 'Ada Lovelace')
    assert.equal(tarea.assignee.initials, 'AL')
  })

  test('la tarea suelta no filtra el email ni más datos de la cuenta', async ({
    client,
    assert,
  }) => {
    const { task } = await tareaDe('Ada Lovelace', 'ada@example.com')
    const token = await sesion(client, 'ada@example.com')

    const response = await client
      .get(`/api/v1/tasks/${task.id}`)
      .qs({ today: HOY })
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
    const { assignee } = response.body().data
    assert.notProperty(assignee, 'email')
    assert.sameMembers(Object.keys(assignee), ['id', 'fullName', 'initials'])
  })

  test('la lista no filtra el email ni más datos de la cuenta', async ({ client, assert }) => {
    await tareaDe('Ada Lovelace', 'ada@example.com')
    const token = await sesion(client, 'ada@example.com')

    const response = await client.get('/api/v1/tasks').header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
    const { assignee } = response.body().data[0]
    assert.notProperty(assignee, 'email')
    assert.sameMembers(Object.keys(assignee), ['id', 'fullName', 'initials'])
  })

  test('la tarea recién creada no filtra el email ni más datos de la cuenta', async ({
    client,
    assert,
  }) => {
    await User.create({
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'secreto123',
    })
    const token = await sesion(client, 'ada@example.com')

    const response = await client
      .post('/api/v1/tasks')
      .json({ title: 'Revisar el informe' })
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(201)
    const { assignee } = response.body().data
    assert.notProperty(assignee, 'email')
    assert.sameMembers(Object.keys(assignee), ['id', 'fullName', 'initials'])
  })

  test('la tarea tras cambiar su estado no filtra el email ni más datos de la cuenta', async ({
    client,
    assert,
  }) => {
    const { task } = await tareaDe('Ada Lovelace', 'ada@example.com')
    const token = await sesion(client, 'ada@example.com')

    const response = await client
      .patch(`/api/v1/tasks/${task.id}/status`)
      .json({ status: 'in_progress' })
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
    const { assignee } = response.body().data
    assert.notProperty(assignee, 'email')
    assert.sameMembers(Object.keys(assignee), ['id', 'fullName', 'initials'])
  })

  test('la tarea tras cambiar su fecha no filtra el email ni más datos de la cuenta', async ({
    client,
    assert,
  }) => {
    const { task } = await tareaDe('Ada Lovelace', 'ada@example.com')
    const token = await sesion(client, 'ada@example.com')

    const response = await client
      .put(`/api/v1/tasks/${task.id}/due-date`)
      .json({ today: HOY, dueDate: '2026-10-30' })
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
    const { assignee } = response.body().data
    assert.notProperty(assignee, 'email')
    assert.sameMembers(Object.keys(assignee), ['id', 'fullName', 'initials'])
  })

  test('un responsable sin nombre llega con nombre nulo e iniciales', async ({
    client,
    assert,
  }) => {
    const { task } = await tareaDe(null, 'ada@example.com')
    const token = await sesion(client, 'ada@example.com')

    const response = await client
      .get(`/api/v1/tasks/${task.id}`)
      .qs({ today: HOY })
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
    const { assignee } = response.body().data
    assert.isNull(assignee.fullName)
    assert.equal(assignee.initials, 'AE')
    assert.notProperty(assignee, 'email')
  })

  test('en la lista, un responsable sin nombre llega con nombre nulo e iniciales', async ({
    client,
    assert,
  }) => {
    await tareaDe(null, 'ada@example.com')
    const token = await sesion(client, 'ada@example.com')

    const response = await client.get('/api/v1/tasks').header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
    const { assignee } = response.body().data[0]
    assert.isNull(assignee.fullName)
    assert.equal(assignee.initials, 'AE')
  })
})
