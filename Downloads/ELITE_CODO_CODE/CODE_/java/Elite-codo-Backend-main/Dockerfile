# ==========================================================
# EliteCodo Core Java Backend Dockerfile
# ==========================================================
FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

# Copy the standalone executable Spring Boot jar
COPY builds/elearning-0.0.1-SNAPSHOT.jar app.jar

# Set default environment variables (overrideable via Docker Compose / .env)
ENV SERVER_PORT=8583 \
    SPRING_DATASOURCE_URL=jdbc:mysql://mysql-db:3306/elitecodo_db?useSSL=false&allowPublicKeyRetrieval=true \
    SPRING_DATASOURCE_USERNAME=root \
    SPRING_DATASOURCE_PASSWORD=root \
    MY_NODE_URL=http://pdf-service:4000/api/pdf \
    JAVA_OPTS="-Xms512m -Xmx2048m"

EXPOSE 8583

# Healthcheck to verify Spring Boot is accepting traffic
HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=60s \
  CMD curl -f http://localhost:${SERVER_PORT}/api/auth/countof || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar --server.port=${SERVER_PORT} --spring.datasource.url=\"${SPRING_DATASOURCE_URL}\" --spring.datasource.username=${SPRING_DATASOURCE_USERNAME} --spring.datasource.password=${SPRING_DATASOURCE_PASSWORD} --my.node.url=${MY_NODE_URL}"]
