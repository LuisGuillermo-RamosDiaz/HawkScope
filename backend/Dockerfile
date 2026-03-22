# Etapa 1: Construcción (Build) usando JDK 21 (versiones LTS son más estables)
# Se ajusta la versión debido a que temurin 25 puede no estar completamente disponible en Docker Hub
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
# Descarga las dependencias primero para aprovechar el caché de Docker
RUN mvn dependency:go-offline
COPY src ./src
# Compila el proyecto generando el .jar
RUN mvn clean package -DskipTests

# Etapa 2: Ejecución (Run) usando JRE
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
