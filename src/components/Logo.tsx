import { useState, useEffect } from 'react';
import { removeBackground, loadImageFromUrl } from '@/utils/backgroundRemover';

interface LogoProps {
  className?: string;
  alt?: string;
}

export const Logo = ({ className = "w-16 h-16", alt = "Anime Plug Logo" }: LogoProps) => {
  const [processedLogoUrl, setProcessedLogoUrl] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processLogo = async () => {
      try {
        setIsProcessing(true);
        const img = await loadImageFromUrl("/lovable-uploads/5ef95fb4-7d5a-4089-8450-bbe2df043b0d.png");
        const blob = await removeBackground(img);
        const url = URL.createObjectURL(blob);
        setProcessedLogoUrl(url);
      } catch (error) {
        console.error('Failed to process logo:', error);
        // Fallback to original image
        setProcessedLogoUrl("/lovable-uploads/5ef95fb4-7d5a-4089-8450-bbe2df043b0d.png");
      } finally {
        setIsProcessing(false);
      }
    };

    processLogo();

    // Cleanup URL object on unmount
    return () => {
      if (processedLogoUrl) {
        URL.revokeObjectURL(processedLogoUrl);
      }
    };
  }, []);

  if (isProcessing) {
    return (
      <div className={`${className} bg-primary/20 rounded-full animate-pulse flex items-center justify-center`}>
        <div className="w-1/2 h-1/2 bg-primary/40 rounded-full" />
      </div>
    );
  }

  return (
    <img 
      src={processedLogoUrl} 
      alt={alt} 
      className={className}
    />
  );
};