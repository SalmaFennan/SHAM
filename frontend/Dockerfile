# Build stage
FROM node:22-alpine AS build

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy configuration files
COPY vite.config.ts tsconfig.json ./
COPY postcss.config.js tailwind.config.js ./

# DEBUG: Supprimer tout fichier/dossier index.html existant
RUN rm -rf index.html || true

# Copy index.html with explicit verification
COPY index.html ./index.html

# DEBUG: Vérifier que index.html est bien un fichier
RUN ls -la /app && \
    echo "=== Checking index.html ===" && \
    file /app/index.html && \
    echo "=== Content of index.html ===" && \
    cat /app/index.html

# Copy source directories AFTER index.html
COPY src ./src

# Copy public if it exists
COPY public ./public 2>/dev/null || true

# Build arguments
ARG VITE_API_BASE_URL
ARG VITE_API_TIMEOUT
ARG VITE_APP_ENV
ARG VITE_APP_VERSION
ARG VITE_FEATURE_PAYMENTS_ENABLED
ARG VITE_FEATURE_REPORTS_ENABLED

# Set environment variables
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_API_TIMEOUT=$VITE_API_TIMEOUT \
    VITE_APP_ENV=$VITE_APP_ENV \
    VITE_APP_VERSION=$VITE_APP_VERSION \
    VITE_FEATURE_PAYMENTS_ENABLED=$VITE_FEATURE_PAYMENTS_ENABLED \
    VITE_FEATURE_REPORTS_ENABLED=$VITE_FEATURE_REPORTS_ENABLED

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]