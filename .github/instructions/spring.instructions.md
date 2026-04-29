---
description: "Guidelines for building Spring Boot applications"
applyTo: "backend/src/**"
---

# Spring Boot Development

## General Instructions

- Make only high confidence suggestions when reviewing code changes.
- Write code with good maintainability practices, including comments on why certain design decisions were made.
- Handle edge cases and write clear exception handling.
- For libraries or external dependencies, mention their usage and purpose in comments.

## Spring Boot Instructions

### Dependency Injection

- Use constructor injection for all required dependencies.
- Declare dependency fields as `private final`.

### Configuration

- Use YAML files (`application.yml`) for externalized configuration.
- Environment Profiles: Use Spring profiles for different environments (dev, test, prod)
- Configuration Properties: Use @ConfigurationProperties for type-safe configuration binding
- Secrets Management: Externalize secrets using environment variables or secret management systems

### Code Organization

- Package Structure: Organize by feature/domain rather than by layer
- Separation of Concerns: Keep controllers thin, services focused, and repositories simple
- Utility Classes: Make utility classes final with private constructors

### Logging

- Use SLF4J for all logging (`@Slf4j` annotation from Lombok)
- Use parameterized logging: `log.info("User {} logged in", userId);`.

### Security & Input Handling

- Use parameterized queries | Always use Spring Data JPA or `NamedParameterJdbcTemplate` to prevent SQL injection.
- Validate request bodies and parameters using JSR-380 (`@NotNull`, `@Size`, etc.) annotations and `BindingResult`

## Build and Verification

- After adding or modifying code, verify the project continues to build successfully.
- Run `mvn clean package`.
- Ensure all tests pass as part of the build.

## Useful Commands

| Maven Command                     | Description                                   |
|:----------------------------------|:----------------------------------------------|
|`./mvnw spring-boot:run`           | Run the application.                          |
|`./mvnw package`                   | Build the application.                        |
|`./mvnw test`                      | Run tests.                                    |
|`./mvnw spring-boot:repackage`     | Package the application as a JAR.             |
|`./mvnw spring-boot:build-image`   | Package the application as a container image. |
