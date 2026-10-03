$path = "C:\Users\sanja\Documents\GitHub\exam-photo-resizer\index.html"
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
$original = $content

# Fix card title - PDF Merger → Photo Merger
$content = $content -replace '<h3>PDF Merger</h3>', '<h3>Photo Merger</h3>'

# Fix description
$content = $content -replace 'Combine multiple PDFs into one', 'Merge 2 or more photos into one'

# Fix in SEO content too
$content = $content -replace '<strong>PDF Merger:</strong> Multiple PDFs ko jodo', '<strong>Photo Merger:</strong> Multiple photos ko jodo'

if ($content -ne $original) {
    [System.IO.File]::WriteAllText($path, $content, [System.Text.UTF8Encoding]::new($false))
    Write-Host "Card name fixed successfully" -ForegroundColor Green
} else {
    Write-Host "No changes needed - checking current content..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Verify:"
Select-String -Path $path -Pattern 'PDF Merger|Photo Merger' | Select-Object LineNumber, Line