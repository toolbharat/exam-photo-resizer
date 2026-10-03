$path = "C:\Users\sanja\Documents\GitHub\exam-photo-resizer\index.html"
$lines = Get-Content $path -Encoding UTF8
$newLines = @()
$inStats = $false
$statsEnded = $false
$statsCount = 0

for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    
    # Detect start of stats section
    if (-not $inStats -and $line -match '<!-- ============ STATS ============ -->') {
        $newLines += '        <!-- STATS HIDDEN - Uncomment by removing this comment to restore'
        $inStats = $true
        continue
    }
    
    if ($inStats) {
        $newLines += '        ' + $line
        $statsCount++
        
        # Detect end of section (the </section> line)
        if ($line -match '^\s*</section>' -and -not $statsEnded) {
            $newLines += '        STATS HIDDEN END -->'
            $inStats = $false
            $statsEnded = $true
        }
        continue
    }
    
    $newLines += $line
}

if ($statsEnded) {
    $newLines | Set-Content $path -Encoding UTF8
    Write-Host "Stats section hidden successfully" -ForegroundColor Green
    Write-Host "Lines hidden: $statsCount"
} else {
    Write-Host "Stats section end not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "Verification (check lines 528-535):"
Get-Content $path | Select-Object -Skip 527 -First 8