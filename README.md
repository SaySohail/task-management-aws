# Task Management System on AWS

A full-stack task management application with a modern **Next.js** UI and a **Node/Express** API backed by **MongoDB Atlas**. It ships with automated **CI/CD (GitHub Actions)**, **API tests (Newman)**, **UI tests (Cypress)**, hardened deployment on **AWS Elastic Beanstalk**, and pragmatic security defaults.

---

## 🚀 Overview

* **Frontend:** Next.js App Router, statically exported, responsive UI (Tailwind, shadcn/ui)
* **Backend:** Node.js + Express, JWT auth, MongoDB via Mongoose
* **Testing:** Newman (API), Cypress (E2E + Component)
* **CI/CD:** Single GitHub Actions workflow builds → deploys to Elastic Beanstalk → runs tests
* **AWS:** EB single-instance environment, Route 53 DNS, optional HTTPS automation
* **Security:** Atlas IP allowlist, HTTPS, no secrets in repo (EB env vars + GitHub OIDC)
* **Logging:** Nginx + app logs, EB engine/hook logs, optional CloudWatch streaming

---

## 🏗️ Architecture

> **Diagram:** Architecture diagram will be added to this repository

**Current flow**

1. **Browser (SPA)** → static assets served by **nginx** on the EB instance (from `server/public`)
2. **API calls** → **nginx** reverse-proxy → **Express** (`/auth`, `/api`, `/healthz`)
3. **Data** → **MongoDB Atlas** (Mongoose)
4. **CI/CD** → GitHub Actions builds client → copies to `server/public` → packages server → deploys to EB → runs Newman + Cypress

**DNS/HTTPS**

* DNS: Custom domain (Route 53 **CNAME** → EB environment CNAME)
* HTTPS (current): Let's Encrypt on the EB instance via post-deploy hook (nginx terminates TLS)
* HTTPS (recommended for production): **CloudFront/ALB + ACM** (managed certs, HTTP/2/3, WAF). This can replace instance-level TLS later without code changes.

---

## 📂 Project Structure

```
.
├─ client/                           # Next.js app (static export for deploy)
│  ├─ app/                           # App Router pages (incl. /auth/success)
│  ├─ components/                    # UI components (shadcn/ui, etc.)
│  ├─ hooks/                         # Custom hooks (e.g., toasts)
│  ├─ lib/api.ts                     # apiUrl helper (same-origin smart default)
│  ├─ store/                         # zustand store for state management
│  └─ next.config.js                 # { output: "export" }
│
├─ server/                           # Express API + static hosting of exported UI
│  ├─ index.js                       # Express bootstrap (/auth, /api, /healthz)
│  ├─ routes/                        # AuthRouter, TaskRouter
│  ├─ controllers/                   # AuthController (register/login)
│  ├─ models/                        # User model, db connection
│  ├─ public/                        # (filled in CI) exported Next app
│  └─ .platform/                     # EB nginx + hooks (TLS automation templates)
│     ├─ nginx/conf.d/
│     │  ├─ 00_http.conf.template
│     │  └─ 10_https.conf.template
│     └─ hooks/postdeploy/01_setup_https.sh
│
├─ postman/                          # Newman collection & environments
├─ cypress/                          # E2E and component tests
├─ .github/workflows/                # Deploy & Test pipeline
└─ README.md
```

---

## 🎨 Frontend (UI Code)

### Tech Stack
* **Next.js (App Router)** with **static export** (`next.config.js → { output: "export" }`)
* **TypeScript** for type safety
* **Tailwind CSS** for styling
* **shadcn/ui** for component library
* **Zustand** for state management
* **@tabler/icons-react** for icons
* **Fetch API** (no axios dependency)

### Key Features
* **Static Export**: Next.js builds to static files served by Express
* **App Router**: Modern Next.js 13+ routing system
* **Server-Side Generation**: Pre-rendered pages for optimal performance
* **Responsive Design**: Mobile-first approach with Tailwind CSS
* **Component Library**: Reusable shadcn/ui components
* **Type Safety**: Full TypeScript integration

### Architecture Notes
* CI builds `client/` and copies `client/out/*` → `server/public/` so the API serves the SPA
* `lib/api.ts` defaults to **same-origin** in the browser and only uses `NEXT_PUBLIC_BASE_URL` if it's a non-localhost URL. This avoids "prod calling localhost" issues

### Local Development
```bash
cd client
npm i
npm run dev   # http://localhost:3000
```

---

## ⚙️ Backend (Server Code)

### Tech Stack
* **Node.js + Express** web framework
* **Mongoose** for MongoDB Atlas integration
* **bcrypt** for password hashing
* **jsonwebtoken** for JWT authentication
* **cors** for cross-origin requests
* **body-parser** for request parsing

### API Endpoints
* `POST /auth/register` — Create user (name/email/password)
* `POST /auth/login` — Returns JWT (28-day expiry)
* `GET /api/tasks` — Retrieve user tasks
* `POST /api/tasks` — Create new task
* `PUT /api/tasks/:id` — Update existing task
* `DELETE /api/tasks/:id` — Delete task
* `GET /healthz`, `GET /ping` — Health checks

### Authentication
* Users register with name, email, password (stored as bcrypt hashes)
* Login returns a JWT; the SPA stores it (e.g., `localStorage`) and includes it in subsequent API requests
* The User model hides `password` by default; login explicitly selects it for comparison

### Static SPA Serving
* Express serves files in `server/public/` (generated during CI)

### Local Development
```bash
cd server
npm i
PORT=8081 npm start
curl -I http://localhost:8081/healthz
```

---

## 🧪 Testing Strategy

### Newman (API Testing)
* **Collection-based Testing**: Postman collections for automated API testing
* **Environment Configuration**: Separate environments for different stages
* **Files**: `postman/collection.json`, `postman/env.staging.json`

**Local API Testing**
```bash
newman run postman/collection.json \
  -e postman/env.staging.json \
  --env-var baseUrl=http://localhost:8081
```

### Cypress (E2E + Component Testing)
* **End-to-End Testing**: Complete user journey testing
* **Component Testing**: Isolated Next.js component testing
* **Configuration**: Lives under `client/` directory

**Local Testing**
```bash
cd client
npm run cypress:open    # Interactive mode
npm run cypress:run     # Headless mode
```

**CI Testing**
* Uses `cypress-io/github-action` in the workflow for headless execution

### Test Coverage
* **API Tests**: Newman collections cover all authentication and task management endpoints
* **E2E Tests**: Critical user flows from registration to task management
* **Component Tests**: Individual UI component testing with real browser rendering

---

## 🔄 CI/CD Pipeline (GitHub Actions)

### Workflow: `.github/workflows/deploy.yml`

The deployment pipeline follows these steps:

1. **AWS OIDC Authentication**
   - Assumes IAM role via `aws-actions/configure-aws-credentials`
   - No long-lived AWS access keys required

2. **Build Process**
   - **Build UI**: Next.js static export from `client/`
   - **Prepare Server**: Copy `client/out` to `server/public`
   - **Package**: Create deployment-ready server package

3. **Deployment**
   - **Upload**: Zip `server/` and upload to S3 releases bucket
   - **Deploy**: Create EB application version and update environment
   - **Health Checks**: Wait for environment to reach "Ready" status

4. **Post-Deploy Testing**
   - **API Tests**: Newman collection against deployed environment
   - **UI Tests**: Cypress E2E tests against live application

5. **Failure Handling**
   - **Diagnostics**: Print recent EB events and logs
   - **Log Tailing**: Surface engine/hook/nginx logs in job output

### Required Repository Variables
```bash
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=123456789012
RELEASES_BUCKET=my-app-releases

# Elastic Beanstalk
EB_APP_NAME=task-management-app
EB_ENV_NAME=task-management-env

# Testing URLs
POSTMAN_API_BASE=https://your-domain.com
CYPRESS_BASE_URL=https://your-domain.com
```

### Security Features
* **OIDC Authentication**: GitHub OIDC provider for secure AWS access
* **Least Privilege**: IAM roles with minimal required permissions
* **No Hardcoded Secrets**: All sensitive data in environment variables

---

## ☁️ AWS Environment

### Infrastructure Components
* **Elastic Beanstalk**
  - Single instance Node.js platform
  - **nginx** reverse-proxies to Node.js on localhost
  - Custom `.platform/` configuration for TLS automation

* **Route 53**
  - DNS management with CNAME records
  - Points custom domain to EB environment CNAME

* **S3**
  - Stores application deployment packages
  - Versioned releases for rollback capability

* **Security Groups**
  - Inbound ports 80 and 443 from `0.0.0.0/0`
  - Configured for public web application access

### Platform Configuration
The `.platform/` directory contains:
* `00_http.conf.template` & `10_https.conf.template` (nginx configuration)
* `hooks/postdeploy/01_setup_https.sh` for Let's Encrypt automation

### Environment Variables (EB Configuration)
```bash
# Required
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/taskdb
JWT_SECRET=your-strong-jwt-secret

# Optional (for TLS automation)
CERTBOT_EMAIL=admin@yourdomain.com
CERTBOT_DOMAIN=tasks.yourdomain.com

# Optional (for cross-origin dev)
CLIENT_BASE_URL=http://localhost:3000
```

### Production Hardening Recommendations
* **CloudFront + ALB + ACM**: Managed certificates, caching, IPv6/HTTP3 support
* **WAF Integration**: Web Application Firewall for additional security
* **Multi-AZ Deployment**: High availability configuration

---

## 🔒 Security Implementation

### MongoDB Atlas Security
* **IP Allowlist**: Restricted database access to specific IP ranges
  - Office/VPN egress IPs
  - EB instance egress IP
  - Avoid `0.0.0.0/0` in production

### HTTPS Configuration
* **Current Implementation**: Let's Encrypt on EB instance
  - Nginx terminates TLS locally
  - Automatic certificate renewal via post-deploy hooks
* **Recommended for Production**: CloudFront/ALB with ACM
  - Managed certificates with automatic renewal
  - Edge termination for better performance

### Secrets Management
* **No Secrets in Repository**: All sensitive data stored securely
* **EB Environment Variables**: Database credentials, JWT secrets
* **GitHub OIDC**: Temporary AWS credentials for CI/CD
* **Principle of Least Privilege**: IAM roles with minimal permissions

### Additional Security Measures
* **CORS Configuration**: Restrict origins to known domains
* **JWT Security**: 28-day token expiry, secure storage recommendations
* **Password Security**: bcrypt hashing with salt rounds
* **Input Validation**: Server-side validation for all endpoints

### Future Security Enhancements
* **HttpOnly Cookies**: For session management instead of localStorage
* **Secure Cookie Flags**: `HttpOnly`, `Secure`, `SameSite=Lax`
* **Trusted Proxy**: `app.set('trust proxy', 1)` for proper client IP detection

---

## 📜 Logging & Monitoring

### Application Logging
**On the EB Instance**
* **App stdout**: `/var/log/web.stdout.log`
* **Nginx Access**: `/var/log/nginx/access.log`
* **Nginx Error**: `/var/log/nginx/error.log`
* **EB Engine**: `/var/log/eb-engine.log`
* **EB Hooks**: `/var/log/eb-hooks.log`

### CI/CD Diagnostics
**Automated Log Collection**
* EB Console → **Logs** → "Request last 100 lines"
* Workflow automatically surfaces recent events and tail logs on failures
* Real-time deployment status and health check monitoring

### Optional CloudWatch Integration
* **Log Streaming**: Forward application logs to CloudWatch Logs
* **Custom Metrics**: Application performance and business metrics
* **Alarms**: Automated alerts for 5xx rates, unhealthy status, latency spikes
* **Dashboards**: Custom monitoring dashboards for operational visibility

### Monitoring Best Practices
```bash
# Health check endpoints
GET /healthz     # Application health
GET /ping        # Simple connectivity test

# Log levels in application
ERROR   # Critical failures
WARN    # Warning conditions  
INFO    # General information
DEBUG   # Detailed diagnostic info
```

---

## 🧭 Local Development

### Option A: Production-like Setup
Serve the built SPA from the API (closer to production behavior)

```bash
# Build UI
cd client && npm i && npm run build

# Copy to server public directory
cd .. && rm -rf server/public && mkdir -p server/public && cp -r client/out/* server/public/

# Run API server
cd server && npm i && npm start

# Test health endpoint
curl -I http://localhost:8081/healthz
```

### Option B: Development Mode
Run UI and API separately (best developer experience)

```bash
# Terminal 1 - API Server
cd server && npm i && PORT=8081 npm start

# Terminal 2 - Next.js Dev Server  
cd client && npm i && npm run dev   # http://localhost:3000
```

### Environment Configuration

**Server Environment (`.env` for local development)**
```bash
# Core configuration
PORT=8081
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/taskdb
JWT_SECRET=your-development-jwt-secret

# Optional for cross-origin development
CLIENT_BASE_URL=http://localhost:3000

# TLS automation (if testing locally)
CERTBOT_EMAIL=dev@yourdomain.com
CERTBOT_DOMAIN=localhost
```

**Client Environment** (avoid setting in CI)
```bash
# Only if you must override same-origin behavior
NEXT_PUBLIC_BASE_URL=http://localhost:8081
```

---

## 🛠️ Troubleshooting Guide

### Common Issues & Solutions

#### 502 Bad Gateway (Custom Domain)
**Problem**: Nginx can't reach Node.js application
**Solution**: 
* Ensure `proxy_pass` points to correct localhost port
* Verify app is listening on expected port
* Re-render nginx configs via post-deploy hook: `nginx -t && nginx -s reload`

#### Production Hitting Localhost
**Problem**: Production app making requests to localhost
**Solution**:
* Ensure `client/lib/api.ts` defaults to **same-origin**
* Verify `NEXT_PUBLIC_BASE_URL` isn't set to `http://localhost:*` in CI
* Use environment-aware API base URL configuration

#### Static File ENOENT
**Problem**: Static assets not found (404 errors)
**Solution**:
* Build and copy UI to `server/public`: `npm run build && cp -r client/out/* server/public/`
* For development: run UI on `:3000` and set `CLIENT_BASE_URL`
* Verify nginx static file serving configuration

#### EB Deployment Errors
**Problem**: Deployment fails with unclear errors
**Solution**:
* Check `/var/log/eb-engine.log` for deployment process errors
* Review `/var/log/eb-hooks.log` for custom hook failures
* Examine nginx configuration syntax: `nginx -t`
* Verify file permissions on deployment hooks: `chmod +x`

#### Missing Environment Variables
**Problem**: Server returns 500 errors, environment variables undefined
**Solution**:
* Set required variables in EB environment properties:
  - `MONGO_URI` (MongoDB connection string)
  - `JWT_SECRET` (strong random value)
* Verify environment variable names match code expectations
* Check EB Console → Configuration → Software → Environment properties

#### Database Connection Issues
**Problem**: Cannot connect to MongoDB Atlas
**Solution**:
* Verify MongoDB Atlas IP allowlist includes EB instance IP
* Check connection string format and credentials
* Test connection locally with same credentials
* Review Atlas network access settings

### Debugging Commands

```bash
# Check nginx configuration
sudo nginx -t

# Reload nginx configuration  
sudo nginx -s reload

# View real-time logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/web.stdout.log

# Test API endpoint
curl -v http://localhost:8081/healthz

# Check process status
pm2 status (if using PM2)
ps aux | grep node
```

### Performance Optimization

#### Frontend Optimizations
* **Static Generation**: Pre-built pages for faster loading
* **Image Optimization**: Next.js automatic image optimization
* **Code Splitting**: Automatic bundle splitting by Next.js
* **Tree Shaking**: Remove unused code from bundles

#### Backend Optimizations  
* **Database Indexing**: Proper indexes on frequently queried fields
* **Query Optimization**: Efficient MongoDB queries with Mongoose
* **Caching Strategies**: In-memory caching for frequently accessed data
* **Connection Pooling**: MongoDB connection pool optimization

#### Infrastructure Optimizations
* **CloudFront CDN**: Edge caching for static assets
* **Elastic Beanstalk Auto Scaling**: Automatic scaling based on load
* **Database Connection Limits**: Optimize MongoDB Atlas connection limits

---


## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with care using modern web technologies and AWS cloud services.**