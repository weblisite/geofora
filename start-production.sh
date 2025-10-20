#!/bin/bash

# GEOFORA Platform - Production Startup Script
# This script handles the complete production startup process

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="geofora"
APP_PORT=3000
NODE_ENV="production"
LOG_DIR="./logs"
BACKUP_DIR="./backups"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        error "This script should not be run as root"
        exit 1
    fi
}

# Check system requirements
check_system_requirements() {
    log "Checking system requirements..."
    
    # Check Node.js version
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2)
    REQUIRED_VERSION="18.0.0"
    
    if ! node -e "process.exit(process.version >= 'v$REQUIRED_VERSION' ? 0 : 1)"; then
        error "Node.js version $REQUIRED_VERSION or higher is required. Current version: $NODE_VERSION"
        exit 1
    fi
    
    # Check PostgreSQL
    if ! command -v psql &> /dev/null; then
        error "PostgreSQL is not installed"
        exit 1
    fi
    
    # Check Redis (optional)
    if ! command -v redis-cli &> /dev/null; then
        warning "Redis is not installed (optional but recommended)"
    fi
    
    # Check PM2
    if ! command -v pm2 &> /dev/null; then
        warning "PM2 is not installed. Installing..."
        npm install -g pm2
    fi
    
    success "System requirements check completed"
}

# Check environment variables
check_environment() {
    log "Checking environment variables..."
    
    # Required environment variables
    REQUIRED_VARS=(
        "DATABASE_URL"
        "CLERK_SECRET_KEY"
        "CLERK_PUBLISHABLE_KEY"
        "OPENAI_API_KEY"
        "STRIPE_SECRET_KEY"
        "STRIPE_WEBHOOK_SECRET"
        "POLAR_ACCESS_TOKEN"
        "JWT_SECRET"
        "ENCRYPTION_KEY"
    )
    
    for var in "${REQUIRED_VARS[@]}"; do
        if [[ -z "${!var}" ]]; then
            error "Required environment variable $var is not set"
            exit 1
        fi
    done
    
    # Optional environment variables
    OPTIONAL_VARS=(
        "ANTHROPIC_API_KEY"
        "DEEPSEEK_API_KEY"
        "GOOGLE_API_KEY"
        "META_API_KEY"
        "XAI_API_KEY"
        "REDIS_URL"
        "SENTRY_DSN"
    )
    
    for var in "${OPTIONAL_VARS[@]}"; do
        if [[ -z "${!var}" ]]; then
            warning "Optional environment variable $var is not set"
        fi
    done
    
    success "Environment variables check completed"
}

# Create necessary directories
create_directories() {
    log "Creating necessary directories..."
    
    mkdir -p "$LOG_DIR"
    mkdir -p "$BACKUP_DIR"
    mkdir -p "./uploads"
    mkdir -p "./temp"
    
    success "Directories created"
}

# Install dependencies
install_dependencies() {
    log "Installing dependencies..."
    
    if [[ ! -f "package.json" ]]; then
        error "package.json not found"
        exit 1
    fi
    
    npm ci --only=production
    
    success "Dependencies installed"
}

# Build application
build_application() {
    log "Building application..."
    
    if [[ ! -f "tsconfig.json" ]]; then
        error "tsconfig.json not found"
        exit 1
    fi
    
    npm run build
    
    if [[ ! -d "dist" ]]; then
        error "Build failed - dist directory not found"
        exit 1
    fi
    
    success "Application built successfully"
}

# Check database connection
check_database() {
    log "Checking database connection..."
    
    if ! psql "$DATABASE_URL" -c "SELECT 1;" &> /dev/null; then
        error "Database connection failed"
        exit 1
    fi
    
    success "Database connection verified"
}

# Run database migrations
run_migrations() {
    log "Running database migrations..."
    
    if [[ -f "scripts/migrate.ts" ]]; then
        npx tsx scripts/migrate.ts
    elif [[ -f "scripts/migrate.js" ]]; then
        node scripts/migrate.js
    else
        warning "Migration script not found"
    fi
    
    success "Database migrations completed"
}

# Check Redis connection
check_redis() {
    if [[ -n "$REDIS_URL" ]]; then
        log "Checking Redis connection..."
        
        if ! redis-cli -u "$REDIS_URL" ping &> /dev/null; then
            error "Redis connection failed"
            exit 1
        fi
        
        success "Redis connection verified"
    fi
}

# Start application with PM2
start_application() {
    log "Starting application with PM2..."
    
    # Create PM2 ecosystem file
    cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '$APP_NAME',
    script: 'dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: '$NODE_ENV',
      PORT: $APP_PORT
    },
    error_file: '$LOG_DIR/err.log',
    out_file: '$LOG_DIR/out.log',
    log_file: '$LOG_DIR/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=4096'
  }]
};
EOF
    
    # Start application
    pm2 start ecosystem.config.js
    
    # Save PM2 configuration
    pm2 save
    
    success "Application started with PM2"
}

# Wait for application to be ready
wait_for_application() {
    log "Waiting for application to be ready..."
    
    local max_attempts=30
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        if curl -f "http://localhost:$APP_PORT/api/health" &> /dev/null; then
            success "Application is ready"
            return 0
        fi
        
        log "Attempt $attempt/$max_attempts - waiting for application..."
        sleep 2
        ((attempt++))
    done
    
    error "Application failed to start within expected time"
    exit 1
}

# Setup monitoring
setup_monitoring() {
    log "Setting up monitoring..."
    
    # Create monitoring script
    cat > monitor.sh << 'EOF'
#!/bin/bash

# Health check script
while true; do
    if ! curl -f http://localhost:3000/api/health &> /dev/null; then
        echo "$(date): Health check failed" >> ./logs/health.log
        pm2 restart geofora
    fi
    sleep 60
done
EOF
    
    chmod +x monitor.sh
    
    # Start monitoring in background
    nohup ./monitor.sh > /dev/null 2>&1 &
    
    success "Monitoring setup completed"
}

# Setup log rotation
setup_log_rotation() {
    log "Setting up log rotation..."
    
    # Create logrotate configuration
    sudo tee /etc/logrotate.d/geofora << EOF
$PWD/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 $(whoami) $(whoami)
    postrotate
        pm2 reloadLogs
    endscript
}
EOF
    
    success "Log rotation setup completed"
}

# Setup backup
setup_backup() {
    log "Setting up backup..."
    
    # Create backup script
    cat > backup.sh << 'EOF'
#!/bin/bash

# Backup script
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.tar.gz"

# Create backup
tar -czf "$BACKUP_FILE" \
    --exclude=node_modules \
    --exclude=dist \
    --exclude=logs \
    --exclude=backups \
    .

echo "$(date): Backup created: $BACKUP_FILE" >> ./logs/backup.log

# Clean old backups (keep last 7 days)
find "$BACKUP_DIR" -name "backup_*.tar.gz" -mtime +7 -delete
EOF
    
    chmod +x backup.sh
    
    # Schedule daily backup
    (crontab -l 2>/dev/null; echo "0 2 * * * cd $PWD && ./backup.sh") | crontab -
    
    success "Backup setup completed"
}

# Display startup information
display_startup_info() {
    log "Displaying startup information..."
    
    echo ""
    echo "=========================================="
    echo "  GEOFORA Platform - Production Ready"
    echo "=========================================="
    echo ""
    echo "Application: $APP_NAME"
    echo "Port: $APP_PORT"
    echo "Environment: $NODE_ENV"
    echo "Log Directory: $LOG_DIR"
    echo "Backup Directory: $BACKUP_DIR"
    echo ""
    echo "Health Check: http://localhost:$APP_PORT/api/health"
    echo "API Documentation: http://localhost:$APP_PORT/api/docs"
    echo ""
    echo "PM2 Commands:"
    echo "  pm2 status          - Check application status"
    echo "  pm2 logs geofora    - View application logs"
    echo "  pm2 restart geofora - Restart application"
    echo "  pm2 stop geofora    - Stop application"
    echo ""
    echo "Monitoring:"
    echo "  ./monitor.sh         - Start health monitoring"
    echo "  ./backup.sh          - Create manual backup"
    echo ""
    echo "=========================================="
    echo ""
}

# Main execution
main() {
    log "Starting GEOFORA Platform production deployment..."
    
    check_root
    check_system_requirements
    check_environment
    create_directories
    install_dependencies
    build_application
    check_database
    run_migrations
    check_redis
    start_application
    wait_for_application
    setup_monitoring
    setup_log_rotation
    setup_backup
    display_startup_info
    
    success "GEOFORA Platform is now running in production!"
    success "Deployment completed successfully!"
}

# Run main function
main "$@"
