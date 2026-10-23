# Etapa 1: build de la aplicación Angular
FROM node:22-alpine AS build

# Habilitar pnpm integrado
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Copiar manifiesto y el lockfile de pnpm
COPY package.json pnpm-lock.yaml* ./

# Instalar dependencias respetando el lockfile
RUN npm install --legacy-peer-deps

COPY . .
RUN pnpm run build

# Etapa 2: servir con Nginx
FROM nginx:alpine

COPY --from=build /app/dist/primeraAplicacion/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
