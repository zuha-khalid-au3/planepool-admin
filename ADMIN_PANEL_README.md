# PlanePool Admin Panel

A comprehensive, production-grade admin dashboard for managing the PlanePool platform. Built with React 19, Express, tRPC, TypeScript, and MySQL.

## Features

### 1. User Management
- View all platform users with search and filtering
- Monitor verification status (Government ID, Selfie, Flight Ticket)
- Track trust scores and ban status
- Ban/unban users with reason tracking
- View user activity and history

### 2. KYC Verification
- Review pending KYC documents
- Document preview with full-screen viewing
- Approve/reject documents with notes
- Track verification status and timestamps
- Bulk verification operations

### 3. CMS Management
- Manage app content (destinations, FAQs, onboarding copy)
- Create/edit/delete content items
- Toggle content visibility
- Organize content by type
- Version control for content changes

### 4. B2B Partner Management
- Onboard airport authorities, airlines, hotels, transport providers
- Manage partner contracts and revenue sharing
- Track partner performance metrics
- Manage sponsored listings and promotions

### 5. Security & Compliance
- Monitor SOS incidents and safety events
- Review flagged users and suspicious activity
- Manage user appeals and disputes
- Track compliance metrics
- Generate audit reports

### 6. Analytics Dashboard
- Real-time platform metrics
- Daily active users tracking
- Ride group formation analytics
- Revenue tracking and forecasting
- Conversion funnel analysis
- Top destinations and performance metrics

### 7. Notification System
- Compose targeted push notifications
- Schedule notifications for specific times
- Target user segments (all users, flight-specific, destination-based)
- Track delivery and engagement metrics

### 8. Audit Logging
- Track all admin actions with timestamps
- Record changes and diffs
- Filter by admin, action, resource type
- Export audit logs for compliance

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS 4
- **Backend**: Express 4, Node.js
- **API**: tRPC 11 (end-to-end type safety)
- **Database**: MySQL 8 / TiDB with Drizzle ORM
- **Authentication**: Manus OAuth
- **Deployment**: Docker, Kubernetes (GKE), GitHub Actions
- **UI Components**: shadcn/ui, Recharts for analytics

## Project Structure

```
planepool-admin/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Admin pages
│   │   ├── components/    # Reusable components
│   │   ├── hooks/         # Custom hooks
│   │   ├── contexts/      # React contexts
│   │   ├── lib/           # Utilities
│   │   └── App.tsx        # Main router
│   ├── public/            # Static assets
│   └── index.html
├── server/                # Express backend
│   ├── _core/            # Framework core
│   ├── routers/          # tRPC routers
│   ├── db.ts             # Database helpers
│   ├── rbac.ts           # Role-based access control
│   └── index.ts          # Entry point
├── drizzle/              # Database schema & migrations
│   └── schema.ts         # Table definitions
├── shared/               # Shared types & constants
├── Dockerfile            # Docker image definition
├── k8s-deployment.yaml   # Kubernetes manifests
├── .github/workflows/    # CI/CD pipelines
└── package.json          # Dependencies
```

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm
- Docker (for deployment)
- MySQL 8 or TiDB

### Installation

```bash
# Clone repository
git clone https://github.com/your-org/planepool-admin.git
cd planepool-admin

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
pnpm db:push

# Start development server
pnpm dev
```

The admin panel will be available at `http://localhost:3000/admin`

## Development

### Database Schema

The database schema is defined in `drizzle/schema.ts` using Drizzle ORM. Key tables:

- **users**: Platform users with verification status
- **admin_users**: Admin accounts with permissions
- **kyc_documents**: KYC verification documents
- **flights**: Flight tracking data
- **ride_groups**: Ride group formations
- **cmsContent**: App content management
- **b2bPartners**: B2B partner information
- **sosIncidents**: Safety incidents
- **auditLogs**: Admin action tracking
- **notifications**: Push notification campaigns
- **analyticsMetrics**: Platform metrics
- **userAppeals**: User appeals and disputes

### Adding New Features

1. **Update Database Schema**
   ```bash
   # Edit drizzle/schema.ts
   pnpm db:push
   ```

2. **Create Backend Procedures**
   ```typescript
   // server/routers/admin.ts
   export const adminRouter = router({
     newFeature: adminProcedure.query(async ({ ctx }) => {
       // Implementation
     }),
   });
   ```

3. **Build Frontend Components**
   ```typescript
   // client/src/pages/AdminNewFeature.tsx
   export default function AdminNewFeature() {
     const { data } = trpc.admin.newFeature.useQuery();
     // Component implementation
   }
   ```

4. **Add Routes**
   ```typescript
   // client/src/App.tsx
   <Route path="/admin/new-feature" component={AdminNewFeature} />
   ```

### Testing

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate coverage report
pnpm test:coverage
```

## Deployment

### Local Docker Build

```bash
# Build image
docker build -t planepool-admin:latest .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="mysql://user:pass@host:3306/planepool" \
  -e JWT_SECRET="your-secret" \
  planepool-admin:latest
```

### GCP Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions on deploying to Google Kubernetes Engine.

### GitHub Actions CI/CD

The project includes automated CI/CD pipeline that:
- Runs tests on every push
- Builds Docker image
- Pushes to Google Container Registry
- Deploys to GKE (main branch only)

## Configuration

### Environment Variables

```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/planepool

# Authentication
JWT_SECRET=your-jwt-secret-key
OAUTH_SERVER_URL=https://api.manus.im
VITE_APP_ID=your-app-id
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im

# Owner
OWNER_NAME=Admin
OWNER_OPEN_ID=owner-open-id

# APIs
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your-api-key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY=your-frontend-key

# Analytics
VITE_ANALYTICS_ENDPOINT=https://analytics.example.com
VITE_ANALYTICS_WEBSITE_ID=your-website-id
```

## API Documentation

### tRPC Procedures

All backend functionality is exposed through tRPC procedures. The type-safe API ensures consistency between frontend and backend.

#### Example: User Management

```typescript
// Get all users with filters
const { data: users } = trpc.admin.users.list.useQuery({
  search: "john",
  verificationStatus: "pending",
  limit: 20,
  offset: 0,
});

// Ban a user
const banMutation = trpc.admin.users.ban.useMutation();
await banMutation.mutateAsync({
  userId: 123,
  reason: "Suspicious activity",
  expiresAt: new Date(),
});
```

## Security

### Role-Based Access Control (RBAC)

- **admin**: Can manage users, review KYC, manage content
- **super_admin**: Full access including admin management

### Authentication

- OAuth-based authentication via Manus
- Session cookies with JWT signing
- Protected procedures enforce role checks

### Data Protection

- KYC documents stored securely in S3
- Sensitive data encrypted at rest
- Audit logging for compliance
- Network policies restrict traffic

## Monitoring & Logging

### Logs

- Application logs: `./logs/app.log`
- Database logs: Check MySQL/TiDB logs
- Kubernetes logs: `kubectl logs -f deployment/planepool-admin -n planepool`

### Metrics

- CPU and memory usage
- Request latency
- Error rates
- Database query performance

## Troubleshooting

### Common Issues

**Issue**: Database connection error
```bash
# Check DATABASE_URL
echo $DATABASE_URL

# Test connection
mysql -h <host> -u <user> -p<password> planepool
```

**Issue**: OAuth authentication fails
```bash
# Verify OAuth credentials
echo $VITE_APP_ID
echo $OAUTH_SERVER_URL
```

**Issue**: Build fails
```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm build
```

## Performance Optimization

- Implemented pagination for large datasets
- Lazy loading for analytics charts
- Database query optimization with indexes
- Frontend code splitting with React.lazy
- Caching strategies for frequently accessed data

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and commit: `git commit -am 'Add feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Submit pull request

## License

MIT

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Contact the development team
- Check documentation at [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

**Version**: 1.0.0  
**Last Updated**: May 10, 2026  
**Status**: Production Ready
