FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

COPY . .

RUN mkdir -p logs

EXPOSE 50051

CMD ["npm", "start"]