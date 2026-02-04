FROM node:18-alpine

# Install netcat for health checks and wait script
RUN apk add --no-cache netcat-openbsd bash

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

COPY . .

RUN mkdir -p logs

# Create wait script for database
RUN cat > wait-for-db.sh << 'EOF'
#!/bin/bash
set -e

host="$1"
port="$2"
shift 2
cmd="$@"

echo "Waiting for database at $host:$port..."

until nc -z "$host" "$port"; do
  echo "Database is unavailable - sleeping"
  sleep 3
done

echo "Database is up - executing command"
exec $cmd
EOF

RUN chmod +x wait-for-db.sh

EXPOSE 50051

CMD ["./wait-for-db.sh", "auth-db", "3306", "npm", "start"]