$path = "C:\Users\sanja\Documents\GitHub\exam-photo-resizer\script.js"
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

# Replace ALL garbled × patterns (any 2-3 char combos) with ASCII 'X'
$content = [regex]::Replace($content, '(?<=id="photoRemoveBtn">)[^<]*(?=</button>)', 'X')
$content = [regex]::Replace($content, '(?<=id="signRemoveBtn">)[^<]*(?=</button>)', 'X')
$content = [regex]::Replace($content, '(?<=data-index="\$\{index\}">)[^<]*(?=</button>)', 'X')

# Replace garbled checkmark in merge status with plain text
$content = [regex]::Replace($content, '(?<=mergeStatus\.textContent = `)[^`]*?(?=images selected)', '')
$content = [regex]::Replace($content, '(?<=mergeStatus\.textContent = `)[^`]*?(?=1 image selected)', '')
$content = [regex]::Replace($content, '(?<=mergeStatus\.textContent = `)[^`]*?(?=Select 2 or more)', '')

# Replace garbled checkmark in compress status with 'OK'
$content = [regex]::Replace($content, '(?<=compressStatus\.textContent = `)[^`]*?(?=Compressed:)', 'OK: ')

# Replace garbled download arrow (all variants)
$content = [regex]::Replace($content, '(?<=textContent = `)[^`]*?(?=Download Photo)', 'Download ')
$content = [regex]::Replace($content, '(?<=textContent = `)[^`]*?(?=Download Signature)', 'Download ')

# Fix base strings in fixButtonText function
$content = $content -replace "base: '[^']*Download Photo'", "base: 'Download Photo'"
$content = $content -replace "base: '[^']*Download Signature'", "base: 'Download Signature'"

# Fix "startsWith" check
$content = $content -replace "current\.startsWith\([^)]*\)", "current.startsWith('Download')"

# Remove old garbled regex patterns that are no longer needed (leave the one at line 1962)
# Just clean the ones that reference ✂️ etc (keep them, they don't hurt)

[System.IO.File]::WriteAllText($path, $content, [System.Text.UTF8Encoding]::new($false))

Write-Host "=== ASCII-safe fixes applied ==="
Write-Host "Checking remaining garbled in UI strings:"
Select-String -Path $path -Pattern '>Ã|âœ…|â¬‡|Ã—' | Select-Object LineNumber, Line | Select-Object -First 10