export const uploadImageToCloudinary = async (file) => {
  const CLOUD_NAME = "doabyqhjn";
  const UPLOAD_PRESET = "senin_unsigned_preset_adin"; // Cloudinary'den aldığın preset adı

  const formData = new FormData();
  formData.append("file", file);
  formData.append("fikstur", UPLOAD_PRESET);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData }
    );
    const data = await response.json();
    return data.secure_url; 
  } catch (error) {
    console.error("Cloudinary Error:", error);
    return null;
  }
};