# syntax=docker/dockerfile:1.6

# ---- Build stage ----------------------------------------------------------
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build

COPY pom.xml ./
COPY src ./src

# Cache the Maven local repo across builds via a BuildKit cache mount.
# Much faster than `dependency:go-offline` and doesn't force-resolve every
# plugin/profile up front.
RUN --mount=type=cache,target=/root/.m2 \
    mvn -q -e -B -DskipTests package \
 && cp target/*.jar app.jar

# ---- Runtime stage --------------------------------------------------------
FROM eclipse-temurin:21-jre
WORKDIR /app

COPY --from=build /build/app.jar /app/app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
