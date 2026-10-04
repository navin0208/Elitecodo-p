const http = require('http');
const httpProxy = require('./CODE_/react/elitecode/node_modules/http-proxy');

const proxy = httpProxy.createProxyServer({ ws: true });

proxy.on('error', (err, req, res) => {
  console.error('[Gateway Proxy Error]', err.message);
  if (res && res.writeHead) {
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end('Gateway Bad Gateway: ' + err.message);
  }
});

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Route /api/ -> Java Backend (8583)
  if (req.url.startsWith('/api/')) {
    proxy.web(req, res, { target: 'http://localhost:8583' });
  }
  // Route /notifications/ -> Notification Service (8080)
  else if (req.url.startsWith('/notifications')) {
    proxy.web(req, res, { target: 'http://localhost:8080' });
  }
  // Route /pdf/ -> Node PDF Service (4001)
  else if (req.url.startsWith('/pdf/')) {
    req.url = req.url.replace(/^\/pdf/, '/api/pdf');
    proxy.web(req, res, { target: 'http://localhost:4001' });
  }
  // Route /question-portal/ -> React Frontend (3001)
  else if (req.url.startsWith('/question-portal')) {
    proxy.web(req, res, { target: 'http://127.0.0.1:3001' });
  }
  // Default -> Angular Frontend (4200)
  else {
    proxy.web(req, res, { target: 'http://localhost:4200' });
  }
});

// WebSocket upgrade routing for STOMP & notifications
server.on('upgrade', (req, socket, head) => {
  if (req.url.startsWith('/ws') || req.url.startsWith('/notifications')) {
    proxy.ws(req, socket, head, { target: 'http://localhost:8080' });
  } else {
    proxy.ws(req, socket, head, { target: 'http://localhost:4200' });
  }
});

const PORT = 5050;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`[EliteCodo Gateway] Running on http://localhost:${PORT}`);
  console.log(`  - Angular Portal:        http://localhost:${PORT}/`);
  console.log(`  - Core Java API:         http://localhost:${PORT}/api/`);
  console.log(`  - Notification Service:  http://localhost:${PORT}/notifications`);
  console.log(`  - React Question Portal: http://localhost:${PORT}/question-portal`);
});
