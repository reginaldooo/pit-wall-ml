// Math track: static multiple-choice rows (bank/math-mcq.js) plus numeric generators.
// A generator is a template; materialize(template, seed) builds one concrete numeric question,
// so a saved seed always replays the same numbers.
;(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./bank/math-mcq.js'))
  else root.MATH_DATA = factory(root.MathBank || [])
})(typeof self !== 'undefined' ? self : this, function (rows) {
  const modules = [
    { id: 'x01', name: 'Linear algebra' },
    { id: 'x02', name: 'Calculus' },
    { id: 'x03', name: 'Probability and statistics' },
    { id: 'x04', name: 'Optimization' },
    { id: 'x05', name: 'ML formulas' },
    { id: 'x06', name: 'Evaluation metrics' },
    { id: 'x07', name: 'Discrete math' },
  ]
  const DEFAULT_TOLERANCE = 0.01

  function rngFrom(seed) {
    let a = seed >>> 0
    return () => {
      a = (a + 0x6d2b79f5) >>> 0
      let t = a
      t = Math.imul(t ^ (t >>> 15), t | 1)
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
  }
  const int = (rng, lo, hi) => lo + Math.floor(rng() * (hi - lo + 1))
  const ints = (rng, n, lo, hi) => Array.from({ length: n }, () => int(rng, lo, hi))
  const tex = (xs) => `[${xs.join(', ')}]`
  const round = (x, d = 4) => Number(x.toFixed(d))
  const sum = (xs) => xs.reduce((s, x) => s + x, 0)
  const dot = (a, b) => sum(a.map((x, i) => x * b[i]))
  const choose = (n, k) => { let r = 1; for (let i = 1; i <= k; i += 1) r = (r * (n - k + i)) / i; return Math.round(r) }
  const sigmoid = (z) => 1 / (1 + Math.exp(-z))
  const signed = (n) => (n < 0 ? `- ${-n}` : `+ ${n}`)

  // Each generator returns { q: en, answer, tolerance?, explain: en }.
  const generators = [
    { id: 'x01-g01', module: 'x01', level: 1, ref: '06-math-formulas#a-dot-product', gen(rng) {
      const a = ints(rng, 3, -4, 6); const b = ints(rng, 3, -4, 6)
      const q = `$A=${tex(a)}$, $B=${tex(b)}$. Compute $A\\cdot B$.`
      return { q: q, answer: dot(a, b),
        explain: `Multiply pairs and add: ${a.map((x, i) => `${x}·${b[i]}`).join(' + ')} = ${dot(a, b)}.` }
    } },
    { id: 'x01-g02', module: 'x01', level: 2, ref: '06-math-formulas#b-matrix-multiplication', gen(rng) {
      const A = [ints(rng, 2, -3, 5), ints(rng, 2, -3, 5)]; const B = [ints(rng, 2, -3, 5), ints(rng, 2, -3, 5)]
      const i = int(rng, 0, 1); const j = int(rng, 0, 1)
      const answer = A[i][0] * B[0][j] + A[i][1] * B[1][j]
      const m = (M) => `\\begin{bmatrix}${M[0][0]}&${M[0][1]}\\\\${M[1][0]}&${M[1][1]}\\end{bmatrix}`
      return { q: `$C=AB$ with $A=${m(A)}$ and $B=${m(B)}$. What is $C_{${i + 1}${j + 1}}$ (row ${i + 1}, column ${j + 1})?`, answer,
        explain: `Row ${i + 1} of $A$ dot column ${j + 1} of $B$ = ${answer}.` }
    } },
    { id: 'x01-g03', module: 'x01', level: 2, ref: '06-math-formulas#e-norm', gen(rng) {
      const v = ints(rng, 3, 1, 6); const answer = round(Math.sqrt(sum(v.map((x) => x * x))), 3)
      return { q: `$x=${tex(v)}$. Compute the L2 norm $\\|x\\|_2$ (3 decimals).`, answer, tolerance: 0.01,
        explain: `$\\sqrt{${sum(v.map((x) => x * x))}}\\approx ${answer}$.` }
    } },
    { id: 'x01-g04', module: 'x01', level: 3, ref: '03-nlp#34-word-embedding', gen(rng) {
      const a = ints(rng, 3, 1, 5); const b = ints(rng, 3, 1, 5)
      const answer = round(dot(a, b) / (Math.sqrt(dot(a, a)) * Math.sqrt(dot(b, b))), 3)
      return { q: `$A=${tex(a)}$, $B=${tex(b)}$. Compute cosine similarity (3 decimals).`, answer, tolerance: 0.01,
        explain: `$\\frac{A\\cdot B}{\\|A\\|\\|B\\|}=\\frac{${dot(a, b)}}{\\sqrt{${dot(a, a)}}\\sqrt{${dot(b, b)}}}\\approx ${answer}$.` }
    } },
    { id: 'x02-g01', module: 'x02', level: 1, ref: '06-math-formulas#a-derivative', gen(rng) {
      const a = int(rng, 1, 5); const b = int(rng, -5, 5); const x0 = int(rng, -3, 4); const answer = 2 * a * x0 + b
      return { q: `$f(x)=${a}x^2 ${signed(b)}x$. Compute $f'(${x0})$.`, answer,
        explain: `$f'(x)=${2 * a}x ${signed(b)}$, so $f'(${x0})=${answer}$.` }
    } },
    { id: 'x02-g02', module: 'x02', level: 2, ref: '06-math-formulas#c-chain-rule', gen(rng) {
      const a = int(rng, 1, 4); const b = int(rng, -4, 4); const x0 = int(rng, -2, 3); const answer = 2 * a * (a * x0 + b)
      return { q: `$y=(${a}x ${signed(b)})^2$. Use the chain rule to compute $\\frac{dy}{dx}$ at $x=${x0}$.`, answer,
        explain: `$\\frac{dy}{dx}=2(${a}x ${signed(b)})\\cdot ${a}$; at $x=${x0}$ this is ${answer}.` }
    } },
    { id: 'x02-g03', module: 'x02', level: 3, ref: '06-math-formulas#b-partial-derivative', gen(rng) {
      const w = int(rng, -2, 3); const b = int(rng, -2, 2); const x = int(rng, 1, 4); const y = int(rng, -3, 6)
      const answer = -2 * x * (y - (w * x + b))
      return { q: `$L=(y-(wx+b))^2$ with $w=${w}$, $b=${b}$, $x=${x}$, $y=${y}$. Compute $\\frac{\\partial L}{\\partial w}$.`, answer,
        explain: `$\\frac{\\partial L}{\\partial w}=-2x\\,(y-(wx+b))=${answer}$.` }
    } },
    { id: 'x03-g01', module: 'x03', level: 1, ref: '06-math-formulas#a-mean', gen(rng) {
      const n = int(rng, 4, 6); const xs = ints(rng, n, 1, 20); const answer = round(sum(xs) / n, 3)
      return { q: `Compute the mean of ${tex(xs)} (3 decimals).`, answer, tolerance: 0.01,
        explain: `${sum(xs)} / ${n} = ${answer}.` }
    } },
    { id: 'x03-g02', module: 'x03', level: 2, ref: '06-math-formulas#b-variance', gen(rng) {
      const xs = ints(rng, 4, 1, 12); const mu = sum(xs) / 4; const answer = round(sum(xs.map((x) => (x - mu) ** 2)) / 4, 3)
      return { q: `Compute the population variance (divide by $n$) of ${tex(xs)} (3 decimals).`, answer, tolerance: 0.01,
        explain: `Mean = ${mu}; variance = average squared deviation = ${answer}.` }
    } },
    { id: 'x03-g03', module: 'x03', level: 3, ref: '06-math-formulas#f-bayes-theorem', gen(rng) {
      const prior = [1, 2, 5, 10][int(rng, 0, 3)] / 100; const sens = [90, 95, 99][int(rng, 0, 2)] / 100; const fpr = [2, 5, 10][int(rng, 0, 2)] / 100
      const evidence = sens * prior + fpr * (1 - prior); const answer = round((sens * prior) / evidence, 3)
      return { q: `A condition has prevalence ${prior * 100}%. A test has sensitivity ${sens * 100}% and false positive rate ${fpr * 100}%. Given a positive test, what is $P(\\text{condition}\\mid +)$? (3 decimals)`, answer, tolerance: 0.005,
        explain: `$\\frac{${sens}\\cdot ${prior}}{${sens}\\cdot ${prior}+${fpr}\\cdot ${round(1 - prior, 2)}}\\approx ${answer}$.` }
    } },
    { id: 'x04-g01', module: 'x04', level: 1, ref: '06-math-formulas#gradient-descent', gen(rng) {
      const w = int(rng, 2, 9); const c = int(rng, -2, 4); const lr = [0.1, 0.2, 0.25, 0.5][int(rng, 0, 3)]
      const answer = round(w - lr * 2 * (w - c), 4)
      return { q: `$L(w)=(w-${c})^2$, $w=${w}$, learning rate $\\alpha=${lr}$. What is $w$ after one gradient descent step?`, answer,
        explain: `Gradient $=2(w-${c})=${2 * (w - c)}$; $w-\\alpha\\cdot\\text{grad}=${answer}$.` }
    } },
    { id: 'x04-g02', module: 'x04', level: 3, ref: '06-math-formulas#gradient-descent', gen(rng) {
      const w0 = int(rng, 2, 8); const lr = [0.1, 0.2, 0.25][int(rng, 0, 2)]; const k = int(rng, 2, 3)
      const answer = round(w0 * (1 - 2 * lr) ** k, 4)
      return { q: `$L(w)=w^2$, start $w_0=${w0}$, $\\alpha=${lr}$. What is $w$ after ${k} gradient descent steps? (4 decimals)`, answer, tolerance: 0.005,
        explain: `Each step multiplies $w$ by $(1-2\\alpha)=${round(1 - 2 * lr, 2)}$, so $w_${k}=${answer}$.` }
    } },
    { id: 'x05-g01', module: 'x05', level: 1, ref: '06-math-formulas#b-mean-squared-error', gen(rng) {
      const y = ints(rng, 3, 0, 10); const p = ints(rng, 3, 0, 10); const answer = round(sum(y.map((v, i) => (v - p[i]) ** 2)) / 3, 3)
      return { q: `True $y=${tex(y)}$, predicted $\\hat y=${tex(p)}$. Compute the MSE (3 decimals).`, answer, tolerance: 0.01,
        explain: `Average of squared errors = ${answer}.` }
    } },
    { id: 'x05-g02', module: 'x05', level: 2, ref: '06-math-formulas#d-logistic-regression', gen(rng) {
      const w = int(rng, 1, 3); const x = int(rng, -2, 3); const b = int(rng, -2, 2); const z = w * x + b; const answer = round(sigmoid(z), 4)
      return { q: `Logistic regression with $w=${w}$, $b=${b}$, input $x=${x}$. What is $P(y=1\\mid x)$? (4 decimals)`, answer, tolerance: 0.002,
        explain: `$z=${z}$; $\\sigma(z)=\\frac{1}{1+e^{-z}}\\approx ${answer}$.` }
    } },
    { id: 'x05-g03', module: 'x05', level: 3, ref: '06-math-formulas#f-softmax', gen(rng) {
      const z = ints(rng, 3, -1, 3); const i = int(rng, 0, 2); const ex = z.map(Math.exp); const answer = round(ex[i] / sum(ex), 4)
      return { q: `Logits $z=${tex(z)}$. What is the softmax probability of class ${i + 1}? (4 decimals)`, answer, tolerance: 0.002,
        explain: `$\\frac{e^{${z[i]}}}{\\sum_j e^{z_j}}\\approx ${answer}$.` }
    } },
    { id: 'x05-g04', module: 'x05', level: 4, ref: '06-math-formulas#e-binary-cross-entropy', gen(rng) {
      const y = int(rng, 0, 1); const p = [0.1, 0.2, 0.3, 0.7, 0.8, 0.9][int(rng, 0, 5)]
      const answer = round(-(y * Math.log(p) + (1 - y) * Math.log(1 - p)), 4)
      return { q: `One sample: label $y=${y}$, predicted probability $p=${p}$. Compute binary cross entropy $-[y\\ln p+(1-y)\\ln(1-p)]$ (4 decimals).`, answer, tolerance: 0.005,
        explain: `Only the term for the true class remains: $-\\ln(${y ? p : round(1 - p, 2)})\\approx ${answer}$.` }
    } },
    { id: 'x06-g01', module: 'x06', level: 2, ref: '06-math-formulas#66-model-evaluation-formulas', gen(rng) {
      const tp = int(rng, 20, 80); const fp = int(rng, 5, 40); const fn = int(rng, 5, 40); const tn = int(rng, 50, 200)
      const answer = round((tp + tn) / (tp + tn + fp + fn), 3)
      return { q: `Confusion matrix: TP=${tp}, FP=${fp}, FN=${fn}, TN=${tn}. Compute accuracy (3 decimals).`, answer, tolerance: 0.005,
        explain: `$\\frac{TP+TN}{TP+TN+FP+FN}=\\frac{${tp + tn}}{${tp + tn + fp + fn}}\\approx ${answer}$.` }
    } },
    { id: 'x06-g02', module: 'x06', level: 3, ref: '06-math-formulas#66-model-evaluation-formulas', gen(rng) {
      const tp = int(rng, 20, 80); const fp = int(rng, 5, 40); const fn = int(rng, 5, 40)
      const p = tp / (tp + fp); const r = tp / (tp + fn); const answer = round((2 * p * r) / (p + r), 3)
      return { q: `TP=${tp}, FP=${fp}, FN=${fn}. Compute the F1 score (3 decimals).`, answer, tolerance: 0.005,
        explain: `Precision ${round(p, 3)}, recall ${round(r, 3)}; $F1=2\\frac{PR}{P+R}\\approx ${answer}$.` }
    } },
    { id: 'x06-g03', module: 'x06', level: 4, ref: '06-math-formulas#66-model-evaluation-formulas', gen(rng) {
      const n = [1000, 2000, 5000, 10000][int(rng, 0, 3)]; const pct = [1, 2, 3, 5][int(rng, 0, 3)]
      const answer = round(100 - pct, 1)
      return { q: `A dataset has ${n} transactions and ${pct}% are fraud. A model always predicts "normal". What is its accuracy in percent?`, answer, tolerance: 0.1,
        explain: `It is right on every normal transaction: ${answer}%, yet recall for fraud is 0.` }
    } },
    { id: 'x07-g01', module: 'x07', level: 1, ref: '07-math-priorities#5-discrete-mathematics-supporting', gen(rng) {
      const n = int(rng, 3, 12)
      return { q: `How many binary strings of length ${n} exist?`, answer: 2 ** n,
        explain: `$2^{${n}}=${2 ** n}$.` }
    } },
    { id: 'x07-g02', module: 'x07', level: 2, ref: '07-math-priorities#5-discrete-mathematics-supporting', gen(rng) {
      const n = int(rng, 5, 10); const k = int(rng, 2, 4)
      return { q: `In how many ways can you choose ${k} features from ${n} (order does not matter)?`, answer: choose(n, k),
        explain: `$\\binom{${n}}{${k}}=${choose(n, k)}$.` }
    } },
    { id: 'x07-g03', module: 'x07', level: 3, ref: '06-math-formulas#d-probability', gen(rng) {
      const red = int(rng, 2, 6); const blue = int(rng, 2, 6); const answer = round(red / (red + blue), 3)
      return { q: `A bag has ${red} red and ${blue} blue balls. What is $P(\\text{red})$ for one draw? (3 decimals)`, answer, tolerance: 0.005,
        explain: `Favourable / total = ${red}/${red + blue} = ${answer}.` }
    } },
  ]

  // Rotate options by the id number so the answer position is spread evenly (the quiz also shuffles at display time).
  function rotate(row) {
    const shift = Number.parseInt(row.id.slice(-3), 10) % 4
    const options = row.options.map((_, i) => row.options[(i - shift + 4) % 4])
    return { options, answer: (row.answer + shift) % 4 }
  }
  const questions = rows.map((row) => ({ ...row, ...rotate(row) }))

  // Seed is derived from the template id and a number; the same pair always gives the same question.
  function materialize(item, seed) {
    const template = typeof item.gen === 'function' ? item : generators.find((g) => g.id === item.id)
    const made = template.gen(rngFrom(seed * 2654435761 + Number.parseInt(template.id.slice(1, 3), 10) * 97 + Number.parseInt(template.id.slice(-2), 10)))
    return {
      id: template.id, module: template.module, level: template.level, ref: template.ref, kind: 'numeric', seed,
      q: made.q, answer: made.answer, tolerance: made.tolerance || DEFAULT_TOLERANCE, explain: made.explain,
    }
  }

  function isNumericCorrect(question, input) {
    const value = Number(String(input).trim().replace(',', '.'))
    return Number.isFinite(value) && Math.abs(value - question.answer) <= question.tolerance
  }

  // Engine bank: static rows and generator templates share id/module/level so the adaptive picker treats them alike.
  const bank = [...questions, ...generators.map(({ id, module, level, ref }) => ({ id, module, level, ref, kind: 'generator' }))]
  return { modules, questions, generators, bank, materialize, isNumericCorrect, DEFAULT_TOLERANCE }
})
