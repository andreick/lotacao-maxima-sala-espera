# Design do Algoritmo — Lotação Máxima da Sala de Espera

## 1) Objetivo
Este documento descreve, em termos técnicos, o algoritmo utilizado para calcular a **lotação máxima** (maior número de passageiros simultaneamente presentes) em uma sala de espera, dado o histórico de **instantes numéricos** de entrada e saída.

## 2) Descrição do problema em termos computacionais

### Entradas
- `quantidadePassageiros`: número de passageiros, com `1 <= quantidadePassageiros <= 100`.
- `temposEntrada[0..quantidadePassageiros-1]`: lista de instantes de **entrada** (inteiros, p.ex. `1..1000`).
- `temposSaida[0..quantidadePassageiros-1]`: lista de instantes de **saída** (inteiros, p.ex. `1..1000`).

Cada passageiro `i` ocupa a sala do instante `temposEntrada[i]` até o instante `temposSaida[i]`.

### Saída
- Um inteiro `M` representando a **lotação máxima** observada ao longo do tempo.

### Regra de negócio (empate de instante)
> **Se um passageiro entra no mesmo instante em que outro sai, a lotação naquele instante não aumenta.**

Computacionalmente, isso equivale a dizer que, para um mesmo instante `t`, devemos processar **todas as saídas antes** de processar **qualquer entrada**.

### Observações sobre validação
A API/UI deve validar consistência básica (por exemplo, `len(temposEntrada)=len(temposSaida)=quantidadePassageiros` e `temposEntrada[i] <= temposSaida[i]`). O algoritmo assume dados válidos e foca no cálculo da lotação máxima.

## 3) Abordagem adotada (Sweep Line / eventos)

### Ideia central
Transformar cada entrada/saída em um **evento temporal** e “varrer” a linha do tempo em ordem crescente. Mantemos um contador `ocupacaoAtual` que representa quantas pessoas estão na sala **após** processar os eventos até aquele ponto.

### Representação de eventos
Para cada passageiro `i`, criamos dois eventos:
- Evento de entrada: `(tempo = temposEntrada[i], tipo = ENTRADA, delta = +1)`
- Evento de saída: `(tempo = temposSaida[i], tipo = SAIDA,   delta = -1)`

### Ordenação dos eventos
Ordenamos os `2N` eventos por:
1. `tempo` crescente
2. `tipo` em caso de empate, com a seguinte prioridade:
   - **SAIDA antes de ENTRADA** (para respeitar a regra “entra no mesmo momento que sai”)

Ou seja, para o mesmo `tempo`, aplicamos primeiro `-1` (saídas) e só depois `+1` (entradas).

## 4) Algoritmo (passo a passo)

1. Construir uma lista `eventos` com `2 * quantidadePassageiros` eventos (entradas e saídas).
2. Ordenar `eventos` por `(tempo, prioridadeTipo)` onde `SAIDA < ENTRADA`.
3. Inicializar:
   - `ocupacaoAtual = 0`
   - `ocupacaoMaxima = 0`
4. Para cada evento na ordem:
   - `ocupacaoAtual += delta`
   - `ocupacaoMaxima = max(ocupacaoMaxima, ocupacaoAtual)`
5. Retornar `ocupacaoMaxima`.

### Pseudocódigo
```text
entrada: quantidadePassageiros, temposEntrada[0..quantidadePassageiros-1], temposSaida[0..quantidadePassageiros-1]

struct Evento { tempo: int, tipo: {SAIDA, ENTRADA}, delta: int }

eventos = []
para i em 0..quantidadePassageiros-1:
  eventos.add(Evento(temposEntrada[i], ENTRADA, +1))
  eventos.add(Evento(temposSaida[i], SAIDA,   -1))

ordenar eventos por:
  (tempo crescente,
   tipo com SAIDA antes de ENTRADA)

ocupacaoAtual = 0
ocupacaoMaxima = 0

para ev em eventos:
  ocupacaoAtual = ocupacaoAtual + ev.delta
  ocupacaoMaxima = max(ocupacaoMaxima, ocupacaoAtual)

retornar ocupacaoMaxima
```

## 5) Tratamento explícito do caso “entra no mesmo momento que sai”

O comportamento desejado é:
- Se existe `temposSaida[a] == temposEntrada[b] == t`, então **no instante `t`** a pessoa `a` deve ser considerada como tendo saído **antes** de `b` entrar.

Na prática, isso é garantido pela ordenação (critério de desempate):
- Para o mesmo `tempo`, processamos primeiro os eventos de **SAIDA** (delta `-1`) e só depois os de **ENTRADA** (delta `+1`).

Consequência: não ocorre um “pico artificial” de ocupação em instantes onde há simultaneamente saídas e entradas.

## 6) Complexidade de tempo e espaço

- Construção dos eventos: `O(N)`
- Ordenação de `2N` eventos: `O(N log N)`
- Varredura (sweep): `O(N)`

**Tempo total:** `O(N log N)`

**Espaço adicional:** `O(N)` para armazenar a lista de eventos.

> Observação: dado `quantidadePassageiros <= 100`, qualquer abordagem eficiente é suficiente. Ainda assim, esta solução é a forma clássica, escalável e fácil de auditar.

## 7) Por que essa abordagem foi escolhida

1. **Correção clara e auditável**: o modelo por eventos torna explícita a regra de negócio (empate) via ordenação.
2. **Implementação simples**: poucas estruturas e lógica linear após ordenação.
3. **Determinismo**: mesma entrada → mesma sequência de eventos ordenados → mesma saída.
