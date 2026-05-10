# PlanePool Admin Panel - Deployment Guide

## Overview

The PlanePool Admin Panel is a production-grade, enterprise-ready application built with React, Express, tRPC, and MySQL. This guide covers deployment to Google Cloud Platform (GCP) using Kubernetes and GitHub Actions CI/CD.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Actions CI/CD                      │
│  (Build, Test, Push to GCR, Deploy to GKE)                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Google Container Registry (GCR)                 │
│  (Docker Image Storage)                                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│         Google Kubernetes Engine (GKE) Cluster               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Pod 1: planepool-admin (Node.js + React)           │   │
│  │  Pod 2: planepool-admin (Node.js + React)           │   │
│  │  Pod 3: planepool-admin (Node.js + React)           │   │
│  │  ...                                                 │   │
│  │  HPA: Auto-scale based on CPU/Memory                │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Service: LoadBalancer (Port 80 → 3000)             │   │
│  │  NetworkPolicy: Ingress/Egress rules                │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────┬──────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
    ┌────────┐  ┌──────────┐  ┌─────────────┐
    │ MySQL  │  │   S3     │  │  Cloud DNS  │
    │Database│  │ Storage  │  │             │
    └────────┘  └──────────┘  └─────────────┘
```

## Prerequisites

1. **GCP Project Setup**
   - Create a GCP project
   - Enable required APIs:
     - Kubernetes Engine API
     - Container Registry API
     - Cloud SQL API
   - Create a GKE cluster:
     ```bash
     gcloud container clusters create planepool-cluster \
       --zone us-central1-a \
       --num-nodes 3 \
       --machine-type n1-standard-2 \
       --enable-autoscaling \
       --min-nodes 3 \
       --max-nodes 10
     ```

2. **GitHub Repository Setup**
   - Fork/clone this repository
   - Add the following secrets to your GitHub repository:
     - `GCP_PROJECT_ID`: Your GCP project ID
     - `WIF_PROVIDER`: Workload Identity Federation provider
     - `WIF_SERVICE_ACCOUNT`: Service account email

3. **Local Development**
   - Node.js 22+
   - pnpm package manager
   - Docker (for building images locally)

## Local Development

### Setup

```bash
# Install dependencies
pnpm install

# Create .env file with required variables
cp .env.example .env

# Run database migrations
pnpm db:push

# Start development server
pnpm dev
```

### Available Scripts

```bash
# Development
pnpm dev              # Start dev server with hot reload

# Building
pnpm build            # Build for production
pnpm check            # Type check

# Testing
pnpm test             # Run tests
pnpm test:watch      # Run tests in watch mode

# Database
pnpm db:push         # Push schema changes to database
pnpm db:studio       # Open Drizzle Studio

# Code Quality
pnpm format          # Format code with Prettier
```

## Deployment to GCP

### Step 1: Configure GCP Authentication

```bash
# Set up Workload Identity Federation
gcloud iam service-accounts create planepool-admin-sa \
  --display-name="PlanePool Admin Service Account"

# Grant necessary permissions
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:planepool-admin-sa@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/container.developer"

gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:planepool-admin-sa@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.admin"
```

### Step 2: Create Kubernetes Secrets

```bash
# Create namespace
kubectl create namespace planepool

# Create secrets
kubectl create secret generic planepool-secrets \
  --from-literal=database-url="mysql://user:pass@host:3306/planepool" \
  --from-literal=jwt-secret="your-jwt-secret" \
  --from-literal=oauth-server-url="https://api.manus.im" \
  --from-literal=vite-app-id="your-app-id" \
  --from-literal=vite-oauth-portal-url="https://oauth.manus.im" \
  -n planepool
```

### Step 3: Deploy Application

```bash
# Update k8s-deployment.yaml with your GCP project ID
sed -i 's/PROJECT_ID/your-project-id/g' k8s-deployment.yaml

# Apply Kubernetes manifests
kubectl apply -f k8s-deployment.yaml

# Check deployment status
kubectl get deployments -n planepool
kubectl get pods -n planepool
kubectl get svc -n planepool
```

### Step 4: Verify Deployment

```bash
# Check pod logs
kubectl logs -f deployment/planepool-admin -n planepool

# Port forward for local testing
kubectl port-forward svc/planepool-admin 3000:80 -n planepool

# Test the application
curl http://localhost:3000/health
```

## CI/CD Pipeline

The GitHub Actions workflow automatically:

1. **On Push to Main/Develop**
   - Installs dependencies
   - Runs linting and formatting checks
   - Runs test suite
   - Builds the application
   - Builds Docker image
   - Pushes to Google Container Registry
   - Deploys to GKE (main branch only)
   - Runs smoke tests

2. **On Pull Requests**
   - Runs all checks except deployment

### Workflow File

See `.github/workflows/deploy.yml` for the complete workflow configuration.

## Monitoring & Logging

### GKE Monitoring

```bash
# View pod metrics
kubectl top pods -n planepool

# View node metrics
kubectl top nodes

# Check pod status
kubectl describe pod <pod-name> -n planepool
```

### Logs

```bash
# View recent logs
kubectl logs deployment/planepool-admin -n planepool --tail=100

# Stream logs
kubectl logs -f deployment/planepool-admin -n planepool

# View logs from all pods
kubectl logs -l app=planepool-admin -n planepool --all-containers=true
```

### Cloud Logging

Access logs in GCP Console:
- Cloud Logging → Logs Explorer
- Filter: `resource.type="k8s_container" AND resource.labels.namespace_name="planepool"`

## Database Management

### Cloud SQL Setup

```bash
# Create Cloud SQL instance
gcloud sql instances create planepool-db \
  --database-version=MYSQL_8_0 \
  --tier=db-n1-standard-2 \
  --region=us-central1

# Create database
gcloud sql databases create planepool --instance=planepool-db

# Create user
gcloud sql users create planepool --instance=planepool-db --password=<PASSWORD>
```

### Backup & Recovery

```bash
# Create backup
gcloud sql backups create --instance=planepool-db

# List backups
gcloud sql backups list --instance=planepool-db

# Restore from backup
gcloud sql backups restore <BACKUP_ID> --backup-instance=planepool-db
```

## Scaling & Performance

### Horizontal Pod Autoscaling

The deployment includes HPA configuration that automatically scales pods based on:
- CPU utilization (target: 70%)
- Memory utilization (target: 80%)
- Min replicas: 3
- Max replicas: 10

Monitor HPA status:
```bash
kubectl get hpa -n planepool
kubectl describe hpa planepool-admin-hpa -n planepool
```

### Performance Optimization

1. **Caching**
   - Implement Redis for session caching
   - Cache frequently accessed data

2. **Database Optimization**
   - Add indexes on frequently queried columns
   - Use connection pooling

3. **CDN**
   - Use Cloud CDN for static assets
   - Configure cache headers

## Security

### Network Security

- NetworkPolicy restricts traffic to/from pods
- Only ingress from nginx ingress controller
- Only egress to databases and external APIs

### Secrets Management

- Use Google Secret Manager for sensitive data
- Rotate secrets regularly
- Never commit secrets to repository

### RBAC

- Service account with minimal required permissions
- Pod security policies enforced
- Non-root container execution

## Troubleshooting

### Pod Crashes

```bash
# Check pod status
kubectl describe pod <pod-name> -n planepool

# View logs
kubectl logs <pod-name> -n planepool

# Check resource limits
kubectl top pod <pod-name> -n planepool
```

### Database Connection Issues

```bash
# Test database connectivity
kubectl exec -it <pod-name> -n planepool -- \
  mysql -h <DB_HOST> -u <DB_USER> -p<DB_PASSWORD> planepool

# Check environment variables
kubectl exec <pod-name> -n planepool -- env | grep DATABASE
```

### Deployment Failures

```bash
# Check deployment status
kubectl describe deployment planepool-admin -n planepool

# View recent events
kubectl get events -n planepool --sort-by='.lastTimestamp'

# Rollback to previous version
kubectl rollout undo deployment/planepool-admin -n planepool
```

## Maintenance

### Regular Tasks

- Monitor resource usage and adjust limits
- Review and update dependencies monthly
- Rotate secrets quarterly
- Backup database daily
- Review logs for errors and warnings

### Upgrades

```bash
# Update application
git pull origin main
pnpm install
pnpm build

# Push new image
docker build -t gcr.io/PROJECT_ID/planepool-admin:v1.1.0 .
docker push gcr.io/PROJECT_ID/planepool-admin:v1.1.0

# Update deployment
kubectl set image deployment/planepool-admin \
  planepool-admin=gcr.io/PROJECT_ID/planepool-admin:v1.1.0 \
  -n planepool
```

## Support & Documentation

- **tRPC Documentation**: https://trpc.io
- **React Documentation**: https://react.dev
- **GKE Documentation**: https://cloud.google.com/kubernetes-engine/docs
- **Drizzle ORM**: https://orm.drizzle.team

## License

MIT
