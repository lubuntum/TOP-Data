# frontend/Dockerfile
# Stage 1: Build the React application
FROM node:20-alpine as builder

WORKDIR /app

# Сначала копируем только файлы зависимостей для кэширования
COPY package*.json ./
RUN npm ci

# Копируем исходный код и собираем проект
COPY . .
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine as production

# Копируем собранные статические файлы
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем наш кастомный конфиг Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]