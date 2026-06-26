import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PRESET_ICONS } from '@/components/icon-presets';
import { useToast } from '@/hooks/use-toast';

interface IconPickerProps {
  value?: string;
  onChange: (icon: string) => void;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_DIMENSION = 128; // resize to 128x128
const OUTPUT_QUALITY = 0.8;

/**
 * Resize an image file to fit within MAX_DIMENSION x MAX_DIMENSION,
 * output as webp data URL.
 */
function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // Scale down to fit within MAX_DIMENSION
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          if (width > height) {
            height = Math.round((height * MAX_DIMENSION) / width);
            width = MAX_DIMENSION;
          } else {
            width = Math.round((width * MAX_DIMENSION) / height);
            height = MAX_DIMENSION;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Cannot get canvas context'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        // Try webp first, fall back to png
        let dataUrl = canvas.toDataURL('image/webp', OUTPUT_QUALITY);
        if (!dataUrl.startsWith('data:image/webp')) {
          dataUrl = canvas.toDataURL('image/png');
        }
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPresets, setShowPresets] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      toast({
        title: t('common.error'),
        description: t('iconPicker.invalidType', 'Only PNG, JPEG, WebP images are allowed'),
        variant: 'destructive',
      });
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: t('common.error'),
        description: t('iconPicker.tooLarge', 'Image must be smaller than 2MB'),
        variant: 'destructive',
      });
      return;
    }

    try {
      const dataUrl = await resizeImage(file);
      onChange(dataUrl);
      setShowPresets(false);
    } catch {
      toast({
        title: t('common.error'),
        description: t('iconPicker.processFailed', 'Failed to process image'),
        variant: 'destructive',
      });
    }

    // Reset input so the same file can be re-selected
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePresetSelect = (dataUrl: string) => {
    onChange(dataUrl);
    setShowPresets(false);
  };

  const handleClear = () => {
    onChange('');
    setShowPresets(false);
  };

  return (
    <div className="space-y-2">
      {/* Current preview + actions */}
      <div className="flex items-center gap-3">
        {value ? (
          <>
            <img
              src={value}
              alt="icon preview"
              className="h-12 w-12 rounded-lg border object-cover"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
              onClick={handleClear}
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
            <Upload className="h-5 w-5" />
          </div>
        )}

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mr-1 h-3 w-3" />
            {t('iconPicker.upload', 'Upload')}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowPresets(!showPresets)}
          >
            {t('iconPicker.presets', 'Presets')}
          </Button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Preset icons grid */}
      {showPresets && (
        <div className="rounded-lg border bg-muted/30 p-3">
          <p className="mb-2 text-xs text-muted-foreground">
            {t('iconPicker.choosePreset', 'Choose a preset icon')}
          </p>
          <div className="grid grid-cols-8 gap-2">
            {PRESET_ICONS.map((icon) => (
              <button
                key={icon.name}
                type="button"
                className={`flex h-9 w-9 items-center justify-center rounded-md border transition-colors hover:bg-muted ${
                  value === icon.dataUrl
                    ? 'border-primary bg-primary/10 ring-1 ring-primary'
                    : 'border-transparent'
                }`}
                onClick={() => handlePresetSelect(icon.dataUrl)}
                title={icon.name}
              >
                <img src={icon.dataUrl} alt={icon.name} className="h-5 w-5" />
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {t('iconPicker.hint', 'Upload an image (max 2MB) or choose a preset. Image will be resized to 128x128.')}
      </p>
    </div>
  );
}
