$path = "C:\Users\sanja\Documents\GitHub\exam-photo-resizer\script.js"
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

# Fix duplicate "Download Download" → "Download"
$content = $content.Replace('`Download Download Photo', '`Download Photo')
$content = $content.Replace('`Download Download Signature', '`Download Signature')

# Fix "OK: Compressed:" → "Compressed:"
$content = $content.Replace('`OK: Compressed:', '`Compressed:')

[System.IO.File]::WriteAllText($path, $content, [System.Text.UTF8Encoding]::new($false))
Write-Host "Buttons fixed" -ForegroundColor Green
Write-Host ""
Write-Host "Verify:"
Select-String -Path $path -Pattern 'Download Photo|Download Signature|Compressed:' | Select-Object LineNumber, Line | Select-Object -First 10