# 🐳 Docker Deployment

TaskFlow uygulamasının Docker ile deployment rehberi.

## 📋 İçindekiler

- [Genel Bakış](#genel-bakış)
- [Docker Images](#docker-images)
- [Docker Compose](#docker-compose)
- [Kubernetes](#kubernetes)
- [Production Deployment](#production-deployment)
- [Monitoring](#monitoring)

## 🎯 Genel Bakış

TaskFlow, **multi-container** Docker mimarisi kullanarak deployment edilir. Bu yaklaşım, **scalability**, **reliability** ve **maintainability** sağlar.

### Container Mimarisi
```
┌─────────────────────────────────────────────────────────────┐
│                    Load Balancer (NGINX)                   │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                  Application Containers                     │
├─────────────────────────────────────────────────────────────┤
│  Backend API  │  Backend API  │  Frontend  │  Frontend     │
│  (Instance 1) │  (Instance 2) │  (Instance 1) │  (Instance 2) │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                               │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL   │  Redis Cache  │  File Storage              │
└─────────────────────────────────────────────────────────────┘
```

## 🏗️ Docker Images

### 1. Backend API Image

#### Dockerfile
```dockerfile
# TaskFlow.API/Dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project files
COPY ["TaskFlow.API/TaskFlow.API.csproj", "TaskFlow.API/"]
COPY ["TaskFlow.API/", "TaskFlow.API/"]

# Restore dependencies
RUN dotnet restore "TaskFlow.API/TaskFlow.API.csproj"

# Build application
FROM build AS publish
RUN dotnet publish "TaskFlow.API/TaskFlow.API.csproj" -c Release -o /app/publish

# Runtime image
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

ENTRYPOINT ["dotnet", "TaskFlow.API.dll"]
```

#### Build Command
```bash
# Build backend image
docker build -t taskflow-api:latest ./TaskFlow.API

# Build with specific tag
docker build -t taskflow-api:v1.0.0 ./TaskFlow.API

# Multi-platform build
docker buildx build --platform linux/amd64,linux/arm64 -t taskflow-api:latest ./TaskFlow.API
```

### 2. Frontend Image

#### Dockerfile
```dockerfile
# TaskFlow.Frontend/Dockerfile
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production image
FROM nginx:alpine AS production

# Copy built files
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### Nginx Configuration
```nginx
# TaskFlow.Frontend/nginx.conf
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/s;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;

        # API proxy
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://backend:5000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # SignalR proxy
        location /hubs/ {
            proxy_pass http://backend:5000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Static files
        location / {
            try_files $uri $uri/ /index.html;
            
            # Cache static assets
            location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
                expires 1y;
                add_header Cache-Control "public, immutable";
            }
        }

        # Health check
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
```

#### Build Command
```bash
# Build frontend image
docker build -t taskflow-frontend:latest ./TaskFlow.Frontend

# Build with environment-specific config
docker build --build-arg VITE_API_URL=https://api.taskflow.com -t taskflow-frontend:latest ./TaskFlow.Frontend
```

## 🚀 Docker Compose

### Development Environment

#### docker-compose.dev.yml
```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: taskflow-postgres-dev
    environment:
      POSTGRES_DB: taskflow_dev
      POSTGRES_USER: taskflow_user
      POSTGRES_PASSWORD: dev_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U taskflow_user -d taskflow_dev"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: taskflow-redis-dev
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  # Backend API
  backend:
    build:
      context: ./TaskFlow.API
      dockerfile: Dockerfile
    container_name: taskflow-backend-dev
    environment:
      - ASPNETCORE_ENVIRONMENT=Development
      - ConnectionStrings__DefaultConnection=Host=postgres;Database=taskflow_dev;Username=taskflow_user;Password=dev_password
      - ConnectionStrings__Redis=redis:6379
      - JWT__SecretKey=dev_secret_key_here_minimum_32_characters
      - JWT__Issuer=TaskFlow
      - JWT__Audience=TaskFlowUsers
    ports:
      - "5000:80"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./TaskFlow.API:/app
      - /app/bin
      - /app/obj
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Frontend
  frontend:
    build:
      context: ./TaskFlow.Frontend
      dockerfile: Dockerfile.dev
    container_name: taskflow-frontend-dev
    environment:
      - VITE_API_URL=http://localhost:5000/api
      - VITE_SIGNALR_URL=http://localhost:5000/hubs
    ports:
      - "3000:3000"
    depends_on:
      - backend
    volumes:
      - ./TaskFlow.Frontend:/app
      - /app/node_modules
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3

  # File Storage (MinIO for development)
  minio:
    image: minio/minio:latest
    container_name: taskflow-minio-dev
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3

volumes:
  postgres_data:
  redis_data:
  minio_data:

networks:
  default:
    name: taskflow-dev-network
```

### Production Environment

#### docker-compose.prod.yml
```yaml
version: '3.8'

services:
  # Load Balancer (NGINX)
  nginx:
    image: nginx:alpine
    container_name: taskflow-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
      - ./logs/nginx:/var/log/nginx
    depends_on:
      - backend
      - frontend
    restart: unless-stopped

  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: taskflow-postgres
    environment:
      POSTGRES_DB: taskflow
      POSTGRES_USER: taskflow_user
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U taskflow_user -d taskflow"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: taskflow-redis
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD}", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Backend API (Multiple instances)
  backend:
    image: taskflow-api:${TAG:-latest}
    container_name: taskflow-backend
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ConnectionStrings__DefaultConnection=Host=postgres;Database=taskflow;Username=taskflow_user;Password=${POSTGRES_PASSWORD}
      - ConnectionStrings__Redis=redis:6379,password=${REDIS_PASSWORD}
      - JWT__SecretKey=${JWT_SECRET_KEY}
      - JWT__Issuer=TaskFlow
      - JWT__Audience=TaskFlowUsers
      - SMTP__Host=${SMTP_HOST}
      - SMTP__Port=${SMTP_PORT}
      - SMTP__Username=${SMTP_USERNAME}
      - SMTP__Password=${SMTP_PASSWORD}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Frontend (Multiple instances)
  frontend:
    image: taskflow-frontend:${TAG:-latest}
    container_name: taskflow-frontend
    environment:
      - VITE_API_URL=https://api.taskflow.com
      - VITE_SIGNALR_URL=https://api.taskflow.com/hubs
    restart: unless-stopped
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Monitoring (Prometheus)
  prometheus:
    image: prom/prometheus:latest
    container_name: taskflow-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    restart: unless-stopped

  # Monitoring (Grafana)
  grafana:
    image: grafana/grafana:latest
    container_name: taskflow-grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards
      - ./monitoring/grafana/datasources:/etc/grafana/provisioning/datasources
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  prometheus_data:
  grafana_data:

networks:
  default:
    name: taskflow-prod-network
    driver: bridge
```

## ☸️ Kubernetes

### Namespace
```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: taskflow
  labels:
    name: taskflow
```

### ConfigMap
```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: taskflow-config
  namespace: taskflow
data:
  appsettings.json: |
    {
      "ConnectionStrings": {
        "DefaultConnection": "Host=postgres;Database=taskflow;Username=taskflow_user;Password=${POSTGRES_PASSWORD}"
      },
      "JwtSettings": {
        "SecretKey": "${JWT_SECRET_KEY}",
        "Issuer": "TaskFlow",
        "Audience": "TaskFlowUsers"
      }
    }
```

### Secret
```yaml
# k8s/secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: taskflow-secrets
  namespace: taskflow
type: Opaque
data:
  postgres-password: <base64-encoded-password>
  redis-password: <base64-encoded-password>
  jwt-secret-key: <base64-encoded-jwt-secret>
```

### Deployment (Backend)
```yaml
# k8s/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: taskflow-backend
  namespace: taskflow
spec:
  replicas: 3
  selector:
    matchLabels:
      app: taskflow-backend
  template:
    metadata:
      labels:
        app: taskflow-backend
    spec:
      containers:
      - name: backend
        image: taskflow-api:latest
        ports:
        - containerPort: 80
        env:
        - name: ASPNETCORE_ENVIRONMENT
          value: "Production"
        - name: ConnectionStrings__DefaultConnection
          valueFrom:
            secretKeyRef:
              name: taskflow-secrets
              key: postgres-connection-string
        - name: ConnectionStrings__Redis
          valueFrom:
            secretKeyRef:
              name: taskflow-secrets
              key: redis-connection-string
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5
```

### Service
```yaml
# k8s/backend-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: taskflow-backend-service
  namespace: taskflow
spec:
  selector:
    app: taskflow-backend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
  type: ClusterIP
```

### Ingress
```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: taskflow-ingress
  namespace: taskflow
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
  - hosts:
    - api.taskflow.com
    - taskflow.com
    secretName: taskflow-tls
  rules:
  - host: api.taskflow.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: taskflow-backend-service
            port:
              number: 80
  - host: taskflow.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: taskflow-frontend-service
            port:
              number: 80
```

## 🚀 Production Deployment

### Environment Variables
```bash
# .env.production
# Database
POSTGRES_PASSWORD=your_secure_postgres_password
REDIS_PASSWORD=your_secure_redis_password

# JWT
JWT_SECRET_KEY=your_super_secret_jwt_key_here_minimum_32_characters

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
APPLE_CLIENT_ID=your_apple_client_id
APPLE_CLIENT_SECRET=your_apple_client_secret

# Monitoring
GRAFANA_PASSWORD=your_grafana_password

# Docker
TAG=v1.0.0
```

### Deployment Script
```bash
#!/bin/bash
# deploy.sh

set -e

echo "🚀 Starting TaskFlow deployment..."

# Load environment variables
source .env.production

# Build images
echo "📦 Building Docker images..."
docker build -t taskflow-api:$TAG ./TaskFlow.API
docker build -t taskflow-frontend:$TAG ./TaskFlow.Frontend

# Deploy with Docker Compose
echo "🚀 Deploying with Docker Compose..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 30

# Run database migrations
echo "🗄️ Running database migrations..."
docker-compose -f docker-compose.prod.yml exec backend dotnet ef database update

# Health check
echo "🏥 Performing health checks..."
curl -f http://localhost/health || exit 1

echo "✅ Deployment completed successfully!"
```

### Backup Script
```bash
#!/bin/bash
# backup.sh

set -e

BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)

echo "💾 Starting backup..."

# Database backup
echo "🗄️ Backing up PostgreSQL..."
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U taskflow_user taskflow > $BACKUP_DIR/db_backup_$DATE.sql

# File storage backup
echo "📁 Backing up files..."
tar -czf $BACKUP_DIR/files_backup_$DATE.tar.gz /var/lib/taskflow/files

# Clean old backups (keep last 7 days)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "✅ Backup completed: $BACKUP_DIR"
```

## 📊 Monitoring

### Prometheus Configuration
```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'taskflow-backend'
    static_configs:
      - targets: ['backend:80']
    metrics_path: '/metrics'
    scrape_interval: 5s

  - job_name: 'taskflow-frontend'
    static_configs:
      - targets: ['frontend:80']
    metrics_path: '/metrics'

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres:5432']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']
```

### Grafana Dashboard
```json
{
  "dashboard": {
    "title": "TaskFlow Dashboard",
    "panels": [
      {
        "title": "API Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])",
            "legendFormat": "{{method}} {{route}}"
          }
        ]
      },
      {
        "title": "Active Users",
        "type": "stat",
        "targets": [
          {
            "expr": "sum(active_users_total)"
          }
        ]
      }
    ]
  }
}
```

---

**Son Güncelleme**: 2024-12-19  
**Docker Versiyon**: 1.0.0  
**Durum**: ✅ Production Ready 