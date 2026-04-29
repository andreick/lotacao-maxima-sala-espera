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
   - Ajuda rápida abaixo de E e S: “Adicione um número por vez ou cole vários de uma vez.”
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
- **Valores inválidos:** apenas números inteiros entre 1 e 1000 são aceitos. Ao tentar adicionar um valor inválido nos campos E ou S, o erro é exibido imediatamente no campo, sem necessidade de clicar em calcular.
- **Colagem flexível:** ao colar valores nos campos E e S, vírgula, espaço e quebra de linha são aceitos como separadores (facilita colar dados de planilhas e mensagens). Caracteres não numéricos no início e no fim do texto (ex.: colchetes em `[1, 5, 7]`) são descartados automaticamente. Valores inválidos ou fora do intervalo são ignorados e o usuário é avisado.
- **Ordem e sentido:** para cada passageiro, a saída deve ocorrer no mesmo momento ou depois da entrada.
- **Momento de exibição:** as mensagens de validação do formulário (N, E e S) só aparecem após o usuário clicar em “Calcular lotação máxima”. Erros de valor individual nos chips de E e S (ex.: valor fora do intervalo) ainda são exibidos imediatamente.
- **Mensagens (tom leigo):**
  - “Informe um número inteiro entre 1 e 1000.” (exibido imediatamente ao tentar adicionar um chip inválido)
  - “Número de passageiros (N) obrigatório.”
  - “A lista de entradas (E) precisa ter N números.” (quando N ainda não está preenchido)
  - “A lista de entradas (E) precisa ter 3 números.” (exemplo quando N = 3)
  - “A lista de saídas (S) precisa ter N números.” / “A lista de saídas (S) precisa ter 3 números.”
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
- **E:** “Entradas (E)” — ajuda: “Adicione um número por vez ou cole vários de uma vez.”
- **S:** “Saídas (S)” — ajuda: “Adicione um número por vez ou cole vários de uma vez.”
- **Botão:** “Calcular lotação máxima”
- **Resultado:** “Lotação máxima: {X} pessoas”

## Acessibilidade e clareza
- Linguagem simples, sem jargões.
- Contraste adequado para leitura do resultado.
- Feedback imediato de erro no campo correto.
- Tecla Enter ou vírgula confirmam cada número adicionado nos campos E e S. Perder o foco no campo também confirma o valor pendente. Digitar qualquer caractere não numérico (ex.: espaço) também registra o chip imediatamente.
