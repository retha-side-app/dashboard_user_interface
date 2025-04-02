import React, { useState, useEffect } from 'react';
import { FileText, Download, ExternalLink, File, FileSpreadsheet, Presentation as FilePresentation } from 'lucide-react';
import { mediaService } from '../../../../services/mediaService';
import type { MediaFile } from '../../../../services/types/media';

interface DocumentContentProps {
  media: MediaFile;
  className?: string;
}

const DocumentContent: React.FC<DocumentContentProps> = ({ media, className = '' }) => {
  const [fileSize, setFileSize] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  const fileUrl = mediaService.getMediaUrl(media.file_path);
  const fileExtension = mediaService.getFileExtension(media.file_path);
  const fileIcon = mediaService.getFileIcon(media.file_path);
  
  useEffect(() => {
    const getSize = async () => {
      try {
        const size = await mediaService.getFileSize(fileUrl);
        setFileSize(size);
      } catch (error) {
        console.error('Failed to get file size:', error);
      } finally {
        setLoading(false);
      }
    };
    
    getSize();
  }, [fileUrl]);
  
  const getFileIcon = () => {
    switch (fileIcon) {
      case 'pdf':
        return <FileText className="h-8 w-8 md:h-10 md:w-10 text-red-500" strokeWidth={1.5} />;
      case 'word':
        return <FileText className="h-8 w-8 md:h-10 md:w-10 text-blue-500" strokeWidth={1.5} />;
      case 'excel':
        return <FileSpreadsheet className="h-8 w-8 md:h-10 md:w-10 text-green-500" strokeWidth={1.5} />;
      case 'powerpoint':
        return <FilePresentation className="h-8 w-8 md:h-10 md:w-10 text-orange-500" strokeWidth={1.5} />;
      default:
        return <File className="h-8 w-8 md:h-10 md:w-10 text-gray-500" strokeWidth={1.5} />;
    }
  };
  
  const isPdf = fileExtension === 'pdf';
  
  // Create a blob URL for download to avoid CORS issues
  const handleDownload = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    fetch(fileUrl)
      .then(response => response.blob())
      .then(blob => {
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = media.title || `document.${fileExtension}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(blobUrl);
        document.body.removeChild(a);
      })
      .catch(error => {
        console.error('Download failed:', error);
        // Fallback to direct link if fetch fails
        window.open(fileUrl, '_blank');
      });
  };
  
  return (
    <div className={`bg-white rounded-[5px] shadow-sm p-4 md:p-6 ${className}`}>
      <div className="flex items-center mb-4">
        {getFileIcon()}
        <div className="ml-4 flex-1">
          <h3 className="text-base md:text-lg font-semibold text-primary">{media.title || 'Document'}</h3>
          <p className="text-xs md:text-sm text-secondary">
            {fileExtension.toUpperCase()} {loading ? 'Loading size...' : `• ${fileSize}`}
          </p>
        </div>
      </div>
      
      {media.description && (
        <p className="text-sm text-secondary mb-4">{media.description}</p>
      )}
      
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
        <a 
          href={fileUrl}
          onClick={handleDownload}
          className="flex items-center justify-center px-4 py-2 bg-primary text-white rounded-[5px] hover:bg-opacity-90 text-sm"
        >
          <Download className="h-4 w-4 mr-2" strokeWidth={1.5} />
          Download
        </a>
        
        {isPdf && (
          <a 
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center px-4 py-2 bg-white border border-gray-200 text-primary rounded-[5px] hover:bg-gray-50 text-sm"
          >
            <ExternalLink className="h-4 w-4 mr-2" strokeWidth={1.5} />
            View PDF
          </a>
        )}
      </div>
    </div>
  );
};

export default DocumentContent;