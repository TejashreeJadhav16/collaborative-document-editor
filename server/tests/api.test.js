// Set environment variables for testing before importing anything
process.env.NODE_ENV = 'test';
process.env.DB_MODE = 'sqlite';
process.env.JWT_SECRET = 'test_jwt_secret_key_1234567890';

const request = require('supertest');
const app = require('../server');
const { sequelize, User, Document } = require('../models');
const bcrypt = require('bcryptjs');

describe('Collaborative Document Editor API Tests', () => {
  let authToken;
  let testUser;
  let createdDocId;

  // Before running tests, synchronize the database and seed a test user
  beforeAll(async () => {
    // Force sync database to clear old tables
    await sequelize.sync({ force: true });

    // Seed a user
    const hashedPassword = await bcrypt.hash('123456', 10);
    testUser = await User.create({
      name: 'Test User',
      email: 'testuser@test.com',
      password: hashedPassword
    });
  });

  // After all tests are done, close the database connection
  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/auth/login', () => {
    it('should fail login with empty fields', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: '', password: '' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should fail login with incorrect credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'testuser@test.com', password: 'wrongpassword' });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
    });

    it('should successfully log in and return a JWT token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'testuser@test.com', password: '123456' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe('testuser@test.com');
      
      // Store token for subsequent requests
      authToken = res.body.token;
    });
  });

  describe('POST /api/documents', () => {
    it('should fail to create a document without authentication token', async () => {
      const res = await request(app)
        .post('/api/documents')
        .send({ title: 'Unauthorized Document' });

      expect(res.status).toBe(401);
    });

    it('should successfully create a new document when authenticated', async () => {
      const res = await request(app)
        .post('/api/documents')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'My First Test Doc', content: '<p>Hello world!</p>' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toBe('My First Test Doc');
      expect(res.body.content).toBe('<p>Hello world!</p>');
      expect(res.body.owner_id).toBe(testUser.id);
      
      // Save ID for update/delete tests
      createdDocId = res.body.id;
    });

    it('should fail to create a document with an empty title', async () => {
      const res = await request(app)
        .post('/api/documents')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: '' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /api/documents', () => {
    it('should retrieve all documents (owned and shared) for the user', async () => {
      const res = await request(app)
        .get('/api/documents')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('owned');
      expect(res.body).toHaveProperty('shared');
      expect(res.body.owned.length).toBe(1);
      expect(res.body.owned[0].id).toBe(createdDocId);
    });
  });

  describe('GET /api/documents/:id', () => {
    it('should retrieve details for a specific document by ID', async () => {
      const res = await request(app)
        .get(`/api/documents/${createdDocId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('My First Test Doc');
    });

    it('should return 404 for a non-existent document ID', async () => {
      const res = await request(app)
        .get('/api/documents/999999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/documents/:id', () => {
    it('should update the title and content of the document', async () => {
      const res = await request(app)
        .put(`/api/documents/${createdDocId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated Test Doc', content: '<h2>New content</h2>' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message');
      
      // Verify DB update
      const dbDoc = await Document.findByPk(createdDocId);
      expect(dbDoc.title).toBe('Updated Test Doc');
      expect(dbDoc.content).toBe('<h2>New content</h2>');
    });
  });

  describe('DELETE /api/documents/:id', () => {
    it('should successfully delete the document', async () => {
      const res = await request(app)
        .delete(`/api/documents/${createdDocId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);

      // Verify deletion in DB
      const dbDoc = await Document.findByPk(createdDocId);
      expect(dbDoc).toBeNull();
    });
  });
});
