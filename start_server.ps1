# AuraStride (極光步履) - Local Windows PowerShell HTTP Server
# Safe from encoding issues by using only ASCII characters in terminal output

$port = 3000
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")

try {
    $listener.Start()
} catch {
    Write-Error "Could not start server. Port $port might be in use. Error: $_"
    Exit
}

Write-Host "===================================================="
Write-Host "[AuraStride] Server started successfully!"
Write-Host "[AuraStride] Local URL: http://localhost:$port/"
Write-Host "[AuraStride] Press Ctrl+C to stop the server."
Write-Host "===================================================="

# Automatically launch default browser
Start-Process "http://localhost:$port/"

# Request handling loop
while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        # Get local path and strip query params (e.g. ?id=men_1)
        $localPath = $request.Url.LocalPath
        if ($localPath -eq "/") {
            $localPath = "/index.html"
        }
        
        # Format physical file path for Windows
        $relativePath = $localPath.Replace("/", "\").TrimStart("\")
        $filePath = Join-Path (Get-Location) $relativePath

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            
            # Set content-type
            switch ($ext) {
                ".html" { $contentType = "text/html; charset=utf-8" }
                ".htm"  { $contentType = "text/html; charset=utf-8" }
                ".css"  { $contentType = "text/css; charset=utf-8" }
                ".js"   { $contentType = "application/javascript; charset=utf-8" }
                ".png"  { $contentType = "image/png" }
                ".jpg"  { $contentType = "image/jpeg" }
                ".jpeg" { $contentType = "image/jpeg" }
                ".gif"  { $contentType = "image/gif" }
                ".ico"  { $contentType = "image/x-icon" }
                ".svg"  { $contentType = "image/svg+xml" }
                default { $contentType = "application/octet-stream" }
            }
            
            # Read binary file and write to stream
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentType = $contentType
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            # File not found
            $response.StatusCode = 404
            $errText = "<h3>404 Not Found</h3><p>File not found: $localPath</p>"
            $errBytes = [System.Text.Encoding]::UTF8.GetBytes($errText)
            $response.ContentType = "text/html; charset=utf-8"
            $response.ContentLength64 = $errBytes.Length
            $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
        }
        $response.Close()
    } catch {
        # Prevent crash on single request failure
        Write-Host "Request handling error: $_"
        if ($null -ne $response) {
            try { $response.Close() } catch {}
        }
    }
}
