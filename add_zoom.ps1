$path = "C:\Users\sanja\Documents\GitHub\exam-photo-resizer\script.js"
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

$zoomCode = @'

// ============ ZOOM FEATURE (Wheel + Pinch) ============
function setupZoom(areaId, target) {
    const area = document.getElementById(areaId);
    if (!area) return;
    
    // Wheel zoom (desktop)
    area.addEventListener('wheel', function(e) {
        const img = area.querySelector('img');
        if (!img || !img.naturalWidth) return;
        if (!panState[target].dragging) {
            // only zoom if not dragging
        }
        e.preventDefault();
        
        const oldScale = panState[target].zoomScale || 1;
        let newScale = oldScale + (e.deltaY > 0 ? -0.1 : 0.1);
        newScale = Math.max(0.5, Math.min(5, newScale));
        
        // Zoom to cursor position
        const rect = area.getBoundingClientRect();
        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;
        
        applyZoom(target, area, newScale, cx, cy);
    }, { passive: false });
    
    // Pinch zoom (mobile)
    let initialDistance = 0;
    let initialScale = 1;
    
    area.addEventListener('touchstart', function(e) {
        if (e.touches.length === 2) {
            e.preventDefault();
            const t1 = e.touches[0];
            const t2 = e.touches[1];
            initialDistance = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
            initialScale = panState[target].zoomScale || 1;
        }
    }, { passive: false });
    
    area.addEventListener('touchmove', function(e) {
        if (e.touches.length === 2 && initialDistance > 0) {
            e.preventDefault();
            const t1 = e.touches[0];
            const t2 = e.touches[1];
            const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
            const ratio = dist / initialDistance;
            let newScale = initialScale * ratio;
            newScale = Math.max(0.5, Math.min(5, newScale));
            
            const rect = area.getBoundingClientRect();
            const cx = (t1.clientX + t2.clientX) / 2 - rect.left;
            const cy = (t1.clientY + t2.clientY) / 2 - rect.top;
            
            applyZoom(target, area, newScale, cx, cy);
        }
    }, { passive: false });
    
    area.addEventListener('touchend', function(e) {
        if (e.touches.length < 2) {
            initialDistance = 0;
        }
    });
}

function applyZoom(target, area, newScale, cx, cy) {
    const s = panState[target];
    const img = area.querySelector('img');
    if (!img || !img.naturalWidth) return;
    
    const areaW = s.areaW || area.clientWidth;
    const areaH = s.areaH || area.clientHeight;
    
    // Base fit size (without zoom)
    const baseScale = Math.max(areaW / img.naturalWidth, areaH / img.naturalHeight);
    const baseW = img.naturalWidth * baseScale;
    const baseH = img.naturalHeight * baseScale;
    
    // New size with zoom
    const newW = baseW * newScale;
    const newH = baseH * newScale;
    
    // Point under cursor in image coordinates
    const relX = (cx - s.x) / s.imgW;
    const relY = (cy - s.y) / s.imgH;
    
    // New position so cursor point stays fixed
    s.x = cx - relX * newW;
    s.y = cy - relY * newH;
    
    s.imgW = newW;
    s.imgH = newH;
    s.zoomScale = newScale;
    
    // Apply new size
    img.style.setProperty('width', newW + 'px', 'important');
    img.style.setProperty('height', newH + 'px', 'important');
    
    clampPan(target);
    applyPan(area, target);
    
    // Update zoom indicator
    updateZoomIndicator(target, newScale);
}

function updateZoomIndicator(target, scale) {
    const indicator = document.getElementById(target + 'ZoomIndicator');
    if (indicator) {
        indicator.textContent = Math.round(scale * 100) + '%';
    }
}

// Initialize zoom scale on panState
if (window.panState) {
    panState.photo.zoomScale = 1;
    panState.signature.zoomScale = 1;
}

// Setup on DOM ready
document.addEventListener('DOMContentLoaded', function() {
    setupZoom('photoImageArea', 'photo');
    setupZoom('signImageArea', 'signature');
});

// Also add zoom scale to fitImageToArea logic
const originalFitImageToArea = window.fitImageToArea;
if (typeof fitImageToArea === 'function') {
    window.originalFitImageToArea = fitImageToArea;
    fitImageToArea = function(area, target) {
        const img = area.querySelector('img');
        if (!img || !img.naturalWidth) return;
        
        const areaW = area.clientWidth;
        const areaH = area.clientHeight;
        if (areaW < 10 || areaH < 10) return;
        
        // Base fit size
        const baseScale = Math.max(areaW / img.naturalWidth, areaH / img.naturalHeight);
        const displayW = img.naturalWidth * baseScale * (panState[target].zoomScale || 1);
        const displayH = img.naturalHeight * baseScale * (panState[target].zoomScale || 1);
        
        img.style.setProperty('width', displayW + 'px', 'important');
        img.style.setProperty('height', displayH + 'px', 'important');
        img.style.setProperty('max-width', 'none', 'important');
        img.style.setProperty('max-height', 'none', 'important');
        img.style.setProperty('position', 'absolute', 'important');
        img.style.setProperty('top', '0', 'important');
        img.style.setProperty('left', '0', 'important');
        
        const prevW = panState[target].imgW;
        const prevH = panState[target].imgH;
        
        panState[target].imgW = displayW;
        panState[target].imgH = displayH;
        panState[target].areaW = areaW;
        panState[target].areaH = areaH;
        
        if (panState[target].initializedFor !== img) {
            panState[target].x = (areaW - displayW) / 2;
            panState[target].y = (areaH - displayH) / 2;
            panState[target].initializedFor = img;
            panState[target].zoomScale = 1;
        } else if (prevW > 0 && prevH > 0) {
            // Preserve center point when size changes
            const scaleRatio = displayW / prevW;
            const centerX = areaW / 2;
            const centerY = areaH / 2;
            panState[target].x = centerX - (centerX - panState[target].x) * scaleRatio;
            panState[target].y = centerY - (centerY - panState[target].y) * scaleRatio;
        }
        
        clampPan(target);
        applyPan(area, target);
        updateZoomIndicator(target, panState[target].zoomScale || 1);
    };
}
'@

$content = $content + "`n" + $zoomCode

[System.IO.File]::WriteAllText($path, $content, [System.Text.UTF8Encoding]::new($false))

Write-Host "=== Zoom feature added ==="
Select-String -Path $path -Pattern 'setupZoom|applyZoom|zoomScale' | Select-Object LineNumber, Line | Select-Object -First 5