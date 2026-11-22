/* Arena code runner. Runs Pyodide (Python + NumPy in WebAssembly) off the main thread.
   The page enforces the time limit by terminating this worker (see arena-runner.js). */
'use strict'
const PYODIDE_URL = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/'
let pyodide = null

async function init() {
  importScripts(PYODIDE_URL + 'pyodide.js')
  pyodide = await loadPyodide({ indexURL: PYODIDE_URL })
  await pyodide.loadPackage('numpy')
  const harness = await (await fetch('/runner-harness.py')).text()
  pyodide.runPython(harness)
  self.postMessage({ type: 'ready' })
}

self.onmessage = async (event) => {
  const { id, code, tests } = event.data
  try {
    pyodide.globals.set('_code', code)
    pyodide.globals.set('_tests', JSON.stringify(tests))
    const raw = pyodide.runPython('run_json(_code, _tests)')
    self.postMessage({ type: 'result', id, results: JSON.parse(raw) })
  } catch (error) {
    self.postMessage({ type: 'failure', id, message: String(error && error.message ? error.message : error).slice(0, 2000) })
  }
}

init().catch((error) => self.postMessage({ type: 'init-error', message: String(error && error.message ? error.message : error) }))
