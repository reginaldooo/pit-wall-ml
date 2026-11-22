// Local static server with clean URLs (like Vercel). Run: node scripts/dev-server.mjs [port]
// Without Supabase settings in config.js the app runs in local demo mode (data stays in the browser).
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const port = Number(process.argv[2]) || 3000
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.json': 'application/json', '.py': 'text/x-python', '.png': 'image/png' }

http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`)
  let file = path.join(root, decodeURIComponent(url.pathname))
  if (!file.startsWith(root)) { res.statusCode = 403; return res.end() }
  if (url.pathname === '/') file = path.join(root, 'index.html')
  else if (!path.extname(file) && fs.existsSync(`${file}.html`)) file = `${file}.html`
  else if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html')
  if (!fs.existsSync(file)) { res.statusCode = 404; return res.end('not found') }
  res.setHeader('Content-Type', TYPES[path.extname(file)] || 'application/octet-stream')
  fs.createReadStream(file).pipe(res)
}).listen(port, () => console.log(`http://localhost:${port}`))
