import { test, expect } from '@playwright/test';
test('marketplace loads and can open cart', async ({page}) => { await page.goto('/products'); await expect(page.getByRole('heading',{name:'Marketplace',exact:true})).toBeVisible(); await page.getByRole('link',{name:/Carrinho/}).click(); await expect(page.getByRole('heading',{name:'Seu carrinho',exact:true})).toBeVisible(); });
