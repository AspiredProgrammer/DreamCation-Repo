# DreamCation Microservices Startup Script (PowerShell)
# This script starts all microservices for local development

# Get the script directory
$ScriptDir = $PSScriptRoot
Set-Location $ScriptDir

Write-Host "Starting DreamCation Microservices..." 
Write-Host "Working directory: $ScriptDir" 

# Function to check if a port is in use
function Test-Port {
    param([int]$Port)
    $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue -State Listen
    if ($connection) {
        Write-Host "Port $Port is already in use" 
        return $false
    }
    return $true
}

# Check ports
Write-Host "Checking ports..." 
$ports = @(8001, 8002, 8003, 8004, 8005, 8006, 3001)
$allPortsAvailable = $true

foreach ($port in $ports) {
    if (-not (Test-Port -Port $port)) {
        Write-Host "Please stop the process using port $port and try again" 
        $allPortsAvailable = $false
    }
}

if (-not $allPortsAvailable) {
    exit 1
}

Write-Host "All ports available" 

# Start services in background
Write-Host "Starting services..." 

# Create logs directory
$logDir = "$env:TEMP\dreamcation-logs"
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

$pids = @()

# Function to start a service
function Start-Microservice {
    param(
        [string]$ServiceName,
        [string]$ServicePath,
        [string]$LogFile
    )
    $logPath = Join-Path $logDir $LogFile
    $serviceDir = Join-Path $ScriptDir $ServicePath
    
    # Create a PowerShell script block that will run in the background
    $scriptBlock = {
        param($dir, $log)
        Set-Location $dir
        npm run dev *>> $log
    }
    
    # Start the process in a new window (hidden) or as background job
    $process = Start-Process -FilePath "powershell.exe" `
        -ArgumentList "-NoProfile", "-Command", "Set-Location '$serviceDir'; npm run dev *>> '$logPath'" `
        -WindowStyle Hidden `
        -PassThru
    
    return $process
}

# User Service
Write-Host "Starting User Service..." 
$userProcess = Start-Microservice -ServiceName "User Service" -ServicePath "services\user-service" -LogFile "user-service.log"
$pids += $userProcess.Id
Start-Sleep -Seconds 2

# Hotel Service
Write-Host "Starting Hotel Service..." 
$hotelProcess = Start-Microservice -ServiceName "Hotel Service" -ServicePath "services\hotel-service" -LogFile "hotel-service.log"
$pids += $hotelProcess.Id
Start-Sleep -Seconds 2

# Flight Service
Write-Host "Starting Flight Service..." 
$flightProcess = Start-Microservice -ServiceName "Flight Service" -ServicePath "services\flight-service" -LogFile "flight-service.log"
$pids += $flightProcess.Id
Start-Sleep -Seconds 2

# Activity Service
Write-Host "Starting Activity Service..."
$activityProcess = Start-Microservice -ServiceName "Activity Service" -ServicePath "services\activity-service" -LogFile "activity-service.log"
$pids += $activityProcess.Id
Start-Sleep -Seconds 2

# Car Service
Write-Host "Starting Car Service..." 
$carProcess = Start-Microservice -ServiceName "Car Service" -ServicePath "services\car-service" -LogFile "car-service.log"
$pids += $carProcess.Id
Start-Sleep -Seconds 2

# Itinerary Service
Write-Host "Starting Itinerary Service..." 
$itineraryProcess = Start-Microservice -ServiceName "Itinerary Service" -ServicePath "services\itinerary-service" -LogFile "itinerary-service.log"
$pids += $itineraryProcess.Id
Start-Sleep -Seconds 2

# API Gateway
Write-Host "Starting API Gateway..." 
$gatewayProcess = Start-Microservice -ServiceName "API Gateway" -ServicePath "api-gateway" -LogFile "api-gateway.log"
$pids += $gatewayProcess.Id
Start-Sleep -Seconds 2

# Store PIDs
$pids | Out-File -FilePath "$env:TEMP\dreamcation-pids.txt" -Encoding utf8

Write-Host "All services started!" 
Write-Host ""
Write-Host "Service URLs:" 
Write-Host "User Service:      http://localhost:8001"
Write-Host " Hotel Service:     http://localhost:8002"
Write-Host "Flight Service:    http://localhost:8003"
Write-Host "Activity Service:  http://localhost:8004"
Write-Host "Car Service:       http://localhost:8005"
Write-Host "Itinerary Service: http://localhost:8006"
Write-Host "API Gateway:       http://localhost:3001"
Write-Host ""
Write-Host "Frontend:            http://localhost:3000"
Write-Host ""
Write-Host "Logs are being written to $logDir" 
Write-Host ""
Write-Host "To stop all services, run: .\stop_services.ps1" 
Write-Host ""
Write-Host "Check health: curl http://localhost:3001/health" 