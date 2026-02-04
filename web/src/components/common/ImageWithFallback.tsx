import React, { useMemo, useState } from "react";
import placeholder from "../../assets/placeholder-cat.svg";

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({ src, fallbackSrc, alt, ...rest }) => {
  const [failed, setFailed] = useState(false);
  const safeSrc = useMemo(() => {
    if (!src || failed) {
      return fallbackSrc || placeholder;
    }
    return src;
  }, [src, failed, fallbackSrc]);

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
