
import { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';

interface CameraOptions {
  onComplete: (blob: Blob | null) => void;
  onCancel: () => void;
}

export default function useCamera() {
  const [cameraVisible, setCameraVisible] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const showCamera = useCallback(() => {
    setCameraVisible(true);
  }, []);

  const hideCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraVisible(false);
  }, []);

  const captureImage = useCallback((options: CameraOptions) => {
    const startCamera = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          toast.error("Câmera não suportada neste dispositivo");
          options.onCancel();
          return;
        }
        
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' }
        });
        
        streamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } catch (err) {
        console.error("Erro ao acessar câmera:", err);
        toast.error("Não foi possível acessar a câmera");
        options.onCancel();
      }
    };

    const takePhoto = () => {
      if (!videoRef.current) {
        options.onComplete(null);
        return;
      }
      
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            options.onComplete(blob);
          } else {
            toast.error("Falha ao processar imagem");
            options.onComplete(null);
          }
          
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
          }
        }, 'image/jpeg', 0.9);
      } else {
        options.onComplete(null);
      }
    };

    // Initialize camera when the component mounts
    startCamera();

    // Return camera UI component
    return (
      <div className="bg-black rounded-lg overflow-hidden flex flex-col max-w-md w-full">
        <div className="relative">
          <video 
            ref={videoRef} 
            className="w-full h-80 object-cover"
            autoPlay 
            playsInline
          />
        </div>
        <div className="p-4 flex justify-between bg-gray-900">
          <button
            type="button"
            className="px-4 py-2 bg-gray-700 text-white rounded"
            onClick={() => {
              if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
              }
              options.onCancel();
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={takePhoto}
          >
            Capturar
          </button>
        </div>
      </div>
    );
  }, []);

  return {
    captureImage,
    cameraVisible,
    showCamera,
    hideCamera
  };
}
