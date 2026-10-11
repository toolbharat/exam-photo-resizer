# Fix canonical tags - add www
$files = Get-ChildItem "*.html"
$fixed = 0

foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    
    if ($content.Contains('canonical" href="https://pixsathi.in/')) {
        $newContent = $content.Replace('canonical" href="https://pixsathi.in/', 'canonical" href="https://www.pixsathi.in/')
        [System.IO.File]::WriteAllText($file.FullName, $newContent, (New-Object System.Text.UTF8Encoding $false))
        Write-Host "  Fixed: $($file.Name)" -ForegroundColor Green
        $fixed++
    }
}

Write-Host ""
Write-Host "Total fixed: $fixed" -ForegroundColor Cyan