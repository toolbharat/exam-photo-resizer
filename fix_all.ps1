$content = [System.IO.File]::ReadAllText("C:\Users\sanja\Documents\GitHub\exam-photo-resizer\script.js", [System.Text.Encoding]::UTF8)

# 1. Fix remove button content (any garbled chars between > and </button>)
$content = [regex]::Replace($content, '(?<=id="photoRemoveBtn">)[^<]*(?=</button>)', '×')
$content = [regex]::Replace($content, '(?<=id="signRemoveBtn">)[^<]*(?=</button>)', '×')
$content = [regex]::Replace($content, '(?<=data-index="\$\{index\}">)[^<]*(?=</button>)', '×')

# 2. Fix download button text in template strings
$content = [regex]::Replace($content, '(?<=textContent = `)[^`]*?(?=Download Photo)', '⬇ ')
$content = [regex]::Replace($content, '(?<=textContent = `)[^`]*?(?=Download Signature)', '⬇ ')

# 3. Fix download button text in fixButtonText function
$content = $content.Replace("base: 'â¬‡ Download Photo'", "base: '⬇ Download Photo'")
$content = $content.Replace("base: 'â¬‡ Download Signature'", "base: '⬇ Download Signature'")
$content = $content.Replace("current.startsWith('â¬‡')", "current.startsWith('⬇')")

# 4. Fix Grid comment
$content = [regex]::Replace($content, '//\s*[^\r\n]{0,60}?Grid\s+[^\r\n]{0,10}?2 columns', '// Grid – 2 columns')

# 5. Fix HIGH QUALITY comment
$content = [regex]::Replace($content, '//\s*[^\r\n]{0,60}?HIGH QUALITY output[^\r\n]{0,40}', '// HIGH QUALITY output – 0.98 (PI7 jaisa)')

# 6. Fix merge status text
$content = [regex]::Replace($content, '(?<=mergeStatus\.textContent = `)[^`]*?(?=images selected)', '✅ ${mergePhotos.length} ')

# 7. Fix compress status
$content = [regex]::Replace($content, '(?<=compressStatus\.textContent = `)[^`]*?(?=Compressed:)', '✅ ')

# 8. Fix horizontal/vertical comments
$content = [regex]::Replace($content, '//\s*[^\r\n]{0,60}?PI7 STYLE: Horizontal[^\r\n]{0,60}', '// PI7 STYLE: Horizontal - same height, aspect ratio maintain')
$content = [regex]::Replace($content, '//\s*[^\r\n]{0,60}?PI7 STYLE: Vertical[^\r\n]{0,60}', '// PI7 STYLE: Vertical - same width, aspect ratio maintain')

[System.IO.File]::WriteAllText("C:\Users\sanja\Documents\GitHub\exam-photo-resizer\script.js", $content, [System.Text.UTF8Encoding]::new($false))

Write-Host "=== All Fixes Applied ==="
Write-Host "Checking remaining garbled chars..."
$check = Select-String -Path "C:\Users\sanja\Documents\GitHub\exam-photo-resizer\script.js" -Pattern 'Ã' | Where-Object { $_.Line -notmatch 'pattern:' }
if ($check) {
    Write-Host "Still garbled:"
    $check | Select-Object LineNumber, Line
} else {
    Write-Host "✅ No garbled text remaining in UI strings!"
}