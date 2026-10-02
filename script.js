// ============ JPEG PADDING (Min size for exam photos) ============
function padJpegToMinSize(dataUrl, minKB) {
    try {
        const base64 = dataUrl.split(',')[1];
        let binaryStr = atob(base64);
        const currentSizeKB = (binaryStr.length) / 1024;
        if (currentSizeKB >= minKB) return dataUrl;

        const lastTwo = binaryStr.charCodeAt(binaryStr.length - 2).toString(16).padStart(2, '0') +
                        binaryStr.charCodeAt(binaryStr.length - 1).toString(16).padStart(2, '0');
        if (lastTwo !== 'ffd9') return dataUrl;

        const targetBytes = Math.round(minKB * 1024);
        const paddingBytes = targetBytes - binaryStr.length;
        if (paddingBytes <= 4) return dataUrl;

        const comDataLength = paddingBytes - 4;
        const lengthHi = String.fromCharCode(((comDataLength + 2) >> 8) & 0xFF);
        const lengthLo = String.fromCharCode((comDataLength + 2) & 0xFF);
        const paddingData = 'P'.repeat(Math.max(0, comDataLength));
        const comMarker = '\xFF\xFE' + lengthHi + lengthLo + paddingData;

        const beforeEoi = binaryStr.slice(0, binaryStr.length - 2);
        const eoi = binaryStr.slice(binaryStr.length - 2);
        const newBinary = beforeEoi + comMarker + eoi;

        return 'data:image/jpeg;base64,' + btoa(newBinary);
    } catch (e) {
        console.warn('Padding failed:', e);
        return dataUrl;
    }
}
/* ============================================
   Photo Resizer - Photo + Signature (2 Boxes)
   + Merger (PI7 Style Quality)
   + FIXED CROP (poori image dikhti hai)
   ============================================ */

// ============ PHOTO BOX ============
const photoInput = document.getElementById('photoInput');
const photoImageArea = document.getElementById('photoImageArea');
const photoFileName = document.getElementById('photoFileName');
const photoWidth = document.getElementById('photoWidth');
const photoHeight = document.getElementById('photoHeight');
const photoSize = document.getElementById('photoSize');
const photoResizeBtn = document.getElementById('photoResizeBtn');
const photoDownloadBtn = document.getElementById('photoDownloadBtn');
const photoBadgeW = document.getElementById('photoBadgeW');
const photoBadgeH = document.getElementById('photoBadgeH');

let photoImg = null;
let photoCanvas = null;
let photoName = '';

// ============ SIGNATURE BOX ============
const signInput = document.getElementById('signInput');
const signImageArea = document.getElementById('signImageArea');
const signFileName = document.getElementById('signFileName');
const signWidth = document.getElementById('signWidth');
const signHeight = document.getElementById('signHeight');
const signSize = document.getElementById('signSize');
const signResizeBtn = document.getElementById('signResizeBtn');
const signDownloadBtn = document.getElementById('signDownloadBtn');
const signBadgeW = document.getElementById('signBadgeW');
const signBadgeH = document.getElementById('signBadgeH');

let signImg = null;
let signCanvas = null;
let signName = '';

// ============ PHOTO SETUP ============
if (photoImageArea) {
    photoImageArea.addEventListener('click', function() {
        photoInput.click();
    });
    photoImageArea.addEventListener('dragover', function(e) {
        e.preventDefault();
    });
    photoImageArea.addEventListener('drop', function(e) {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) loadPhoto(file);
    });
}

if (photoInput) {
    photoInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) loadPhoto(file);
    });
}

function loadPhoto(file) {
    photoName = file.name;
    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            photoImg = img;
            if (photoFileName) photoFileName.textContent = file.name;
            if (photoResizeBtn) photoResizeBtn.disabled = false;
            if (photoDownloadBtn) photoDownloadBtn.style.display = 'none';

            photoImageArea.innerHTML = `
                <button class="crop-btn-icon" id="photoCropBtn">âœ‚ï¸ Crop</button>
                <button class="remove-btn-icon" id="photoRemoveBtn">Ã—</button>
                <img src="${event.target.result}" id="photoPreviewImg">
            `;
            document.getElementById('photoCropBtn').addEventListener('click', function(e) {
                e.stopPropagation();
                openCropModal('photo');
            });
            document.getElementById('photoRemoveBtn').addEventListener('click', function(e) {
                e.stopPropagation();
                removePhoto();
            });
            document.getElementById('photoPreviewImg').addEventListener('click', function(e) {
                e.stopPropagation();
            });
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

function removePhoto() {
    photoImg = null;
    photoCanvas = null;
    if (photoInput) photoInput.value = '';
    if (photoFileName) photoFileName.textContent = '';
    if (photoResizeBtn) photoResizeBtn.disabled = true;
    if (photoDownloadBtn) photoDownloadBtn.style.display = 'none';
    photoImageArea.innerHTML = `
        <div class="empty-state">
            <p>ðŸ“ Click to select a photo</p>
            <p style="font-size:13px;color:#999;">or drag & drop here</p>
        </div>
    `;
}

if (photoWidth) {
    photoWidth.addEventListener('input', function() {
        if (photoBadgeW) photoBadgeW.textContent = 'W-' + (this.value || '0');
    });
}
if (photoHeight) {
    photoHeight.addEventListener('input', function() {
        if (photoBadgeH) photoBadgeH.textContent = 'H-' + (this.value || '0');
    });
}

if (photoResizeBtn) {
    photoResizeBtn.addEventListener('click', function() {
        if (!photoImg) return;
        const tw = parseInt(photoWidth.value) || 200;
        const th = parseInt(photoHeight.value) || 230;
        const tkb = parseInt(photoSize.value) || 50;
        const result = resizeImage(photoImg, tw, th, tkb, panState.photo);
        photoCanvas = result.canvas;
        if (photoDownloadBtn) {
            photoDownloadBtn.style.display = 'block';
            photoDownloadBtn.textContent = `â¬‡ Download Photo (${result.sizeKB.toFixed(1)} KB)`;
        }
        photoImageArea.innerHTML = `
            <button class="remove-btn-icon" id="photoRemoveBtn">Ã—</button>
            <img src="${result.dataUrl}" id="photoPreviewImg">
        `;
        document.getElementById('photoRemoveBtn').addEventListener('click', function(e) {
            e.stopPropagation();
            removePhoto();
        });
        document.getElementById('photoPreviewImg').addEventListener('click', function(e) {
            e.stopPropagation();
        });
    });
}

if (photoDownloadBtn) {
    photoDownloadBtn.addEventListener('click', function() {
        if (!photoCanvas) return;
        const tw = parseInt(photoWidth.value) || 200;
        const th = parseInt(photoHeight.value) || 230;
        const tkb = parseInt(photoSize.value) || 50;
        const result = resizeImage(photoImg, tw, th, tkb, panState.photo);
        const link = document.createElement('a');
        link.download = 'ibps-photo.jpg';
        link.href = result.dataUrl;
        link.click();
    });
}

// ============ SIGNATURE SETUP ============
if (signImageArea) {
    signImageArea.addEventListener('click', function() {
        signInput.click();
    });
    signImageArea.addEventListener('dragover', function(e) {
        e.preventDefault();
    });
    signImageArea.addEventListener('drop', function(e) {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) loadSign(file);
    });
}

if (signInput) {
    signInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) loadSign(file);
    });
}

function loadSign(file) {
    signName = file.name;
    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            signImg = img;
            if (signFileName) signFileName.textContent = file.name;
            if (signResizeBtn) signResizeBtn.disabled = false;
            if (signDownloadBtn) signDownloadBtn.style.display = 'none';

            signImageArea.innerHTML = `
                <button class="crop-btn-icon" id="signCropBtn">âœ‚ï¸ Crop</button>
                <button class="remove-btn-icon" id="signRemoveBtn">Ã—</button>
                <img src="${event.target.result}" id="signPreviewImg">
            `;
            document.getElementById('signCropBtn').addEventListener('click', function(e) {
                e.stopPropagation();
                openCropModal('signature');
            });
            document.getElementById('signRemoveBtn').addEventListener('click', function(e) {
                e.stopPropagation();
                removeSign();
            });
            document.getElementById('signPreviewImg').addEventListener('click', function(e) {
                e.stopPropagation();
            });
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

function removeSign() {
    signImg = null;
    signCanvas = null;
    if (signInput) signInput.value = '';
    if (signFileName) signFileName.textContent = '';
    if (signResizeBtn) signResizeBtn.disabled = true;
    if (signDownloadBtn) signDownloadBtn.style.display = 'none';
    signImageArea.innerHTML = `
        <div class="empty-state">
            <p>ðŸ“ Click to select a signature</p>
            <p style="font-size:13px;color:#999;">or drag & drop here</p>
        </div>
    `;
}

if (signWidth) {
    signWidth.addEventListener('input', function() {
        if (signBadgeW) signBadgeW.textContent = 'W-' + (this.value || '0');
    });
}
if (signHeight) {
    signHeight.addEventListener('input', function() {
        if (signBadgeH) signBadgeH.textContent = 'H-' + (this.value || '0');
    });
}

if (signResizeBtn) {
    signResizeBtn.addEventListener('click', function() {
        if (!signImg) return;
        const tw = parseInt(signWidth.value) || 140;
        const th = parseInt(signHeight.value) || 60;
        const tkb = parseInt(signSize.value) || 20;
        const result = resizeImage(signImg, tw, th, tkb, panState.signature);
        signCanvas = result.canvas;
        if (signDownloadBtn) {
            signDownloadBtn.style.display = 'block';
            signDownloadBtn.textContent = `â¬‡ Download Signature (${result.sizeKB.toFixed(1)} KB)`;
        }
        signImageArea.innerHTML = `
            <button class="remove-btn-icon" id="signRemoveBtn">Ã—</button>
            <img src="${result.dataUrl}" id="signPreviewImg">
        `;
        document.getElementById('signRemoveBtn').addEventListener('click', function(e) {
            e.stopPropagation();
            removeSign();
        });
        document.getElementById('signPreviewImg').addEventListener('click', function(e) {
            e.stopPropagation();
        });
    });
}

if (signDownloadBtn) {
    signDownloadBtn.addEventListener('click', function() {
        if (!signCanvas) return;
        const tw = parseInt(signWidth.value) || 140;
        const th = parseInt(signHeight.value) || 60;
        const tkb = parseInt(signSize.value) || 20;
        const result = resizeImage(signImg, tw, th, tkb, panState.signature);
        const link = document.createElement('a');
        link.download = 'ibps-signature.jpg';
        link.href = result.dataUrl;
        link.click();
    });
}

// ============ COMMON RESIZE FUNCTION (PI7 STYLE QUALITY) ============
function resizeImage(sourceImg, targetW, targetH, targetKB, panOffset) {
    let currentImg = sourceImg;
    
    // Multi-step downscale for best quality
    if (sourceImg.width > targetW * 4 || sourceImg.height > targetH * 4) {
        const step1W = Math.round(sourceImg.width / 2);
        const step1H = Math.round(sourceImg.height / 2);
        
        const step1Canvas = document.createElement('canvas');
        step1Canvas.width = step1W;
        step1Canvas.height = step1H;
        const step1Ctx = step1Canvas.getContext('2d');
        step1Ctx.imageSmoothingEnabled = true;
        step1Ctx.imageSmoothingQuality = 'high';
        step1Ctx.drawImage(sourceImg, 0, 0, step1W, step1H);
        
        currentImg = step1Canvas;
        
        if (step1W > targetW * 2 || step1H > targetH * 2) {
            const step2W = Math.round(step1W / 2);
            const step2H = Math.round(step1H / 2);
            
            const step2Canvas = document.createElement('canvas');
            step2Canvas.width = step2W;
            step2Canvas.height = step2H;
            const step2Ctx = step2Canvas.getContext('2d');
            step2Ctx.imageSmoothingEnabled = true;
            step2Ctx.imageSmoothingQuality = 'high';
            step2Ctx.drawImage(currentImg, 0, 0, step2W, step2H);
            
            currentImg = step2Canvas;
        }
    }
    
    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetW, targetH);
    
    // If panOffset is provided, use it for source rect calculation
    if (panOffset && panOffset.areaW > 0 && panOffset.imgW > 0 && sourceImg.naturalWidth > 0) {
        const displayToSource = sourceImg.naturalWidth / panOffset.imgW;
        
        let sx = (-panOffset.x) * displayToSource;
        let sy = (-panOffset.y) * displayToSource;
        let sw = panOffset.areaW * displayToSource;
        let sh = panOffset.areaH * displayToSource;
        
        if (sx < 0) { sw = sw + sx; sx = 0; }
        if (sy < 0) { sh = sh + sy; sy = 0; }
        if (sx + sw > sourceImg.naturalWidth) sw = sourceImg.naturalWidth - sx;
        if (sy + sh > sourceImg.naturalHeight) sh = sourceImg.naturalHeight - sy;
        
        ctx.drawImage(sourceImg, sx, sy, sw, sh, 0, 0, targetW, targetH);
    } else {
        const scale = Math.max(targetW / currentImg.width, targetH / currentImg.height);
        const drawW = currentImg.width * scale;
        const drawH = currentImg.height * scale;
        const x = (targetW - drawW) / 2;
        const y = (targetH - drawH) / 2;
        ctx.drawImage(currentImg, x, y, drawW, drawH);
    }
    
    let dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    let sizeKB = (dataUrl.length * 0.75) / 1024;
    
    if (sizeKB <= targetKB) {
        // Pad to minimum size for exam requirements
    const minKB = 0;
    if (sizeKB < minKB) {
        // DISABLED FOR TEST
        sizeKB = (dataUrl.length * 0.75) / 1024;
    }
    return { canvas, dataUrl, sizeKB };
    }
    
    let quality = 0.95;
    while (sizeKB > targetKB && quality > 0.85) {
        quality -= 0.02;
        dataUrl = canvas.toDataURL('image/jpeg', quality);
        sizeKB = (dataUrl.length * 0.75) / 1024;
    }
    
    if (sizeKB > targetKB) {
        let currentW = targetW;
        let currentH = targetH;
        let workCanvas = canvas;
        let scaleDown = 1.0;
        
        while (sizeKB > targetKB && scaleDown > 0.5) {
            scaleDown -= 0.05;
            currentW = Math.round(targetW * scaleDown);
            currentH = Math.round(targetH * scaleDown);
            
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = currentW;
            tempCanvas.height = currentH;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.imageSmoothingEnabled = true;
            tempCtx.imageSmoothingQuality = 'high';
            tempCtx.fillStyle = '#ffffff';
            tempCtx.fillRect(0, 0, currentW, currentH);
            tempCtx.drawImage(workCanvas, 0, 0, currentW, currentH);
            
            dataUrl = tempCanvas.toDataURL('image/jpeg', 0.9);
            sizeKB = (dataUrl.length * 0.75) / 1024;
            workCanvas = tempCanvas;
        }
        
        canvas.width = currentW;
        canvas.height = currentH;
        const finalCtx = canvas.getContext('2d');
        finalCtx.imageSmoothingEnabled = true;
        finalCtx.imageSmoothingQuality = 'high';
        finalCtx.fillStyle = '#ffffff';
        finalCtx.fillRect(0, 0, currentW, currentH);
        finalCtx.drawImage(workCanvas, 0, 0, currentW, currentH);
    }
    
    if (sizeKB > targetKB) {
        let q = 0.85;
        while (sizeKB > targetKB && q > 0.7) {
            q -= 0.02;
            dataUrl = canvas.toDataURL('image/jpeg', q);
            sizeKB = (dataUrl.length * 0.75) / 1024;
        }
    }
    
    // Pad to minimum size for exam requirements
    const minKB = 0;
    if (sizeKB < minKB) {
        // DISABLED FOR TEST
        sizeKB = (dataUrl.length * 0.75) / 1024;
    }
    return { canvas, dataUrl, sizeKB };
}

// ============ CROP FUNCTIONALITY (FIXED) ============
let cropTarget = 'photo';
let cropBox = { x: 75, y: 75, w: 350, h: 350 };
let cropBoxDragging = false;
let cropBoxResizing = false;
let cropResizeHandle = '';
let cropBoxStartX = 0, cropBoxStartY = 0;
let cropBoxStart = { x: 0, y: 0, w: 0, h: 0 };
const CROP_CANVAS_SIZE = 500;

function openCropModal(target) {
    cropTarget = target;
    const img = target === 'photo' ? photoImg : signImg;
    if (!img) return;

    let modal = document.getElementById('cropModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'cropModal';
        modal.className = 'crop-modal';
        modal.innerHTML = `
            <div class="crop-modal-content">
                <h3>âœ‚ï¸ Crop Image</h3>
                <p style="font-size:13px; color:#718096;">Drag corners to resize. Drag inside to move.</p>
                <div class="crop-canvas-wrapper">
                    <canvas id="cropCanvas"></canvas>
                </div>
                <div class="crop-controls">
                    <button class="btn-cancel" id="cropCancelBtn">Cancel</button>
                    <button class="btn-save" id="cropSaveBtn">Save Crop</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        setupCropEvents();
    }

    const size = CROP_CANVAS_SIZE;
    const imgAspect = img.width / img.height;

    let boxW, boxH;
    if (imgAspect > 1) {
        boxW = size * 0.8;
        boxH = size * 0.6;
    } else if (imgAspect < 1) {
        boxW = size * 0.6;
        boxH = size * 0.8;
    } else {
        boxW = size * 0.7;
        boxH = size * 0.7;
    }

    cropBox = {
        x: (size - boxW) / 2,
        y: (size - boxH) / 2,
        w: boxW,
        h: boxH
    };

    modal.classList.add('active');
    drawCropCanvas();
}

function drawCropCanvas() {
    const canvas = document.getElementById('cropCanvas');
    const img = cropTarget === 'photo' ? photoImg : signImg;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    const size = CROP_CANVAS_SIZE;
    canvas.width = size;
    canvas.height = size;
    
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, size, size);

    const scale = Math.min(size / img.width, size / img.height);
    const drawW = img.width * scale;
    const drawH = img.height * scale;
    const x = (size - drawW) / 2;
    const y = (size - drawH) / 2;

    ctx.drawImage(img, x, y, drawW, drawH);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, size, cropBox.y);
    ctx.fillRect(0, cropBox.y + cropBox.h, size, size - cropBox.y - cropBox.h);
    ctx.fillRect(0, cropBox.y, cropBox.x, cropBox.h);
    ctx.fillRect(cropBox.x + cropBox.w, cropBox.y, size - cropBox.x - cropBox.w, cropBox.h);

    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 3;
    ctx.strokeRect(cropBox.x, cropBox.y, cropBox.w, cropBox.h);

    ctx.fillStyle = '#667eea';
    const hs = 14;
    ctx.fillRect(cropBox.x - hs/2, cropBox.y - hs/2, hs, hs);
    ctx.fillRect(cropBox.x + cropBox.w - hs/2, cropBox.y - hs/2, hs, hs);
    ctx.fillRect(cropBox.x - hs/2, cropBox.y + cropBox.h - hs/2, hs, hs);
    ctx.fillRect(cropBox.x + cropBox.w - hs/2, cropBox.y + cropBox.h - hs/2, hs, hs);
}

function setupCropEvents() {
    const canvas = document.getElementById('cropCanvas');
    const modal = document.getElementById('cropModal');
    const saveBtn = document.getElementById('cropSaveBtn');
    const cancelBtn = document.getElementById('cropCancelBtn');

    function getMousePos(e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    }

    function getHandleAt(mx, my) {
        const hs = 20;
        const { x, y, w, h } = cropBox;
        if (mx >= x - hs && mx <= x + hs && my >= y - hs && my <= y + hs) return 'tl';
        if (mx >= x + w - hs && mx <= x + w + hs && my >= y - hs && my <= y + hs) return 'tr';
        if (mx >= x - hs && mx <= x + hs && my >= y + h - hs && my <= y + h + hs) return 'bl';
        if (mx >= x + w - hs && mx <= x + w + hs && my >= y + h - hs && my <= y + h + hs) return 'br';
        if (mx >= x && mx <= x + w && my >= y && my <= y + h) return 'move';
        return null;
    }

    function onStart(e) {
        const pos = getMousePos(e);
        const handle = getHandleAt(pos.x, pos.y);
        if (!handle) return;
        if (handle === 'move') {
            cropBoxDragging = true;
        } else {
            cropBoxResizing = true;
            cropResizeHandle = handle;
        }
        cropBoxStartX = pos.x;
        cropBoxStartY = pos.y;
        cropBoxStart = { ...cropBox };
        if (e.cancelable) e.preventDefault();
    }

    function onMove(e) {
        if (!cropBoxDragging && !cropBoxResizing) return;
        const pos = getMousePos(e);
        const dx = pos.x - cropBoxStartX;
        const dy = pos.y - cropBoxStartY;
        const size = CROP_CANVAS_SIZE;
        const minSize = 50;

        if (cropBoxDragging) {
            let nx = cropBoxStart.x + dx;
            let ny = cropBoxStart.y + dy;
            nx = Math.max(0, Math.min(size - cropBox.w, nx));
            ny = Math.max(0, Math.min(size - cropBox.h, ny));
            cropBox.x = nx;
            cropBox.y = ny;
        } else {
            let { x, y, w, h } = cropBoxStart;
            if (cropResizeHandle === 'tl') {
                let nx = Math.max(0, Math.min(x + w - minSize, x + dx));
                let ny = Math.max(0, Math.min(y + h - minSize, y + dy));
                cropBox.w = x + w - nx;
                cropBox.h = y + h - ny;
                cropBox.x = nx;
                cropBox.y = ny;
            } else if (cropResizeHandle === 'tr') {
                let ny = Math.max(0, Math.min(y + h - minSize, y + dy));
                cropBox.h = y + h - ny;
                cropBox.y = ny;
                cropBox.w = Math.max(minSize, Math.min(size - x, w + dx));
            } else if (cropResizeHandle === 'bl') {
                let nx = Math.max(0, Math.min(x + w - minSize, x + dx));
                cropBox.w = x + w - nx;
                cropBox.x = nx;
                cropBox.h = Math.max(minSize, Math.min(size - y, h + dy));
            } else if (cropResizeHandle === 'br') {
                cropBox.w = Math.max(minSize, Math.min(size - x, w + dx));
                cropBox.h = Math.max(minSize, Math.min(size - y, h + dy));
            }
        }
        drawCropCanvas();
        if (e.cancelable) e.preventDefault();
    }

    function onEnd() {
        cropBoxDragging = false;
        cropBoxResizing = false;
        cropResizeHandle = '';
    }

    if (canvas) {
        canvas.addEventListener('mousedown', onStart);
        canvas.addEventListener('touchstart', onStart, { passive: false });
        document.addEventListener('mousemove', onMove);
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('mouseup', onEnd);
        document.addEventListener('touchend', onEnd);
    }

    if (saveBtn) saveBtn.addEventListener('click', saveCrop);
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            modal.classList.remove('active');
        });
    }
}

function saveCrop() {
    const canvas = document.getElementById('cropCanvas');
    const img = cropTarget === 'photo' ? photoImg : signImg;
    if (!canvas || !img) return;

    const size = CROP_CANVAS_SIZE;
    const scale = Math.min(size / img.width, size / img.height);
    const drawW = img.width * scale;
    const drawH = img.height * scale;
    const imgX = (size - drawW) / 2;
    const imgY = (size - drawH) / 2;

    const srcX = (cropBox.x - imgX) / scale;
    const srcY = (cropBox.y - imgY) / scale;
    const srcW = cropBox.w / scale;
    const srcH = cropBox.h / scale;

    const newCanvas = document.createElement('canvas');
    newCanvas.width = cropBox.w;
    newCanvas.height = cropBox.h;
    const newCtx = newCanvas.getContext('2d', { alpha: false });
    newCtx.imageSmoothingEnabled = true;
    newCtx.imageSmoothingQuality = 'high';
    newCtx.fillStyle = '#ffffff';
    newCtx.fillRect(0, 0, cropBox.w, cropBox.h);
    newCtx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, cropBox.w, cropBox.h);

    const croppedImg = new Image();
    croppedImg.onload = function() {
        const dataUrl = newCanvas.toDataURL('image/jpeg', 1.0);

        if (cropTarget === 'photo') {
            photoImg = croppedImg;
            photoImageArea.innerHTML = `
                <button class="crop-btn-icon" id="photoCropBtn">âœ‚ï¸ Crop</button>
                <button class="remove-btn-icon" id="photoRemoveBtn">Ã—</button>
                <img src="${dataUrl}" id="photoPreviewImg">
            `;
            document.getElementById('photoCropBtn').addEventListener('click', function(e) {
                e.stopPropagation();
                openCropModal('photo');
            });
            document.getElementById('photoRemoveBtn').addEventListener('click', function(e) {
                e.stopPropagation();
                removePhoto();
            });
            document.getElementById('photoPreviewImg').addEventListener('click', function(e) {
                e.stopPropagation();
            });
        } else {
            signImg = croppedImg;
            signImageArea.innerHTML = `
                <button class="crop-btn-icon" id="signCropBtn">âœ‚ï¸ Crop</button>
                <button class="remove-btn-icon" id="signRemoveBtn">Ã—</button>
                <img src="${dataUrl}" id="signPreviewImg">
            `;
            document.getElementById('signCropBtn').addEventListener('click', function(e) {
                e.stopPropagation();
                openCropModal('signature');
            });
            document.getElementById('signRemoveBtn').addEventListener('click', function(e) {
                e.stopPropagation();
                removeSign();
            });
            document.getElementById('signPreviewImg').addEventListener('click', function(e) {
                e.stopPropagation();
            });
        }

        document.getElementById('cropModal').classList.remove('active');
    };
    croppedImg.src = newCanvas.toDataURL('image/jpeg', 1.0);
}

// ============ PHOTO MERGER ============
const mergeInput = document.getElementById('mergeInput');
const mergeGrid = document.getElementById('mergeGrid');
const mergeStatus = document.getElementById('mergeStatus');
const mergeBtn = document.getElementById('mergeBtn');
const mergeDownloadBtn = document.getElementById('mergeDownloadBtn');
const mergeCanvas = document.getElementById('mergeCanvas');
const mergePreviewBox = document.getElementById('mergePreviewBox');

let mergePhotos = [];
let mergedBlob = null;

if (mergeInput) {
    mergeInput.addEventListener('change', function(e) {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        files.forEach((file) => {
            const reader = new FileReader();
            reader.onload = function(event) {
                const img = new Image();
                img.onload = function() {
                    mergePhotos.push({
                        id: Date.now() + Math.random(),
                        img: img,
                        croppedImg: img,
                        name: file.name
                    });
                    renderMergeGrid();
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });
        mergeInput.value = '';
    });
}

function renderMergeGrid() {
    if (!mergeGrid) return;
    mergeGrid.innerHTML = '';
    mergePhotos.forEach((photo, index) => {
        const div = document.createElement('div');
        div.className = 'merge-item';
        div.innerHTML = `
            <button class="crop-btn" data-index="${index}">âœ‚ï¸ Crop</button>
            <button class="remove-btn" data-index="${index}">Ã—</button>
            <img src="${photo.croppedImg.src}" alt="Photo">
            <div class="file-name">${photo.name || 'Photo ' + (index + 1)}</div>
        `;
        mergeGrid.appendChild(div);
    });
    const addBox = document.createElement('div');
    addBox.className = 'merge-item';
    addBox.innerHTML = `
        <div class="add-photo-inner" id="addMoreBtn">
            <span style="font-size:32px;">+</span>
            <p style="font-size:13px;color:#718096;margin-top:6px;">Add Photo</p>
        </div>
    `;
    mergeGrid.appendChild(addBox);
    mergeGrid.querySelectorAll('.crop-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            openMergeCropModal(parseInt(this.dataset.index));
        });
    });
    mergeGrid.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            mergePhotos.splice(parseInt(this.dataset.index), 1);
            renderMergeGrid();
        });
    });
    const addMoreBtn = document.getElementById('addMoreBtn');
    if (addMoreBtn) {
        addMoreBtn.addEventListener('click', function() {
            mergeInput.click();
        });
    }
    if (mergeStatus) {
        if (mergePhotos.length === 0) {
            mergeStatus.textContent = 'Select 2 or more images to merge.';
        } else if (mergePhotos.length === 1) {
            mergeStatus.textContent = '1 image selected. Add 1 more.';
        } else {
            mergeStatus.textContent = `âœ… ${mergePhotos.length} images selected.`;
        }
    }
    if (mergeBtn) mergeBtn.disabled = mergePhotos.length < 2;
    if (mergeDownloadBtn) mergeDownloadBtn.style.display = 'none';
    if (mergePreviewBox) mergePreviewBox.style.display = 'none';
    mergedBlob = null;
}

// ============ MERGE CROP MODAL ============
let mergeCropIndex = -1;
let mergeCropBox = { x: 75, y: 75, w: 350, h: 350 };
let mergeCropDragging = false;
let mergeCropResizing = false;
let mergeCropResizeHandle = '';
let mergeCropStartX = 0, mergeCropStartY = 0;
let mergeCropBoxStart = { x: 0, y: 0, w: 0, h: 0 };
const MERGE_CROP_SIZE = 500;

function openMergeCropModal(index) {
    mergeCropIndex = index;
    const photo = mergePhotos[index];
    if (!photo) return;

    let modal = document.getElementById('mergeCropModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'mergeCropModal';
        modal.className = 'crop-modal';
        modal.innerHTML = `
            <div class="crop-modal-content">
                <h3>âœ‚ï¸ Crop Image</h3>
                <p style="font-size:13px; color:#718096;">Drag corners to resize. Drag inside to move.</p>
                <div class="crop-canvas-wrapper">
                    <canvas id="mergeCropCanvas"></canvas>
                </div>
                <div class="crop-controls">
                    <button class="btn-cancel" id="mergeCropCancelBtn">Cancel</button>
                    <button class="btn-save" id="mergeCropSaveBtn">Save Crop</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        setupMergeCropEvents();
    }

    const img = photo.croppedImg;
    const size = MERGE_CROP_SIZE;
    const imgAspect = img.width / img.height;

    let boxW, boxH;
    if (imgAspect > 1) {
        boxW = size * 0.8;
        boxH = size * 0.6;
    } else if (imgAspect < 1) {
        boxW = size * 0.6;
        boxH = size * 0.8;
    } else {
        boxW = size * 0.7;
        boxH = size * 0.7;
    }

    mergeCropBox = {
        x: (size - boxW) / 2,
        y: (size - boxH) / 2,
        w: boxW,
        h: boxH
    };

    modal.classList.add('active');
    drawMergeCropCanvas();
}

function drawMergeCropCanvas() {
    const canvas = document.getElementById('mergeCropCanvas');
    if (!canvas || mergeCropIndex === -1) return;
    const photo = mergePhotos[mergeCropIndex];
    if (!photo) return;

    const img = photo.croppedImg;
    const ctx = canvas.getContext('2d');
    const size = MERGE_CROP_SIZE;
    canvas.width = size;
    canvas.height = size;
    
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, size, size);

    const scale = Math.min(size / img.width, size / img.height);
    const drawW = img.width * scale;
    const drawH = img.height * scale;
    const x = (size - drawW) / 2;
    const y = (size - drawH) / 2;

    ctx.drawImage(img, x, y, drawW, drawH);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, size, mergeCropBox.y);
    ctx.fillRect(0, mergeCropBox.y + mergeCropBox.h, size, size - mergeCropBox.y - mergeCropBox.h);
    ctx.fillRect(0, mergeCropBox.y, mergeCropBox.x, mergeCropBox.h);
    ctx.fillRect(mergeCropBox.x + mergeCropBox.w, mergeCropBox.y, size - mergeCropBox.x - mergeCropBox.w, mergeCropBox.h);

    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 3;
    ctx.strokeRect(mergeCropBox.x, mergeCropBox.y, mergeCropBox.w, mergeCropBox.h);

    ctx.fillStyle = '#667eea';
    const hs = 14;
    ctx.fillRect(mergeCropBox.x - hs/2, mergeCropBox.y - hs/2, hs, hs);
    ctx.fillRect(mergeCropBox.x + mergeCropBox.w - hs/2, mergeCropBox.y - hs/2, hs, hs);
    ctx.fillRect(mergeCropBox.x - hs/2, mergeCropBox.y + mergeCropBox.h - hs/2, hs, hs);
    ctx.fillRect(mergeCropBox.x + mergeCropBox.w - hs/2, mergeCropBox.y + mergeCropBox.h - hs/2, hs, hs);
}

function setupMergeCropEvents() {
    const canvas = document.getElementById('mergeCropCanvas');
    const modal = document.getElementById('mergeCropModal');
    const saveBtn = document.getElementById('mergeCropSaveBtn');
    const cancelBtn = document.getElementById('mergeCropCancelBtn');

    function getMousePos(e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    }

    function getHandleAt(mx, my) {
        const hs = 20;
        const { x, y, w, h } = mergeCropBox;
        if (mx >= x - hs && mx <= x + hs && my >= y - hs && my <= y + hs) return 'tl';
        if (mx >= x + w - hs && mx <= x + w + hs && my >= y - hs && my <= y + hs) return 'tr';
        if (mx >= x - hs && mx <= x + hs && my >= y + h - hs && my <= y + h + hs) return 'bl';
        if (mx >= x + w - hs && mx <= x + w + hs && my >= y + h - hs && my <= y + h + hs) return 'br';
        if (mx >= x && mx <= x + w && my >= y && my <= y + h) return 'move';
        return null;
    }

    function onStart(e) {
        const pos = getMousePos(e);
        const handle = getHandleAt(pos.x, pos.y);
        if (!handle) return;
        if (handle === 'move') {
            mergeCropDragging = true;
        } else {
            mergeCropResizing = true;
            mergeCropResizeHandle = handle;
        }
        mergeCropStartX = pos.x;
        mergeCropStartY = pos.y;
        mergeCropBoxStart = { ...mergeCropBox };
        if (e.cancelable) e.preventDefault();
    }

    function onMove(e) {
        if (!mergeCropDragging && !mergeCropResizing) return;
        const pos = getMousePos(e);
        const dx = pos.x - mergeCropStartX;
        const dy = pos.y - mergeCropStartY;
        const size = MERGE_CROP_SIZE;
        const minSize = 50;

        if (mergeCropDragging) {
            let nx = mergeCropBoxStart.x + dx;
            let ny = mergeCropBoxStart.y + dy;
            nx = Math.max(0, Math.min(size - mergeCropBox.w, nx));
            ny = Math.max(0, Math.min(size - mergeCropBox.h, ny));
            mergeCropBox.x = nx;
            mergeCropBox.y = ny;
        } else {
            let { x, y, w, h } = mergeCropBoxStart;
            if (mergeCropResizeHandle === 'tl') {
                let nx = Math.max(0, Math.min(x + w - minSize, x + dx));
                let ny = Math.max(0, Math.min(y + h - minSize, y + dy));
                mergeCropBox.w = x + w - nx;
                mergeCropBox.h = y + h - ny;
                mergeCropBox.x = nx;
                mergeCropBox.y = ny;
            } else if (mergeCropResizeHandle === 'tr') {
                let ny = Math.max(0, Math.min(y + h - minSize, y + dy));
                mergeCropBox.h = y + h - ny;
                mergeCropBox.y = ny;
                mergeCropBox.w = Math.max(minSize, Math.min(size - x, w + dx));
            } else if (mergeCropResizeHandle === 'bl') {
                let nx = Math.max(0, Math.min(x + w - minSize, x + dx));
                mergeCropBox.w = x + w - nx;
                mergeCropBox.x = nx;
                mergeCropBox.h = Math.max(minSize, Math.min(size - y, h + dy));
            } else if (mergeCropResizeHandle === 'br') {
                mergeCropBox.w = Math.max(minSize, Math.min(size - x, w + dx));
                mergeCropBox.h = Math.max(minSize, Math.min(size - y, h + dy));
            }
        }
        drawMergeCropCanvas();
        if (e.cancelable) e.preventDefault();
    }

    function onEnd() {
        mergeCropDragging = false;
        mergeCropResizing = false;
        mergeCropResizeHandle = '';
    }

    if (canvas) {
        canvas.addEventListener('mousedown', onStart);
        canvas.addEventListener('touchstart', onStart, { passive: false });
        document.addEventListener('mousemove', onMove);
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('mouseup', onEnd);
        document.addEventListener('touchend', onEnd);
    }

    if (saveBtn) saveBtn.addEventListener('click', saveMergeCrop);
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            modal.classList.remove('active');
        });
    }
}

function saveMergeCrop() {
    const canvas = document.getElementById('mergeCropCanvas');
    if (!canvas || mergeCropIndex === -1) return;
    const photo = mergePhotos[mergeCropIndex];
    if (!photo) return;

    const img = photo.croppedImg;
    const size = MERGE_CROP_SIZE;
    const scale = Math.min(size / img.width, size / img.height);
    const drawW = img.width * scale;
    const drawH = img.height * scale;
    const imgX = (size - drawW) / 2;
    const imgY = (size - drawH) / 2;

    const srcX = (mergeCropBox.x - imgX) / scale;
    const srcY = (mergeCropBox.y - imgY) / scale;
    const srcW = mergeCropBox.w / scale;
    const srcH = mergeCropBox.h / scale;

    const newCanvas = document.createElement('canvas');
    newCanvas.width = mergeCropBox.w;
    newCanvas.height = mergeCropBox.h;
    const newCtx = newCanvas.getContext('2d', { alpha: false });
    newCtx.imageSmoothingEnabled = true;
    newCtx.imageSmoothingQuality = 'high';
    newCtx.fillStyle = '#ffffff';
    newCtx.fillRect(0, 0, mergeCropBox.w, mergeCropBox.h);
    newCtx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, mergeCropBox.w, mergeCropBox.h);

    const croppedImg = new Image();
    croppedImg.onload = function() {
        mergePhotos[mergeCropIndex].croppedImg = croppedImg;
        renderMergeGrid();
        document.getElementById('mergeCropModal').classList.remove('active');
        mergeCropIndex = -1;
    };
    croppedImg.src = newCanvas.toDataURL('image/jpeg', 0.95);
}

// ============ MERGE FUNCTION (PI7 STYLE - FIXED QUALITY) ============
if (mergeBtn) {
    mergeBtn.addEventListener('click', function() {
        if (mergePhotos.length < 2 || !mergeCanvas) return;

        const direction = document.querySelector('input[name="direction"]:checked').value;
        const addBorder = document.getElementById('addBorder').checked;

        const ctx = mergeCanvas.getContext('2d');
        const images = mergePhotos.map(p => p.croppedImg);

        let canvasW, canvasH;

        // âœ… PI7 STYLE: Horizontal â€” same height, aspect ratio maintain
        if (direction === 'horizontal') {
            canvasH = Math.max(...images.map(img => img.height));
            
            const widths = images.map(img => {
                const aspect = img.width / img.height;
                return Math.round(canvasH * aspect);
            });
            
            canvasW = widths.reduce((sum, w) => sum + w, 0);
            
            mergeCanvas.width = canvasW;
            mergeCanvas.height = canvasH;
            
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvasW, canvasH);

            let x = 0;
            images.forEach((img, i) => {
                const drawW = widths[i];
                ctx.drawImage(img, x, 0, drawW, canvasH);
                
                if (addBorder) {
                    ctx.strokeStyle = '#000000';
                    ctx.lineWidth = 3;
                    ctx.strokeRect(x, 0, drawW, canvasH);
                }
                x += drawW;
            });
        }
        // âœ… PI7 STYLE: Vertical â€” same width, aspect ratio maintain
        else if (direction === 'vertical') {
            canvasW = Math.max(...images.map(img => img.width));
            
            const heights = images.map(img => {
                const aspect = img.height / img.width;
                return Math.round(canvasW * aspect);
            });
            
            canvasH = heights.reduce((sum, h) => sum + h, 0);
            
            mergeCanvas.width = canvasW;
            mergeCanvas.height = canvasH;
            
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvasW, canvasH);

            let y = 0;
            images.forEach((img, i) => {
                const drawH = heights[i];
                ctx.drawImage(img, 0, y, canvasW, drawH);
                
                if (addBorder) {
                    ctx.strokeStyle = '#000000';
                    ctx.lineWidth = 3;
                    ctx.strokeRect(0, y, canvasW, drawH);
                }
                y += drawH;
            });
        }
        // âœ… Grid â€” 2 columns
        else {
            const cols = 2;
            const rows = Math.ceil(images.length / cols);
            
            const maxW = Math.max(...images.map(img => img.width));
            const maxH = Math.max(...images.map(img => img.height));
            
            const cellW = maxW;
            const cellH = maxH;
            
            canvasW = cellW * cols;
            canvasH = cellH * rows;
            
            mergeCanvas.width = canvasW;
            mergeCanvas.height = canvasH;
            
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvasW, canvasH);

            images.forEach((img, i) => {
                const col = i % cols;
                const row = Math.floor(i / cols);
                const x = col * cellW;
                const y = row * cellH;
                
                const scale = Math.min(cellW / img.width, cellH / img.height);
                const drawW = img.width * scale;
                const drawH = img.height * scale;
                const offsetX = (cellW - drawW) / 2;
                const offsetY = (cellH - drawH) / 2;
                
                ctx.drawImage(img, x + offsetX, y + offsetY, drawW, drawH);
                
                if (addBorder) {
                    ctx.strokeStyle = '#000000';
                    ctx.lineWidth = 3;
                    ctx.strokeRect(x + offsetX, y + offsetY, drawW, drawH);
                }
            });
        }

        if (mergePreviewBox) mergePreviewBox.style.display = 'block';
        
        // âœ… HIGH QUALITY output â€” 0.98 (PI7 jaisa)
        mergeCanvas.toBlob(function(blob) {
            mergedBlob = blob;
            if (mergeDownloadBtn) mergeDownloadBtn.style.display = 'block';
        }, 'image/jpeg', 0.98);
    });
}

if (mergeDownloadBtn) {
    mergeDownloadBtn.addEventListener('click', function() {
        if (!mergedBlob) return;
        const link = document.createElement('a');
        link.download = 'merged-photo.jpg';
        link.href = URL.createObjectURL(mergedBlob);
        link.click();
    });
}


/* ============================================
   PHOTO COMPRESSOR
   ============================================ */
const compressInput = document.getElementById('compressInput');
const targetSize = document.getElementById('targetSize');
const compressPreview = document.getElementById('compressPreview');
const compressStatus = document.getElementById('compressStatus');
const compressBtn = document.getElementById('compressBtn');
const compressDownloadBtn = document.getElementById('compressDownloadBtn');

let compressImage = null;
let compressedBlob = null;

if (compressInput) {
    compressInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                compressImage = img;
                if (compressPreview) {
                    compressPreview.src = event.target.result;
                    compressPreview.style.display = 'block';
                }
                if (compressStatus) {
                    compressStatus.textContent = `Original Size: ${(file.size / 1024).toFixed(1)} KB`;
                }
                if (compressBtn) compressBtn.disabled = false;
                if (compressDownloadBtn) compressDownloadBtn.disabled = true;
                compressedBlob = null;
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });
}

function compressImageFile(img, targetKB, callback) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    let width = img.width;
    let height = img.height;

    if (width > 1200 || height > 1200) {
        if (width > height) {
            height = (height / width) * 1200;
            width = 1200;
        } else {
            width = (width / height) * 1200;
            height = 1200;
        }
    }

    canvas.width = width;
    canvas.height = height;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, width, height);

    let quality = 1.0;
    function tryCompress() {
        canvas.toBlob(function(blob) {
            const sizeKB = blob.size / 1024;
            if (sizeKB <= targetKB || quality <= 0.5) {
                callback(blob);
            } else {
                quality -= 0.05;
                tryCompress();
            }
        }, 'image/jpeg', quality);
    }
    tryCompress();
}

if (compressBtn) {
    compressBtn.addEventListener('click', function() {
        if (!compressImage) return;
        const targetKB = parseInt(targetSize.value) || 100;
        if (compressStatus) compressStatus.textContent = 'Compressing...';

        compressImageFile(compressImage, targetKB, function(blob) {
            compressedBlob = blob;
            const sizeKB = (blob.size / 1024).toFixed(1);

            if (compressPreview) {
                compressPreview.src = URL.createObjectURL(blob);
            }
            if (compressStatus) {
                compressStatus.textContent = `âœ… Compressed: ${sizeKB} KB (Target: ${targetKB} KB)`;
            }
            if (compressDownloadBtn) compressDownloadBtn.disabled = false;
        });
    });
}

if (compressDownloadBtn) {
    compressDownloadBtn.addEventListener('click', function() {
        if (!compressedBlob) return;
        const link = document.createElement('a');
        link.download = 'compressed-photo.jpg';
        link.href = URL.createObjectURL(compressedBlob);
        link.click();
    });
}

// ============ PAN/DRAG IMAGE FEATURE ============
const panState = {
    photo: { x: 0, y: 0, dragging: false, startX: 0, startY: 0, startPanX: 0, startPanY: 0, imgW: 0, imgH: 0, areaW: 0, areaH: 0 },
    signature: { x: 0, y: 0, dragging: false, startX: 0, startY: 0, startPanX: 0, startPanY: 0, imgW: 0, imgH: 0, areaW: 0, areaH: 0 }
};

function fitImageToArea(area, target) {
    const img = area.querySelector('img');
    if (!img || !img.naturalWidth) return;
    
    const areaW = area.clientWidth;
    const areaH = area.clientHeight;
    if (areaW < 10 || areaH < 10) return;
    
    // Cover fit - image fills area, extends beyond
    const scale = Math.max(areaW / img.naturalWidth, areaH / img.naturalHeight);
    const displayW = img.naturalWidth * scale;
    const displayH = img.naturalHeight * scale;
    
    img.style.width = displayW + 'px';
    img.style.height = displayH + 'px';
    
    panState[target].imgW = displayW;
    panState[target].imgH = displayH;
    panState[target].areaW = areaW;
    panState[target].areaH = areaH;
    
    // Center initially
    if (panState[target].x === 0 && panState[target].y === 0) {
        panState[target].x = (areaW - displayW) / 2;
        panState[target].y = (areaH - displayH) / 2;
    } else {
        // Clamp existing position
        clampPan(target);
    }
    
    applyPan(area, target);
}

function clampPan(target) {
    const s = panState[target];
    const minX = s.areaW - s.imgW;  // negative
    const minY = s.areaH - s.imgH;
    const maxX = 0;
    const maxY = 0;
    
    if (s.imgW <= s.areaW) {
        s.x = (s.areaW - s.imgW) / 2;
    } else {
        if (s.x > maxX) s.x = maxX;
        if (s.x < minX) s.x = minX;
    }
    
    if (s.imgH <= s.areaH) {
        s.y = (s.areaH - s.imgH) / 2;
    } else {
        if (s.y > maxY) s.y = maxY;
        if (s.y < minY) s.y = minY;
    }
}

function applyPan(area, target) {
    const img = area.querySelector('img');
    if (!img) return;
    img.style.left = panState[target].x + 'px';
    img.style.top = panState[target].y + 'px';
}

function setupPanDrag(areaId, target) {
    const area = document.getElementById(areaId);
    if (!area) return;

    function getPoint(e) {
        if (e.touches && e.touches[0]) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        return { x: e.clientX, y: e.clientY };
    }

    function onStart(e) {
        const img = area.querySelector('img');
        if (!img || !img.naturalWidth) return;
        e.preventDefault();
        const p = getPoint(e);
        panState[target].dragging = true;
        panState[target].startX = p.x;
        panState[target].startY = p.y;
        panState[target].startPanX = panState[target].x;
        panState[target].startPanY = panState[target].y;
        area.classList.add('dragging');
    }

    function onMove(e) {
        if (!panState[target].dragging) return;
        e.preventDefault();
        const p = getPoint(e);
        const dx = p.x - panState[target].startX;
        const dy = p.y - panState[target].startY;
        panState[target].x = panState[target].startPanX + dx;
        panState[target].y = panState[target].startPanY + dy;
        clampPan(target);
        applyPan(area, target);
    }

    function onEnd() {
        if (!panState[target].dragging) return;
        panState[target].dragging = false;
        area.classList.remove('dragging');
    }

    area.addEventListener('mousedown', onStart);
    area.addEventListener('touchstart', onStart, { passive: false });
    document.addEventListener('mousemove', onMove);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchend', onEnd);
    
    // Observe image load to fit
    const observer = new MutationObserver(function() {
        const img = area.querySelector('img');
        if (img && img.naturalWidth) {
            setTimeout(function() { fitImageToArea(area, target); }, 50);
        }
    });
    observer.observe(area, { childList: true, subtree: true });
}

// Auto-fit on image load
function autoFitAll() {
    const photoArea = document.getElementById('photoImageArea');
    const signArea = document.getElementById('signImageArea');
    if (photoArea) {
        const img = photoArea.querySelector('img');
        if (img && img.naturalWidth) fitImageToArea(photoArea, 'photo');
    }
    if (signArea) {
        const img = signArea.querySelector('img');
        if (img && img.naturalWidth) fitImageToArea(signArea, 'signature');
    }
}

// Get source rect for canvas drawing based on pan
function getPanSourceRect(target) {
    const s = panState[target];
    const img = target === 'photo' ? photoImg : signImg;
    if (!img || !img.naturalWidth || !s.areaW) return null;
    
    // Scale factor from display to original
    const scale = img.naturalWidth / s.imgW;
    
    // Visible area in original image coordinates
    const sx = (-s.x) * scale;
    const sy = (-s.y) * scale;
    const sw = s.areaW * scale;
    const sh = s.areaH * scale;
    
    return { sx: sx, sy: sy, sw: sw, sh: sh };
}

document.addEventListener('DOMContentLoaded', function() {
    setupPanDrag('photoImageArea', 'photo');
    setupPanDrag('signImageArea', 'signature');
    setInterval(autoFitAll, 500);
});

// ============ REMOVE CROP BUTTONS ON LOAD ============
function removeCropButtons() {
    document.querySelectorAll('.crop-btn-icon').forEach(function(btn) {
        btn.remove();
    });
}
document.addEventListener('DOMContentLoaded', removeCropButtons);
setInterval(removeCropButtons, 500);

// ============ FORCE FRAME DIMENSIONS ============
function forceFrameAspect() {
    const photoArea = document.getElementById('photoImageArea');
    const signArea = document.getElementById('signImageArea');
    const pw = document.getElementById('photoWidth');
    const ph = document.getElementById('photoHeight');
    const sw = document.getElementById('signWidth');
    const sh = document.getElementById('signHeight');
    
    if (photoArea && pw && ph) {
        const tw = parseInt(pw.value) || 100;
        const th = parseInt(ph.value) || 120;
        const aspect = tw / th;
        const displayW = 240;
        const displayH = Math.round(displayW / aspect);
        
        photoArea.style.setProperty('width', displayW + 'px', 'important');
        photoArea.style.setProperty('height', displayH + 'px', 'important');
        photoArea.style.setProperty('max-width', displayW + 'px', 'important');
        photoArea.style.setProperty('max-height', displayH + 'px', 'important');
        photoArea.style.setProperty('min-height', displayH + 'px', 'important');
        photoArea.style.setProperty('margin', '0 auto', 'important');
        photoArea.style.setProperty('position', 'relative', 'important');
        photoArea.style.setProperty('overflow', 'hidden', 'important');
        photoArea.style.setProperty('border', '2px solid #4f46e5', 'important');
        photoArea.style.setProperty('background', '#ffffff', 'important');
        photoArea.style.setProperty('border-radius', '8px', 'important');
    }
    
    if (signArea && sw && sh) {
        const tw = parseInt(sw.value) || 140;
        const th = parseInt(sh.value) || 60;
        const aspect = tw / th;
        const displayW = 320;
        const displayH = Math.round(displayW / aspect);
        
        signArea.style.setProperty('width', displayW + 'px', 'important');
        signArea.style.setProperty('height', displayH + 'px', 'important');
        signArea.style.setProperty('max-width', displayW + 'px', 'important');
        signArea.style.setProperty('max-height', displayH + 'px', 'important');
        signArea.style.setProperty('min-height', displayH + 'px', 'important');
        signArea.style.setProperty('margin', '0 auto', 'important');
        signArea.style.setProperty('position', 'relative', 'important');
        signArea.style.setProperty('overflow', 'hidden', 'important');
        signArea.style.setProperty('border', '2px solid #4f46e5', 'important');
        signArea.style.setProperty('background', '#ffffff', 'important');
        signArea.style.setProperty('border-radius', '8px', 'important');
    }
}

// Call on load and on input change
document.addEventListener('DOMContentLoaded', function() {
    forceFrameAspect();
    setTimeout(forceFrameAspect, 300);
    setTimeout(forceFrameAspect, 1000);
    
    ['photoWidth', 'photoHeight', 'signWidth', 'signHeight'].forEach(function(id) {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', forceFrameAspect);
    });
});

setInterval(forceFrameAspect, 1000);

// ============ FORCE IMAGE POSITION ============
function forceImageStyle() {
    ['photoImageArea', 'signImageArea'].forEach(function(id) {
        const area = document.getElementById(id);
        if (!area) return;
        const img = area.querySelector('img');
        if (!img || !img.naturalWidth) return;
        img.style.setProperty('position', 'absolute', 'important');
        img.style.setProperty('top', img.style.top || '0px', 'important');
        img.style.setProperty('left', img.style.left || '0px', 'important');
        img.style.setProperty('max-width', 'none', 'important');
        img.style.setProperty('max-height', 'none', 'important');
        img.style.setProperty('pointer-events', 'none', 'important');
        img.style.setProperty('user-select', 'none', 'important');
    });
}

document.addEventListener('DOMContentLoaded', function() {
    forceImageStyle();
    setInterval(forceImageStyle, 500);
});

// ============ HIDE EMPTY STATE WHEN IMAGE PRESENT ============
function hideEmptyState() {
    ['photoImageArea', 'signImageArea'].forEach(function(id) {
        const area = document.getElementById(id);
        if (!area) return;
        const emptyState = area.querySelector('.empty-state');
        const img = area.querySelector('img');
        if (emptyState && img && img.naturalWidth) {
            emptyState.style.display = 'none';
        }
    });
}

setInterval(hideEmptyState, 500);

// ============ PAN FRAME MANAGER v3 ============
function initPanFrames() {
    const configs = [
        { area: 'photoImageArea', wId: 'photoWidth', hId: 'photoHeight', target: 'photo', maxW: 240 },
        { area: 'signImageArea', wId: 'signWidth', hId: 'signHeight', target: 'signature', maxW: 340 }
    ];
    
    configs.forEach(function(cfg) {
        const area = document.getElementById(cfg.area);
        if (!area) return;
        
        area.classList.add('pan-frame');
        
        const wEl = document.getElementById(cfg.wId);
        const hEl = document.getElementById(cfg.hId);
        const tw = parseInt(wEl ? wEl.value : 100) || 100;
        const th = parseInt(hEl ? hEl.value : 120) || 120;
        
        const aspect = tw / th;
        const displayW = cfg.maxW;
        const displayH = Math.round(displayW / aspect);
        
        // Force dimensions
        area.style.cssText = 'width:' + displayW + 'px !important;' +
                              'height:' + displayH + 'px !important;' +
                              'max-width:' + displayW + 'px !important;' +
                              'max-height:' + displayH + 'px !important;' +
                              'min-height:' + displayH + 'px !important;' +
                              'margin: 0 auto !important;' +
                              'position: relative !important;' +
                              'overflow: hidden !important;' +
                              'border: 2px solid #4f46e5 !important;' +
                              'background: #f0f0f5 !important;' +
                              'border-radius: 8px !important;';
        
        // Set pan state area dimensions
        if (window.panState && panState[cfg.target]) {
            panState[cfg.target].areaW = displayW;
            panState[cfg.target].areaH = displayH;
        }
        
        // Fit image
        const img = area.querySelector('img');
        if (img && img.naturalWidth) {
            fitImageToArea(area, cfg.target);
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    initPanFrames();
    setTimeout(initPanFrames, 200);
    setTimeout(initPanFrames, 500);
});

// Re-run on width/height input change
document.addEventListener('input', function(e) {
    if (e.target && (e.target.id === 'photoWidth' || e.target.id === 'photoHeight' ||
                     e.target.id === 'signWidth' || e.target.id === 'signHeight')) {
        initPanFrames();
    }
});

setInterval(initPanFrames, 1500);

// ============ PAN FRAME MANAGER v4 (Fixed) ============
function setImp(el, prop, val) {
    if (el && el.style) el.style.setProperty(prop, val, 'important');
}

function initPanFrames() {
    const configs = [
        { area: 'photoImageArea', wId: 'photoWidth', hId: 'photoHeight', target: 'photo', maxW: 240 },
        { area: 'signImageArea', wId: 'signWidth', hId: 'signHeight', target: 'signature', maxW: 340 }
    ];
    
    configs.forEach(function(cfg) {
        const area = document.getElementById(cfg.area);
        if (!area) return;
        
        area.classList.add('pan-frame');
        
        const wEl = document.getElementById(cfg.wId);
        const hEl = document.getElementById(cfg.hId);
        const tw = parseInt(wEl ? wEl.value : 100) || 100;
        const th = parseInt(hEl ? hEl.value : 120) || 120;
        
        const aspect = tw / th;
        const displayW = cfg.maxW;
        const displayH = Math.round(displayW / aspect);
        
        // Use setProperty with important flag (cssText doesn't support !important)
        setImp(area, 'width', displayW + 'px');
        setImp(area, 'height', displayH + 'px');
        setImp(area, 'max-width', displayW + 'px');
        setImp(area, 'max-height', displayH + 'px');
        setImp(area, 'min-height', displayH + 'px');
        setImp(area, 'min-width', displayW + 'px');
        setImp(area, 'margin', '0 auto');
        setImp(area, 'position', 'relative');
        setImp(area, 'overflow', 'hidden');
        setImp(area, 'border', '2px solid #4f46e5');
        setImp(area, 'background', '#f0f0f5');
        setImp(area, 'border-radius', '8px');
        setImp(area, 'padding', '0');
        
        // Update pan state
        if (window.panState && panState[cfg.target]) {
            panState[cfg.target].areaW = displayW;
            panState[cfg.target].areaH = displayH;
        }
        
        // Fit image
        const img = area.querySelector('img');
        if (img && img.naturalWidth) {
            img.style.setProperty('position', 'absolute', 'important');
            img.style.setProperty('max-width', 'none', 'important');
            img.style.setProperty('max-height', 'none', 'important');
            img.style.setProperty('pointer-events', 'none', 'important');
            
            if (typeof fitImageToArea === 'function') {
                fitImageToArea(area, cfg.target);
            }
        }
    });
}

// Remove old manager if exists
window.initPanFrames = initPanFrames;

document.addEventListener('DOMContentLoaded', function() {
    initPanFrames();
    setTimeout(initPanFrames, 200);
    setTimeout(initPanFrames, 500);
});

document.addEventListener('input', function(e) {
    if (e.target && (e.target.id === 'photoWidth' || e.target.id === 'photoHeight' ||
                     e.target.id === 'signWidth' || e.target.id === 'signHeight')) {
        initPanFrames();
    }
});

setInterval(initPanFrames, 1000);
