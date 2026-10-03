$path = "C:\Users\sanja\Documents\GitHub\exam-photo-resizer\script.js"
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

# Fix photo minKB (line 398 area)
# Change from 0 to targetKB * 0.5 (min 20 KB, max 30 KB)
$content = $content -replace 'const minKB = 0;(\s*if \(sizeKB < minKB\))', 'const minKB = Math.max(20, Math.min(30, Math.round(targetKB * 0.6)));$1'

# Verify count
$matches = [regex]::Matches($content, 'const minKB = Math\.max\(20')
Write-Host "Fixed occurrences: $($matches.Count)"

[System.IO.File]::WriteAllText($path, $content, [System.Text.UTF8Encoding]::new($false))

Write-Host "Photo/Signature size fix applied" -ForegroundColor Green
Write-Host ""
Write-Host "Verification:"
Select-String -Path $path -Pattern 'const minKB = ' | Select-Object LineNumber, Line