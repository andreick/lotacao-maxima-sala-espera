<project-overview>
## Contexto

O cliente da Atech solicitou uma avaliação da capacidade necessária de um aeroporto para que atenda na sala de espera todos os passageiros até que os mesmos tomem o seu voo. Isso porque o mal dimensionamento já trouxe transtornos operacionais e o cliente está fazendo um estudo de redimensionamento das salas de espera.

Em outras palavras, o cliente gostaria de saber qual foi a lotação máxima de uma sala de espera dado o horário de entrada e saída de cada um dos passageiros naquela sala controlada.

A nossa equipe de negócios, que trata com o cliente, solicitou ao time técnico ajuda na solução desse problema. Nossa equipe técnica extraiu os dados do horário de entrada e de saída de cada passageiro no último período em diversas salas a partir dos dados fornecidos pelo cliente. Além disso, fez um trabalho de transformação dos dados de data a fim de facilitar a análise, de modo que os horários de entrada e saída de cada passageiro foram transformados em números entre 1 e 1000.

Porém, para finalizar a análise foi solicitado a você o desenvolvimento do algoritmo que mostre a solução para cada conjunto de dados. Além disso, a solução será apresentada para uma pessoal muito importante do cliente, portanto precisamos de uma interface que sirva de apoio para mostrar a excelência da Atech nas soluções, até mesmo nas mais simples e pontuais.

## Problema técnico

Dado um número **N** de passageiros (1 <= N <= 100) que passaram pela sala de espera, uma lista **E** com os números do momento de entrada de cada passageiro e uma lista **S** com os números do momento de saída de cada passageiro, você deve calcular qual foi o número máximo de passageiros simultâneos naquela sala de espera durante todo o período.

Considere que se um passageiro entra no mesmo momento que outro sai, então naquele instante só é contabilizada uma pessoa para a lotação da sala.

## Exemplos

Seja **N = 3**, **E = [1,5,7]** e **S = [9,13,12]**, sabemos que o número máximo de passageiros simultaneamente na sala foi **3**, pois o primeiro passageiro entrou no momento 1 e saiu no momento 9, o segundo passageiro entrou no momento 5 e saiu no momento 13 e o terceiro passageiro entrou no momento 7 e saiu no momento 12; portanto entre o momento 7 e 8 estavam todos os 3 passageiros simultaneamente na sala.

Seja **N = 4**, **E = [1,4,8,10]** e **S = [3,8,10,17]**, sabemos que o número máximo de passageiros simultaneamente na sala foi **1**, pois o primeiro passageiro saiu antes do segundo chegar; o segundo saiu no mesmo momento que o terceiro chegou; e o terceiro saiu no mesmo momento que o quarto chegou; portanto em nenhum momento houve mais de um passageiro simultaneamente na sala de espera.

## Objetivos

1. Criar uma interface web para inserção dos dados e para visualização da solução.
2. Disponibilizar na interface uma explicação da solução do problema para pessoas leigas, ou seja, uma explicação cujo formato seja pensado para a leitura do cliente que iremos apresentar a solução, não da equipe técnica.
3. Criar uma API REST que receba os dados e retorne a solução. Note que deverão ser recebidos obrigatoriamente os valores N, E e S conforme a descrição do problema técnico.
4. Escrever um texto explicativo do algoritmo em forma técnica, cujo formato seja pensado para a leitura de uma equipe técnica de desenvolvedores, a ser disponibilizada junto ao código.
</project-overviews>

<project-stack>
## Backend
- Linguagem: Java 25
- Framework: Spring Boot 4.0.6

## Frontend
- Linguagem: TypeScript 5
- Framework: Angular 21.2.8
- Biblioteca de componentes: Angular Material
</project-stack>

<project-documentation>
`docs/solution-overview.md` - Leitura obrigatória para entender a solução proposta em alto nível, com foco na visão geral e no fluxo de informação entre os componentes.
`docs/system-architecture.md` - Leitura obrigatória para entender a arquitetura do sistema, os containers envolvidos e a comunicação entre eles.
`docs/algorithm-design.md` - Leitura obrigatória para entender o algoritmo utilizado para calcular a lotação máxima, incluindo detalhes técnicos e justificativas de design.
</project-documentation>

<project-openapi>
`backend/src/main/resources/static/openapi.yaml` - Leitura obrigatória para entender o contrato da API REST.
</project-openapi>
