$path = "C:\Users\sanja\Documents\GitHub\exam-photo-resizer\script.js"
$lines = Get-Content $path -Encoding UTF8
$newLines = @()
$removed = 0

for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    
    # Remove lines with garbled patterns for "images selected"
    if ($line -match "pattern:.*images selected.*replace:") {
        $removed++
        continue
    }
    
    # Remove entire fixImagesCount function
    if ($line -match "function fixImagesCount\(\)") {
        # Skip until matching closing brace
        $braceCount = 1
        $i++
        while ($i -lt $lines.Count -and $braceCount -gt 0) {
            $braceCount += ([regex]::Matches($lines[$i], '\{')).Count
            $braceCount -= ([regex]::Matches($lines[$i], '\}')).Count
            $i++
        }
        $i--
        $removed++
        continue
    }
    
    # Remove fixImagesCount() call
    if ($line -match "^\s*fixImagesCount\(\);\s*$") {
        $removed++
        continue
    }
    
    $newLines += $line
}

$newLines | Set-Content $path -Encoding UTF8
Write-Host "Removed: $removed lines"
Write-Host ""
Write-Host "Verification:"
Select-String -Path $path -Pattern 'images selected' | Select-Object LineNumber, Line
Write-Host ""
Select-String -Path $path -Pattern 'fixImagesCount' | Select-Object LineNumber, Line