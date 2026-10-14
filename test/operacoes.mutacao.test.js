const {
  divisao, raizQuadrada, fatorial, mediaArray, maximoArray, minimoArray,
  isPar, isImpar, isPrimo, produtoArray, clamp, isDivisivel,
  celsiusParaFahrenheit, fahrenheitParaCelsius, inverso,
  isMaiorQue, isMenorQue, isEqual, medianaArray
} = require('../src/operacoes');

// Testes adicionados a partir da análise de mutação (StrykerJS).
// Cada bloco indica os mutantes sobreviventes que ele mata.

describe('divisao', () => {
  // L8 StringLiteral: mensagem trocada por ""
  test('lança erro com a mensagem exata ao dividir por zero', () => {
    expect(() => divisao(5, 0)).toThrow('Divisão por zero não é permitida.');
  });
});

describe('raizQuadrada', () => {
  // L13 ConditionalExpression (n < 0 -> false) e StringLiteral
  test('lança erro com a mensagem exata para número negativo', () => {
    expect(() => raizQuadrada(-4)).toThrow('Não é possível calcular a raiz quadrada de um número negativo.');
  });
  // L13 EqualityOperator (n < 0 -> n <= 0): zero é o valor de fronteira
  test('retorna 0 para a raiz de zero, sem lançar erro', () => {
    expect(raizQuadrada(0)).toBe(0);
  });
});

describe('fatorial', () => {
  // L18 ConditionalExpression (n < 0 -> false) e StringLiteral
  test('lança erro com a mensagem exata para número negativo', () => {
    expect(() => fatorial(-1)).toThrow('Fatorial não é definido para números negativos.');
  });
  // L18 EqualityOperator (n < 0 -> n <= 0)
  test('retorna 1 para fatorial de 0', () => {
    expect(fatorial(0)).toBe(1);
  });
  test('retorna 1 para fatorial de 1', () => {
    expect(fatorial(1)).toBe(1);
  });
  test('retorna 2 para fatorial de 2 (primeira iteração do laço)', () => {
    expect(fatorial(2)).toBe(2);
  });
  test('retorna 120 para fatorial de 5', () => {
    expect(fatorial(5)).toBe(120);
  });
});

describe('mediaArray', () => {
  // L25 ConditionalExpression (length === 0 -> false): sem o if, 0/0 = NaN
  test('retorna 0 para array vazio', () => {
    expect(mediaArray([])).toBe(0);
  });
  test('calcula média não inteira', () => {
    expect(mediaArray([1, 2])).toBe(1.5);
  });
});

describe('maximoArray e minimoArray', () => {
  // L34 / L38 ConditionalExpression e StringLiteral
  // (as mensagens no código-fonte contêm a palavra cirílica "не")
  test('maximoArray lança erro com a mensagem exata para array vazio', () => {
    expect(() => maximoArray([])).toThrow('Array vazio не possui valor máximo.');
  });
  test('minimoArray lança erro com a mensagem exata para array vazio', () => {
    expect(() => minimoArray([])).toThrow('Array vazio не possui valor mínimo.');
  });
  test('funcionam com números negativos', () => {
    expect(maximoArray([-5, -1, -9])).toBe(-1);
    expect(minimoArray([-5, -1, -9])).toBe(-9);
  });
});

describe('isPar e isImpar', () => {
  // L43 ConditionalExpression (-> true)
  test('isPar retorna false para número ímpar', () => {
    expect(isPar(7)).toBe(false);
  });
  test('isPar retorna true para zero', () => {
    expect(isPar(0)).toBe(true);
  });
  // L44 ConditionalExpression (-> true) e ArithmeticOperator (n % 2 -> n * 2)
  test('isImpar retorna false para número par', () => {
    expect(isImpar(4)).toBe(false);
  });
  test('isImpar retorna false para zero', () => {
    expect(isImpar(0)).toBe(false);
  });
  test('isImpar retorna true para ímpar negativo', () => {
    expect(isImpar(-3)).toBe(true);
  });
});

describe('isPrimo', () => {
  // L73 ConditionalExpression (n <= 1 -> false), EqualityOperator (n < 1) e BooleanLiteral
  test('retorna false para 1 (fronteira de n <= 1)', () => {
    expect(isPrimo(1)).toBe(false);
  });
  test('retorna false para 0 e negativos', () => {
    expect(isPrimo(0)).toBe(false);
    expect(isPrimo(-7)).toBe(false);
  });
  // L74 laço removido/condição invertida; L75 condição -> false, n % i -> n * i, BooleanLiteral
  test('retorna false para compostos', () => {
    expect(isPrimo(4)).toBe(false);
    expect(isPrimo(9)).toBe(false);
    expect(isPrimo(15)).toBe(false);
  });
  test('retorna true para 2, o menor primo', () => {
    expect(isPrimo(2)).toBe(true);
  });
  test('retorna true para primo maior', () => {
    expect(isPrimo(13)).toBe(true);
  });
});

describe('produtoArray', () => {
  test('retorna 1 para array vazio', () => {
    expect(produtoArray([])).toBe(1);
  });
  test('retorna 0 quando há um zero no array', () => {
    expect(produtoArray([5, 0, 3])).toBe(0);
  });
});

describe('clamp', () => {
  // L88 ConditionalExpression (valor < min -> false)
  test('retorna min quando valor está abaixo do intervalo', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });
  // L89 ConditionalExpression (valor > max -> false)
  test('retorna max quando valor está acima do intervalo', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });
  test('retorna o próprio valor nas fronteiras', () => {
    expect(clamp(0, 0, 10)).toBe(0);
    expect(clamp(10, 0, 10)).toBe(10);
  });
  // L88 EqualityOperator (valor < min -> valor <= min) e
  // L89 EqualityOperator (valor > max -> valor >= max).
  // Com valores numéricos comuns, valor === min devolve o mesmo número nos dois
  // casos. A única diferença observável é com zero com sinal: 0 e -0 são ===,
  // mas toBe usa Object.is e os distingue. O contrato é "devolver o próprio
  // valor quando ele está dentro do intervalo (inclusive nas fronteiras)".
  test('devolve o próprio valor (não o limite) quando valor é igual a min', () => {
    expect(clamp(-0, 0, 10)).toBe(-0);
  });
  test('devolve o próprio valor (não o limite) quando valor é igual a max', () => {
    expect(clamp(0, -10, -0)).toBe(0);
  });
});

describe('isDivisivel', () => {
  // L92 ConditionalExpression (-> true)
  test('retorna false quando não é divisível', () => {
    expect(isDivisivel(10, 3)).toBe(false);
  });
});

describe('conversões de temperatura', () => {
  // L93 ArithmeticOperator (* 9/5 -> * 9 * 5 e * 9 -> / 9): com 0 °C as contas coincidem
  test('converte 100 °C para 212 °F', () => {
    expect(celsiusParaFahrenheit(100)).toBe(212);
  });
  test('converte -40 °C para -40 °F', () => {
    expect(celsiusParaFahrenheit(-40)).toBe(-40);
  });
  // L94 ArithmeticOperator (* 5 -> / 5 e 5/9 -> 5 * 9): com 32 °F as contas coincidem
  test('converte 212 °F para 100 °C', () => {
    expect(fahrenheitParaCelsius(212)).toBe(100);
  });
  test('converte -40 °F para -40 °C', () => {
    expect(fahrenheitParaCelsius(-40)).toBe(-40);
  });
});

describe('inverso', () => {
  // L96 ConditionalExpression (-> false) e StringLiteral: sem o if, 1/0 = Infinity
  test('lança erro com a mensagem exata para zero', () => {
    expect(() => inverso(0)).toThrow('Não é possível inverter o número zero.');
  });
  test('calcula o inverso de número negativo', () => {
    expect(inverso(-2)).toBe(-0.5);
  });
});

describe('comparações', () => {
  // L104 ConditionalExpression (-> true) e EqualityOperator (a > b -> a >= b)
  test('isMaiorQue retorna false quando a < b', () => {
    expect(isMaiorQue(5, 10)).toBe(false);
  });
  test('isMaiorQue retorna false para valores iguais', () => {
    expect(isMaiorQue(5, 5)).toBe(false);
  });
  // L105 ConditionalExpression (-> true) e EqualityOperator (a < b -> a <= b)
  test('isMenorQue retorna false quando a > b', () => {
    expect(isMenorQue(10, 5)).toBe(false);
  });
  test('isMenorQue retorna false para valores iguais', () => {
    expect(isMenorQue(5, 5)).toBe(false);
  });
  // L106 ConditionalExpression (-> true)
  test('isEqual retorna false para valores diferentes', () => {
    expect(isEqual(7, 8)).toBe(false);
  });
});

describe('medianaArray', () => {
  // L108 ConditionalExpression e StringLiteral
  test('lança erro com a mensagem exata para array vazio', () => {
    expect(() => medianaArray([])).toThrow('Array vazio не possui mediana.');
  });
  // L109 MethodExpression (sort removido), ArrowFunction (() => undefined) e
  // ArithmeticOperator (a - b -> a + b): todos deixam o array desordenado
  test('ordena antes de calcular a mediana (tamanho ímpar)', () => {
    expect(medianaArray([5, 1, 3])).toBe(3);
  });
  test('ordena numericamente, não lexicograficamente', () => {
    expect(medianaArray([10, 9, 1])).toBe(9);
  });
  // L111 ConditionalExpression (-> false), ArithmeticOperator (% -> *), BlockStatement;
  // L112 ArithmeticOperator (/ -> *, + -> -, mid - 1 -> mid + 1)
  test('calcula a mediana de array par como média dos dois centrais', () => {
    expect(medianaArray([4, 1, 3, 2])).toBe(2.5);
  });
  test('calcula a mediana de array par com dois elementos', () => {
    expect(medianaArray([10, 20])).toBe(15);
  });
  test('não altera o array recebido', () => {
    const entrada = [3, 1, 2];
    medianaArray(entrada);
    expect(entrada).toEqual([3, 1, 2]);
  });
});
