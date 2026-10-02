$path = "C:\Users\sanja\Documents\GitHub\exam-photo-resizer\script.js"
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

# Remove the old garbled fixers that would overwrite the number
$content = $content -replace "\s*\{\s*pattern:\s*/Ã\[\^\\s<\]\{0,30\}\?images selected/g,\s*replace:\s*'[^']*'\s*\},", ''
$content = $content -replace "\s*\{\s*pattern:\s*/\[ÃÂ\]\[\\s\\S\]\{0,80\}\?images selected/g,\s*replace:\s*'[^']*'\s*\},", ''

# Remove the fixImagesCount function (obsolete now)
$content = $content -replace "(?s)// Also fix the .2 images selected. to preserve number\r?\nfunction fixImagesCount\(\) \{.*?\r?\n\}\r?\n", ''
$content = $content -replace "(?s)\s*fixImagesCount\(\);", ''

[System.IO.File]::WriteAllText($path, $content, [System.Text.UTF8Encoding]::new($false))
Write-Host "=== v4 fixes applied ==="
Write-Host ""
Write-Host "Checking images selected:"
Select-String -Path $path -Pattern 'images selected' | Select-Object LineNumber, Line
Write-Host ""
Write-Host "Checking fixImagesCount:"
Select-String -Path $path -Pattern 'fixImagesCount' | Select-Object LineNumber, Line