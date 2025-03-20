[build]
  publish = "dist"
  command = "npm run build"

# Environment variables for development
[context.dev.environment]
  VITE_API_URL = "http://localhost:4041"

# Environment variables for production
[context.production.environment]
  VITE_API_URL = "https://api.lawsofexistence.com"

# Handle admin routes
[[redirects]]
  from = "/admin/*"
  to = "/admin/index.html"
  status = 200
  force = true

# Handle SPA routing - redirect all routes to index.html
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Add security headers
[[headers]]
  for = "/*"
    [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=(), interest-cohort=()"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self' https://api.lawsofexistence.com;"

# Development server configuration
[dev]
  framework = "#custom"
  command = "npm run dev"
  targetPort = 5173  # Vite's default port
  port = 8888
  publish = "dist"
  autoLaunch = false

# Force HTTPS redirect
[[redirects]]
  from = "http://lawsofexistence.com/*"
  to = "https://www.lawsofexistence.com/:splat"
  status = 301
  force = true

[[redirects]]
  from = "http://www.lawsofexistence.com/*"
  to = "https://www.lawsofexistence.com/:splat"
  status = 301
  force = true

[[redirects]]
  from = "https://lawsofexistence.com/*"
  to = "https://www.lawsofexistence.com/:splat"
  status = 301
  force = true

[[redirects]]
  from = "https://lawofexistence.netlify.app/*"
  to = "https://www.lawsofexistence.com/:splat"
  status = 301
  force = true