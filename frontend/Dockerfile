# Build stage
FROM node:22-alpine AS build

WORKDIR /app

# Copier UNIQUEMENT le frontend
COPY frontend/package.json frontend/package-lock.json ./

RUN npm ci

COPY frontend/ .

# Build arguments
ARG VITE_API_BASE_URL
ARG VITE_API_TIMEOUT
ARG VITE_APP_ENV
ARG VITE_APP_VERSION
ARG VITE_FEATURE_PAYMENTS_ENABLED
ARG VITE_FEATURE_REPORTS_ENABLED

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_API_TIMEOUT=$VITE_API_TIMEOUT \
    VITE_APP_ENV=$VITE_APP_ENV \
    VITE_APP_VERSION=$VITE_APP_VERSION \
    VITE_FEATURE_PAYMENTS_ENABLED=$VITE_FEATURE_PAYMENTS_ENABLED \
    VITE_FEATURE_REPORTS_ENABLED=$VITE_FEATURE_REPORTS_ENABLED

RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
