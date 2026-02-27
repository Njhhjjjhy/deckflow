import { useState, useEffect, useCallback, useRef } from 'react';
import type { Page, TranslatableField } from '../../types/presentation';
import { usePresentationStore } from '../../lib/store/presentationStore';
import { loadImage, fileToBase64, saveImage } from '../../lib/images/imageStore';
import LanguageTabs from './LanguageTabs';

interface PhotoEntry {
  id: string;
  imageKey: string; // key in IndexedDB, '' if not yet uploaded
}

const MAX_PHOTOS = 16;
const MIN_PHOTOS = 1;
const IMAGE_MAX_SIZE = 5 * 1024 * 1024;
const IMAGE_ACCEPTED = '.jpg,.jpeg,.png,.webp';

interface PhotoGalleryEditorProps {
  page: Page;
}

export default function PhotoGalleryEditor({ page }: PhotoGalleryEditorProps) {
  const updateTranslatableField = usePresentationStore((s) => s.updateTranslatableField);
  const updateStringField = usePresentationStore((s) => s.updateStringField);

  const sectionLabel = page.content.sectionLabel as TranslatableField;
  const year = (page.content.year as string) || '';
  const photosDataRaw = (page.content.photosData as string) || '[]';

  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [photoImages, setPhotoImages] = useState<Record<string, string | null>>({});
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  // Parse photos on mount
  useEffect(() => {
    try {
      const parsed = JSON.parse(photosDataRaw);
      setPhotos(parsed.length > 0 ? parsed : [{ id: crypto.randomUUID(), imageKey: '' }]);
    } catch {
      setPhotos([{ id: crypto.randomUUID(), imageKey: '' }]);
    }
  }, []); // Only on mount

  // Load all photo images from IndexedDB
  useEffect(() => {
    if (photos.length === 0) return;
    const loadAll = async () => {
      const map: Record<string, string | null> = {};
      for (const photo of photos) {
        if (photo.imageKey) {
          map[photo.id] = await loadImage(photo.imageKey);
        } else {
          map[photo.id] = null;
        }
      }
      setPhotoImages(map);
    };
    loadAll();
  }, [photos]);

  const syncPhotos = useCallback(
    (updated: PhotoEntry[]) => {
      setPhotos(updated);
      updateStringField(page.id, 'photosData', JSON.stringify(updated));
    },
    [page.id, updateStringField]
  );

  const addPhoto = useCallback(() => {
    if (photos.length >= MAX_PHOTOS) return;
    syncPhotos([...photos, { id: crypto.randomUUID(), imageKey: '' }]);
  }, [photos, syncPhotos]);

  const removePhoto = useCallback(
    (idx: number) => {
      if (photos.length <= MIN_PHOTOS) return;
      syncPhotos(photos.filter((_, i) => i !== idx));
    },
    [photos, syncPhotos]
  );

  const movePhoto = useCallback(
    (fromIdx: number, toIdx: number) => {
      if (fromIdx === toIdx) return;
      const updated = [...photos];
      const [moved] = updated.splice(fromIdx, 1);
      updated.splice(toIdx, 0, moved);
      syncPhotos(updated);
    },
    [photos, syncPhotos]
  );

  const processImageFile = useCallback(
    async (file: File, photoIdx: number) => {
      setImageError(null);
      if (file.size > IMAGE_MAX_SIZE) {
        setImageError('Image must be under 5MB');
        return;
      }
      if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
        setImageError('Only JPG, PNG, or WebP');
        return;
      }
      try {
        const base64 = await fileToBase64(file);
        const key = `img-${crypto.randomUUID()}`;
        await saveImage(key, base64);
        const updated = [...photos];
        updated[photoIdx] = { ...updated[photoIdx], imageKey: key };
        setPhotoImages((prev) => ({ ...prev, [updated[photoIdx].id]: base64 }));
        syncPhotos(updated);
      } catch {
        setImageError('Upload failed. Try again.');
      }
    },
    [photos, syncPhotos]
  );

  const clearPhoto = useCallback(
    (idx: number) => {
      const updated = [...photos];
      updated[idx] = { ...updated[idx], imageKey: '' };
      setPhotoImages((prev) => ({ ...prev, [updated[idx].id]: null }));
      syncPhotos(updated);
    },
    [photos, syncPhotos]
  );

  const setFileInputRef = useCallback((key: string, el: HTMLInputElement | null) => {
    fileInputRefs.current[key] = el;
  }, []);

  return (
    <div className="space-y-5">
      <h2 className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-wide">
        Photo Gallery
      </h2>

      {/* Section label */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">Section Label</label>
        <LanguageTabs
          field={sectionLabel as any}
          onChange={(lang, value) => updateTranslatableField(page.id, 'sectionLabel', lang, value)}
          placeholder="e.g. 02 | Properties"
        />
      </fieldset>

      {/* Year */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">Year</label>
        <input
          type="text"
          value={year}
          onChange={(e) => updateStringField(page.id, 'year', e.target.value)}
          placeholder="e.g. 2026"
          maxLength={10}
          className="w-full px-3 py-2 text-sm rounded border border-[#E5E5E5] bg-white focus:outline-none focus:border-[#FBB931] focus:ring-1 focus:ring-[#FBB931]"
          style={{ color: '#1A1A1A' }}
        />
      </fieldset>

      <hr className="border-[#E5E5E5]" />

      {/* Photos */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-medium text-[#333]">
            Photos ({photos.length}/{MAX_PHOTOS})
          </label>
          <button
            onClick={addPhoto}
            disabled={photos.length >= MAX_PHOTOS}
            className="px-2 py-1 text-xs rounded transition-colors disabled:opacity-30"
            style={{ background: '#FBB931', color: '#1A1A1A' }}
          >
            + Add Photo
          </button>
        </div>

        <p className="text-[10px] text-[#999] mb-3">
          Drag to reorder. Grid auto-arranges based on photo count.
        </p>

        <div className="space-y-2">
          {photos.map((photo, idx) => {
            const imgData = photoImages[photo.id] || null;
            const inputKey = `photo-${photo.id}`;
            const isDragged = draggedIdx === idx;
            const isDragOver = dragOverIdx === idx && draggedIdx !== idx;

            return (
              <div
                key={photo.id}
                draggable
                onDragStart={() => setDraggedIdx(idx)}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverIdx(idx);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (draggedIdx !== null && draggedIdx !== idx) {
                    movePhoto(draggedIdx, idx);
                  }
                  setDraggedIdx(null);
                  setDragOverIdx(null);
                }}
                onDragEnd={() => {
                  setDraggedIdx(null);
                  setDragOverIdx(null);
                }}
                className="flex items-center gap-2 p-2 rounded border"
                style={{
                  background: '#FAFAFA',
                  borderColor: isDragOver ? '#FBB931' : '#E5E5E5',
                  opacity: isDragged ? 0.4 : 1,
                  cursor: 'grab',
                }}
              >
                {/* Drag handle */}
                <span className="text-[10px] text-[#999] select-none" style={{ cursor: 'grab' }}>
                  ⠿
                </span>

                {/* Photo number */}
                <span className="text-[10px] font-medium text-[#999] w-4 text-center">
                  {idx + 1}
                </span>

                {/* Thumbnail or upload */}
                {imgData ? (
                  <img
                    src={imgData}
                    alt=""
                    className="w-16 h-10 object-cover rounded border border-[#E5E5E5]"
                  />
                ) : (
                  <button
                    onClick={() => fileInputRefs.current[inputKey]?.click()}
                    className="flex items-center justify-center w-16 h-10 rounded border-2 border-dashed cursor-pointer hover:border-[#FBB931] transition-colors"
                    style={{ borderColor: '#CCCCCC' }}
                  >
                    <span className="text-[9px] text-[#999]">+ Upload</span>
                  </button>
                )}

                {/* Actions */}
                <div className="flex items-center gap-0.5 ml-auto">
                  {imgData && (
                    <button
                      onClick={() => clearPhoto(idx)}
                      className="text-[10px] text-red-500 hover:underline mr-1"
                    >
                      clear
                    </button>
                  )}
                  {!imgData && (
                    <button
                      onClick={() => fileInputRefs.current[inputKey]?.click()}
                      className="text-[10px] text-[#666] hover:underline mr-1"
                    >
                      browse
                    </button>
                  )}
                  <button
                    onClick={() => removePhoto(idx)}
                    disabled={photos.length <= MIN_PHOTOS}
                    className="w-5 h-5 flex items-center justify-center text-[8px] rounded hover:bg-red-100 disabled:opacity-25"
                    style={{ color: '#999' }}
                  >
                    ✕
                  </button>
                </div>

                {/* Hidden file input */}
                <input
                  ref={(el) => setFileInputRef(inputKey, el)}
                  type="file"
                  accept={IMAGE_ACCEPTED}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) processImageFile(file, idx);
                    e.target.value = '';
                  }}
                  className="hidden"
                  aria-label={`Upload photo ${idx + 1}`}
                />
              </div>
            );
          })}
        </div>
      </div>

      {imageError && (
        <p className="text-[10px] text-red-500 mt-0.5">{imageError}</p>
      )}
    </div>
  );
}
