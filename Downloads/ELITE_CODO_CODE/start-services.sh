#!/usr/bin/env bash
set -e
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

LOG_DIR="$ROOT_DIR/logs"
mkdir -p "$LOG_DIR"

echo "Checking databases..."
lsof -i:3306 >/dev/null || brew services start mysql
lsof -i:27017 >/dev/null || brew services start mongodb-community

echo "1. Starting Core Java Backend (port 8583)..."
nohup java -jar CODE_/java/Elite-codo-Backend-main/builds/elearning-0.0.1-SNAPSHOT.jar \
  "--spring.datasource.url=jdbc:mysql://localhost:3306/elitecodo_db?useSSL=false" \
  --spring.datasource.username=root \
  --spring.datasource.password=root > "$LOG_DIR/backend.log" 2>&1 &
echo $! > "$LOG_DIR/backend.pid"

echo "2. Starting Node PDF Microservice (port 4001)..."
(cd "$ROOT_DIR/CODE_/node/elitecodo-node" && PORT=4001 nohup node index.js > "$LOG_DIR/pdf.log" 2>&1 & echo $! > "$LOG_DIR/pdf.pid")

echo "3. Starting Notification Microservice (port 8080)..."
(cd "$ROOT_DIR/CODE_/notification" && nohup mvn spring-boot:run > "$LOG_DIR/notification.log" 2>&1 & echo $! > "$LOG_DIR/notification.pid")

echo "4. Starting React Question Portal (port 3001)..."
(cd "$ROOT_DIR/CODE_/react/elitecode" && PORT=3001 BROWSER=none nohup npm start > "$LOG_DIR/react.log" 2>&1 & echo $! > "$LOG_DIR/react.pid")

echo "5. Starting Angular Management Portal (port 4200)..."
(cd "$ROOT_DIR/CODE_/Angular/EliteCodo Angular" && nohup npx ng serve --host 0.0.0.0 --port 4200 --disable-host-check > "$LOG_DIR/angular.log" 2>&1 & echo $! > "$LOG_DIR/angular.pid")

echo "6. Starting Gateway Proxy (port 5050)..."
nohup node gateway.js > "$LOG_DIR/gateway.log" 2>&1 &
echo $! > "$LOG_DIR/gateway.pid"

echo "7. Starting ngrok Tunnel (port 5050)..."
nohup ngrok http 5050 --log=stdout > "$LOG_DIR/ngrok.log" 2>&1 &
echo $! > "$LOG_DIR/ngrok.pid"

echo "All EliteCodo services started successfully in background!"
