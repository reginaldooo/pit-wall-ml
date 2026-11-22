import test from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const { problems } = require('../problems.js')
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const probe = spawnSync('python3', ['-c', 'import numpy'], { encoding: 'utf8' })
const hasPython = probe.status === 0
const skip = hasPython ? false : 'python3 with numpy is not available'

function grade(code, tests) {
  const script = `import json, sys\nsys.path.insert(0, ${JSON.stringify(root)})\nimport importlib.util\nspec = importlib.util.spec_from_file_location('h', ${JSON.stringify(path.join(root, 'runner-harness.py'))})\nh = importlib.util.module_from_spec(spec); spec.loader.exec_module(h)\ndata = json.load(sys.stdin)\nprint(json.dumps(h.run(data['code'], data['tests'])))`
  const result = spawnSync('python3', ['-c', script], { input: JSON.stringify({ code, tests }), encoding: 'utf8', timeout: 20000 })
  assert.equal(result.status, 0, result.stderr)
  return JSON.parse(result.stdout)
}

test('problems have the required shape', () => {
  const ids = problems.map((p) => p.id)
  assert.equal(new Set(ids).size, ids.length)
  assert.ok(problems.length >= 12)
  for (const p of problems) {
    assert.ok([1, 2, 3].includes(p.tier), p.id)
    for (const field of ['title', 'statement', 'editorial']) assert.ok(typeof p[field] === 'string' && p[field].trim(), `${p.id} ${field}`)
    assert.match(p.starter, /def solve/, p.id)
    assert.match(p.solution, /def solve/, p.id)
    assert.ok(p.hints.length >= 1, p.id)
    assert.ok(p.tests.some((t) => t.visible), `${p.id} needs a visible sample`)
    assert.ok(p.tests.some((t) => !t.visible), `${p.id} needs a hidden test`)
  }
  for (let tier = 1; tier <= 3; tier += 1) assert.ok(problems.filter((p) => p.tier === tier).length >= 3, `tier ${tier}`)
})

test('every reference solution passes all of its tests through the harness', { skip }, () => {
  for (const p of problems) {
    const results = grade(p.solution, p.tests)
    assert.equal(results.length, p.tests.length)
    results.forEach((r, i) => assert.equal(r.ok, true, `${p.id} test ${i}: ${JSON.stringify(r)}`))
  }
})

test('the starter code fails (it is a stub, not a solution)', { skip }, () => {
  for (const p of problems) {
    const results = grade(p.starter, p.tests)
    assert.ok(results.some((r) => !r.ok), p.id)
  }
})

test('wrong answers, exceptions and missing solve are reported without crashing the harness', { skip }, () => {
  const p = problems[0]
  assert.ok(grade('def solve(xs):\n    return [0, 0]\n', p.tests).some((r) => !r.ok))
  const boom = grade('def solve(xs):\n    raise ValueError("boom")\n', p.tests)
  assert.ok(boom.every((r) => !r.ok))
  assert.ok(boom.find((r) => r.visible).error.includes('ValueError'))
  assert.equal(boom.find((r) => !r.visible).error, 'Raised an exception.')
  assert.ok(grade('x = 1\n', p.tests).every((r) => /Define a function/.test(r.error)))
  assert.ok(grade('def solve(:\n', p.tests).every((r) => !r.ok))
})

test('hidden tests never leak the expected value or the learner output', { skip }, () => {
  const p = problems[0]
  const results = grade('def solve(xs):\n    print("secret")\n    return [0, 0]\n', p.tests)
  for (const r of results.filter((x) => !x.visible)) {
    assert.equal(r.expected, undefined)
    assert.equal(r.got, undefined)
    assert.equal(r.stdout, '')
  }
})

test('numeric tolerance: close floats pass, far floats fail', { skip }, () => {
  const tests = [{ args: [[1, 2, 3, 4]], expected: [2.5, 1.25], visible: true }]
  assert.equal(grade('def solve(xs):\n    return [2.5 + 1e-9, 1.25]\n', tests)[0].ok, true)
  assert.equal(grade('def solve(xs):\n    return [2.6, 1.25]\n', tests)[0].ok, false)
})
