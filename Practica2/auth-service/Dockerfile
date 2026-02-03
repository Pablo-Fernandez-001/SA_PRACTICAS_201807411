FROM node:18-alpine

WORKDIR /app

# Copiar package.json e instalar dependencias
COPY package*.json ./
RUN npm install --only=production

# Copiar código fuente
COPY . .

# Exponer puerto gRPC
EXPOSE 50051

# Comando para iniciar el servicio
CMD ["node", "server.js"]
