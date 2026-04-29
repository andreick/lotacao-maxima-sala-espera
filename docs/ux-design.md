# Design de UX — Lotação Máxima da Sala de Espera

## Visão geral
A interface foi pensada para um público leigo, com foco em clareza e objetividade. O usuário deve conseguir inserir os dados, clicar para calcular e entender o resultado sem precisar conhecer termos técnicos.

## Funcionalidades principais
- **Campos simples para inserção de N, E e S**
  - **N (número de passageiros):** campo numérico.
  - **E (momentos de entrada):** lista de números.
  - **S (momentos de saída):** lista de números.
- **Botão de envio que dispara o cálculo**
  - Ação principal da tela: “Calcular lotação máxima”.
- **Exibição clara do resultado numérico**
  - Apresentar o valor final como destaque visual (ex.: “Lotação máxima: 3 pessoas”).
  - Manter o resultado sempre no mesmo local da tela para facilitar leitura.
- **Texto explicativo em linguagem acessível**
  - Explica o que é “lotação máxima” e como o valor é obtido, sem termos técnicos.

## Estrutura da tela (conteúdo e hierarquia)
1. **Título curto**
   - “Lotação máxima na sala de espera”
2. **Descrição de uma frase (contexto)**
   - “Informe entradas e saídas para descobrir qual foi o maior número de pessoas ao mesmo tempo na sala.”
3. **Formulário de dados**
   - Campo **N**
   - Campo **E** (lista)
   - Campo **S** (lista)
   - Ajuda rápida abaixo de E e S: “Cole ou digite N números. Separe por vírgula, espaço ou por linha (ex.: `1, 5, 7` ou `1 5 7` ou `1↵5↵7`).”
   - Feedback logo abaixo do campo: “Valores detectados: X de N”.
4. **Botão principal**
   - “Calcular lotação máxima”
5. **Área de resultado**
   - Card/caixa com:
     - Resultado numérico em destaque
     - Frase de reforço: “Maior quantidade de pessoas simultaneamente na sala.”
6. **Bloco: explicação para o cliente**
   - Texto simples, direto e com exemplos curtos.

## Comportamento e validações (mensagens amigáveis)
- **Obrigatoriedade:** N, E e S são necessários para calcular.
- **Consistência de quantidade:** E e S devem ter exatamente **N** valores.
- **Valores inválidos:** aceitar apenas números inteiros.
- **Separadores flexíveis:** permitir vírgula, espaço e quebra de linha (facilita colar dados de planilhas e mensagens).
- **Ordem e sentido:** para cada passageiro, a saída deve ocorrer no mesmo momento ou depois da entrada.
- **Mensagens (tom leigo):**
  - “Confira o número de passageiros (N).”
  - “A lista de entradas (E) precisa ter N números.”
  - “A lista de saídas (S) precisa ter N números.”
  - “Encontramos uma saída antes da entrada. Revise os valores.”

## Estados da interface
- **Estado inicial:** formulário vazio com exemplos nos campos (placeholders).
- **Carregando (após clicar em calcular):** botão desabilitado e indicador “Calculando…”.
- **Sucesso:** exibe “Lotação máxima: X pessoas” e mantém os dados inseridos.
- **Erro de validação:** destaca o campo com problema e mostra mensagem curta.
- **Erro inesperado (API indisponível, etc.):**
  - Mensagem: “Não foi possível calcular agora. Tente novamente em instantes.”

## Texto explicativo (linguagem acessível)

### O que significa “lotação máxima”
“Lotação máxima” é **o maior número de pessoas que ficaram ao mesmo tempo** dentro da sala de espera, em algum momento do período analisado.

### Como o valor foi determinado (sem termos técnicos)
Com base nos horários informados:
- Cada passageiro **entra** em um momento (E) e **sai** em outro momento (S).
- A sala vai “ganhando” pessoas quando alguém entra e vai “perdendo” pessoas quando alguém sai.
- O resultado é o **maior número de pessoas presentes ao mesmo tempo** em qualquer instante.

Regra importante (para evitar dúvida):
- Se uma pessoa **sai exatamente no mesmo momento** em que outra **entra**, consideramos que **não há aumento** naquele instante — conta como se a troca tivesse acontecido sem a sala ficar mais cheia.

### Por que isso ajuda
Esse número mostra a **capacidade mínima** que a sala precisaria suportar para acomodar todos com segurança e conforto, considerando o pior momento observado.

## Microcopy (rótulos e ajuda)
- **N:** “Número de passageiros (N)”
- **E:** “Entradas (E)” — ajuda: “Cole ou digite N números (vírgula, espaço ou uma linha por número).”
- **S:** “Saídas (S)” — ajuda: “Cole ou digite N números (vírgula, espaço ou uma linha por número).”
- **Botão:** “Calcular lotação máxima”
- **Resultado:** “Lotação máxima: {X} pessoas”

## Acessibilidade e clareza
- Linguagem simples, sem jargões.
- Contraste adequado para leitura do resultado.
- Feedback imediato de erro no campo correto.
- Tecla Enter pode acionar o cálculo quando o foco estiver no formulário.
