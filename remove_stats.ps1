$path = "C:\Users\sanja\Documents\GitHub\exam-photo-resizer\index.html"
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

# Find stats section
$startMarker = '<!-- ============ STATS ============ -->'
$endMarker = '<!-- ============ EXAM PHOTO RESIZER ============ -->'

$startIdx = $content.IndexOf($startMarker)
$endIdx = $content.IndexOf($endMarker)

if ($startIdx -ge 0 -and $endIdx -gt $startIdx) {
    $before = $content.Substring(0, $startIdx)
    $after = $content.Substring($endIdx)
    $content = $before + $after
    [System.IO.File]::WriteAllText($path, $content, [System.Text.UTF8Encoding]::new($false))
    Write-Host "Stats section removed successfully" -ForegroundColor Green
} else {
    Write-Host "Stats section not found. Trying alternate method..." -ForegroundColor Yellow
    
    # Try to find just stats-section
    $startMarker2 = '<section class="stats-section">'
    $endMarker2 = '</section>'
    
    $startIdx2 = $content.IndexOf($startMarker2)
    if ($startIdx2 -ge 0) {
        $endIdx2 = $content.IndexOf($endMarker2, $startIdx2) + $endMarker2.Length
        $before = $content.Substring(0, $startIdx2)
        $after = $content.Substring($endIdx2)
        $content = $before + "`n`n" + $after
        [System.IO.File]::WriteAllText($path, $content, [System.Text.UTF8Encoding]::new($false))
        Write-Host "Stats section removed (alternate method)" -ForegroundColor Green
    } else {
        Write-Host "Could not find stats section" -ForegroundColor Red
    }
}

# Also remove stats CSS (optional)
Write-Host ""
Write-Host "Verification:"
$check = Select-String -Path $path -Pattern 'stats-section'
if ($check) {
    Write-Host "Still found stats-section:" -ForegroundColor Yellow
    $check | Select-Object LineNumber, Line
} else {
    Write-Host "Stats section fully removed" -ForegroundColor Green
}