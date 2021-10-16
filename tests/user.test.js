const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/User')
const {
    userOneId,
    userOne,
    setupDB
} = require('./fixtures/db')



beforeEach(setupDB)

test('Should signup new user', async () => {
    await request(app).post('/users').send({
        username: 'Andrew',
        email: 'andrew@example.com',
        password: '123456'
    }).expect(201)
})

test('Should login exising user', async ()=>{
    const res = await request(app).post('/users/login').send({
        username: userOne.username,
        password: userOne.password
    }).expect(200)

    // Assert that the databse was changed correctly
    const user = await User.findById(res.body.user._id)
    expect(user).not.toBeNull() 
    // Assertions about the response
    // expect(res.body).toMatchObject({
    //     user: {
    //         username: userOne.username,
    //         email: userOne.email,            
    //     },
    //     token : userOne.tokens[0].token
    // })

    const user2 = await User.findById(userOneId)
    expect(res.body.token).toBe(user2.tokens[1].token)
})

test('Should not login non-existent user', async ()=>{
    await request(app).post('/users/login').send({
        username: userOne.username,
        password: 'wrong-password'
    }).expect(400)
})

test('Should get profile for user', async () => {
    await request(app)
    .get('/users/me')
    .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
})

test('Should not get profile for unauthenticated user', async () => { 
    await request(app) .get('/users/me')
    // .set('Authorization','Bearer wong-token')
    .send()
    .expect(401)
})

test('Should delete account for user', async () => {
    const res = await request(app).delete('/users/me')
    .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

    const user = await User.findById(userOneId)
    expect(user).toBeNull()
})

test('Should not delete account for unautheticated user', async () => {
    await request(app).delete('/users/me')
    .send()
    .expect(401)
})

test('Should upload images', async () => {

    await request(app).post('/users/me/avatar')
    .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
    .attach('avatar', 'tests/fixtures/Cat03.jpg')
    .expect(200)
    
})

test('Should update valid user fields', async () => {
    await request(app).patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({email: 'asdff@gmail.com'})
    .expect(200)

    const user = await User.findById(userOneId)
    expect(user.email).toEqual('asdff@gmail.com')
})

test('Should not update invalid user fields', async () => {
    await request(app).patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({location: 'HCM'})
    .expect(400)

    const user = await User.findById(userOneId)
    expect(user.location).toBeUndefined()
})