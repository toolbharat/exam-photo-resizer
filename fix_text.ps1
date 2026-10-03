$path = "C:\Users\sanja\Documents\GitHub\exam-photo-resizer\index.html"
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

# Fix dropdown default text - remove garbled before "Choose"
$content = [regex]::Replace($content, '<option value="">[^<]*Choose Your Exam[^<]*</option>', '<option value="">Choose Your Exam (45+ Exams)</option>')

# Fix CTA button text - remove garbled chars, use arrow entity
$content = [regex]::Replace($content, '<button class="hero-cta"[^>]*>[^<]*Start Photo Resizer[^<]*</button>', '<button class="hero-cta" id="startResizerBtn" disabled>Start Photo Resizer &rarr;</button>')

# Fix trust badge 1: No Signup
$content = [regex]::Replace($content, '<span>[^<]*No Signup[^<]*</span>', '<span>&#10003; No Signup</span>')

# Fix trust badge 2: 100% Free
$content = [regex]::Replace($content, '<span>[^<]*100% Free[^<]*</span>', '<span>&#10003; 100% Free</span>')

# Fix trust badge 3: Private
$content = [regex]::Replace($content, '<span>[^<]*Private[^<]*</span>', '<span>&#128274; Private</span>')

# Fix paragraph em dash
$content = [regex]::Replace($content, 'calculate EMI[^<]*100% Free & Private', 'calculate EMI &mdash; 100% Free &amp; Private')

# Fix h1 if needed - ensure "Free Online Tools for Everyone"
$content = [regex]::Replace($content, '<h1>[^<]*Free Online Tools for Everyone[^<]*</h1>', '<h1>Free Online Tools for Everyone</h1>')

[System.IO.File]::WriteAllText($path, $content, [System.Text.UTF8Encoding]::new($false))

Write-Host "Text patterns fixed" -ForegroundColor Green
Write-Host ""
Write-Host "=== Verification ==="

# Check for remaining garbled patterns
$garbled = Select-String -Path $path -Pattern 'ðŸ|âœ|â€|â†' | Select-Object LineNumber, Line | Select-Object -First 10

if ($garbled) {
    Write-Host "Still garbled in these lines:" -ForegroundColor Yellow
    $garbled | ForEach-Object { Write-Host $_.Line }
} else {
    Write-Host "No garbled text remaining in main patterns" -ForegroundColor Green
}