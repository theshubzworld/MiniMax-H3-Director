import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import fs from 'fs';

const savePromptsPlugin = (): Plugin => ({
  name: 'save-prompts-plugin',
  configureServer(server) {
    server.middlewares.use('/api/save-prompts', (req, res) => {
      if (req.method === 'POST') {
        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });
        req.on('end', () => {
          try {
            const prompts = JSON.parse(body);
            const formatted = JSON.stringify(prompts, null, 2);
            const file1 = path.resolve(__dirname, './src/data/user_saved_prompts.json');
            const file2 = path.resolve(__dirname, './user_saved_prompts.json');

            fs.writeFileSync(file1, formatted, 'utf8');
            fs.writeFileSync(file2, formatted, 'utf8');

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, count: prompts.length }));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
        });
      } else {
        res.statusCode = 405;
        res.end('Method Not Allowed');
      }
    });
  },
});

export default defineConfig({
  plugins: [react(), tailwindcss(), savePromptsPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
