const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.connection.close();
});

afterEach(async () => {
  await User.deleteMany({});
});

describe('Auth API', () => {
  it('should sign up a new user', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ username: 'testuser', password: 'testpass' });
    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('User created');
  });

  it('should not sign up with existing username', async () => {
    await User.create({ username: 'testuser', password: 'testpass' });
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ username: 'testuser', password: 'testpass' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('should sign in with correct credentials', async () => {
    await request(app)
      .post('/api/auth/signup')
      .send({ username: 'testuser', password: 'testpass' });
    const res = await request(app)
      .post('/api/auth/signin')
      .send({ username: 'testuser', password: 'testpass' });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('should not sign in with wrong password', async () => {
    await request(app)
      .post('/api/auth/signup')
      .send({ username: 'testuser', password: 'testpass' });
    const res = await request(app)
      .post('/api/auth/signin')
      .send({ username: 'testuser', password: 'wrongpass' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Invalid credentials');
  });

  it('should sign out (stateless)', async () => {
    const res = await request(app)
      .post('/api/auth/signout');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Signed out');
  });
});
