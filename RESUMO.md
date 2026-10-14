# Resumo: Teste de Mutação com StrykerJS

## 1. Situação inicial

| Métrica | Inicial | Final |
|---|---|---|
| Testes | 50 | 98 |
| Cobertura: Statements | 85,41% | 100% |
| Cobertura: Branches | 58,82% | 100% |
| Cobertura: Functions | 100% | 100% |
| Cobertura: Lines | 98,64% | 100% |
| **Mutation score** | **73,71%** (157/213) | **100%** (201/201)* |
| Mutantes sobreviventes | 44 | 0 |

\* Antes de excluir os equivalentes: 97,65% (208/213), com 5 sobreviventes equivalentes.
| Mutantes sem cobertura | 12 | 0 |

**Cobertura × mutation score.** A cobertura mede se uma linha foi *executada* durante os testes. O mutation score mede se os testes *percebem* quando aquela linha está errada. A suíte original executava 98,64% das linhas, mas quase sempre com um único valor "feliz" e sem testar fronteiras. Por exemplo, `celsiusParaFahrenheit(0)`, `isPrimo(7)` e `medianaArray([1,2,3,4,5])`. Por isso 44 versões alteradas do código continuavam passando. Cobertura alta é necessária, mas não suficiente: ela não diz nada sobre a qualidade das asserções.

## 2. Os 3 sobreviventes mais interessantes da primeira execução

### a) `isPrimo`: laço inteiro removido (L74, BlockStatement)

```js
// original
for (let i = 2; i < n; i++) { if (n % i === 0) return false; }
// mutante
{}
```

**Por que sobreviveu:** o único teste era `isPrimo(7)`, e 7 é primo. Sem o laço, a função devolve `true` para qualquer `n > 1`, e o teste continuava verde. A suíte nunca verificava um número composto. Isso também explica por que sobreviviam `n % i → n * i`, `i < n → i >= n` e `n <= 1 → n < 1`.

**Teste que mata:**

```js
test('retorna false para compostos', () => {
  expect(isPrimo(4)).toBe(false);
  expect(isPrimo(9)).toBe(false);
  expect(isPrimo(15)).toBe(false);
});
test('retorna false para 1 (fronteira de n <= 1)', () => {
  expect(isPrimo(1)).toBe(false);
});
```

**Por que é eficaz:** força o caminho `return false` dentro do laço, que nunca era executado. Com o laço removido ou com `n * i`, a função devolve `true` para 4, 9 e 15. O caso `1` é a fronteira exata de `<=` contra `<`. O 9 foi escolhido de propósito: ele não é par, então só é detectado se o laço chegar a `i = 3`.

### b) `medianaArray`: ordenação removida (L109, MethodExpression)

```js
// original
const sorted = [...numeros].sort((a, b) => a - b);
// mutante
const sorted = [...numeros];
```

**Por que sobreviveu:** o teste usava `[1, 2, 3, 4, 5]`, que **já está ordenado**. Ordenar ou não dá no mesmo. Também sobreviviam o comparador trocado por `() => undefined` e `a - b → a + b`. Além disso, nenhum teste usava array de tamanho par, então o ramo `(sorted[mid-1] + sorted[mid]) / 2` nem era executado (4 mutantes sem cobertura).

**Teste que mata:**

```js
test('ordena antes de calcular a mediana (tamanho ímpar)', () => {
  expect(medianaArray([5, 1, 3])).toBe(3);   // sem sort: elemento do meio = 1
});
test('ordena numericamente, não lexicograficamente', () => {
  expect(medianaArray([10, 9, 1])).toBe(9);
});
test('calcula a mediana de array par como média dos dois centrais', () => {
  expect(medianaArray([4, 1, 3, 2])).toBe(2.5);
});
```

**Por que é eficaz:** com entrada desordenada, o elemento do meio *antes* de ordenar é diferente da mediana. Os três mutantes de ordenação mantêm a ordem original (verificado no V8) e devolvem 1, 9 e 2. O caso par cobre o segundo ramo, e o valor 2,5 distingue `/ 2` de `* 2`, `+` de `-` e `mid - 1` de `mid + 1`.

### c) `celsiusParaFahrenheit`: operador aritmético trocado (L93, ArithmeticOperator)

```js
// original
return (celsius * 9/5) + 32;
// mutantes
return (celsius * 9 * 5) + 32;
return (celsius / 9 / 5) + 32;
```

**Por que sobreviveu:** o teste era `celsiusParaFahrenheit(0)`. Zero multiplicado ou dividido por qualquer coisa continua zero, então todos os mutantes devolvem 32. O mesmo acontecia com `fahrenheitParaCelsius(32)`. É o caso clássico de entrada que "anula" o operador.

**Teste que mata:**

```js
test('converte 100 °C para 212 °F', () => {
  expect(celsiusParaFahrenheit(100)).toBe(212);   // mutantes: 4532 e ~34,2
});
test('converte 212 °F para 100 °C', () => {
  expect(fahrenheitParaCelsius(212)).toBe(100);   // mutantes: 4 e 8100
});
```

**Por que é eficaz:** com um valor diferente de zero, cada operador produz um resultado diferente. A asserção usa `toBe` com o valor exato, então qualquer troca de `*` por `/` é detectada.

### Outros padrões corrigidos

- **Mensagens de erro:** `toThrow()` sem mensagem não mata mutantes que trocam a string por `""`. O teste 4 original passou a usar `toThrow('Divisão por zero não é permitida.')`, e todos os novos testes de erro usam a mensagem exata.
- **Só o caminho `true` testado:** `isPar`, `isImpar`, `isDivisivel`, `isMaiorQue`, `isMenorQue` e `isEqual` só eram testados com resultado `true`, então o mutante `return true` sobrevivia. Foram adicionados casos `false` e de valores iguais (`isMaiorQue(5, 5)`), que distinguem `>` de `>=`.
- **Fronteira zero:** `raizQuadrada(0)` e `fatorial(0)` distinguem `n < 0` de `n <= 0`.
- **`clamp` nas fronteiras:** os mutantes `valor < min → valor <= min` e `valor > max → valor >= max` só diferem quando `valor === min`. Com números comuns, os dois devolvem o mesmo número. A única diferença observável é com zero com sinal: `clamp(-0, 0, 10)` devolve `-0` no original e `0` no mutante, e `toBe` (que usa `Object.is`) distingue os dois. O teste deixa explícito o contrato "devolver o próprio valor quando está dentro do intervalo". Esses mutantes **não** são equivalentes, mas são os que mais se aproximam disso.

## 3. Mutation score final

- **Antes:** 73,71% (154 mortos + 3 timeouts de 213; 44 sobreviventes e 12 sem cobertura)
- **Depois:** **97,65%** (205 mortos + 3 timeouts de 213; 5 sobreviventes)
- **Excluindo os equivalentes:** 208/208 = **100%** dos mutantes não equivalentes foram mortos.

Sem excluir nada, o máximo possível era 208/213 = 97,65%, porque 5 mutantes são equivalentes. Como `src/` não podia ser alterado, as linhas 19 e 84 (onde estão os equivalentes) foram excluídas no `mutate` do `stryker.conf.json`:

```json
"mutate": ["src/operacoes.js:1-18", "src/operacoes.js:20-83", "src/operacoes.js:85-131"]
```

- **Score final:** **100%** (198 mortos + 3 timeouts de 201). A exclusão removeu 12 mutantes: os 5 equivalentes e outros 7 dessas linhas que já eram mortos.

## 4. Mutantes equivalentes

Os cinco foram confirmados por análise e também por um teste comparativo. O original e cada mutante foram executados em 386 entradas, incluindo `0`, `-0`, `1`, decimais, `NaN`, strings, `null`, `undefined` e arrays. **Nenhuma diferença foi encontrada.**

| # | Linha | Mutador | Original → Mutante | Por que é equivalente |
|---|---|---|---|---|
| 1 | L19 | ConditionalExpression | `n === 0 \|\| n === 1` → `false` | Sem o atalho, o laço `for (i = 2; i <= n; ...)` não executa para `n = 0` nem `n = 1`, e `resultado` continua `1`. O `if` é só uma otimização. |
| 2 | L19 | LogicalOperator | `n === 0 \|\| n === 1` → `n === 0 && n === 1` | A condição vira sempre `false`, o que é igual ao item 1. |
| 3 | L19 | ConditionalExpression | `n === 0` → `false` | Para `n = 0`, o laço também devolve `1`. |
| 4 | L19 | ConditionalExpression | `n === 1` → `false` | Para `n = 1`, o laço também devolve `1`. |
| 5 | L84 | ConditionalExpression | `numeros.length === 0` → `false` | `[].reduce(fn, 1)` devolve o valor inicial `1`, igual ao `return 1` do `if`. |

São guardas redundantes no código-fonte. A forma correta de eliminá-los seria remover essas linhas de `src/` (o que não era permitido neste trabalho) ou marcá-los com `// Stryker disable next-line`, que também exige editar `src/`.

## Observação sobre o código-fonte

As mensagens de erro de `maximoArray`, `minimoArray` e `medianaArray` contêm a palavra cirílica **"не"** em vez de "não" (por exemplo, `'Array vazio не possui valor máximo.'`). Como `src/` não podia ser alterado, os testes verificam a mensagem exatamente como está. Vale corrigir no código e nos testes depois.
