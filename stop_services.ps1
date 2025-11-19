$ports = 8001,8002,8003,8004,8005,8006,3001

foreach ($port in $ports) {
    $pids = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
    if ($pids) {
        foreach ($pid in $pids) {
            Write-Host "Killing PID $pid on port $port..."
            Stop-Process -Id $pid -Force
        }
    } else {
        Write-Host "Port $port is free."
    }
}

Write-Host "Done!"
