FROM node:18-alpine

WORKDIR /app

# Copiar package.json e instalar dependencias
COPY package*.json ./
RUN npm install --only=production

# Copiar código fuente
COPY . .

# Copiar archivo proto del auth-service
COPY ../auth-service/proto/auth.proto ./proto/

# Exponer puerto HTTP
EXPOSE 3000

# Comando para iniciar
CMD ["node", "app.js"]
