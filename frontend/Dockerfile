# Use official Node.js image for building
FROM node:18 AS build
WORKDIR /app
# Copy package.json and package-lock.json
COPY package*.json ./
RUN npm install
# Copy the rest of the application
COPY . .
# Les variables VITE_ seront injectées au moment du build
ARG VITE_API_BASE_URL
ARG VITE_API_TIMEOUT
ARG VITE_APP_ENV
ARG VITE_APP_VERSION
ARG VITE_FEATURE_PAYMENTS_ENABLED
ARG VITE_FEATURE_REPORTS_ENABLED
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_API_TIMEOUT=$VITE_API_TIMEOUT
ENV VITE_APP_ENV=$VITE_APP_ENV
ENV VITE_APP_VERSION=$VITE_APP_VERSION
ENV VITE_FEATURE_PAYMENTS_ENABLED=$VITE_FEATURE_PAYMENTS_ENABLED
ENV VITE_FEATURE_REPORTS_ENABLED=$VITE_FEATURE_REPORTS_ENABLED
RUN npm run build
# Use nginx to serve the static files
FROM nginx:alpine
# COPY nginx.conf /etc/nginx/nginx.conf
# Copy the build output to nginx
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
# Start nginx
CMD ["nginx", "-g", "daemon off;"]