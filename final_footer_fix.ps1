$fixed = 0
$files = Get-ChildItem -File -Filter "*-photo-resizer.html"

foreach ($file in $files) {
    $path = $file.FullName
    $content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
    $original = $content
    
    # Simple text replace - skip the © character
    $content = $content.Replace('Photo Resizer | Made for India', 'PixSathi | Made for India')
    $content = $content.Replace('Photo Resizer | Made for the World', 'PixSathi | Made for India')
    
    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($path, $content, [System.Text.UTF8Encoding]::new($false))
        Write-Host "Fixed: $($file.Name)" -ForegroundColor Green
        $fixed++
    }
}

Write-Host ""
Write-Host "=== Total fixed: $fixed ===" -ForegroundColor Cyan

# Show one example
Write-Host ""
Write-Host "Example (ssc-cgl):"
Get-Content ssc-cgl-photo-resizer.html | Select-Object -Skip 182 -First 3