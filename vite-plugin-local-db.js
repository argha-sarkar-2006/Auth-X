import fs from 'node:fs'
import path from 'node:path'

// Dev-only bridge that makes ./accounts.json the on-disk source of truth for the
// app's local database. It exposes GET/POST /__db (read/write the file) and
// watches the file so manual edits push a reload event into the running app.
//
// This only runs under `vite dev` — a production build has no server, so the
// app falls back to plain localStorage.
export default function localDbPlugin() {
  return {
    name: 'local-db-bridge',
    configureServer(server) {
      const file = path.resolve(server.config.root, 'accounts.json')
      // Last body we wrote via the API, so the watcher can ignore our own writes
      // (app -> file) and only react to genuine manual edits (file -> app).
      let lastWrittenByApi = null

      const ensure = () => {
        if (!fs.existsSync(file)) fs.writeFileSync(file, '{}\n')
      }
      ensure()

      server.middlewares.use('/__db', (req, res) => {
        if (req.method === 'GET') {
          ensure()
          res.setHeader('Content-Type', 'application/json')
          res.end(fs.readFileSync(file, 'utf-8'))
          return
        }
        if (req.method === 'POST') {
          let body = ''
          req.on('data', (c) => (body += c))
          req.on('end', () => {
            try {
              lastWrittenByApi = body
              fs.writeFileSync(file, body)
              res.statusCode = 204
              res.end()
            } catch (err) {
              res.statusCode = 500
              res.end(String(err))
            }
          })
          return
        }
        res.statusCode = 405
        res.end()
      })

      // Manual edits to accounts.json → tell the client to reload & re-read it.
      server.watcher.add(file)
      server.watcher.on('change', (changed) => {
        if (path.resolve(changed) !== file) return
        let current
        try {
          current = fs.readFileSync(file, 'utf-8')
        } catch {
          return
        }
        if (current === lastWrittenByApi) return // our own write — ignore
        server.ws.send({ type: 'custom', event: 'local-db:changed' })
      })
    },
  }
}
