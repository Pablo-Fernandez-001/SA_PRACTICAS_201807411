# Execution Guide - Proyecto8

## Opcion recomendada: Docker Compose

1. Copia variables:
   - cp .env.example .env
2. Levanta todo:
   - docker compose up --build -d
3. Verifica:
   - docker compose ps
4. Ejecuta smoke test:
   - PowerShell: ./scripts/smoke-test.ps1
   - Bash: ./scripts/smoke-test.sh
5. Abre frontend:
   - http://localhost:3000

## Pruebas E2E

1. Instala dependencias del runner raiz:
   - npm install
2. Ejecuta:
   - npm run test:all

## Reset completo

- docker compose down -v

## Diagnostico rapido

- users-service health: http://localhost:3101/api/health
- tickets-service health: http://localhost:3102/api/health
- assignments-service health: http://localhost:3103/api/health
- audit-service health: http://localhost:3104/api/health
- rabbitmq management: http://localhost:15672
