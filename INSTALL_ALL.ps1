# DreamCation Complete Installation Script
# This script installs all npm dependencies for backend (microservices + API Gateway) and frontend

# Get the script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

Write-Host "Installing DreamCation Dependencies (Backend + Frontend)..." -ForegroundColor Cyan
Write-Host "Working directory: $ScriptDir"
Write-Host ""

# Track success/failure
$SuccessCount = 0
$FailCount = 0
$FailedServices = @()

# Function to install dependencies for a service
function Install-Service {
    param(
        [string]$ServiceName,
        [string]$ServicePath
    )
    
    Write-Host "[*] Installing dependencies for $ServiceName..." -ForegroundColor Blue
    
    if (-not (Test-Path $ServicePath)) {
        Write-Host "[ERROR] Directory not found: $ServicePath" -ForegroundColor Red
        $script:FailCount++
        $script:FailedServices += "$ServiceName (directory not found)"
        return $false
    }
    
    if (-not (Test-Path (Join-Path $ServicePath "package.json"))) {
        Write-Host "[WARN] No package.json found in $ServicePath" -ForegroundColor Yellow
        $script:FailCount++
        $script:FailedServices += "$ServiceName (no package.json)"
        return $false
    }
    
    Push-Location $ServicePath
    
    try {
        $npmProcess = Start-Process -FilePath "npm" -ArgumentList "install" -Wait -NoNewWindow -PassThru
        
        if ($npmProcess.ExitCode -eq 0) {
            Write-Host "[OK] $ServiceName dependencies installed successfully" -ForegroundColor Green
            $script:SuccessCount++
            Pop-Location
            return $true
        } else {
            Write-Host "[ERROR] Failed to install dependencies for $ServiceName" -ForegroundColor Red
            $script:FailCount++
            $script:FailedServices += "$ServiceName (npm install failed with exit code $($npmProcess.ExitCode))"
            Pop-Location
            return $false
        }
    } catch {
        Write-Host "[ERROR] Exception while installing $ServiceName : $_" -ForegroundColor Red
        $script:FailCount++
        $script:FailedServices += "$ServiceName (exception: $($_.Exception.Message))"
        Pop-Location
        return $false
    }
}

# ============================================
# BACKEND INSTALLATION
# ============================================
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   BACKEND INSTALLATION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Install API Gateway
Write-Host "=== API Gateway ===" -ForegroundColor Yellow
Install-Service -ServiceName "API Gateway" -ServicePath (Join-Path $ScriptDir "api-gateway")
Write-Host ""

# Install Microservices
Write-Host "=== Microservices ===" -ForegroundColor Yellow

Install-Service -ServiceName "User Service" -ServicePath (Join-Path $ScriptDir "services\user-service")
Write-Host ""

Install-Service -ServiceName "Hotel Service" -ServicePath (Join-Path $ScriptDir "services\hotel-service")
Write-Host ""

Install-Service -ServiceName "Flight Service" -ServicePath (Join-Path $ScriptDir "services\flight-service")
Write-Host ""

Install-Service -ServiceName "Activity Service" -ServicePath (Join-Path $ScriptDir "services\activity-service")
Write-Host ""

Install-Service -ServiceName "Car Service" -ServicePath (Join-Path $ScriptDir "services\car-service")
Write-Host ""

Install-Service -ServiceName "Itinerary Service" -ServicePath (Join-Path $ScriptDir "services\itinerary-service")
Write-Host ""

# ============================================
# FRONTEND INSTALLATION
# ============================================
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   FRONTEND INSTALLATION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Install-Service -ServiceName "Frontend" -ServicePath (Join-Path $ScriptDir "frontend")
Write-Host ""

# ============================================
# SUMMARY
# ============================================
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   INSTALLATION SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Successfully installed: $SuccessCount service(s)" -ForegroundColor Green

if ($FailCount -gt 0) {
    Write-Host "Failed to install: $FailCount service(s)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Failed services:"
    foreach ($service in $FailedServices) {
        Write-Host "  - $service" -ForegroundColor Red
    }
    Write-Host ""
    exit 1
} else {
    Write-Host "All services installed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Create a .env file in the root directory (see README.md)"
    Write-Host "  2. Set up your MySQL database"
    Write-Host "  3. Run .\start_services.ps1 to start backend services"
    Write-Host "  4. Run 'cd frontend; npm start' to start the frontend"
    Write-Host ""
    exit 0
}

