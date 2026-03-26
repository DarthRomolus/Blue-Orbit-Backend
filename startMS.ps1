# Microservices Startup Script for Blue Orbit
$services = @(
    @{ Name = "orbital-service"; Command = "npm run start:dev" },
    @{ Name = "pathfinding-service"; Command = "npm run start:dev" },
    @{ Name = "mission-service"; Command = "npm run start:dev" }
)

Write-Host "Starting microservices..." -ForegroundColor Cyan

foreach ($service in $services) {
    $name = $service.Name
    $cmd = $service.Command
    $path = Join-Path (Get-Location) "apps\$name"
    
    Write-Host "Launching $name..." -ForegroundColor Green
    Start-Process powershell.exe -ArgumentList "-NoExit", "-Command", "cd `"$path`"; $cmd" -WorkingDirectory $path
}

Write-Host "All services launched in separate windows." -ForegroundColor Cyan
