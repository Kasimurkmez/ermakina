export const uploadImageToCloudinary = async (file: File): Promise<string | null> => {
    // Görseldeki 'doabyqhjn' bulut adınız
    const CLOUD_NAME = "doabyqhjn"; 
    // Cloudinary panelinde oluşturduğunuz preset adı
    const UPLOAD_PRESET = "fikstur"; 

    const formData = new FormData();
    formData.append("file", file);
    // Hata Çözümü: 'fikstur' anahtarı yerine mutlaka 'upload_preset' kullanılmalıdır
    formData.append("upload_preset", UPLOAD_PRESET); 

    try {
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
            {
                method: "POST",
                body: formData,
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Cloudinary Detaylı Hata:", errorData);
            return null;
        }

        const data = await response.json();
        
        // --- EKONOMİK BOYUTLANDIRMA VE TASARRUF ---
        // 700KB'lık resmi yaklaşık 60-70KB'a düşüren optimizasyon linki
        if (data.secure_url) {
            return data.secure_url.replace('/upload/', '/upload/w_800,c_limit,q_auto,f_auto/');
        }
        
        return null;
    } catch (error) {
        console.error("Bağlantı Hatası:", error);
        return null;
    }
};