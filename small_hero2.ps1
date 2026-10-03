$path = "C:\Users\sanja\Documents\GitHub\exam-photo-resizer\index.html"
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

$newCSS = @'
    <style>
    .hero-new {
        background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
        border-radius: 12px;
        padding: 20px 20px;
        text-align: center;
        color: #ffffff;
        margin: 12px 0 16px;
        box-shadow: 0 4px 15px rgba(79, 70, 229, 0.15);
    }
    .hero-new h1 {
        font-size: 20px;
        font-weight: 800;
        margin: 0 0 4px;
        line-height: 1.3;
    }
    .hero-new > p {
        font-size: 12px;
        opacity: 0.9;
        margin: 0 0 12px;
        line-height: 1.4;
    }
    .hero-dropdown {
        display: flex;
        gap: 8px;
        max-width: 520px;
        margin: 0 auto 10px;
        flex-wrap: wrap;
    }
    .hero-dropdown select {
        flex: 1;
        min-width: 180px;
        padding: 10px 32px 10px 14px;
        border-radius: 8px;
        border: none;
        font-size: 13px;
        font-weight: 600;
        background: #ffffff;
        color: #1d1d1f;
        cursor: pointer;
        outline: none;
        appearance: none;
    }
    .hero-dropdown select:focus {
        box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.5);
    }
    .hero-cta {
        padding: 10px 20px;
        background: #fbbf24;
        color: #1d1d1f;
        text-decoration: none;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 700;
        border: none;
        cursor: pointer;
        white-space: nowrap;
    }
    .hero-cta:hover:not(:disabled) {
        background: #f59e0b;
    }
    .hero-cta:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        background: #e5e7eb;
        color: #9ca3af;
    }
    .hero-trust {
        display: flex;
        justify-content: center;
        gap: 6px;
        flex-wrap: wrap;
        font-size: 10px;
        font-weight: 600;
    }
    .hero-trust span {
        background: rgba(255, 255, 255, 0.18);
        padding: 3px 10px;
        border-radius: 20px;
    }
    @media (max-width: 600px) {
        .hero-new {
            padding: 16px 14px;
        }
        .hero-new h1 {
            font-size: 17px;
        }
        .hero-new > p {
            font-size: 11px;
        }
        .hero-dropdown {
            flex-direction: column;
            gap: 6px;
        }
        .hero-dropdown select {
            padding: 9px 30px 9px 12px;
            font-size: 12px;
        }
        .hero-cta {
            width: 100%;
            padding: 10px 16px;
            font-size: 12px;
        }
    }
    </style>
'@

# Replace old hero CSS
$content = $content -replace '(?s)<style>\s*\.hero-new.*?</style>', $newCSS

[System.IO.File]::WriteAllText($path, $content, [System.Text.UTF8Encoding]::new($false))
Write-Host "Compact hero CSS applied successfully" -ForegroundColor Green
Write-Host "Total file length: $($content.Length) chars"