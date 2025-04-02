import React from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { mediaService } from '../../../../services/mediaService';
import type { MediaFile } from '../../../../services/types/media';

interface ImageContentProps {
  media: MediaFile;
  className?: string;
}

const ImageContent: React.FC<ImageContentProps> = ({ media, className = '' }) => {
  return (
    <figure className={`rounded-[5px] overflow-hidden ${className} max-w-full md:max-w-2xl mx-auto`}>
      <LazyLoadImage
        src={mediaService.getMediaUrl(media.file_path)}
        alt={media.title || 'Course content image'}
        effect="blur"
        className="w-full h-auto"
        threshold={300}
      />
      {(media.title || media.description) && (
        <figcaption className="mt-2 text-xs md:text-sm text-secondary">
          {media.title && <strong className="block">{media.title}</strong>}
          {media.description && <p>{media.description}</p>}
        </figcaption>
      )}
    </figure>
  );
};

export default React.memo(ImageContent);