FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies with legacy-peer-deps to resolve conflicts
COPY package.json yarn.lock* package-lock.json* ./
RUN if [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci --legacy-peer-deps; \
    else npm install --legacy-peer-deps; fi

# Fix ajv/ajv-keywords compatibility issue
RUN npm install ajv@8 --legacy-peer-deps

# Copy source and build
COPY . .

# Build arg for backend URL
ARG REACT_APP_BACKEND_URL
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL

RUN npm run build

# Production with nginx on port 4522
FROM nginx:alpine

# Copy built files
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 4522

CMD ["nginx", "-g", "daemon off;"]
