import { describe, it, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import app from '../src/server';

/**
 * Backend API Integration Test Suite.
 */
describe('NextAI Game Offline Backend API Test Suite', () => {

    it('GET /health - Should return server UP status on port 6033', async () => {
        const res = await request(app).get('/health');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('UP');
        expect(res.body.port).toBe(6033);
    });

    it('GET /api/v1/games - Should return list of mini-games', async () => {
        const res = await request(app).get('/api/v1/games');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('games');
        expect(res.body.games.length).toBeGreaterThan(0);
    });

    it('POST /api/v1/auth/login - Should authenticate default admin', async () => {
        const res = await request(app)
            .post('/api/v1/auth/login')
            .send({
                username: 'admin',
                password: 'NextAIAdmin@2026'
            });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body.user.username).toBe('admin');
    });

    it('POST /api/v1/devices/register - Should register a new android device', async () => {
        const res = await request(app)
            .post('/api/v1/devices/register')
            .send({
                device_id: 'test_phone_001',
                app_version: '2.1.0',
                os_version: 'Android 14',
                device_model: 'Google Pixel 8'
            });

        expect([200, 201]).toContain(res.status);
    });
});
