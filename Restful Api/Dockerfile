# Render's native "Java" environment detection is unreliable (it silently fell
# back to a Node.js build image here), so this Dockerfile takes full, explicit
# control over the JDK instead of relying on that auto-detection.

FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B
COPY src ./src
RUN ./mvnw clean package -DskipTests -B

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/libman-api-0.0.1-SNAPSHOT.jar app.jar
# Render injects PORT; application.yml already binds server.port to ${PORT:8080}.
ENTRYPOINT ["java", "-jar", "app.jar"]
