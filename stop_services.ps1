# DreamCation Microservices Stop Script (PowerShell)
 
Write-Host "Stopping DreamCation Microservices..."
 
$pidsFile = "$env:TEMP\dreamcation-pids.txt"
 
# Kill processes by PID

$foundProcesses = $false

if (Test-Path $pidsFile) {

    $pids = Get-Content $pidsFile

    foreach ($pid in $pids) {

        if ($pid -and (Get-Process -Id $pid -ErrorAction SilentlyContinue)) {

            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue

            Write-Host "[OK] Stopped process $pid"

            $foundProcesses = $true

        }

    }

    Remove-Item $pidsFile -ErrorAction SilentlyContinue

}
 
# Kill any remaining Node processes on our ports (most reliable method)

$ports = @(8001, 8002, 8003, 8004, 8005, 8006, 3001)

$killedByPort = $false

foreach ($port in $ports) {

    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue -State Listen

    foreach ($conn in $connections) {

        $process = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue

        if ($process) {

            # Kill the process and any child processes

            Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue

            Write-Host "[OK] Killed process on port $port (PID: $($conn.OwningProcess), Name: $($process.ProcessName))"

            $killedByPort = $true

        }

    }

}
 
if ($foundProcesses -or $killedByPort) {

    Write-Host "[OK] All services stopped"

} else {

    Write-Host "[ERROR] No running services found"

}
 
 
 