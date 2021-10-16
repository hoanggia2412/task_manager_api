const request = require('supertest')
const app = require('../src/app')
const Task = require('../src/models/Task')
const {
    userOneId,
    userOne,
    setupDB,
    taskOne,
    userTwo,
} = require('./fixtures/db')

beforeEach(setupDB)

test('Should create new task for user', async () => {
    const response = await request(app).post('/tasks/')
                    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                    .send({
                        description: 'This is test description'
                    })
                    .expect(201)
    const task = await Task.findById(response.body._id)
    expect(task).not.toBeNull()
    expect(task.description).toContain('This is test description')
})

test('Should fetch user tasks', async () => {
    const response = await request(app).get('/tasks')
                    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                    .send()
                    .expect(200)
    expect(response.body.length).toEqual(2)
})

test('Test delete tasks security', async () => {
    const response = await request(app).delete(`/tasks/${taskOne._id}`)
                    .set('Authorization',`Bearer ${userTwo.tokens[0].token}`)
                    .send()
                    .expect(404)
    const task = Task.findById(taskOne._id)
    expect(task).not.toBeNull()
})