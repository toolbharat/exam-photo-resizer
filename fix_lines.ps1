$path = "C:\Users\sanja\Documents\GitHub\exam-photo-resizer\script.js"
$lines = Get-Content $path -Encoding UTF8
$newLines = @()
$fixed = 0

for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    
    # Replace "DISABLED FOR TEST" comment with actual padding call
    if ($line -match '^\s*//\s*DISABLED FOR TEST\s*$') {
        $newLines += '        dataUrl = padJpegToMinSize(dataUrl, minKB);'
        $newLines += '        sizeKB = (dataUrl.length * 0.75) / 1024;'
        $fixed++
        
        # Skip next line if it's the sizeKB recalculation
        if ($i + 1 -lt $lines.Count -and $lines[$i + 1] -match '^\s*sizeKB = \(dataUrl\.length') {
            $i++
        }
        continue
    }
    
    $newLines += $line
}

$newLines | Set-Content $path -Encoding UTF8
Write-Host "Fixed: $fixed occurrences" -ForegroundColor Green
Write-Host ""
Write-Host "Verify:"
Select-String -Path $path -Pattern 'padJpegToMinSize\(dataUrl|DISABLED' | Select-Object LineNumber, Line