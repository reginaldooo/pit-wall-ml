"""Generates problems.js (the Arena study cases) from the definitions below.

Run: python3 scripts/build-problems.py   (needs numpy)

Each problem has a reference solution. The expected output of every test is computed by running that
solution, and visible sample tests also carry a hand-checked `check` value that must match, so a wrong
reference solution fails the build instead of shipping a wrong answer key.
"""
import json
import math
import re
from pathlib import Path

import numpy as np

OUT = Path(__file__).resolve().parent.parent / "problems.js"
CLOSE = 1e-6


def close(a, b):
    if isinstance(a, (list, tuple)) and isinstance(b, (list, tuple)):
        return len(a) == len(b) and all(close(x, y) for x, y in zip(a, b))
    if isinstance(a, (int, float)) and isinstance(b, (int, float)) and not isinstance(a, bool):
        return math.isclose(a, b, rel_tol=CLOSE, abs_tol=CLOSE)
    return a == b


P = []


def problem(**kw):
    P.append(kw)


# ---------------------------------------------------------------- tier 1
problem(
    id="p01", tier=1, module="ml", ref="06-math-formulas#a-mean",
    title="Mean and variance",
    statement="Given a list of numbers `xs`, return `[mean, variance]` where variance is the **population** variance $\\frac{1}{n}\\sum (x_i-\\mu)^2$.",
    starter="def solve(xs):\n    # return [mean, variance]\n    pass\n",
    hints=["Compute the mean first, then average the squared deviations."],
    editorial="Two passes: $\\mu=\\frac{\\sum x}{n}$, then $\\frac{1}{n}\\sum(x-\\mu)^2$. Divide by $n-1$ only for the sample variance.",
    solution="def solve(xs):\n    n = len(xs)\n    mean = sum(xs) / n\n    var = sum((x - mean) ** 2 for x in xs) / n\n    return [mean, var]\n",
    tests=[([[1, 2, 3, 4]], True, [2.5, 1.25]), ([[5]], True, [5.0, 0.0]), ([[2, 4, 4, 4, 5, 5, 7, 9]], False), ([[-1.5, 2.5, 0.0]], False)],
)
problem(
    id="p02", tier=1, module="nlp", ref="03-nlp#34-word-embedding",
    title="Cosine similarity",
    statement="Return the cosine similarity $\\frac{A\\cdot B}{\\|A\\|\\|B\\|}$ of vectors `a` and `b`. If either vector has zero length, return `0.0`.",
    starter="def solve(a, b):\n    pass\n",
    hints=["Write a dot product helper and reuse it for the norms.", "Guard the zero-norm case before dividing."],
    editorial="`dot(a,b) / (sqrt(dot(a,a)) * sqrt(dot(b,b)))`, with an early return of `0.0` for zero vectors. The value lies in $[-1,1]$.",
    solution="import math\n\ndef solve(a, b):\n    dot = sum(x * y for x, y in zip(a, b))\n    na = math.sqrt(sum(x * x for x in a))\n    nb = math.sqrt(sum(y * y for y in b))\n    if na == 0 or nb == 0:\n        return 0.0\n    return dot / (na * nb)\n",
    tests=[([[1, 0], [0, 1]], True, 0.0), ([[1, 2, 3], [2, 4, 6]], True, 1.0), ([[1, 0], [-1, 0]], False), ([[0, 0], [1, 1]], False), ([[3, 4], [4, 3]], False)],
)
problem(
    id="p03", tier=1, module="ml", ref="06-math-formulas#b-mean-squared-error",
    title="Mean squared error",
    statement="Return the MSE between true values `y` and predictions `p`.",
    starter="def solve(y, p):\n    pass\n",
    hints=["Square each difference, then take the mean."],
    editorial="$\\frac{1}{n}\\sum (y_i-\\hat y_i)^2$. RMSE is the square root of this.",
    solution="def solve(y, p):\n    return sum((a - b) ** 2 for a, b in zip(y, p)) / len(y)\n",
    tests=[([[1, 2, 3], [1, 2, 5]], True, 4 / 3), ([[0, 0], [0, 0]], True, 0.0), ([[1.5, 2.5, -1], [1, 3, 0]], False), ([[10], [7]], False)],
)
problem(
    id="p04", tier=1, module="ml", ref="06-math-formulas#66-model-evaluation-formulas",
    title="Precision, recall, F1",
    statement="Binary labels `y_true` and `y_pred` use 1 for positive. Return `[precision, recall, f1]`. When a denominator is zero, that value is `0.0`.",
    starter="def solve(y_true, y_pred):\n    pass\n",
    hints=["Count TP, FP and FN with one loop.", "$F1=\\frac{2PR}{P+R}$ — guard $P+R=0$."],
    editorial="Precision $\\frac{TP}{TP+FP}$, recall $\\frac{TP}{TP+FN}$, F1 their harmonic mean. Zero-division guards matter on rare-class data such as fraud.",
    solution="def solve(y_true, y_pred):\n    tp = sum(1 for t, p in zip(y_true, y_pred) if t == 1 and p == 1)\n    fp = sum(1 for t, p in zip(y_true, y_pred) if t == 0 and p == 1)\n    fn = sum(1 for t, p in zip(y_true, y_pred) if t == 1 and p == 0)\n    precision = tp / (tp + fp) if tp + fp else 0.0\n    recall = tp / (tp + fn) if tp + fn else 0.0\n    f1 = 2 * precision * recall / (precision + recall) if precision + recall else 0.0\n    return [precision, recall, f1]\n",
    tests=[([[1, 0, 1, 1, 0, 0], [1, 0, 0, 1, 1, 0]], True, [2 / 3, 2 / 3, 2 / 3]), ([[0, 0, 0], [0, 0, 0]], True, [0.0, 0.0, 0.0]), ([[1, 1, 1, 0], [1, 0, 0, 0]], False), ([[1, 0, 0, 0, 0, 1], [1, 1, 1, 0, 0, 1]], False)],
)

# ---------------------------------------------------------------- tier 2
problem(
    id="p05", tier=2, module="dl", ref="06-math-formulas#f-softmax",
    title="Stable softmax",
    statement="Return the softmax of the logits `z` as a list. It must not overflow for large values such as `[1000, 1000]`.",
    starter="import math\n\ndef solve(z):\n    pass\n",
    hints=["Softmax is unchanged if you subtract the same number from every logit.", "Subtract the maximum before exponentiating."],
    editorial="Subtracting $\\max(z)$ keeps every exponent $\\le 0$, so `exp` cannot overflow, and the result is mathematically identical.",
    solution="import math\n\ndef solve(z):\n    m = max(z)\n    e = [math.exp(v - m) for v in z]\n    s = sum(e)\n    return [v / s for v in e]\n",
    tests=[([[0, 0]], True, [0.5, 0.5]), ([[1000, 1000, 1000]], True, [1 / 3, 1 / 3, 1 / 3]), ([[1, 2, 3]], False), ([[-1000, 0]], False), ([[2.5]], False)],
)
problem(
    id="p06", tier=2, module="ml", ref="06-math-formulas#d-logistic-regression",
    title="One logistic regression step",
    statement="Do **one** gradient descent step of logistic regression with binary cross entropy. `X` is a list of rows, `w` the weights, `b` the bias, `y` labels in {0,1}, `lr` the learning rate. With $p=\\sigma(Xw+b)$: $\\nabla_w=\\frac{1}{n}X^T(p-y)$ and $\\nabla_b=\\frac{1}{n}\\sum(p-y)$. Return `[w_new, b_new]`.",
    starter="import numpy as np\n\ndef solve(w, b, X, y, lr):\n    # return [w_new (list), b_new (float)]\n    pass\n",
    hints=["Compute z = X @ w + b, then p = 1 / (1 + exp(-z)).", "The error term is (p - y); average over the n samples."],
    editorial="The BCE gradient simplifies to $(p-y)$ times the input. Update: $w\\leftarrow w-\\alpha\\nabla_w$, $b\\leftarrow b-\\alpha\\nabla_b$.",
    solution="import numpy as np\n\ndef solve(w, b, X, y, lr):\n    X = np.array(X, dtype=float)\n    w = np.array(w, dtype=float)\n    y = np.array(y, dtype=float)\n    p = 1 / (1 + np.exp(-(X @ w + b)))\n    err = p - y\n    grad_w = X.T @ err / len(y)\n    grad_b = err.mean()\n    return [(w - lr * grad_w).tolist(), float(b - lr * grad_b)]\n",
    tests=[([[0, 0], 0, [[1, 0], [0, 1]], [1, 0], 1.0], True, [[0.25, -0.25], 0.0]), ([[0.5, -0.5], 0.1, [[1, 2], [2, 1], [0, 1]], [1, 0, 1], 0.5], False), ([[0.0], 0.0, [[1], [2], [3], [4]], [0, 0, 1, 1], 0.1], False)],
)
problem(
    id="p07", tier=2, module="nlp", ref="03-nlp#b-text-representation",
    title="Tokenizer and bag of words",
    statement="Lowercase each document and split it into tokens with the regex `[a-z0-9]+`. Return `[vocab, matrix]` where `vocab` is the sorted list of unique tokens and `matrix[i][j]` is how many times `vocab[j]` appears in document `i`.",
    starter="import re\n\ndef solve(docs):\n    pass\n",
    hints=["`re.findall(r\"[a-z0-9]+\", doc.lower())` tokenizes one document.", "Build the vocab from all documents first, then count per document."],
    editorial="Bag of words ignores word order, which is why it cannot tell \"not good\" from \"good\" well. It is the base for TF-IDF.",
    solution="import re\n\ndef solve(docs):\n    tokens = [re.findall(r\"[a-z0-9]+\", d.lower()) for d in docs]\n    vocab = sorted({t for doc in tokens for t in doc})\n    matrix = [[doc.count(w) for w in vocab] for doc in tokens]\n    return [vocab, matrix]\n",
    tests=[([["a b a", "b c"]], True, [["a", "b", "c"], [[2, 1, 0], [0, 1, 1]]]), ([["Hello, World! hello"]], False), ([["The cat", "the dog", "A cat, a dog"]], False), ([[""]], False)],
)
problem(
    id="p08", tier=2, module="nlp", ref="03-nlp#b-text-representation",
    title="TF-IDF",
    statement="Tokenize as in the bag-of-words problem. For each document, $TF=\\frac{\\text{count}}{\\text{tokens in the document}}$ and $IDF=\\ln\\frac{N}{DF}$ (natural log, no smoothing). Return `[vocab, matrix]` of $TF\\times IDF$ with the same sorted vocab. An empty document gives a row of zeros.",
    starter="import math\nimport re\n\ndef solve(docs):\n    pass\n",
    hints=["DF is the number of documents containing the term, not the total count.", "A term in every document gets IDF = ln(1) = 0."],
    editorial="Frequent in one document but rare overall scores high; words present everywhere score zero. This matches the intuition in the notes.",
    solution="import math\nimport re\n\ndef solve(docs):\n    tokens = [re.findall(r\"[a-z0-9]+\", d.lower()) for d in docs]\n    vocab = sorted({t for doc in tokens for t in doc})\n    n = len(docs)\n    df = {w: sum(1 for doc in tokens if w in doc) for w in vocab}\n    matrix = []\n    for doc in tokens:\n        row = []\n        for w in vocab:\n            tf = doc.count(w) / len(doc) if doc else 0.0\n            row.append(tf * math.log(n / df[w]))\n        matrix.append(row)\n    return [vocab, matrix]\n",
    tests=[([["a b", "a c"]], True, [["a", "b", "c"], [[0.0, 0.5 * math.log(2), 0.0], [0.0, 0.0, 0.5 * math.log(2)]]]), ([["x y z", "x", "y y"]], False), ([["one two", "two three", "three four", "four one"]], False)],
)

# ---------------------------------------------------------------- tier 3
problem(
    id="p09", tier=3, module="ml", ref="01-machine-learning#b-unsupervised-learning",
    title="K-Means: one iteration",
    statement="Do one K-Means iteration. Assign every point to its nearest centroid (Euclidean distance; on a tie pick the lower index), then move each centroid to the mean of its points. A centroid with no points stays where it is. Return the new centroids.",
    starter="import numpy as np\n\ndef solve(points, centroids):\n    # return list of new centroids\n    pass\n",
    hints=["Distances to all centroids: a (n, k) array; `argmin(axis=1)` picks the nearest (lowest index on ties).", "Loop over centroids and average `points[labels == j]`."],
    editorial="K-Means alternates assignment and update steps; each step cannot increase the within-cluster squared distance. Handling empty clusters is the usual edge case.",
    solution="import numpy as np\n\ndef solve(points, centroids):\n    pts = np.array(points, dtype=float)\n    cen = np.array(centroids, dtype=float)\n    dist = np.linalg.norm(pts[:, None, :] - cen[None, :, :], axis=2)\n    labels = dist.argmin(axis=1)\n    out = cen.copy()\n    for j in range(len(cen)):\n        members = pts[labels == j]\n        if len(members):\n            out[j] = members.mean(axis=0)\n    return out.tolist()\n",
    tests=[([[[0, 0], [0, 1], [10, 10], [10, 11]], [[0, 0], [10, 10]]], True, [[0.0, 0.5], [10.0, 10.5]]), ([[[1, 1], [2, 2], [3, 3]], [[0, 0], [100, 100]]], False), ([[[0, 0], [4, 0], [0, 4], [4, 4]], [[1, 1], [3, 3], [50, 50]]], False)],
)
problem(
    id="p10", tier=3, module="dl", ref="03-nlp#36-attention-mechanism",
    title="Scaled dot-product attention",
    statement="Implement $\\text{Attention}(Q,K,V)=\\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$ with NumPy. `Q` is $(n,d_k)$, `K` is $(m,d_k)$, `V` is $(m,d_v)$. Softmax is applied over each row. Return an $(n,d_v)$ list of lists.",
    starter="import numpy as np\n\ndef solve(Q, K, V):\n    pass\n",
    hints=["scores = Q @ K.T / sqrt(d_k) has shape (n, m).", "Make the row softmax stable: subtract each row maximum."],
    editorial="Each query scores every key; softmax turns scores into weights; the output is the weighted mix of values. Dividing by $\\sqrt{d_k}$ stops large dot products from saturating the softmax.",
    solution="import numpy as np\n\ndef solve(Q, K, V):\n    Q = np.array(Q, dtype=float)\n    K = np.array(K, dtype=float)\n    V = np.array(V, dtype=float)\n    scores = Q @ K.T / np.sqrt(Q.shape[1])\n    scores = scores - scores.max(axis=1, keepdims=True)\n    weights = np.exp(scores)\n    weights = weights / weights.sum(axis=1, keepdims=True)\n    return (weights @ V).tolist()\n",
    tests=[([[[1, 0]], [[1, 0], [0, 1]], [[1, 2], [3, 4]]], True, [[1.6605, 2.6605]], 1e-3), ([[[0, 0], [1, 1]], [[1, 0], [0, 1], [1, 1]], [[1], [2], [3]]], False), ([[[2, 1, 0]], [[1, 1, 1], [0, 0, 5]], [[10, 0], [0, 10]]], False)],
)
problem(
    id="p11", tier=3, module="dl", ref="02-deep-learning#24-forward-propagation-and-backpropagation",
    title="Backprop through a tiny network",
    statement="A network has $z=W_1x+b_1$, $a=\\text{ReLU}(z)$, $\\hat y=W_2\\cdot a+b_2$ (`W2` is a vector, `b2` a scalar) and loss $L=(\\hat y-y)^2$. Return the gradients `[dW1, db1, dW2, db2]` as nested lists / a float. Use the derivative of ReLU as 1 where $z>0$, else 0.",
    starter="import numpy as np\n\ndef solve(x, y, W1, b1, W2, b2):\n    # return [dW1, db1, dW2, db2]\n    pass\n",
    hints=["Start at the output: dL/dy_hat = 2 * (y_hat - y).", "Chain rule backwards: da = dL/dy_hat * W2, dz = da * (z > 0), dW1 = outer(dz, x)."],
    editorial="Every gradient is a product of local derivatives along the path from the loss back to the parameter: that is backpropagation by the chain rule.",
    solution="import numpy as np\n\ndef solve(x, y, W1, b1, W2, b2):\n    x = np.array(x, dtype=float)\n    W1 = np.array(W1, dtype=float)\n    b1 = np.array(b1, dtype=float)\n    W2 = np.array(W2, dtype=float)\n    z = W1 @ x + b1\n    a = np.maximum(z, 0)\n    y_hat = W2 @ a + b2\n    d_out = 2 * (y_hat - y)\n    dW2 = d_out * a\n    da = d_out * W2\n    dz = da * (z > 0)\n    dW1 = np.outer(dz, x)\n    return [dW1.tolist(), dz.tolist(), dW2.tolist(), float(d_out)]\n",
    tests=[([[1], 0, [[2]], [0], [3], 0], True, [[[36.0]], [36.0], [24.0], 12.0]), ([[1, 2], 1, [[1, 0], [0, -1]], [0, 0], [1, 1], 0], False), ([[0.5, -1, 2], 3, [[1, 2, 3], [-1, -2, -3], [0.1, 0.2, 0.3]], [0.1, 0.1, 0.1], [1, 2, 3], 0.5], False)],
)
problem(
    id="p12", tier=3, module="nlp", ref="03-nlp#34-word-embedding",
    title="Cosine similarity search",
    statement="Given a `query` vector and a list of document vectors `docs`, return the indices of the top `k` documents by cosine similarity, best first. On equal similarity the lower index wins. Treat zero vectors as similarity `0.0`.",
    starter="import numpy as np\n\ndef solve(query, docs, k):\n    pass\n",
    hints=["Normalise every vector, then one matrix-vector product gives all similarities.", "`sorted(range(n), key=lambda i: (-sim[i], i))` handles ties."],
    editorial="This is the core of embedding retrieval (and RAG). Normalising once turns cosine similarity into a dot product.",
    solution="import numpy as np\n\ndef solve(query, docs, k):\n    q = np.array(query, dtype=float)\n    D = np.array(docs, dtype=float)\n    qn = np.linalg.norm(q)\n    dn = np.linalg.norm(D, axis=1)\n    sims = np.zeros(len(D))\n    ok = (dn > 0) & (qn > 0)\n    sims[ok] = (D[ok] @ q) / (dn[ok] * qn)\n    order = sorted(range(len(D)), key=lambda i: (-round(float(sims[i]), 12), i))\n    return order[:k]\n",
    tests=[([[1, 0], [[1, 0], [0, 1], [1, 1]], 2], True, [0, 2]), ([[1, 1], [[2, 2], [1, 1], [0, 0], [-1, -1]], 3], False), ([[0.2, 0.9, 0.1], [[1, 0, 0], [0, 1, 0], [0, 0, 1], [0.2, 0.9, 0.1]], 2], False)],
)


def run_solution(source, args):
    env = {"np": np, "math": math, "re": re}
    exec(source, env)
    return env["solve"](*json.loads(json.dumps(args)))


def jsonable(value):
    return json.loads(json.dumps(value))


out = []
for p in P:
    tests = []
    for entry in p["tests"]:
        args, visible, *rest = entry
        expected = jsonable(run_solution(p["solution"], args))
        if rest:
            tol = rest[1] if len(rest) > 1 else CLOSE
            check = rest[0]
            ok = (lambda a, b: all(abs(x - y) <= tol for u, v in zip(a, b) for x, y in zip(u, v))) if tol != CLOSE else close
            assert ok(expected, check), f"{p['id']}: reference gave {expected}, hand check says {check}"
        tests.append({"args": args, "expected": expected, "visible": visible})
    assert sum(1 for t in tests if t["visible"]) >= 1 and len(tests) >= 3, p["id"]
    out.append({
        "id": p["id"], "tier": p["tier"], "module": p["module"], "ref": p["ref"],
        "title": p["title"],
        "statement": p["statement"],
        "starter": p["starter"],
        "hints": p["hints"],
        "editorial": p["editorial"],
        "solution": p["solution"], "tests": tests,
    })

header = "// Generated by scripts/build-problems.py. Do not edit by hand.\n"
body = "(function (root, data) {\n  if (typeof module === 'object' && module.exports) module.exports = data\n  else root.PROBLEMS = data\n})(typeof self !== 'undefined' ? self : this, "
OUT.write_text(header + body + json.dumps({"problems": out}, indent=1, ensure_ascii=False) + ")\n")
print(f"wrote {len(out)} problems to {OUT}")
