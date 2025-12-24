# Build stage
FROM node:22-alpine AS build

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy ALL configuration files
COPY vite.config.ts ./
COPY tsconfig.json ./
COPY tsconfig.app.json ./
COPY tsconfig.node.json ./
COPY postcss.config.js ./
COPY tailwind.config.js ./
COPY eslint.config.js ./

# Copy index.html explicitly
COPY index.html ./

# Copy source directories
COPY src ./src
COPY public ./public

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

# Copy built files
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]