$lines = Get-Content script.js -Encoding UTF8
$newLines = @()
$fixed = 0

foreach ($line in $lines) {
    $newLine = $line
    
    # Fix remove button: replace anything between > and </button> for remove-btn
    if ($line -match 'remove-btn-icon"' -and $line -match '</button>') {
        $newLine = [regex]::Replace($line, '(?<=removeBtn">)[^<]*(?=</button>)', '×')
    }
    if ($line -match 'remove-btn"' -and $line -match 'data-index') {
        $newLine = [regex]::Replace($line, '(?<=\$\{index\}">)[^<]*(?=</button>)', '×')
    }
    
    # Fix Grid comment (line 1186)
    if ($line -match 'Grid' -and $line -match '2 columns' -and $line -match 'PI7') {
        $newLine = '        // Grid – 2 columns'
    }
    
    # Fix HIGH QUALITY comment (line 1232)
    if ($line -match 'HIGH QUALITY output' -and $line -match '0\.98') {
        $newLine = '        // HIGH QUALITY output – 0.98 (PI7 jaisa)'
    }
    
    if ($newLine -ne $line) { $fixed++ }
    $newLines += $newLine
}

$newLines | Set-Content script.js -Encoding UTF8
Write-Host "Fixed: $fixed lines"