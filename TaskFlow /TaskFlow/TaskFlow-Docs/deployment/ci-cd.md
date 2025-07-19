# 🔄 CI/CD Pipeline

TaskFlow sürekli entegrasyon ve sürekli dağıtım (CI/CD) pipeline dokümantasyonu.

## 📋 İçindekiler

- [Genel Bakış](#genel-bakış)
- [GitHub Actions](#github-actions)
- [Pipeline Stages](#pipeline-stages)
- [Environment Management](#environment-management)
- [Security Scanning](#security-scanning)
- [Monitoring](#monitoring)

## 🎯 Genel Bakış

TaskFlow CI/CD pipeline'ı **GitHub Actions** kullanarak otomatik build, test, security scanning ve deployment işlemlerini gerçekleştirir. **Multi-environment** desteği ile development, staging ve production ortamları için ayrı pipeline'lar sağlar.

### Pipeline Akışı
```
Code Push → Build → Test → Security Scan → Quality Check → Deploy → Monitor
```

### Desteklenen Özellikler
- **Automated Testing**: Otomatik test çalıştırma
- **Security Scanning**: Güvenlik taraması
- **Code Quality**: Kod kalitesi kontrolü
- **Multi-Environment**: Çoklu ortam desteği
- **Rollback**: Geri alma mekanizması
- **Monitoring**: Deployment izleme

## 🔧 GitHub Actions

### Main Workflow

#### `.github/workflows/main.yml`
```yaml
name: TaskFlow CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

env:
  DOTNET_VERSION: '8.0.x'
  NODE_VERSION: '18.x'
  DOCKER_REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  # Backend Tests
  backend-tests:
    name: Backend Tests
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup .NET
      uses: actions/setup-dotnet@v4
      with:
        dotnet-version: ${{ env.DOTNET_VERSION }}
        
    - name: Restore dependencies
      run: |
        dotnet restore TaskFlow.API/TaskFlow.API.csproj
        dotnet restore TaskFlow.Tests/TaskFlow.Tests.csproj
        
    - name: Run tests
      run: |
        dotnet test TaskFlow.Tests/TaskFlow.Tests.csproj --verbosity normal --collect:"XPlat Code Coverage" --results-directory ./coverage
        
    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/coverage.cobertura.xml
        flags: backend
        name: backend-coverage
        
    - name: Build API
      run: dotnet build TaskFlow.API/TaskFlow.API.csproj --configuration Release --no-restore
      
    - name: Publish API
      run: dotnet publish TaskFlow.API/TaskFlow.API.csproj --configuration Release --output ./publish/api --no-build

  # Frontend Tests
  frontend-tests:
    name: Frontend Tests
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        cache-dependency-path: TaskFlow.Frontend/package-lock.json
        
    - name: Install dependencies
      working-directory: TaskFlow.Frontend
      run: npm ci
      
    - name: Run linting
      working-directory: TaskFlow.Frontend
      run: npm run lint
      
    - name: Run type checking
      working-directory: TaskFlow.Frontend
      run: npm run type-check
      
    - name: Run unit tests
      working-directory: TaskFlow.Frontend
      run: npm run test:unit
      
    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      with:
        file: TaskFlow.Frontend/coverage/lcov.info
        flags: frontend
        name: frontend-coverage
        
    - name: Build frontend
      working-directory: TaskFlow.Frontend
      run: npm run build
      
    - name: Upload build artifacts
      uses: actions/upload-artifact@v4
      with:
        name: frontend-build
        path: TaskFlow.Frontend/dist

  # Security Scanning
  security-scan:
    name: Security Scan
    runs-on: ubuntu-latest
    needs: [backend-tests, frontend-tests]
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Run Trivy vulnerability scanner
      uses: aquasecurity/trivy-action@master
      with:
        scan-type: 'fs'
        scan-ref: '.'
        format: 'sarif'
        output: 'trivy-results.sarif'
        
    - name: Upload Trivy scan results
      uses: github/codeql-action/upload-sarif@v2
      with:
        sarif_file: 'trivy-results.sarif'
        
    - name: Run OWASP ZAP scan
      uses: zaproxy/action-full-scan@v0.8.0
      with:
        target: 'http://localhost:5000'
        
    - name: Run Snyk security scan
      uses: snyk/actions/node@master
      env:
        SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
      with:
        args: --severity-threshold=high

  # Code Quality
  code-quality:
    name: Code Quality
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: SonarCloud Scan
      uses: SonarSource/sonarcloud-github-action@master
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}

  # Build Docker Images
  build-images:
    name: Build Docker Images
    runs-on: ubuntu-latest
    needs: [backend-tests, frontend-tests, security-scan]
    if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/develop'
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3
      
    - name: Log in to Container Registry
      uses: docker/login-action@v3
      with:
        registry: ${{ env.DOCKER_REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
        
    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v5
      with:
        images: ${{ env.DOCKER_REGISTRY }}/${{ env.IMAGE_NAME }}
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=semver,pattern={{version}}
          type=semver,pattern={{major}}.{{minor}}
          type=sha
          
    - name: Build and push Backend API image
      uses: docker/build-push-action@v5
      with:
        context: ./TaskFlow.API
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
        cache-from: type=gha
        cache-to: type=gha,mode=max
        
    - name: Build and push Frontend image
      uses: docker/build-push-action@v5
      with:
        context: ./TaskFlow.Frontend
        push: true
        tags: ${{ steps.meta.outputs.tags }}-frontend
        labels: ${{ steps.meta.outputs.labels }}
        cache-from: type=gha
        cache-to: type=gha,mode=max

  # Deploy to Staging
  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: [build-images]
    if: github.ref == 'refs/heads/develop'
    environment: staging
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Deploy to staging
      run: |
        echo "Deploying to staging environment..."
        # Add your staging deployment commands here
        # Example: kubectl apply -f k8s/staging/
        
    - name: Run smoke tests
      run: |
        echo "Running smoke tests..."
        # Add smoke test commands here
        
    - name: Notify deployment
      uses: 8398a7/action-slack@v3
      with:
        status: success
        text: 'Staging deployment completed successfully!'
      env:
        SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}

  # Deploy to Production
  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: [deploy-staging]
    if: github.ref == 'refs/heads/main'
    environment: production
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Deploy to production
      run: |
        echo "Deploying to production environment..."
        # Add your production deployment commands here
        # Example: kubectl apply -f k8s/production/
        
    - name: Run health checks
      run: |
        echo "Running health checks..."
        # Add health check commands here
        
    - name: Notify deployment
      uses: 8398a7/action-slack@v3
      with:
        status: success
        text: 'Production deployment completed successfully!'
      env:
        SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### Pull Request Workflow

#### `.github/workflows/pr.yml`
```yaml
name: Pull Request Checks

on:
  pull_request:
    branches: [ main, develop ]

jobs:
  pr-checks:
    name: PR Checks
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Check conventional commits
      uses: amannn/action-semantic-pull-request@v5
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      with:
        types: |
          feat
          fix
          docs
          style
          refactor
          test
          chore
        requireScope: false
        
    - name: Check PR size
      uses: actions/github-script@v7
      with:
        script: |
          const { data: files } = await github.rest.pulls.listFiles({
            owner: context.repo.owner,
            repo: context.repo.repo,
            pull_number: context.issue.number,
          });
          
          const totalChanges = files.reduce((sum, file) => sum + file.changes, 0);
          
          if (totalChanges > 1000) {
            core.setFailed(`PR is too large: ${totalChanges} changes. Please split into smaller PRs.`);
          }
          
    - name: Run dependency check
      uses: actions/dependency-review-action@v3
      with:
        fail-on-severity: high
```

## 🚀 Pipeline Stages

### 1. **Build Stage**
```yaml
# Build configuration
build:
  backend:
    steps:
      - restore-dependencies
      - build-application
      - run-tests
      - generate-coverage
      - create-artifacts
      
  frontend:
    steps:
      - install-dependencies
      - lint-code
      - type-check
      - run-tests
      - build-application
      - create-artifacts
```

### 2. **Test Stage**
```yaml
# Test configuration
tests:
  unit:
    backend: dotnet test --collect:"XPlat Code Coverage"
    frontend: npm run test:unit
    
  integration:
    backend: dotnet test --filter Category=Integration
    frontend: npm run test:integration
    
  e2e:
    command: npm run test:e2e
    browser: chrome
    headless: true
```

### 3. **Security Stage**
```yaml
# Security scanning
security:
  static-analysis:
    - sonarqube
    - snyk
    - trivy
    
  dependency-check:
    - npm audit
    - dotnet list package --vulnerable
    
  container-scanning:
    - trivy image
    - clair
```

### 4. **Quality Stage**
```yaml
# Code quality checks
quality:
  linting:
    backend: dotnet format --verify-no-changes
    frontend: npm run lint
    
  formatting:
    backend: dotnet format --check
    frontend: npm run format:check
    
  complexity:
    - cyclomatic-complexity
    - cognitive-complexity
```

### 5. **Deploy Stage**
```yaml
# Deployment configuration
deploy:
  staging:
    trigger: develop branch
    environment: staging
    steps:
      - deploy-application
      - run-smoke-tests
      - notify-team
      
  production:
    trigger: main branch
    environment: production
    steps:
      - deploy-application
      - run-health-checks
      - notify-team
      - monitor-deployment
```

## 🌍 Environment Management

### Environment Configuration

#### Development Environment
```yaml
# .env.development
NODE_ENV=development
VITE_API_URL=http://localhost:5000/api
VITE_SIGNALR_URL=http://localhost:5000/hubs
VITE_APP_NAME=TaskFlow Dev
VITE_DEBUG=true
```

#### Staging Environment
```yaml
# .env.staging
NODE_ENV=staging
VITE_API_URL=https://api-staging.taskflow.com
VITE_SIGNALR_URL=https://api-staging.taskflow.com/hubs
VITE_APP_NAME=TaskFlow Staging
VITE_DEBUG=false
```

#### Production Environment
```yaml
# .env.production
NODE_ENV=production
VITE_API_URL=https://api.taskflow.com
VITE_SIGNALR_URL=https://api.taskflow.com/hubs
VITE_APP_NAME=TaskFlow
VITE_DEBUG=false
```

### Environment Variables Management
```yaml
# GitHub Secrets
secrets:
  # Database
  DB_CONNECTION_STRING: ${{ secrets.DB_CONNECTION_STRING }}
  DB_PASSWORD: ${{ secrets.DB_PASSWORD }}
  
  # JWT
  JWT_SECRET_KEY: ${{ secrets.JWT_SECRET_KEY }}
  JWT_ISSUER: ${{ secrets.JWT_ISSUER }}
  
  # OAuth
  GOOGLE_CLIENT_ID: ${{ secrets.GOOGLE_CLIENT_ID }}
  GOOGLE_CLIENT_SECRET: ${{ secrets.GOOGLE_CLIENT_SECRET }}
  
  # Monitoring
  SENTRY_DSN: ${{ secrets.SENTRY_DSN }}
  LOG_LEVEL: ${{ secrets.LOG_LEVEL }}
  
  # External Services
  SMTP_HOST: ${{ secrets.SMTP_HOST }}
  SMTP_PASSWORD: ${{ secrets.SMTP_PASSWORD }}
  
  # Security
  SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
  SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

## 🔒 Security Scanning

### Static Application Security Testing (SAST)
```yaml
# SAST configuration
sast:
  tools:
    - name: SonarQube
      config: sonar-project.properties
      
    - name: Snyk
      config: .snyk
      
    - name: Trivy
      config: trivy.yaml
      
  rules:
    - severity: high
      fail-on-findings: true
      
    - severity: medium
      fail-on-findings: false
      
    - severity: low
      fail-on-findings: false
```

### Dependency Scanning
```yaml
# Dependency scanning
dependency-scan:
  tools:
    - name: npm audit
      command: npm audit --audit-level=high
      
    - name: dotnet list package
      command: dotnet list package --vulnerable
      
    - name: Snyk
      command: snyk test --severity-threshold=high
      
  schedule:
    - cron: "0 2 * * 1"  # Every Monday at 2 AM
```

### Container Security
```yaml
# Container security scanning
container-security:
  tools:
    - name: Trivy
      command: trivy image --severity HIGH,CRITICAL
      
    - name: Clair
      command: clair-scanner --ip 10.0.0.1
      
  base-images:
    - mcr.microsoft.com/dotnet/aspnet:8.0
    - node:18-alpine
    - nginx:alpine
```

## 📊 Monitoring

### Deployment Monitoring
```yaml
# Deployment monitoring
monitoring:
  health-checks:
    - name: API Health Check
      url: https://api.taskflow.com/health
      timeout: 30s
      retries: 3
      
    - name: Frontend Health Check
      url: https://taskflow.com
      timeout: 30s
      retries: 3
      
  metrics:
    - name: Response Time
      threshold: 2000ms
      
    - name: Error Rate
      threshold: 5%
      
    - name: Availability
      threshold: 99.9%
```

### Notification System
```yaml
# Notification configuration
notifications:
  slack:
    webhook: ${{ secrets.SLACK_WEBHOOK_URL }}
    channels:
      - name: deployments
        events: [deploy-success, deploy-failure]
        
      - name: security
        events: [security-alert, vulnerability-found]
        
  email:
    smtp:
      host: ${{ secrets.SMTP_HOST }}
      port: 587
      username: ${{ secrets.SMTP_USERNAME }}
      password: ${{ secrets.SMTP_PASSWORD }}
      
    recipients:
      - admin@taskflow.com
      - dev-team@taskflow.com
```

### Rollback Strategy
```yaml
# Rollback configuration
rollback:
  triggers:
    - error-rate > 10%
    - response-time > 5000ms
    - health-check-failure
    
  strategy:
    - type: automatic
      conditions:
        - error-rate > 20%
        - response-time > 10000ms
        
    - type: manual
      conditions:
        - error-rate > 10%
        - response-time > 5000ms
        
  steps:
    - revert-deployment
    - restore-database
    - notify-team
    - investigate-issue
```

## 🛠️ Deployment Scripts

### Kubernetes Deployment
```bash
#!/bin/bash
# deploy-k8s.sh

set -e

ENVIRONMENT=$1
VERSION=$2

echo "🚀 Deploying TaskFlow to $ENVIRONMENT (v$VERSION)..."

# Update image tags
kubectl set image deployment/taskflow-backend taskflow-backend=$DOCKER_REGISTRY/$IMAGE_NAME:$VERSION -n taskflow
kubectl set image deployment/taskflow-frontend taskflow-frontend=$DOCKER_REGISTRY/$IMAGE_NAME-frontend:$VERSION -n taskflow

# Apply configuration
kubectl apply -f k8s/$ENVIRONMENT/ -n taskflow

# Wait for deployment
kubectl rollout status deployment/taskflow-backend -n taskflow --timeout=300s
kubectl rollout status deployment/taskflow-frontend -n taskflow --timeout=300s

# Run health checks
./scripts/health-check.sh $ENVIRONMENT

echo "✅ Deployment completed successfully!"
```

### Docker Compose Deployment
```bash
#!/bin/bash
# deploy-docker.sh

set -e

ENVIRONMENT=$1
VERSION=$2

echo "🚀 Deploying TaskFlow to $ENVIRONMENT (v$VERSION)..."

# Pull latest images
docker-compose -f docker-compose.$ENVIRONMENT.yml pull

# Deploy with new version
TAG=$VERSION docker-compose -f docker-compose.$ENVIRONMENT.yml up -d

# Wait for services to be healthy
sleep 30

# Run health checks
curl -f http://localhost/health || exit 1

echo "✅ Deployment completed successfully!"
```

### Database Migration
```bash
#!/bin/bash
# migrate-db.sh

set -e

ENVIRONMENT=$1

echo "🗄️ Running database migrations for $ENVIRONMENT..."

# Run migrations
docker-compose -f docker-compose.$ENVIRONMENT.yml exec backend dotnet ef database update

# Verify migration
docker-compose -f docker-compose.$ENVIRONMENT.yml exec backend dotnet ef migrations list

echo "✅ Database migration completed successfully!"
```

## 📈 Performance Monitoring

### Build Performance
```yaml
# Build performance tracking
build-performance:
  metrics:
    - name: Build Time
      threshold: 10m
      
    - name: Test Time
      threshold: 5m
      
    - name: Docker Build Time
      threshold: 15m
      
  optimization:
    - cache-dependencies
    - parallel-jobs
    - incremental-builds
```

### Deployment Performance
```yaml
# Deployment performance tracking
deployment-performance:
  metrics:
    - name: Deployment Time
      threshold: 10m
      
    - name: Rollback Time
      threshold: 5m
      
    - name: Health Check Time
      threshold: 2m
      
  optimization:
    - blue-green-deployment
    - rolling-updates
    - health-check-optimization
```

---

**Son Güncelleme**: 2024-12-19  
**CI/CD Versiyon**: 1.0.0  
**Durum**: ✅ Production Ready 