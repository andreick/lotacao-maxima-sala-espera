import { expect, test, type Page } from '@playwright/test';

const dispatchPaste = async (page: Page, locator: ReturnType<Page['getByPlaceholder']>, texto: string) => {
  await locator.click();
  await locator.evaluate((el, text) => {
    const event = new ClipboardEvent('paste', { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'clipboardData', { value: { getData: () => text } });
    el.dispatchEvent(event);
  }, texto);
};

const preencherEntradas = async (page: Page, texto: string) => {
  await dispatchPaste(page, page.getByPlaceholder('Ex.: 1, 5, 7'), texto);
};

const preencherSaidas = async (page: Page, texto: string) => {
  await dispatchPaste(page, page.getByPlaceholder('Ex.: 9, 13, 12'), texto);
};

const preencherFormulario = async (page: Page, quantidade: string, entradas: string, saidas: string) => {
  await page.getByLabel('Número de passageiros (N)').fill(quantidade);
  await preencherEntradas(page, entradas);
  await preencherSaidas(page, saidas);
};

test.describe('Lotação máxima - validações do frontend', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('exibe erros de obrigatoriedade ao tentar enviar vazio', async ({ page }) => {
    await page.getByRole('button', { name: 'Calcular lotação máxima' }).click();

    await expect(page.getByText('Número de passageiros (N) obrigatório.')).toBeVisible();
    await expect(page.getByText('A lista de entradas (E) precisa ter N números.')).toBeVisible();
    await expect(page.getByText('A lista de saídas (S) precisa ter N números.')).toBeVisible();
  });

  test('valida faixa permitida para N', async ({ page }) => {
    await page.getByLabel('Número de passageiros (N)').fill('101');
    await preencherEntradas(page, '1');
    await preencherSaidas(page, '1');

    await page.getByRole('button', { name: 'Calcular lotação máxima' }).click();

    await expect(page.getByText('N deve estar entre 1 e 100.')).toBeVisible();
  });

  test('não exibe erro de N antes de clicar em Calcular', async ({ page }) => {
    const campoN = page.getByLabel('Número de passageiros (N)');

    await campoN.fill('5');
    await campoN.clear();
    await campoN.blur();

    await expect(page.getByText('Número de passageiros (N) obrigatório.')).not.toBeVisible();

    await page.getByRole('button', { name: 'Calcular lotação máxima' }).click();

    await expect(page.getByText('Número de passageiros (N) obrigatório.')).toBeVisible();
  });

  test('rejeita chip com valor não inteiro imediatamente', async ({ page }) => {
    const entradasInput = page.getByPlaceholder('Ex.: 1, 5, 7');
    await entradasInput.fill('abc');
    await entradasInput.press('Enter');

    await expect(page.getByText('Informe um número inteiro entre 1 e 1000.').first()).toBeVisible();

    const saidasInput = page.getByPlaceholder('Ex.: 9, 13, 12');
    await saidasInput.fill('4.5');
    await saidasInput.press('Enter');

    await expect(page.getByText('Informe um número inteiro entre 1 e 1000.').last()).toBeVisible();
  });

  test('rejeita chip com valor fora do intervalo 1 a 1000 imediatamente', async ({ page }) => {
    const entradasInput = page.getByPlaceholder('Ex.: 1, 5, 7');
    await entradasInput.fill('0');
    await entradasInput.press('Enter');

    await expect(page.getByText('Informe um número inteiro entre 1 e 1000.').first()).toBeVisible();

    const saidasInput = page.getByPlaceholder('Ex.: 9, 13, 12');
    await saidasInput.fill('1001');
    await saidasInput.press('Enter');

    await expect(page.getByText('Informe um número inteiro entre 1 e 1000.').last()).toBeVisible();
  });

  test('registra chip de entradas ao perder o foco', async ({ page }) => {
    const entradasInput = page.getByPlaceholder('Ex.: 1, 5, 7');
    await entradasInput.fill('42');
    await entradasInput.blur();

    await expect(page.getByRole('button', { name: 'Remover entrada 42' })).toBeVisible();
    await expect(entradasInput).toHaveValue('');
  });

  test('registra chip de entradas ao digitar caractere não numérico', async ({ page }) => {
    const entradasInput = page.getByPlaceholder('Ex.: 1, 5, 7');
    await entradasInput.fill('73');
    await entradasInput.press(' ');

    await expect(page.getByRole('button', { name: 'Remover entrada 73' })).toBeVisible();
    await expect(entradasInput).toHaveValue('');
  });

  test('aceita colagem com notação de colchetes', async ({ page }) => {
    await preencherEntradas(page, '[1, 5, 7]');

    await expect(page.getByRole('button', { name: 'Remover entrada 1' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Remover entrada 5' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Remover entrada 7' })).toBeVisible();
  });

  test('valida quantidade de valores em E e S igual a N', async ({ page }) => {
    await page.getByLabel('Número de passageiros (N)').fill('3');
    await preencherEntradas(page, '1, 5');
    await preencherSaidas(page, '9, 13, 12, 20');

    await page.getByRole('button', { name: 'Calcular lotação máxima' }).click();

    await expect(page.getByText('A lista de entradas (E) precisa ter 3 números.')).toBeVisible();
    await expect(page.getByText('A lista de saídas (S) precisa ter 3 números.')).toBeVisible();
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
