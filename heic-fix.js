document.addEventListener('DOMContentLoaded', () => {
    const loaderHTML = 
        <div id="heic-loader" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255,255,255,0.95); z-index: 99999; flex-direction: column; justify-content: center; align-items: center;">
            <div style="border: 5px solid #f3f3f3; border-top: 5px solid #4f46e5; border-radius: 50%; width: 50px; height: 50px; animation: heic-spin 1s linear infinite;"></div>
            <p style="margin-top: 20px; font-weight: bold; color: #4f46e5; font-size: 18px; text-align: center;">Converting iPhone Photo (HEIC)...<br>Please wait.</p>
        </div>
        <style>@keyframes heic-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
    ;
    document.body.insertAdjacentHTML('beforeend', loaderHTML);
    const loader = document.getElementById('heic-loader');

    const inputs = document.querySelectorAll('input[type="file"]');
    inputs.forEach(input => {
        input.addEventListener('change', async (e) => {
            const files = Array.from(input.files);
            if (files.length === 0) return;
            
            let hasHeic = false;
            const dataTransfer = new DataTransfer();
            
            for (let file of files) {
                if (file.name.toLowerCase().endsWith('.heic') || file.type === 'image/heic') {
                    hasHeic = true;
                    if(loader) loader.style.display = 'flex'; 
                    
                    try {
                        const convertedBlob = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
                        const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
                        const newFile = new File([blob], file.name.replace(/\.heic$/i, '.jpg'), { type: "image/jpeg" });
                        dataTransfer.items.add(newFile);
                    } catch (error) { console.error("HEIC Error", error); }
                } else {
                    dataTransfer.items.add(file);
                }
            }
            
            if (hasHeic) {
                e.stopImmediatePropagation(); 
                input.files = dataTransfer.files;
                if(loader) loader.style.display = 'none'; 
                input.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }, true); 
    });
});