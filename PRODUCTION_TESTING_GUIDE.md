# PlanePool Admin Panel - Production Testing & Deployment Guide

## Pre-Deployment Checklist

### 1. Code Quality

```bash
# Run linting
pnpm format --check

# Type checking
pnpm check

# Run tests
pnpm test
```

### 2. Build Verification

```bash
# Build the application
pnpm build

# Check build output
ls -lah dist/
ls -lah client/dist/
```

### 3. Docker Build Test

```bash
# Build Docker image locally
docker build -t planepool-admin:test .

# Run container locally
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e DATABASE_URL="mysql://user:pass@localhost:3306/planepool" \
  -e JWT_SECRET="test-secret" \
  planepool-admin:test

# Test health endpoint
curl http://localhost:3000/health
```

## Deployment Environments

### Development Environment
- **Branch**: `develop`
- **Auto-deploy**: On push
- **Database**: Development MySQL instance
- **URL**: `dev-admin.planepool.com`

### Staging Environment
- **Branch**: `staging`
- **Auto-deploy**: On push
- **Database**: Staging MySQL instance
- **URL**: `staging-admin.planepool.com`
- **Testing**: Full regression testing

### Production Environment
- **Branch**: `main`
- **Manual deploy**: Via GitHub Actions workflow
- **Database**: Production MySQL instance
- **URL**: `admin.planepool.com`
- **Replicas**: 3+ pods with auto-scaling

## Deployment Steps

### Step 1: Prepare Release

```bash
# Create release branch
git checkout -b release/v1.0.0

# Update version in package.json
# Commit changes
git commit -am "Bump version to 1.0.0"

# Create release tag
git tag -a v1.0.0 -m "Release version 1.0.0"

# Push to GitHub
git push origin release/v1.0.0 --tags
```

### Step 2: Create Pull Request

```bash
# Create PR from release branch to main
# Title: "Release: v1.0.0"
# Description: Include changelog and testing notes
```

### Step 3: Automated CI/CD Pipeline

The GitHub Actions workflow will automatically:

1. **Run Tests**
   - Lint code
   - Run unit tests
   - Type check

2. **Build Application**
   - Install dependencies
   - Build React frontend
   - Build Node.js backend

3. **Build Docker Image**
   - Create Docker image
   - Tag with version and latest
   - Push to Google Container Registry

4. **Deploy to GKE**
   - Update Kubernetes deployment
   - Rolling update (zero downtime)
   - Run smoke tests

5. **Verify Deployment**
   - Check pod health
   - Verify endpoints
   - Run post-deployment tests

### Step 4: Post-Deployment Verification

```bash
# Check deployment status
kubectl get deployments -n planepool
kubectl get pods -n planepool
kubectl get svc -n planepool

# View logs
kubectl logs -f deployment/planepool-admin -n planepool

# Check metrics
kubectl top pods -n planepool
kubectl top nodes

# Run smoke tests
curl https://admin.planepool.com/health
curl https://admin.planepool.com/api/trpc/auth.me
```

## Testing Procedures

### Unit Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run specific test file
pnpm test server/auth.logout.test.ts

# Generate coverage report
pnpm test:coverage
```

### Integration Testing

Create tests for critical workflows:

```typescript
// server/admin.users.test.ts
import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";

describe("admin.users", () => {
  it("should list users with pagination", async () => {
    const caller = appRouter.createCaller(adminContext);
    const result = await caller.admin.users.list({
      limit: 10,
      offset: 0,
    });
    expect(result.users).toBeDefined();
    expect(result.total).toBeGreaterThanOrEqual(0);
  });

  it("should ban a user", async () => {
    const caller = appRouter.createCaller(adminContext);
    const result = await caller.admin.users.ban({
      userId: 123,
      reason: "Test ban",
    });
    expect(result.success).toBe(true);
  });
});
```

### End-to-End Testing

```bash
# Run E2E tests (if configured)
pnpm test:e2e

# Manual E2E testing checklist:
# 1. Login as admin
# 2. Navigate to Users page
# 3. Search for a user
# 4. View user details
# 5. Ban/unban user
# 6. Navigate to KYC page
# 7. Review a document
# 8. Approve/reject document
# 9. Navigate to Analytics
# 10. Check real-time metrics
# 11. Send a notification
# 12. Check notification delivery
```

### Performance Testing

```bash
# Load testing with Apache Bench
ab -n 1000 -c 10 https://admin.planepool.com/

# Stress testing with wrk
wrk -t4 -c100 -d30s https://admin.planepool.com/

# Monitor during load test
kubectl top pods -n planepool --watch
```

## Monitoring & Alerts

### Key Metrics to Monitor

1. **Pod Health**
   - CPU usage (target: <70%)
   - Memory usage (target: <80%)
   - Restart count (target: 0)

2. **Application Metrics**
   - Request latency (p95 < 500ms)
   - Error rate (< 0.1%)
   - Throughput (requests/sec)

3. **Database Metrics**
   - Connection pool usage
   - Query latency
   - Slow query count

### Set Up Alerts

```bash
# Create alert for pod crashes
kubectl create alert pod-crash \
  --condition "pod.restartCount > 0" \
  --namespace planepool

# Create alert for high CPU
kubectl create alert high-cpu \
  --condition "pod.cpu > 80%" \
  --namespace planepool

# Create alert for high memory
kubectl create alert high-memory \
  --condition "pod.memory > 90%" \
  --namespace planepool
```

## Rollback Procedures

### Automatic Rollback

If deployment fails or health checks fail:

```bash
# Automatic rollback (configured in deployment)
kubectl rollout undo deployment/planepool-admin -n planepool
```

### Manual Rollback

```bash
# View rollout history
kubectl rollout history deployment/planepool-admin -n planepool

# Rollback to previous version
kubectl rollout undo deployment/planepool-admin -n planepool

# Rollback to specific revision
kubectl rollout undo deployment/planepool-admin -n planepool --to-revision=5

# Verify rollback
kubectl rollout status deployment/planepool-admin -n planepool
```

## Database Migration

### Before Deployment

1. **Backup Database**
   ```bash
   gcloud sql backups create --instance=planepool-db
   ```

2. **Test Migration**
   ```bash
   # Run migrations on staging first
   pnpm db:push --env=staging
   ```

3. **Verify Data Integrity**
   ```bash
   # Run validation queries
   SELECT COUNT(*) FROM users;
   SELECT COUNT(*) FROM kyc_documents;
   ```

### During Deployment

1. **Run Migrations**
   ```bash
   # Migrations run automatically during deployment
   # Check migration status
   kubectl logs deployment/planepool-admin -n planepool | grep "migration"
   ```

2. **Monitor Database**
   ```bash
   # Check connection pool
   SHOW PROCESSLIST;
   
   # Check slow queries
   SELECT * FROM mysql.slow_log;
   ```

### After Deployment

1. **Verify Schema**
   ```bash
   # Check table structure
   DESCRIBE users;
   DESCRIBE kyc_documents;
   ```

2. **Validate Data**
   ```bash
   # Run consistency checks
   SELECT COUNT(*) FROM users WHERE created_at IS NULL;
   ```

## Incident Response

### If Deployment Fails

1. **Check Logs**
   ```bash
   kubectl logs deployment/planepool-admin -n planepool
   kubectl describe pod <pod-name> -n planepool
   ```

2. **Check Events**
   ```bash
   kubectl get events -n planepool --sort-by='.lastTimestamp'
   ```

3. **Rollback**
   ```bash
   kubectl rollout undo deployment/planepool-admin -n planepool
   ```

### If Application Crashes

1. **Check Pod Status**
   ```bash
   kubectl get pods -n planepool
   kubectl describe pod <pod-name> -n planepool
   ```

2. **View Logs**
   ```bash
   kubectl logs <pod-name> -n planepool --previous
   ```

3. **Restart Pod**
   ```bash
   kubectl delete pod <pod-name> -n planepool
   ```

### If Database Connection Fails

1. **Check Database**
   ```bash
   gcloud sql instances describe planepool-db
   ```

2. **Check Credentials**
   ```bash
   kubectl get secret planepool-secrets -n planepool -o yaml
   ```

3. **Test Connection**
   ```bash
   kubectl run -it --rm debug --image=mysql:8 --restart=Never -- \
     mysql -h <DB_HOST> -u <DB_USER> -p<DB_PASSWORD> planepool
   ```

## Success Criteria

### Deployment is successful if:

- [ ] All pods are running (3+ replicas)
- [ ] Health checks pass
- [ ] No error logs in first 5 minutes
- [ ] API endpoints respond correctly
- [ ] Database queries execute successfully
- [ ] Admin panel loads in browser
- [ ] All admin features work as expected
- [ ] No increase in error rate
- [ ] Performance metrics are normal

### Rollback if:

- [ ] Pods fail to start
- [ ] Health checks fail
- [ ] Error rate > 1%
- [ ] Database connection fails
- [ ] Critical features broken
- [ ] Performance degradation > 50%

## Documentation

- **Deployment Guide**: See `DEPLOYMENT_GUIDE.md`
- **Admin Panel Guide**: See `ADMIN_PANEL_README.md`
- **API Documentation**: See inline code comments
- **Troubleshooting**: See `DEPLOYMENT_GUIDE.md#Troubleshooting`

## Support

For deployment issues:
1. Check logs: `kubectl logs -f deployment/planepool-admin -n planepool`
2. Check events: `kubectl get events -n planepool`
3. Check pod status: `kubectl describe pod <pod-name> -n planepool`
4. Review this guide for common solutions
5. Contact the development team

---

**Last Updated**: May 10, 2026  
**Version**: 1.0.0
