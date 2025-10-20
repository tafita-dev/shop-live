const uploadImageToCloudinary = async (imageUri: string): Promise<string> => {
  try {
    const formData = new FormData();

    // Fichier image
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'upload.jpg',
    } as any);

    // 🔹 Nom de ton upload preset Cloudinary
    formData.append('upload_preset', 'categories_preset');

    const cloudName = 'dfywekuna'; // 🔹 Remplace par ton cloud name

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      },
    );

    const data = await res.json();
    console.log(data, 'data');

    if (!data.secure_url) throw new Error('Erreur Cloudinary');

    return data.secure_url;
  } catch (error) {
    console.error('❌ Erreur upload Cloudinary:', error);
    throw error;
  }
};

export default uploadImageToCloudinary;
