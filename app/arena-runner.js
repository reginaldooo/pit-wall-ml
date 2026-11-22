/* Main-thread side of the Arena runner: owns the worker, loads it lazily, and kills it when a run exceeds the limit. */
(function (root) {
  'use strict'
  const TIME_LIMIT_MS = 5000
  const LOAD_LIMIT_MS = 60000
  let worker = null
  let ready = null
  let counter = 0

  function stop() {
    if (worker) worker.terminate()
    worker = null
    ready = null
  }

  function start() {
    if (ready) return ready
    worker = new Worker('/runner.worker.js')
    const current = worker
    ready = new Promise((resolve, reject) => {
      const timer = setTimeout(() => { stop(); reject(new Error('load-timeout')) }, LOAD_LIMIT_MS)
      current.addEventListener('message', function onMessage(event) {
        if (event.data.type === 'ready') { clearTimeout(timer); current.removeEventListener('message', onMessage); resolve(current) }
        if (event.data.type === 'init-error') { clearTimeout(timer); stop(); reject(new Error(event.data.message)) }
      })
      current.addEventListener('error', () => { clearTimeout(timer); stop(); reject(new Error('worker-error')) })
    })
    return ready
  }

  // Resolves { status: 'ok' | 'timeout' | 'failure', results?, message? }
  async function run(code, tests) {
    let active
    try { active = await start() } catch (error) { return { status: 'failure', message: error.message } }
    const id = (counter += 1)
    return new Promise((resolve) => {
      const timer = setTimeout(() => { stop(); resolve({ status: 'timeout' }) }, TIME_LIMIT_MS)
      active.addEventListener('message', function onMessage(event) {
        if (event.data.id !== id) return
        clearTimeout(timer)
        active.removeEventListener('message', onMessage)
        if (event.data.type === 'result') resolve({ status: 'ok', results: event.data.results })
        else resolve({ status: 'failure', message: event.data.message })
      })
      active.postMessage({ id, code, tests })
    })
  }

  root.ArenaRunner = { run, stop, warmUp: start, TIME_LIMIT_MS }
})(self)
