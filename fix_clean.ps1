$path = "C:\Users\sanja\Documents\GitHub\exam-photo-resizer\index.html"
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

# 1. Fix dropdown - find option with "Choose Your Exam" and replace entire line
$content = [regex]::Replace($content, '<option value="">.*?Choose Your Exam.*?</option>', '<option value="">Choose Your Exam (45+ Exams)</option>')

# 2. Fix CTA button - keep id and disabled, replace inner text
$content = [regex]::Replace($content, '(<button class="hero-cta" id="startResizerBtn" disabled>).*?(</button>)', '$1Start Photo Resizer &rarr;$2')

# 3. Fix trust badges - replace spans by content
$content = [regex]::Replace($content, '<span>[^<]*No Signup[^<]*</span>', '<span>&#10003; No Signup</span>')
$content = [regex]::Replace($content, '<span>[^<]*100% Free[^<]*</span>', '<span>&#10003; 100% Free</span>')
$content = [regex]::Replace($content, '<span>[^<]*Private[^<]*</span>', '<span>&#128274; Private</span>')

# 4. Fix paragraph - replace any garbled dash between "EMI" and "100%"
$content = [regex]::Replace($content, 'calculate EMI[^1]*100% Free', 'calculate EMI &mdash; 100% Free')

# 5. Fix h1 heading
$content = [regex]::Replace($content, '<h1>[^<]*Free Online Tools for Everyone[^<]*</h1>', '<h1>Free Online Tools for Everyone</h1>')

[System.IO.File]::WriteAllText($path, $content, [System.Text.UTF8Encoding]::new($false))

Write-Host "=== Clean fixes applied ===" -ForegroundColor Green
Write-Host ""
Write-Host "Check CTA button:"
Select-String -Path $path -Pattern 'startResizerBtn' | Select-Object LineNumber, Line
Write-Host ""
Write-Host "Check trust badges:"
Select-String -Path $path -Pattern 'No Signup|100% Free' | Select-Object -First 3 LineNumber, Line