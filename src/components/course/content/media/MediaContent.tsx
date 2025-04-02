import React from 'react';
import type { CourseMedia } from '../../../../services/types/media';
import ImageContent from './ImageContent';
import AudioContent from './AudioContent';
import DocumentContent from './DocumentContent';

interface MediaContentProps {
  media: CourseMedia[];
  className?: string;
}

const MediaContent: React.FC<MediaContentProps> = ({ media, className = '' }) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {media.map((item) => {
        const { media_file } = item;
        
        switch (media_file.media_type) {
          case 'image':
            return (
              <ImageContent
                key={item.id}
                media={media_file}
                className="shadow-sm"
              />
            );
          case 'audio':
            return (
              <AudioContent
                key={item.id}
                media={media_file}
              />
            );
          case 'document':
            return (
              <DocumentContent
                key={item.id}
                media={media_file}
              />
            );
          default:
            return null;
        }
      })}
    </div>
  );
};

export default MediaContent;