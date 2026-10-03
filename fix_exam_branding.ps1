$fixed = 0
$files = Get-ChildItem -File -Filter "*-photo-resizer.html"

foreach ($file in $files) {
    $path = $file.FullName
    $content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
    $original = $content
    
    # Fix logo - Photo Resizer → PixSathi
    $content = $content -replace '<h1 class="logo">[^<]*Photo Resizer[^<]*</h1>', '<h1 class="logo">📸 PixSathi</h1>'
    
    # Fix tagline
    $content = $content -replace '<p class="tagline">[^<]*Exam Photo[^<]*</p>', '<p class="tagline">Free Online Tools for Everyone • 100% Free • Private</p>'
    
    # Fix footer copyright
    $content = $content -replace '© 2026 Photo Resizer[^<]*', '© 2026 PixSathi | Made for India 🇮🇳'
    
    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($path, $content, [System.Text.UTF8Encoding]::new($false))
        Write-Host "Fixed: $($file.Name)" -ForegroundColor Green
        $fixed++
    }
}

Write-Host ""
Write-Host "=== Total files updated: $fixed ===" -ForegroundColor Cyan