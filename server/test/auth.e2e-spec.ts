import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Authentication (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        prisma = app.get<PrismaService>(PrismaService);
        await app.init();
    });

    beforeEach(async () => {
        // Clean up the database before each test
        await prisma.cleanDatabase();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('Authentication Flow', () => {
        const testUser = {
            email: 'test@example.com',
            password: 'password123',
            firstName: 'Test',
            lastName: 'User',
        };

        it('should register a new user', () => {
            return request(app.getHttpServer())
                .post('/api/v1/auth/register')
                .send(testUser)
                .expect(201)
                .expect((res) => {
                    expect(res.body).toHaveProperty('access_token');
                    expect(res.body.user).toHaveProperty('email', testUser.email);
                });
        });

        it('should login an existing user', async () => {
            // First register the user
            await request(app.getHttpServer())
                .post('/api/v1/auth/register')
                .send(testUser)
                .expect(201);

            // Then try to login
            return request(app.getHttpServer())
                .post('/api/v1/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password,
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveProperty('access_token');
                    expect(res.body.user).toHaveProperty('email', testUser.email);
                });
        });

        it('should not login with wrong password', async () => {
            // First register the user
            await request(app.getHttpServer())
                .post('/api/v1/auth/register')
                .send(testUser)
                .expect(201);

            // Then try to login with wrong password
            return request(app.getHttpServer())
                .post('/api/v1/auth/login')
                .send({
                    email: testUser.email,
                    password: 'wrongpassword',
                })
                .expect(401);
        });

        it('should get user profile with valid token', async () => {
            // First register and get token
            const registerResponse = await request(app.getHttpServer())
                .post('/api/v1/auth/register')
                .send(testUser)
                .expect(201);

            const token = registerResponse.body.access_token;

            // Then try to get profile
            return request(app.getHttpServer())
                .get('/api/v1/auth/profile')
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveProperty('email', testUser.email);
                });
        });
    });
}); 