$fixed = 0
$files = Get-ChildItem -File -Filter "*-photo-resizer.html"

foreach ($file in $files) {
    $path = $file.FullName
    $content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
    $original = $content
    
    # Fix tagline - any tagline containing "Free • Fast" or "Free • Fast • 100%"
    $content = [regex]::Replace($content, '<p class="tagline">[^<]*Free[^<]*Fast[^<]*</p>', '<p class="tagline">Free Online Tools for Everyone • 100% Free • Private</p>')
    
    # Fix tagline alternate - "Free and Fast" or similar
    $content = [regex]::Replace($content, '<p class="tagline">Free[^<]*100% Private[^<]*</p>', '<p class="tagline">Free Online Tools for Everyone • 100% Free • Private</p>')
    
    # Fix footer - any copyright mentioning Photo Resizer
    $content = [regex]::Replace($content, '©\s*2026\s*Photo Resizer[^<]*', '© 2026 PixSathi | Made for India 🇮🇳')
    $content = [regex]::Replace($content, '©\s*2026\s*Exam Photo[^<]*', '© 2026 PixSathi | Made for India 🇮🇳')
    $content = [regex]::Replace($content, '©\s*2026\s*Photo\s*Resizer[^<]*', '© 2026 PixSathi | Made for India 🇮🇳')
    
    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($path, $content, [System.Text.UTF8Encoding]::new($false))
        Write-Host "Fixed: $($file.Name)" -ForegroundColor Green
        $fixed++
    }
}

Write-Host ""
Write-Host "=== Total files updated: $fixed ===" -ForegroundColor Cyan