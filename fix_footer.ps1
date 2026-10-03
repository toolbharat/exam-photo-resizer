$fixed = 0
$files = Get-ChildItem -File -Filter "*-photo-resizer.html"

foreach ($file in $files) {
    $path = $file.FullName
    $content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
    $original = $content
    
    # Fix footer - various patterns
    $content = [regex]::Replace($content, '©\s*2026\s*Photo\s*Resizer\s*\|\s*Made\s*for\s*the\s*World[^\n<]*', '© 2026 PixSathi | Made for India 🇮🇳')
    $content = [regex]::Replace($content, '©\s*2026\s*Photo\s*Resizer[^\n<]*', '© 2026 PixSathi | Made for India 🇮🇳')
    $content = [regex]::Replace($content, '©\s*2026\s*Exam\s*Photo[^\n<]*', '© 2026 PixSathi | Made for India 🇮🇳')
    $content = [regex]::Replace($content, 'Made\s*for\s*the\s*World[^\n<]*', 'Made for India 🇮🇳')
    
    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($path, $content, [System.Text.UTF8Encoding]::new($false))
        Write-Host "Fixed footer: $($file.Name)" -ForegroundColor Green
        $fixed++
    }
}

Write-Host ""
Write-Host "=== Total files updated: $fixed ===" -ForegroundColor Cyan

# Verify
Write-Host ""
Write-Host "Verification:"
Select-String -Path ssc-chsl-photo-resizer.html -Pattern '© 2026|Made for' | Select-Object LineNumber, Line