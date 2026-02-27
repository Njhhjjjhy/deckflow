import { useCallback, useRef, useState } from 'react';
import { fileToBase64, saveImage } from '../../lib/images/imageStore';

interface ImageUploadProps {
  value: string; // image key or empty
  imageData: string | null; // base64 data URL or null
  onUpload: (imageKey: string, base64: string) => void;
  onClear: () => void;
}

const ACCEPTED = '.jpg,.jpeg,.png,.webp';
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export default function ImageUpload({ value, imageData, onUpload, onClear }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = useCallback(
    async (file: File) => {
      setError(null);
      if (file.size > MAX_SIZE) {
        setError('Image must be under 5MB');
        return;
      }
      if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
        setError('Only JPG, PNG, or WebP images');
        return;
      }
      try {
        const base64 = await fileToBase64(file);
        const key = `img-${crypto.randomUUID()}`;
        await saveImage(key, base64);
        onUpload(key, base64);
      } catch {
        setError('Upload failed. Try again.');
      }
    },
    [onUpload]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      e.target.value = '';
    },
    [processFile]
  );

  return (
    <div>
      {imageData ? (
        <div className="relative">
          <img
            src={imageData}
            alt="Hero preview"
            className="w-full h-32 object-cover rounded border border-[#E5E5E5]"
          />
          <button
            onClick={onClear}
            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-[#1A1A1A] text-white text-xs flex items-center justify-center hover:bg-red-600 transition-colors"
            title="Remove image"
          >
            x
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className="flex flex-col items-center justify-center h-32 rounded border-2 border-dashed cursor-pointer transition-colors"
          style={{
            borderColor: dragOver ? '#FBB931' : '#CCCCCC',
            background: dragOver ? '#FBB93111' : '#fff',
          }}
        >
          <span className="text-sm text-[#666] mb-1">Drop image here</span>
          <span className="text-xs text-[#999]">or click to browse</span>
          <span className="text-xs text-[#999] mt-0.5">JPG, PNG, WebP — max 5MB</span>
        </div>
      )}

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        onChange={onFileChange}
        className="hidden"
        aria-label={value ? 'Replace hero image' : 'Upload hero image'}
      />
    </div>
  );
}
