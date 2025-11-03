import React, { useState, useRef } from 'react';
import { Button } from './Button';

interface LogoUploadProps {
  currentLogo?: string;
  onLogoChange: (logo: string | null) => void;
  className?: string;
}

export const LogoUpload: React.FC<LogoUploadProps> = ({ 
  currentLogo, 
  onLogoChange, 
  className = '' 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentLogo || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update preview when currentLogo changes
  React.useEffect(() => {
    setPreview(currentLogo || null);
  }, [currentLogo]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, JPEG, etc.)');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB');
      return;
    }

    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
      onLogoChange(result);
      setIsUploading(false);
    };
    reader.onerror = () => {
      alert('Failed to read the file. Please try again.');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setPreview(null);
    onLogoChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Company Logo
        </label>
        <div className="flex space-x-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleUploadClick}
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : preview ? 'Change Logo' : 'Upload Logo'}
          </Button>
          {preview && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemoveLogo}
              disabled={isUploading}
            >
              Remove
            </Button>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {preview ? (
        <div className="space-y-2">
          <div className="relative inline-block">
            <img
              src={preview}
              alt="Company Logo Preview"
              className="max-w-[200px] max-h-[100px] object-contain border border-gray-300 rounded-lg p-2 bg-white"
            />
          </div>
          <p className="text-xs text-gray-500">
            Logo will be displayed in headers and PDFs. Recommended size: 200x100px or similar aspect ratio.
          </p>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <div className="space-y-2">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-sm text-gray-600">
              No logo uploaded
            </p>
            <p className="text-xs text-gray-500">
              Click "Upload Logo" to add your company logo
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
