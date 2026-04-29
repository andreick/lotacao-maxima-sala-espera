import { expect, test, type Page } from '@playwright/test';

const preencherFormulario = async (
  page: Page,
  quantidade: string,
  entradas: string,
  saidas: string,
) => {
  await page.getByLabel('Número de passageiros (N)').fill(quantidade);
  await page.getByLabel('Entradas (E)').fill(entradas);
  await page.getByLabel('Saídas (S)').fill(saidas);
};

test.describe('Lotação máxima - validações do frontend', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('exibe erros de obrigatoriedade ao tentar enviar vazio', async ({ page }) => {
    await page.getByRole('button', { name: 'Calcular lotação máxima' }).click();

    await expect(page.getByText('Confira o número de passageiros (N).')).toBeVisible();
    await expect(page.getByText('A lista de entradas (E) precisa ter N números.')).toBeVisible();
    await expect(page.getByText('A lista de saídas (S) precisa ter N números.')).toBeVisible();
  });

  test('valida faixa permitida para N', async ({ page }) => {
    await preencherFormulario(page, '101', '1', '1');

    await page.getByRole('button', { name: 'Calcular lotação máxima' }).click();

    await expect(page.getByText('N deve estar entre 1 e 100.')).toBeVisible();
  });

  test('valida formato inteiro das entradas e saídas', async ({ page }) => {
    await preencherFormulario(page, '2', '1, abc', '3, 4.5');

    await page.getByRole('button', { name: 'Calcular lotação máxima' }).click();

    await expect(page.getByText('A lista de entradas (E) aceita apenas números inteiros.')).toBeVisible();
    await expect(page.getByText('A lista de saídas (S) aceita apenas números inteiros.')).toBeVisible();
  });

  test('valida faixa de 1 a 1000 para entradas e saídas', async ({ page }) => {
    await preencherFormulario(page, '2', '0, 5', '9, 1001');

    await page.getByRole('button', { name: 'Calcular lotação máxima' }).click();

    await expect(page.getByText('As entradas (E) devem estar entre 1 e 1000.')).toBeVisible();
    await expect(page.getByText('As saídas (S) devem estar entre 1 e 1000.')).toBeVisible();
  });

  test('valida quantidade de valores em E e S igual a N', async ({ page }) => {
    await preencherFormulario(page, '3', '1, 5', '9, 13, 12, 20');

    await page.getByRole('button', { name: 'Calcular lotação máxima' }).click();

    await expect(page.getByText('A lista de entradas (E) precisa ter N números.')).toBeVisible();
    await expect(page.getByText('A lista de saídas (S) precisa ter N números.')).toBeVisible();
  });

  test('valida que saída não pode ocorrer antes da entrada', async ({ page }) => {
    await preencherFormulario(page, '2', '5, 7', '6, 6');

    await page.getByRole('button', { name: 'Calcular lotação máxima' }).click();

    await expect(page.getByText('Encontramos uma saída antes da entrada. Revise os valores.')).toBeVisible();
  });

  test('envia payload normalizado para API e mostra o resultado', async ({ page }) => {
    let payloadRecebido: unknown = null;
    await page.route('**/api/lotacao-maxima', async (route) => {
      payloadRecebido = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ maxOcupacao: 3 }),
      });
    });

    await preencherFormulario(page, '3', '1,\n5 7', '9 13,\n12');

    await page.getByRole('button', { name: 'Calcular lotação máxima' }).click();

    await expect(page.getByText('Lotação máxima: 3 pessoas')).toBeVisible();
    expect(payloadRecebido).toEqual({
      quantidadePassageiros: 3,
      temposEntrada: [1, 5, 7],
      temposSaida: [9, 13, 12],
    });
  });

  test('mostra mensagem amigável quando API retorna erro de validação', async ({ page }) => {
    await page.route('**/api/lotacao-maxima', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          title: 'Bad Request',
          detail: 'Requisição inválida.',
          details: ['N deve ser compatível com E e S.'],
        }),
      });
    });

    await preencherFormulario(page, '3', '1, 5, 7', '9, 13, 12');

    await page.getByRole('button', { name: 'Calcular lotação máxima' }).click();

    await expect(page.getByRole('alert').filter({ hasText: 'N deve ser compatível com E e S.' })).toBeVisible();
  });
});
