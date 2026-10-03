$fixed = 0
$files = Get-ChildItem -File -Filter "*-photo-resizer.html"

foreach ($file in $files) {
    $path = $file.FullName
    $content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
    $original = $content
    
    # Simple direct string replace
    $content = $content.Replace('© 2026 Photo Resizer | Made for India', '© 2026 PixSathi | Made for India')
    $content = $content.Replace('© 2026 Photo Resizer', '© 2026 PixSathi')
    $content = $content.Replace('© 2026 Exam Photo Resizer', '© 2026 PixSathi')
    
    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($path, $content, [System.Text.UTF8Encoding]::new($false))
        Write-Host "Fixed: $($file.Name)" -ForegroundColor Green
        $fixed++
    }
}

Write-Host ""
Write-Host "=== Total fixed: $fixed ===" -ForegroundColor Cyan

# Verify
Write-Host ""
Write-Host "Verify:"
Select-String -Path ssc-cgl-photo-resizer.html -Pattern '© 2026' | Select-Object LineNumber, Line