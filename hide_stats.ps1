$path = "C:\Users\sanja\Documents\GitHub\exam-photo-resizer\index.html"
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

# Find stats section and wrap in HTML comment
$startMarker = '<!-- ============ STATS ============ -->'
$endMarker = '<!-- ============ EXAM PHOTO RESIZER ============ -->'

$startIdx = $content.IndexOf($startMarker)
$endIdx = $content.IndexOf($endMarker)

if ($startIdx -ge 0 -and $endIdx -gt $startIdx) {
    # Extract the section
    $statsSection = $content.Substring($startIdx, $endIdx - $startIdx)
    
    # Wrap in comment
    $hiddenSection = "<!-- STATS SECTION HIDDEN - Uncomment when needed`n" + $statsSection + "STATS SECTION END -->`n`n"
    
    # Replace
    $before = $content.Substring(0, $startIdx)
    $after = $content.Substring($endIdx)
    $content = $before + $hiddenSection + $after
    
    [System.IO.File]::WriteAllText($path, $content, [System.Text.UTF8Encoding]::new($false))
    Write-Host "Stats section hidden successfully" -ForegroundColor Green
} else {
    Write-Host "Stats section markers not found" -ForegroundColor Red
}

# Alternative: just hide the section if markers not found
if ($startIdx -lt 0) {
    $startMarker2 = '<section class="stats-section">'
    $startIdx2 = $content.IndexOf($startMarker2)
    
    if ($startIdx2 -ge 0) {
        # Find closing section
        $closeIdx = $content.IndexOf('</section>', $startIdx2) + '</section>'.Length
        
        if ($closeIdx -gt $startIdx2) {
            $statsSection = $content.Substring($startIdx2, $closeIdx - $startIdx2)
            $hiddenSection = "<!-- STATS HIDDEN`n" + $statsSection + "`nSTATS END -->"
            
            $before = $content.Substring(0, $startIdx2)
            $after = $content.Substring($closeIdx)
            $content = $before + $hiddenSection + $after
            
            [System.IO.File]::WriteAllText($path, $content, [System.Text.UTF8Encoding]::new($false))
            Write-Host "Stats section hidden (alternate)" -ForegroundColor Green
        }
    }
}

Write-Host ""
Write-Host "Verification:"
Select-String -Path $path -Pattern 'STATS' | Select-Object LineNumber, Line | Select-Object -First 3