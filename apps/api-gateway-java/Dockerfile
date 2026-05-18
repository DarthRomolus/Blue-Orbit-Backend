# ============================================================
#  Blue Orbit — Java API Gateway Dev Dockerfile
#  Runs with spring-boot:run (dev mode)
# ============================================================

FROM maven:3.9-eclipse-temurin-17

WORKDIR /app

# Copy pom.xml first for dependency caching
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Run Spring Boot in dev mode
CMD ["mvn", "spring-boot:run"]
