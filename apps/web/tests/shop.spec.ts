import { test, expect, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const evidenceDir = path.resolve(process.cwd(), 'evidence/screenshots');

async function capture(page: Page, name: string) {
  await mkdir(evidenceDir, { recursive: true });
  await page.screenshot({ path: path.join(evidenceDir, name), fullPage: true });
}

async function openCart(page: Page) {
  await page.getByRole('link', { name: /Carrinho/ }).click();
  await expect(page.getByRole('heading', { name: 'Seu carrinho', exact: true })).toBeVisible();
}

async function addFromMarketplace(page: Page, slug: string) {
  await page.getByTestId(`add-${slug}`).click();
  await expect(page.getByTestId(`product-card-${slug}`)).toContainText('Adicionado');
}

async function addCoupon(page: Page, code: string) {
  await page.getByTestId('coupon-input').fill(code);
  await page.getByTestId('apply-coupon').click();
  await expect(page.getByTestId('quote-loading-summary')).toBeHidden();
}

test.beforeEach(async ({ page }) => {
  await page.goto('/products');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Marketplace', exact: true })).toBeVisible();
});

test('E2E01 marketplace loads', async ({ page }) => {
  await expect(page.getByTestId('product-card-headset-gamer')).toBeVisible();
  await capture(page, 'e2e-marketplace.png');
});

test('E2E02 opens a salespage with coupon compatibility', async ({ page }) => {
  await page.getByTestId('product-card-gift-card').getByRole('link').first().click();
  await expect(page.getByRole('heading', { name: 'Gift Card', exact: true })).toBeVisible();
  await expect(page.getByTestId('coupon-card-BEMVINDO10')).toContainText('Incompatível');
  await capture(page, 'e2e-salespage-incompatible-coupon.png');
});

test('E2E03 adds a product from the marketplace', async ({ page }) => {
  await addFromMarketplace(page, 'headset-gamer');
  await openCart(page);
  await expect(page.getByTestId('cart-line-headset-gamer')).toBeVisible();
});

test('E2E04 adds a product from its salespage', async ({ page }) => {
  await page.getByTestId('product-card-mouse-gamer').getByRole('link').first().click();
  await page.getByTestId('add-product-mouse-gamer').click();
  await openCart(page);
  await expect(page.getByTestId('cart-line-mouse-gamer')).toBeVisible();
});

test('E2E05 changes quantity in the cart', async ({ page }) => {
  await addFromMarketplace(page, 'headset-gamer');
  await openCart(page);
  await page.getByRole('button', { name: 'Aumentar Headset Gamer' }).click();
  await expect(page.getByLabel('Quantidade de Headset Gamer')).toHaveText('2');
  await expect(page.getByTestId('cart-subtotal')).toContainText('R$ 240,00');
});

test('E2E06 removes a product', async ({ page }) => {
  await addFromMarketplace(page, 'headset-gamer');
  await openCart(page);
  await page.getByTestId('remove-headset-gamer').click();
  await expect(page.getByRole('heading', { name: 'Seu carrinho está vazio', exact: true })).toBeVisible();
});

test('E2E07 applies BEMVINDO10', async ({ page }) => {
  await addFromMarketplace(page, 'headset-gamer');
  await openCart(page);
  await addCoupon(page, 'BEMVINDO10');
  await expect(page.getByTestId('coupon-success')).toContainText('BEMVINDO10');
  await expect(page.getByTestId('cart-total')).toContainText('R$ 108,00');
  await capture(page, 'e2e-coupon-applied.png');
});

test('E2E08 rejects BEMVINDO10 below the global minimum', async ({ page }) => {
  await addFromMarketplace(page, 'webcam-hd');
  await openCart(page);
  await addCoupon(page, 'BEMVINDO10');
  await expect(page.getByTestId('coupon-error')).toContainText('R$ 100,00');
  await capture(page, 'e2e-global-minimum-rejected.png');
});

test('E2E09 rejects SUPER20 below R$ 200', async ({ page }) => {
  await addFromMarketplace(page, 'headset-gamer');
  await addFromMarketplace(page, 'mousepad');
  await openCart(page);
  await addCoupon(page, 'SUPER20');
  await expect(page.getByTestId('coupon-error')).toContainText('R$ 200,00');
});

test('E2E10 applies SUPER20 exactly at R$ 200', async ({ page }) => {
  await addFromMarketplace(page, 'headset-gamer');
  await addFromMarketplace(page, 'mouse-gamer');
  await openCart(page);
  await addCoupon(page, 'SUPER20');
  await expect(page.getByTestId('coupon-success')).toBeVisible();
  await expect(page.getByTestId('cart-total')).toContainText('R$ 160,00');
});

test('E2E11 excludes Gift Card from SUPER20 discount', async ({ page }) => {
  await addFromMarketplace(page, 'headset-gamer');
  await addFromMarketplace(page, 'mouse-gamer');
  await addFromMarketplace(page, 'gift-card');
  await openCart(page);
  await addCoupon(page, 'SUPER20');
  await expect(page.getByTestId('cart-line-gift-card')).toContainText('Não elegível');
  await expect(page.getByTestId('cart-discount')).toContainText('R$ 40,00');
  await expect(page.getByTestId('cart-total')).toContainText('R$ 220,00');
  await capture(page, 'e2e-gift-card-excluded.png');
});

test('E2E12 preserves the cart and applied coupon after reload', async ({ page }) => {
  await addFromMarketplace(page, 'headset-gamer');
  await openCart(page);
  await addCoupon(page, 'BEMVINDO10');
  await page.reload();
  await expect(page.getByTestId('cart-line-headset-gamer')).toBeVisible();
  await expect(page.getByTestId('coupon-success')).toBeVisible();
  await expect(page.getByTestId('cart-total')).toContainText('R$ 108,00');
  await capture(page, 'e2e-cart-reload.png');
});

test('E2E13 shows compatible and incompatible coupons on salespages', async ({ page }) => {
  await page.getByTestId('product-card-headset-gamer').getByRole('link').first().click();
  await expect(page.getByTestId('coupon-card-BEMVINDO10')).toContainText('Compatível');
  await page.goto('/products/gift-card');
  await expect(page.getByTestId('coupon-card-BEMVINDO10')).toContainText('Incompatível');
});

test('E2E14 removes a coupon and recalculates the total', async ({ page }) => {
  await addFromMarketplace(page, 'headset-gamer');
  await addFromMarketplace(page, 'mouse-gamer');
  await openCart(page);
  await addCoupon(page, 'SUPER20');
  await expect(page.getByTestId('cart-total')).toContainText('R$ 160,00');
  await page.getByTestId('clear-coupon').click();
  await expect(page.getByTestId('cart-total')).toContainText('R$ 200,00');
  await expect(page.getByTestId('coupon-success')).toBeHidden();
});
