$path = "C:\Users\sanja\Documents\GitHub\exam-photo-resizer\index.html"
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

$newCard = @'
                <a href="/pdf-password-remover" class="dash-card tool-card">
                    <div class="tool-icon">&#128273;</div>
                    <div class="tool-info">
                        <h3>PDF Password Remover</h3>
                        <p>Remove password from PDF files</p>
                        <div class="tool-cta">Open Tool &rarr;</div>
                    </div>
                </a>

'@

# Insert after PDF Merger card
$marker = '<a href="/photo-merger" class="dash-card tool-card">'
$idx = $content.IndexOf($marker)
if ($idx -ge 0) {
    # Find end of this card's </a>
    $endIdx = $content.IndexOf('</a>', $idx) + 4
    $content = $content.Substring(0, $endIdx) + "`n`n" + $newCard + $content.Substring($endIdx)
    [System.IO.File]::WriteAllText($path, $content, [System.Text.UTF8Encoding]::new($false))
    Write-Host "Card added to homepage" -ForegroundColor Green
} else {
    Write-Host "Marker not found" -ForegroundColor Red
}