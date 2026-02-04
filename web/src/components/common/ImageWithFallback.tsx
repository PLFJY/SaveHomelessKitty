import React, { useMemo, useState } from "react";
import placeholderLight from "../../assets/placeholder-cat.svg";
import placeholderDark from "../../assets/placeholder-cat-dark.svg";
import { useThemeSettings } from "../../context/ThemeContext";

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({ src, fallbackSrc, alt, ...rest }) => {
  const [failed, setFailed] = useState(false);
  const { effectiveMode } = useThemeSettings();
  const defaultPlaceholder = effectiveMode === "dark" ? placeholderDark : placeholderLight;
  const safeSrc = useMemo(() => {
    if (!src || failed) {
      return fallbackSrc || defaultPlaceholder;
    }
    return src;
  }, [src, failed, fallbackSrc, defaultPlaceholder]);

  return (
    <img
      src={safeSrc}
      alt={alt || "image"}
      onError={() => setFailed(true)}
      {...rest}
    />
  );
};

export default ImageWithFallback;
