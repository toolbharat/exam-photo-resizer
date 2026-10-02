$path = "C:\Users\sanja\Documents\GitHub\exam-photo-resizer\script.js"
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

# Fix 1: Crop button - restore "Crop" text (specifically the crop-btn class)
$content = [regex]::Replace($content, '(?<=class="crop-btn" data-index="\$\{index\}">)[^<]*(?=</button>)', 'Crop')

# Fix 2: Crop button in merge template (crop-btn-icon)
$content = [regex]::Replace($content, '(?<=class="crop-btn-icon" id="photoCropBtn">)[^<]*(?=</button>)', 'Crop')
$content = [regex]::Replace($content, '(?<=class="crop-btn-icon" id="signCropBtn">)[^<]*(?=</button>)', 'Crop')

# Fix 3: Restore the images-selected counter with the variable
$content = $content -replace 'mergeStatus\.textContent = `[^`]*images selected\.`', 'mergeStatus.textContent = `${mergePhotos.length} images selected.`'

# Fix 4: Also fix 1 image case
$content = $content -replace 'mergeStatus\.textContent = `[^`]*1 image selected[^`]*`', 'mergeStatus.textContent = `1 image selected. Add 1 more.`'

[System.IO.File]::WriteAllText($path, $content, [System.Text.UTF8Encoding]::new($false))

Write-Host "=== v3 fixes applied ==="
Write-Host ""
Write-Host "Crop button check:"
Select-String -Path $path -Pattern 'crop-btn' | Select-Object LineNumber, Line | Select-Object -First 5
Write-Host ""
Write-Host "Merge status check:"
Select-String -Path $path -Pattern 'images selected' | Select-Object LineNumber, Line | Select-Object -First 5