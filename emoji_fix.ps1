$fixed = 0
$files = Get-ChildItem -File -Filter "*-photo-resizer.html"

foreach ($file in $files) {
    $path = $file.FullName
    $bytes = [System.IO.File]::ReadAllBytes($path)
    $content = [System.Text.Encoding]::UTF8.GetString($bytes)
    $original = $content
    
    # Replace garbled emoji with HTML entities (using hex to avoid encoding issues)
    # Camera emoji garbled: ðŸ"¸  (U+00F0 U+0178 U+201C U+00B8)
    $content = $content.Replace([char]0x00F0 + [char]0x0178 + [char]0x201C + [char]0x00B8, '&#128248;')
    
    # India flag garbled: ðŸ‡®ðŸ‡³ (U+00F0 U+0178 U+2021 U+00AE U+00F0 U+0178 U+2021 U+00B3)
    $content = $content.Replace([char]0x00F0 + [char]0x0178 + [char]0x2021 + [char]0x00AE, '')
    $content = $content.Replace([char]0x00F0 + [char]0x0178 + [char]0x2021 + [char]0x00B3, '&#127470;&#127475;')
    
    # Bullet garbled: â€¢ (U+00E2 U+20AC U+00A2)
    $content = $content.Replace([char]0x00E2 + [char]0x20AC + [char]0x00A2, '&bull;')
    
    # Em dash garbled: â€" (U+00E2 U+20AC U+201D)
    $content = $content.Replace([char]0x00E2 + [char]0x20AC + [char]0x201D, '&mdash;')
    
    if ($content -ne $original) {
        [System.IO.File]::WriteAllBytes($path, [System.Text.Encoding]::UTF8.GetBytes($content))
        Write-Host "Fixed: $($file.Name)" -ForegroundColor Green
        $fixed++
    }
}

Write-Host ""
Write-Host "=== Total fixed: $fixed ===" -ForegroundColor Cyan

# Verify
Write-Host ""
Write-Host "Verify on ssc-cgl:"
Select-String -Path ssc-cgl-photo-resizer.html -Pattern '128248|127470' | Select-Object LineNumber, Line