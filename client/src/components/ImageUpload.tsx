import { useState } from 'react';

interface ImageUploadProps {
  onImageSelect: (base64: string) => void;
  label?: string;
}

export default function ImageUpload({ onImageSelect, label = '사진 업로드' }: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create preview URL
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      // Convert to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Send base64 to parent
      onImageSelect(base64);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onImageSelect('');
  };

  return (
    <div>
      <label className="block text-white font-medium mb-2">
        {label}
      </label>

      {!previewUrl ? (
        <label className="block">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
          <div className="w-full h-64 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 transition">
            <span className="material-symbols-outlined text-6xl text-gray-500 mb-2">
              add_photo_alternate
            </span>
            <p className="text-[#ab9eb7] text-sm">
              클릭하여 사진을 선택하세요
            </p>
          </div>
        </label>
      ) : (
        <div className="relative">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-64 object-cover rounded-lg"
          />
          <button
            onClick={handleRemove}
            type="button"
            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}
    </div>
  );
}
