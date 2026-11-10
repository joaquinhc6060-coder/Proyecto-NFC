import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import adminHandler from './api/vigio-admin.js'
import pinActivationHandler from './api/vigio-pin-activation.js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  for (const name of ['SUPABASE_URL', 'VITE_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'VIGIO_ADMIN_USERNAME', 'VIGIO_ADMIN_EMAIL', 'VIGIO_PIN_RATE_LIMIT_SECRET']) {
    if (!process.env[name] && env[name]) process.env[name] = env[name];
  }
  return {
    plugins: [react(), {
      name: 'vigio-admin-local-api',
      configureServer(server) {
        const serveApi = (path, handler) => server.middlewares.use(path, async (req, res) => {
          res.status = code => { res.statusCode = code; return res; };
          res.json = value => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(value)); };
          let body = '';
          for await (const chunk of req) {
            body += chunk;
            if (body.length > 16384) return res.status(413).json({ error: 'Solicitud demasiado grande.' });
          }
          req.body = body;
          await handler(req, res);
        });
        server.middlewares.use('/api/vigio-admin', async (req, res) => {
          res.status = code => { res.statusCode = code; return res; };
          res.json = value => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(value)); };
          let body = '';
          for await (const chunk of req) {
            body += chunk;
            if (body.length > 16384) return res.status(413).json({ error: 'Solicitud demasiado grande.' });
          }
          req.body = body;
          await adminHandler(req, res);
        });
        serveApi('/api/vigio-pin-activation', pinActivationHandler);
      },
    }],
  };
})

