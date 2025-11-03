import React from 'react';
import { Textarea } from './Textarea';

interface EditableSectionBoxProps {
  title: string;
  content: string;
  onContentChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
  isRequired?: boolean;
}

export const EditableSectionBox: React.FC<EditableSectionBoxProps> = ({
  title,
  content,
  onContentChange,
  placeholder,
  className = '',
  rows = 4,
  isRequired = false
}) => {
  return (
    <div className={`border border-gray-300 rounded-lg ${className}`}>
      {/* Fixed Header */}
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-300">
        <h3 className="font-bold text-gray-900 text-sm">
          {title}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </h3>
      </div>
      
      {/* Editable Content Area */}
      <div className="p-4">
        <Textarea
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="w-full border-0 p-0 resize-none focus:ring-0 focus:border-0 text-sm"
        />
      </div>
    </div>
  );
};
