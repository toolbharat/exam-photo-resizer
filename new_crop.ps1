$path = "C:\Users\sanja\Documents\GitHub\exam-photo-resizer\script.js"
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

# नया simple crop code
$newCropCode = @'

// ============ SIMPLE CROP MODAL (REWRITTEN) ============
let simpleCropTargetIndex = -1;
let simpleCropBox = { x: 50, y: 50, w: 300, h: 300 };
let simpleCropDragMode = null;
let simpleCropDragStart = { x: 0, y: 0 };
let simpleCropBoxStart = { x: 0, y: 0, w: 0, h: 0 };
const SIMPLE_CROP_SIZE = 400;

function openSimpleCrop(index) {
    simpleCropTargetIndex = index;
    const photo = mergePhotos[index];
    if (!photo) return;
    
    // Remove existing modal
    let existingModal = document.getElementById('simpleCropModal');
    if (existingModal) existingModal.remove();
    
    // Create new modal
    const modal = document.createElement('div');
    modal.id = 'simpleCropModal';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:99999;display:flex;align-items:center;justify-content:center;';
    modal.innerHTML = `
        <div style="background:#fff;border-radius:12px;padding:20px;max-width:95vw;">
            <h3 style="margin:0 0 10px;font-size:18px;">Crop Image</h3>
            <p style="font-size:12px;color:#666;margin:0 0 15px;">Drag the box to move. Drag corners to resize.</p>
            <div style="position:relative;display:inline-block;line-height:0;">
                <canvas id="simpleCropCanvas" style="display:block;border:1px solid #ccc;max-width:80vw;max-height:60vh;"></canvas>
            </div>
            <div style="margin-top:15px;display:flex;gap:10px;justify-content:flex-end;">
                <button id="simpleCropCancel" style="padding:10px 20px;border:1px solid #ccc;background:#fff;border-radius:6px;cursor:pointer;font-size:14px;">Cancel</button>
                <button id="simpleCropSave" style="padding:10px 20px;border:none;background:#4f46e5;color:#fff;border-radius:6px;cursor:pointer;font-size:14px;font-weight:600;">Save Crop</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Initial crop box = full image
    const img = photo.croppedImg;
    const aspect = img.width / img.height;
    let boxW, boxH;
    if (aspect > 1) {
        boxW = SIMPLE_CROP_SIZE * 0.9;
        boxH = boxW / aspect;
    } else {
        boxH = SIMPLE_CROP_SIZE * 0.9;
        boxW = boxH * aspect;
    }
    simpleCropBox = {
        x: (SIMPLE_CROP_SIZE - boxW) / 2,
        y: (SIMPLE_CROP_SIZE - boxH) / 2,
        w: boxW,
        h: boxH
    };
    
    drawSimpleCrop();
    setupSimpleCropEvents();
}

function drawSimpleCrop() {
    const canvas = document.getElementById('simpleCropCanvas');
    if (!canvas) return;
    const photo = mergePhotos[simpleCropTargetIndex];
    if (!photo) return;
    
    const img = photo.croppedImg;
    const ctx = canvas.getContext('2d');
    canvas.width = SIMPLE_CROP_SIZE;
    canvas.height = SIMPLE_CROP_SIZE;
    
    // Fit image to canvas (contain)
    const scale = Math.min(SIMPLE_CROP_SIZE / img.width, SIMPLE_CROP_SIZE / img.height);
    const drawW = img.width * scale;
    const drawH = img.height * scale;
    const drawX = (SIMPLE_CROP_SIZE - drawW) / 2;
    const drawY = (SIMPLE_CROP_SIZE - drawH) / 2;
    
    // White background
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, SIMPLE_CROP_SIZE, SIMPLE_CROP_SIZE);
    
    // Draw image
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
    
    // Dark overlay outside crop box
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, SIMPLE_CROP_SIZE, simpleCropBox.y);
    ctx.fillRect(0, simpleCropBox.y + simpleCropBox.h, SIMPLE_CROP_SIZE, SIMPLE_CROP_SIZE - simpleCropBox.y - simpleCropBox.h);
    ctx.fillRect(0, simpleCropBox.y, simpleCropBox.x, simpleCropBox.h);
    ctx.fillRect(simpleCropBox.x + simpleCropBox.w, simpleCropBox.y, SIMPLE_CROP_SIZE - simpleCropBox.x - simpleCropBox.w, simpleCropBox.h);
    
    // Crop box border
    ctx.strokeStyle = '#4f46e5';
    ctx.lineWidth = 2;
    ctx.strokeRect(simpleCropBox.x, simpleCropBox.y, simpleCropBox.w, simpleCropBox.h);
    
    // Corner handles
    ctx.fillStyle = '#4f46e5';
    const hs = 12;
    [[simpleCropBox.x, simpleCropBox.y], 
     [simpleCropBox.x + simpleCropBox.w, simpleCropBox.y],
     [simpleCropBox.x, simpleCropBox.y + simpleCropBox.h],
     [simpleCropBox.x + simpleCropBox.w, simpleCropBox.y + simpleCropBox.h]].forEach(([hx, hy]) => {
        ctx.fillRect(hx - hs/2, hy - hs/2, hs, hs);
    });
}

function setupSimpleCropEvents() {
    const canvas = document.getElementById('simpleCropCanvas');
    if (!canvas) return;
    
    const getPos = function(e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    };
    
    const getHandle = function(x, y) {
        const hs = 20;
        const b = simpleCropBox;
        if (x >= b.x - hs && x <= b.x + hs && y >= b.y - hs && y <= b.y + hs) return 'tl';
        if (x >= b.x + b.w - hs && x <= b.x + b.w + hs && y >= b.y - hs && y <= b.y + hs) return 'tr';
        if (x >= b.x - hs && x <= b.x + hs && y >= b.y + b.h - hs && y <= b.y + b.h + hs) return 'bl';
        if (x >= b.x + b.w - hs && x <= b.x + b.w + hs && y >= b.y + b.h - hs && y <= b.y + b.h + hs) return 'br';
        if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) return 'move';
        return null;
    };
    
    const onStart = function(e) {
        const pos = getPos(e);
        simpleCropDragMode = getHandle(pos.x, pos.y);
        if (!simpleCropDragMode) return;
        simpleCropDragStart = pos;
        simpleCropBoxStart = { x: simpleCropBox.x, y: simpleCropBox.y, w: simpleCropBox.w, h: simpleCropBox.h };
        e.preventDefault();
    };
    
    const onMove = function(e) {
        if (!simpleCropDragMode) return;
        e.preventDefault();
        const pos = getPos(e);
        const dx = pos.x - simpleCropDragStart.x;
        const dy = pos.y - simpleCropDragStart.y;
        const size = SIMPLE_CROP_SIZE;
        const minSize = 40;
        
        if (simpleCropDragMode === 'move') {
            simpleCropBox.x = Math.max(0, Math.min(size - simpleCropBox.w, simpleCropBoxStart.x + dx));
            simpleCropBox.y = Math.max(0, Math.min(size - simpleCropBox.h, simpleCropBoxStart.y + dy));
        } else {
            let x = simpleCropBoxStart.x, y = simpleCropBoxStart.y, w = simpleCropBoxStart.w, h = simpleCropBoxStart.h;
            if (simpleCropDragMode === 'tl') {
                const nx = Math.max(0, Math.min(x + w - minSize, x + dx));
                const ny = Math.max(0, Math.min(y + h - minSize, y + dy));
                simpleCropBox.x = nx; simpleCropBox.y = ny;
                simpleCropBox.w = x + w - nx; simpleCropBox.h = y + h - ny;
            } else if (simpleCropDragMode === 'tr') {
                const ny = Math.max(0, Math.min(y + h - minSize, y + dy));
                simpleCropBox.y = ny; simpleCropBox.h = y + h - ny;
                simpleCropBox.w = Math.max(minSize, Math.min(size - x, w + dx));
            } else if (simpleCropDragMode === 'bl') {
                const nx = Math.max(0, Math.min(x + w - minSize, x + dx));
                simpleCropBox.x = nx; simpleCropBox.w = x + w - nx;
                simpleCropBox.h = Math.max(minSize, Math.min(size - y, h + dy));
            } else if (simpleCropDragMode === 'br') {
                simpleCropBox.w = Math.max(minSize, Math.min(size - x, w + dx));
                simpleCropBox.h = Math.max(minSize, Math.min(size - y, h + dy));
            }
        }
        drawSimpleCrop();
    };
    
    const onEnd = function() {
        simpleCropDragMode = null;
    };
    
    canvas.addEventListener('mousedown', onStart);
    canvas.addEventListener('touchstart', onStart, { passive: false });
    document.addEventListener('mousemove', onMove);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchend', onEnd);
    
    // Save button
    const saveBtn = document.getElementById('simpleCropSave');
    if (saveBtn) {
        saveBtn.onclick = function() {
            saveSimpleCrop();
        };
    }
    
    // Cancel button
    const cancelBtn = document.getElementById('simpleCropCancel');
    if (cancelBtn) {
        cancelBtn.onclick = function() {
            document.getElementById('simpleCropModal').remove();
            simpleCropTargetIndex = -1;
        };
    }
}

function saveSimpleCrop() {
    const photo = mergePhotos[simpleCropTargetIndex];
    if (!photo) return;
    
    const img = photo.croppedImg;
    const size = SIMPLE_CROP_SIZE;
    const scale = Math.min(size / img.width, size / img.height);
    const drawW = img.width * scale;
    const drawH = img.height * scale;
    const imgX = (size - drawW) / 2;
    const imgY = (size - drawH) / 2;
    
    // Calculate source coordinates in original image
    let srcX = (simpleCropBox.x - imgX) / scale;
    let srcY = (simpleCropBox.y - imgY) / scale;
    let srcW = simpleCropBox.w / scale;
    let srcH = simpleCropBox.h / scale;
    
    // Clamp to image bounds
    srcX = Math.max(0, Math.min(img.width, srcX));
    srcY = Math.max(0, Math.min(img.height, srcY));
    srcW = Math.min(srcW, img.width - srcX);
    srcH = Math.min(srcH, img.height - srcY);
    
    // Create cropped canvas
    const newCanvas = document.createElement('canvas');
    newCanvas.width = Math.round(srcW);
    newCanvas.height = Math.round(srcH);
    const newCtx = newCanvas.getContext('2d');
    newCtx.imageSmoothingEnabled = true;
    newCtx.imageSmoothingQuality = 'high';
    newCtx.fillStyle = '#ffffff';
    newCtx.fillRect(0, 0, newCanvas.width, newCanvas.height);
    newCtx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, newCanvas.width, newCanvas.height);
    
    const croppedImg = new Image();
    croppedImg.onload = function() {
        mergePhotos[simpleCropTargetIndex].croppedImg = croppedImg;
        renderMergeGrid();
        document.getElementById('simpleCropModal').remove();
        simpleCropTargetIndex = -1;
    };
    croppedImg.src = newCanvas.toDataURL('image/jpeg', 0.95);
}

// Override the crop button click to use simple crop
function attachSimpleCropButtons() {
    document.querySelectorAll('.crop-btn').forEach(function(btn) {
        btn.onclick = function(e) {
            e.stopPropagation();
            const idx = parseInt(this.dataset.index);
            openSimpleCrop(idx);
        };
    });
}
'@

# Add new crop code before the last line
$content = $content + "`n" + $newCropCode

# Replace the openMergeCropModal call with openSimpleCrop in renderMergeGrid
$content = $content -replace 'openMergeCropModal\(parseInt\(this\.dataset\.index\)\);', 'openSimpleCrop(parseInt(this.dataset.index));'

[System.IO.File]::WriteAllText($path, $content, [System.Text.UTF8Encoding]::new($false))

Write-Host "=== Simple crop feature added ==="
Write-Host "Checking:"
Select-String -Path $path -Pattern 'openSimpleCrop|saveSimpleCrop|simpleCropModal' | Select-Object LineNumber, Line | Select-Object -First 5