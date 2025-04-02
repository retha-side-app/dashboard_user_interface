import React from 'react';

interface TextContentProps {
  content: string;
}

const TextContent: React.FC<TextContentProps> = ({ content }) => {
  return (
    <div className="prose max-w-none">
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
};

export default TextContent;