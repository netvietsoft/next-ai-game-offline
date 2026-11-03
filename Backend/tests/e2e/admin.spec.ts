import { test, expect } from '@playwright/test';

/**
 * Playwright E2E Visual & Functional UI Test Suite for Web Admin CMS.
 * Requirement 25: Test giao diện Web Admin Dashboard.
 */
test.describe('NextAI Admin CMS Web UI Test', () => {

    test('Loads Admin Dashboard on Port 6033 with Card Layout', async ({ page }) => {
        await page.goto('http://localhost:6033/admin');

        // 1. Kiểm tra tiêu đề trang
        await expect(page).toHaveTitle(/NextAI Game Offline - Admin CMS Dashboard/);

        // 2. Kiểm tra hiển thị tiêu đề chính
        const header = page.locator('h1');
        await expect(header).toContainText('Bảng Quản Trị Nền Tảng Game Offline');

        // 3. Kiểm tra các thẻ thống kê (Stat cards)
        const statCards = page.locator('.stat-card');
        await expect(statCards).toHaveCount(4);

        // 4. Kiểm tra danh sách Card Mini-Game trực quan
        const gameCards = page.locator('.data-card');
        const count = await gameCards.count();
        expect(count).toBeGreaterThan(0);

        // 5. Kiểm tra nút chuyển đổi Theme Sáng / Tối
        const themeBtn = page.locator('.theme-btn');
        await expect(themeBtn).toBeVisible();
        await themeBtn.click();
        const bodyTheme = await page.getAttribute('body', 'data-theme');
        expect(bodyTheme).toBe('light');

        // 6. Kiểm tra nút liên kết Swagger API Docs
        const swaggerBtn = page.locator('.swagger-btn');
        await expect(swaggerBtn).toHaveAttribute('href', '/api-docs');
    });
});
