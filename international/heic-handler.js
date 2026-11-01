// HEIC Auto-Converter for all tools
window.addEventListener('DOMContentLoaded', () => {
    const inputs = document.querySelectorAll('input[type="file"]');
    
    inputs.forEach(input => {
        input.dataset.heicHandled = "false";
        
        input.addEventListener('change', async (e) => {
            if (input.dataset.heicHandled === "true") {
                input.dataset.heicHandled = "false"; 
                return; 
            }

            const file = input.files[0];
            if (!file) return;

            // Check if HEIC
            if (file.name.toLowerCase().endsWith('.heic') || file.type === 'image/heic' || file.type === 'image/heif') {
                e.stopImmediatePropagation(); 
                
                const status = document.getElementById('compressStatus') || document.getElementById('statusText') || document.getElementById('mergeStatus') || document.getElementById('photoFileName') || document.getElementById('fileNameText');
                if(status) status.innerText = "Converting iPhone HEIC photo to JPG... Please wait.";
                
                try {
                    const convertedBlob = await heic2any({
                        blob: file,
                        toType: "image/jpeg",
                        quality: 0.9
                    });
                    
                    const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
                    const newFile = new File([blob], file.name.replace(/\.heic$/i, '.jpg'), { type: "image/jpeg" });
                    
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(newFile);
                    input.files = dataTransfer.files;
                    input.dataset.heicHandled = "true";
                    
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                    
                } catch (error) {
                    console.error("HEIC conversion failed", error);
                    alert("iPhone photo convert nahi ho payi. Kripya JPG use karein.");
                }
            }
        }, true);
    });
});