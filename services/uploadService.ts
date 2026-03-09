import { dbService } from "./dbService";

export const uploadImage = async (file: File, mode: 'cloud' | 'local' = 'cloud'): Promise<string> => {
  if (mode === 'cloud') {
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.url) return data.url;
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.warn("Cloud upload returned error:", response.status, errorData);
      }
    } catch (error) {
      console.warn("Cloud upload network failure, falling back to local storage:", error);
    }
  }

  // Local storage (IndexedDB)
  console.log("Using local storage for image upload");
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        // Lưu vào thư viện ảnh cục bộ để có thể dùng lại
        await dbService.saveLocalImage(base64, ["local", "avatar"]);
        resolve(base64);
      } catch (err) {
        console.error("IndexedDB save error:", err);
        resolve(base64);
      }
    };
    reader.onerror = (err) => {
      console.error("FileReader error:", err);
      reject(new Error("Lỗi đọc file ảnh: " + (err.target?.error?.message || "Unknown error")));
    };
    reader.readAsDataURL(file);
  });
};

export const saveExternalUrlToLocal = async (url: string): Promise<void> => {
  try {
    await dbService.saveLocalImage(url, ["external", "avatar"]);
  } catch (err) {
    console.error("Failed to save external URL to local DB:", err);
  }
};

export const deleteImageFromCloudinary = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch("/api/images", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Delete failed");
    }

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error("Delete image error:", error);
    return false;
  }
};

export const fetchCloudinaryImages = async (): Promise<string[]> => {
  let cloudImages: string[] = [];
  try {
    const response = await fetch("/api/images");
    if (response.ok) {
      const data = await response.json();
      cloudImages = data.images || [];
    }
  } catch (error) {
    console.error("Gallery fetch error:", error);
  }

  // Luôn lấy thêm ảnh từ IndexedDB
  try {
    const localImages = await dbService.getLocalImages();
    const localUrls = localImages.map(img => img.url);
    // Kết hợp và loại bỏ trùng lặp
    return Array.from(new Set([...cloudImages, ...localUrls]));
  } catch (err) {
    console.error("Local gallery fetch error:", err);
    return cloudImages;
  }
};

export const checkSystemHealth = async (): Promise<{ cloudinary: boolean, mode: 'full' | 'basic' }> => {
  try {
    const response = await fetch("/api/health");
    if (!response.ok) return { cloudinary: false, mode: 'basic' };
    return await response.json();
  } catch (error) {
    return { cloudinary: false, mode: 'basic' };
  }
};
