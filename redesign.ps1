$path = "C:\Users\sanja\Documents\GitHub\exam-photo-resizer\index.html"
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

# Step 1: Add CSS for hero section (before </head>)
$heroCSS = @'

    <!-- Hero Section CSS -->
    <style>
    .hero-new {
        background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
        border-radius: 16px;
        padding: 40px 24px;
        text-align: center;
        color: #ffffff;
        margin: 20px 0 24px;
        box-shadow: 0 8px 30px rgba(79, 70, 229, 0.2);
    }
    .hero-new h1 {
        font-size: 28px;
        font-weight: 800;
        margin: 0 0 8px;
        line-height: 1.2;
    }
    .hero-new p {
        font-size: 15px;
        opacity: 0.95;
        margin: 0 0 24px;
        line-height: 1.5;
    }
    .hero-dropdown {
        display: flex;
        flex-direction: column;
        gap: 12px;
        max-width: 420px;
        margin: 0 auto 20px;
    }
    .hero-dropdown select {
        width: 100%;
        padding: 14px 16px;
        border-radius: 10px;
        border: none;
        font-size: 15px;
        font-weight: 600;
        background: #ffffff;
        color: #1d1d1f;
        cursor: pointer;
        outline: none;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .hero-cta {
        display: inline-block;
        padding: 14px 28px;
        background: #fbbf24;
        color: #1d1d1f;
        text-decoration: none;
        border-radius: 10px;
        font-size: 16px;
        font-weight: 700;
        border: none;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 4px 15px rgba(251, 191, 36, 0.4);
    }
    .hero-cta:hover {
        background: #f59e0b;
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(251, 191, 36, 0.5);
    }
    .hero-cta:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    .hero-trust {
        display: flex;
        justify-content: center;
        gap: 20px;
        flex-wrap: wrap;
        margin-top: 20px;
        font-size: 13px;
        font-weight: 600;
    }
    .hero-trust span {
        display: flex;
        align-items: center;
        gap: 5px;
        background: rgba(255, 255, 255, 0.15);
        padding: 6px 14px;
        border-radius: 20px;
    }
    @media (max-width: 600px) {
        .hero-new {
            padding: 28px 16px;
        }
        .hero-new h1 {
            font-size: 22px;
        }
        .hero-new p {
            font-size: 14px;
        }
        .hero-trust {
            gap: 8px;
            font-size: 11px;
        }
    }
    </style>
'@

# Insert CSS before </head>
$content = $content.Replace('</head>', $heroCSS + "`n</head>")

# Step 2: Create new hero HTML
$newHero = @'
        <!-- ============ NEW HERO ============ -->
        <section class="hero-new">
            <h1>Free Online Tools for Everyone</h1>
            <p>Resize photos, compress images, merge PDFs, calculate EMI — 100% Free & Private</p>

            <div class="hero-dropdown">
                <select id="examSelect">
                    <option value="">📸 Choose Your Exam</option>
                    <optgroup label="SSC Exams">
                        <option value="/ssc-cgl-photo-resizer">SSC CGL</option>
                        <option value="/ssc-chsl-photo-resizer">SSC CHSL</option>
                        <option value="/ssc-mts-photo-resizer">SSC MTS</option>
                        <option value="/ssc-gd-photo-resizer">SSC GD</option>
                        <option value="/ssc-cpo-photo-resizer">SSC CPO</option>
                        <option value="/ssc-je-photo-resizer">SSC JE</option>
                    </optgroup>
                    <optgroup label="Banking Exams">
                        <option value="/ibps-po-photo-resizer">IBPS PO</option>
                        <option value="/ibps-clerk-photo-resizer">IBPS Clerk</option>
                        <option value="/ibps-so-photo-resizer">IBPS SO</option>
                        <option value="/ibps-rrb-photo-resizer">IBPS RRB</option>
                        <option value="/sbi-po-photo-resizer">SBI PO</option>
                        <option value="/sbi-clerk-photo-resizer">SBI Clerk</option>
                    </optgroup>
                    <optgroup label="Railway Exams">
                        <option value="/rrb-ntpc-photo-resizer">RRB NTPC</option>
                        <option value="/rrb-group-d-photo-resizer">RRB Group D</option>
                        <option value="/rrb-alp-photo-resizer">RRB ALP</option>
                    </optgroup>
                    <optgroup label="Medical/Engineering">
                        <option value="/neet-photo-resizer">NEET</option>
                        <option value="/neet-pg-photo-resizer">NEET PG</option>
                        <option value="/jee-main-photo-resizer">JEE Main</option>
                        <option value="/gate-photo-resizer">GATE</option>
                        <option value="/aiims-photo-resizer">AIIMS</option>
                    </optgroup>
                    <optgroup label="Civil Services">
                        <option value="/upsc-photo-resizer">UPSC</option>
                        <option value="/state-psc-photo-resizer">State PSC</option>
                        <option value="/mpsc-photo-resizer">MPSC</option>
                        <option value="/bpsc-photo-resizer">BPSC</option>
                        <option value="/uppsc-photo-resizer">UPPSC</option>
                    </optgroup>
                    <optgroup label="Police/Defence">
                        <option value="/police-photo-resizer">Police</option>
                        <option value="/up-police-photo-resizer">UP Police</option>
                        <option value="/bihar-police-photo-resizer">Bihar Police</option>
                        <option value="/delhi-police-photo-resizer">Delhi Police</option>
                        <option value="/nda-photo-resizer">NDA</option>
                        <option value="/cds-photo-resizer">CDS</option>
                    </optgroup>
                    <optgroup label="Teaching">
                        <option value="/ctet-photo-resizer">CTET</option>
                        <option value="/ugc-net-photo-resizer">UGC NET</option>
                        <option value="/kvs-photo-resizer">KVS</option>
                        <option value="/dsssb-photo-resizer">DSSSB</option>
                    </optgroup>
                    <optgroup label="Law/University">
                        <option value="/clat-photo-resizer">CLAT</option>
                        <option value="/ailet-photo-resizer">AILET</option>
                        <option value="/cuet-photo-resizer">CUET</option>
                        <option value="/duet-photo-resizer">DUET</option>
                        <option value="/ipu-cet-photo-resizer">IPU CET</option>
                    </optgroup>
                </select>
                <button class="hero-cta" id="startResizerBtn" disabled>🚀 Start Photo Resizer →</button>
            </div>

            <div class="hero-trust">
                <span>✅ No Signup</span>
                <span>✅ 100% Free</span>
                <span>🔒 Private</span>
            </div>
        </section>
'@

# Replace intro-section with new hero
$oldIntroStart = '        <section class="intro-section">'
$oldIntroEnd = '        <!-- ============ STATS ============ -->'

$startIndex = $content.IndexOf($oldIntroStart)
$endIndex = $content.IndexOf($oldIntroEnd)

if ($startIndex -ge 0 -and $endIndex -gt $startIndex) {
    $before = $content.Substring(0, $startIndex)
    $after = $content.Substring($endIndex)
    $content = $before + $newHero + "`n`n" + $after
    Write-Host "✅ Intro replaced with new hero" -ForegroundColor Green
} else {
    Write-Host "❌ Intro section not found" -ForegroundColor Red
}

# Step 3: Remove Exam Photo Resizer section (badges)
$examStartMarker = '        <!-- ============ EXAM PHOTO RESIZER ============ -->'
$toolsStartMarker = '        <!-- ============ GENERAL TOOLS ============ -->'

$examStart = $content.IndexOf($examStartMarker)
$toolsStart = $content.IndexOf($toolsStartMarker)

if ($examStart -ge 0 -and $toolsStart -gt $examStart) {
    $before = $content.Substring(0, $examStart)
    $after = $content.Substring($toolsStart)
    $content = $before + $after
    Write-Host "✅ Exam badges section removed" -ForegroundColor Green
} else {
    Write-Host "⚠️ Exam section not found (might be OK)" -ForegroundColor Yellow
}

# Step 4: Add JavaScript before </body>
$heroJS = @'

    <!-- Hero Dropdown Script -->
    <script>
    document.addEventListener('DOMContentLoaded', function() {
        var select = document.getElementById('examSelect');
        var btn = document.getElementById('startResizerBtn');
        if (select && btn) {
            select.addEventListener('change', function() {
                if (this.value) {
                    btn.disabled = false;
                } else {
                    btn.disabled = true;
                }
            });
            btn.addEventListener('click', function() {
                if (select.value) {
                    window.location.href = select.value;
                }
            });
        }
    });
    </script>

</body>
'@

$content = $content.Replace('</body>', $heroJS)

# Save
[System.IO.File]::WriteAllText($path, $content, [System.Text.UTF8Encoding]::new($false))
Write-Host ""
Write-Host "=== DONE! ===" -ForegroundColor Cyan
Write-Host "Hero section added"
Write-Host "Exam badges removed"
Write-Host "JavaScript added"