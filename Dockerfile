FROM node:20-alpine AS builder
WORKDIR /app
COPY Client/package*.json ./
RUN npm ci || npm install
ARG VITE_API_URL=http://localhost:4001
ENV VITE_API_URL=$VITE_API_URL
COPY Client/ .
RUN npm run build

FROM nginx:alpine AS runner
RUN rm -rf /usr/share/nginx/html/*
COPY Client/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
