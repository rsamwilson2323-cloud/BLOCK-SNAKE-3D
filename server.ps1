# Simple Local HTTP Static Server for SnakeGame3D
$port = 8000
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " CYBERSERPENT 3D GAME SERVER RUNNING AT:" -ForegroundColor Green
Write-Host " http://localhost:$port/" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

$mime = @{
    ".html" = "text/html"
    ".css"  = "text/css"
    ".js"   = "application/javascript"
    ".json" = "application/json"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".svg"  = "image/svg+xml"
}

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $path = $request.Url.LocalPath
        if ($path -eq "/") { $path = "/index.html" }
        
        $localPath = Join-Path (Get-Location) $path.Substring(1).Replace('/', '\')

        if (Test-Path $localPath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($localPath)
            $response.ContentType = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { "application/octet-stream" }
            
            # Add CORS headers
            $response.AddHeader("Access-Control-Allow-Origin", "*")

            $bytes = [System.IO.File]::ReadAllBytes($localPath)
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 444
        }
        $response.Close()
    }
} finally {
    $listener.Stop()
}
