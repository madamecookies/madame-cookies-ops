import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RotateCcw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface AdvancedOCRProps {
  onCapture: (imageData: string, ocrResult?: { lot?: string; dlc?: string }) => void;
  onClose: () => void;
  isOpen: boolean;
  title: string;
}

export const AdvancedOCR: React.FC<AdvancedOCRProps> = ({
  onCapture,
  onClose,
  isOpen,
  title
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string>('');
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [ocrEngine, setOcrEngine] = useState<'native' | 'tesseract' | 'huggingface'>('native');

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen]);

  const startCamera = async () => {
    try {
      setError('');
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported on this device');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }

      setStream(mediaStream);
      setHasPermission(true);
    } catch (err) {
      console.error('Camera error:', err);
      setError('Impossible d\'accéder à la caméra. Vérifiez les permissions.');
      setHasPermission(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const processWithNativeOCR = async (imageData: string): Promise<{ lot?: string; dlc?: string }> => {
    try {
      // @ts-ignore - TextDetector est expérimental
      if ('TextDetector' in window) {
        // @ts-ignore
        const detector = new window.TextDetector();
        const img = new Image();
        img.src = imageData;
        
        await new Promise(resolve => img.onload = resolve);
        
        const detectedTexts = await detector.detect(img);
        const allText = detectedTexts.map((text: any) => text.rawValue).join(' ').toUpperCase();
        
        return extractFromText(allText);
      }
    } catch (error) {
      console.log('Native OCR failed, falling back');
    }
    return {};
  };

  const processWithTesseract = async (imageData: string): Promise<{ lot?: string; dlc?: string }> => {
    try {
      const Tesseract = (await import('tesseract.js')).default;
      
      const result = await Tesseract.recognize(imageData, 'fra+eng', {
        logger: m => console.log(m)
      });
      
      return extractFromText(result.data.text.toUpperCase());
    } catch (error) {
      console.error('Tesseract OCR failed:', error);
      return {};
    }
  };

  const processWithHuggingFace = async (imageData: string): Promise<{ lot?: string; dlc?: string }> => {
    try {
      const { pipeline } = await import('@huggingface/transformers');
      
      // Utilisation d'un modèle de vision-language pour l'extraction de texte
      const extractor = await pipeline(
        'image-to-text',
        'Salesforce/blip-image-captioning-base',
        { device: 'webgpu' }
      );
      
      const result = await extractor(imageData);
      
      if (result && Array.isArray(result) && result[0] && 'generated_text' in result[0]) {
        return extractFromText(result[0].generated_text.toUpperCase());
      }
      
      return {};
    } catch (error) {
      console.error('HuggingFace OCR failed:', error);
      return {};
    }
  };

  const extractFromText = (text: string): { lot?: string; dlc?: string } => {
    console.log('Texte détecté:', text);
    
    // Patterns améliorés pour numéros de lot
    const lotPatterns = [
      /LOT\s*:?\s*([A-Z0-9-]{4,})/i,
      /L\s*:?\s*([A-Z0-9-]{4,})/i,
      /BATCH\s*:?\s*([A-Z0-9-]{4,})/i,
      /N°?\s*LOT\s*:?\s*([A-Z0-9-]{4,})/i,
      /([A-Z]{2,3}\d{6,})/,
      /(\d{6,}[A-Z]*)/,
      /([A-Z]+\d{4,}[A-Z]*)/
    ];
    
    let lot;
    for (const pattern of lotPatterns) {
      const match = text.match(pattern);
      if (match && match[1].length >= 4) {
        lot = match[1].replace(/[^A-Z0-9]/g, '');
        break;
      }
    }
    
    // Patterns améliorés pour dates (DLC)
    const dlcPatterns = [
      /DLC\s*:?\s*(\d{2})[\/\.-](\d{2})[\/\.-](\d{4})/i,
      /(\d{2})[\/\.-](\d{2})[\/\.-](\d{4})/,
      /(\d{4})-(\d{2})-(\d{2})/,
      /EXPIRE?\s*:?\s*(\d{2})[\/\.-](\d{2})[\/\.-](\d{4})/i,
      /BEST\s*BEFORE\s*:?\s*(\d{2})[\/\.-](\d{2})[\/\.-](\d{4})/i
    ];
    
    let dlc;
    for (const pattern of dlcPatterns) {
      const match = text.match(pattern);
      if (match) {
        if (pattern.source.includes('\\d{4})-')) {
          dlc = `${match[1]}-${match[2]}-${match[3]}`;
        } else {
          dlc = `${match[3]}-${match[2]}-${match[1]}`;
        }
        break;
      }
    }
    
    return { lot, dlc };
  };

  const processOCR = async (imageData: string): Promise<{ lot?: string; dlc?: string }> => {
    setIsProcessingOCR(true);
    
    try {
      let result: { lot?: string; dlc?: string } = {};
      
      // Essayer différents moteurs OCR
      if (ocrEngine === 'native') {
        result = await processWithNativeOCR(imageData);
        if (!result.lot && !result.dlc) {
          console.log('Fallback vers Tesseract');
          setOcrEngine('tesseract');
          result = await processWithTesseract(imageData);
        }
      } else if (ocrEngine === 'tesseract') {
        result = await processWithTesseract(imageData);
      } else if (ocrEngine === 'huggingface') {
        result = await processWithHuggingFace(imageData);
        if (!result.lot && !result.dlc) {
          console.log('Fallback vers Tesseract');
          result = await processWithTesseract(imageData);
        }
      }
      
      return result;
    } catch (error) {
      console.error('Erreur OCR:', error);
      return {};
    } finally {
      setIsProcessingOCR(false);
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0);
    
    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    
    const ocrResult = await processOCR(imageData);
    onCapture(imageData, ocrResult);
    onClose();
  };

  const FileInputFallback = () => (
    <div className="text-center space-y-4">
      <Camera className="w-16 h-16 mx-auto text-muted-foreground" />
      <p className="text-muted-foreground">Caméra non disponible</p>
      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = async (event) => {
              if (event.target?.result) {
                const imageData = event.target.result as string;
                const ocrResult = await processOCR(imageData);
                onCapture(imageData, ocrResult);
                onClose();
              }
            };
            reader.readAsDataURL(file);
          }
        }}
        className="hidden"
        id="file-input"
      />
      <label htmlFor="file-input">
        <Button asChild>
          <span>Choisir une photo</span>
        </Button>
      </label>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card border-border">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-foreground">{title}</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="p-4">
          {hasPermission === false || error ? (
            <div className="space-y-4">
              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded">
                  {error}
                </div>
              )}
              <FileInputFallback />
            </div>
          ) : hasPermission === null ? (
            <div className="text-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-muted-foreground">Accès à la caméra...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-64 object-cover"
                />
              </div>
              
              {isProcessingOCR && (
                <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <p className="text-sm text-primary">Analyse OCR avancée en cours...</p>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button onClick={capturePhoto} className="flex-1" disabled={isProcessingOCR}>
                  <Camera className="w-4 h-4 mr-2" />
                  Prendre la photo
                </Button>
                <Button variant="outline" size="icon" onClick={startCamera}>
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
      
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};