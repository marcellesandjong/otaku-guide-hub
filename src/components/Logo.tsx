import { useState, useEffect } from 'react';
import { removeBackground, loadImageFromUrl } from '@/utils/backgroundRemover';
import animePlugLogo from '@/assets/anime-plug-logo-new.png';

interface LogoProps {
  className?: string;
  alt?: string;
}

export const Logo = ({ className = "w-16 h-16", alt = "Anime Plug Logo" }: LogoProps) => {
  return (
    <img 
      src={animePlugLogo} 
      alt={alt} 
      className={className}
    />
  );
};