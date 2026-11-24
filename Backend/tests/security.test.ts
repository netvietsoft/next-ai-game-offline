import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import app from '../src/server';

/**
 * Bộ kiểm thử bảo mật & kiến trúc sau Phase 1 + Phase 2 Backend:
 * - Chống Path Traversal và Reflected XSS trên `/games/*`, `/play/*`, `/tester/*`.
 * - Xác minh giao diện Tester Studio đã tách file tĩnh hoạt động trọn vẹn.
 */
describe('Backend Security Hardening & Modular GameTester Suite', () => {
    it('blocks path traversal attempts on /games/:gameName and /tester/embed/:gameName', async () => {
        const resGame = await request(app).get('/games/..%2F..%2Fpackage.json');
        expect(resGame.status).toBe(400);

        const resEmbed = await request(app).get('/tester/embed/..%2F..%2Fpackage.json');
        expect(resEmbed.status).toBe(400);

        const resPlay = await request(app).get('/play/..%2Fadmin');
        expect(resPlay.status).toBe(400);
    });

    it('rejects XSS payloads inside :gameName parameters', async () => {
        const xssPayload = encodeURIComponent('<script>alert(1)</script>');

        const resEmbed = await request(app).get(`/tester/embed/${xssPayload}`);
        expect(resEmbed.status).toBe(400);
        expect(resEmbed.text).not.toContain('<script>alert(1)</script>');

        const resPlay = await request(app).get(`/tester/play/${xssPayload}`);
        expect(resPlay.status).toBe(400);
        expect(resPlay.text).not.toContain('<script>alert(1)</script>');

        const resDirect = await request(app).get(`/tester/${xssPayload}`);
        expect(resDirect.status).toBe(400);
    });

    it('serves modular Tester Studio HTML, static CSS/JS assets, and games API', async () => {
        const studioRes = await request(app).get('/tester');
        expect(studioRes.status).toBe(200);
        expect(studioRes.text).toContain('/tester/static/studio.css');
        expect(studioRes.text).toContain('/tester/static/studio.js');
        expect(studioRes.text).toContain('window.__TESTER_BOOTSTRAP__');

        const cssRes = await request(app).get('/tester/static/studio.css');
        expect(cssRes.status).toBe(200);

        const jsRes = await request(app).get('/tester/static/studio.js');
        expect(jsRes.status).toBe(200);

        const apiRes = await request(app).get('/tester/api/games');
        expect(apiRes.status).toBe(200);
        expect(Array.isArray(apiRes.body.games)).toBe(true);

        const playRes = await request(app).get('/tester/play/abalone');
        expect(playRes.status).toBe(200);
        expect(playRes.text).toContain('/tester/static/player.css');

        const playerCssRes = await request(app).get('/tester/static/player.css');
        expect(playerCssRes.status).toBe(200);
    });
});
