const { createServer } = require('http');
const next = require('next');

const port = parseInt(process.env.PORT || '3000', 10);
const app = next({ dev: false, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => handle(req, res));
  server.listen(port, () => {
    console.log(`> FiraLive TV ready on http://localhost:${port}`);
  });
  server.timeout = 60000;
  server.keepAliveTimeout = 60000;
}).catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
