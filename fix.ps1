$lines = Get-Content script.js -Encoding UTF8
$newLines = @()
$fixed = 0

foreach ($line in $lines) {
    $newLine = $line
    
    if ($line -match 'remove-btn-icon' -or $line -match 'remove-btn"') {
        $newLine = $line -replace 'ÃƒÆ..Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â', '×'
    }
    
    if ($line -match 'Grid.*2 columns' -and $line -match 'Ã') {
        $newLine = '        // Grid – 2 columns'
    }
    
    if ($line -match 'HIGH QUALITY output' -and $line -match 'Ã') {
        $newLine = '        // HIGH QUALITY output – 0.98 (PI7 jaisa)'
    }
    
    if ($newLine -ne $line) { $fixed++ }
    $newLines += $newLine
}

$newLines | Set-Content script.js -Encoding UTF8
Write-Host "Fixed: $fixed lines"