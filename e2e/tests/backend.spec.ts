import { expect, test, type Page } from '@playwright/test';

const dispatchPaste = async (page: Page, locator: ReturnType<Page['getByPlaceholder']>, texto: string) => {
  await locator.click();
  await locator.evaluate((el, text) => {
    const event = new ClipboardEvent('paste', { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'clipboardData', { value: { getData: () => text } });
    el.dispatchEvent(event);
  }, texto);
};

const calcularLotacao = async (page: Page, n: string, entradas: string, saidas: string) => {
  await page.goto('/');
  await page.getByLabel('Número de passageiros (N)').fill(n);
  await dispatchPaste(page, page.getByPlaceholder('Ex.: 1, 5, 7'), entradas);
  await dispatchPaste(page, page.getByPlaceholder('Ex.: 9, 13, 12'), saidas);
  await page.getByRole('button', { name: 'Calcular lotação máxima' }).click();
};

test.describe('Lotação máxima - resultado do backend', () => {
  test('exemplo 1 do enunciado: lotação máxima 3', async ({ page }) => {
    // N=3, E=[1,5,7], S=[9,13,12] → passageiros 1, 2 e 3 estão juntos entre t=7 e t=8
    await calcularLotacao(page, '3', '1, 5, 7', '9, 13, 12');
    await expect(page.getByText('Lotação máxima: 3 pessoas')).toBeVisible();
  });

  test('exemplo 2 do enunciado: lotação máxima 1 (sem sobreposição)', async ({ page }) => {
    // N=4, E=[1,4,8,10], S=[3,8,10,17] → cada passageiro sai quando o próximo entra
    await calcularLotacao(page, '4', '1, 4, 8, 10', '3, 8, 10, 17');
    await expect(page.getByText('Lotação máxima: 1 pessoas')).toBeVisible();
  });

  test('todos os passageiros presentes ao mesmo tempo', async ({ page }) => {
    // N=5, E=[1,2,3,4,5], S=[10,10,10,10,10] → no t=5 há 5 passageiros simultâneos
    await calcularLotacao(page, '5', '1, 2, 3, 4, 5', '10, 10, 10, 10, 10');
    await expect(page.getByText('Lotação máxima: 5 pessoas')).toBeVisible();
  });

  test('dois passageiros com entrada e saída coincidentes conta como 1', async ({ page }) => {
    // N=2, E=[1,5], S=[5,10] → p1 sai quando p2 entra: nunca há 2 ao mesmo tempo
    await calcularLotacao(page, '2', '1, 5', '5, 10');
    await expect(page.getByText('Lotação máxima: 1 pessoas')).toBeVisible();
  });

  test('passageiro cuja entrada coincide com saída não incrementa a lotação', async ({ page }) => {
    // N=3, E=[5,5,5], S=[5,5,5] → saídas processadas antes das entradas: ocupação máxima é 0
    await calcularLotacao(page, '3', '5, 5, 5', '5, 5, 5');
    await expect(page.getByText('Lotação máxima: 0 pessoas')).toBeVisible();
  });

  test('ordem dos passageiros na entrada não altera o resultado', async ({ page }) => {
    // Mesmo cenário do exemplo 1 com passageiros em ordem diferente → ainda 3
    // N=3, E=[7,1,5], S=[12,9,13]
    await calcularLotacao(page, '3', '7, 1, 5', '12, 9, 13');
    await expect(page.getByText('Lotação máxima: 3 pessoas')).toBeVisible();
  });

  test('múltiplas entradas e saídas no mesmo instante respeita ordem de processamento', async ({ page }) => {
    // N=4, E=[1,3,3,3], S=[3,7,7,7] → no t=3 um sai e três entram; no pico há 3 simultâneos
    // Eventos em t=3: (SAIDA, -1) → ocupacao=0, depois (ENTRADA,+1) x3 → 1, 2, 3
    await calcularLotacao(page, '4', '1, 3, 3, 3', '3, 7, 7, 7');
    await expect(page.getByText('Lotação máxima: 3 pessoas')).toBeVisible();
  });
});
