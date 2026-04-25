import React, { useState, useCallback } from 'react';
import { UploadCloudIcon } from './Icons';

interface FileUploadProps {
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
  // Yeni: Kabul edilecek dosya türlerini dışarıdan alabilir hale getirdik
  accept?: string; 
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onChange, 
  disabled, 
  accept = ".xlsx, .xls, .csv, .jpg, .png, .jpeg" 
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);
  
  const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if(!disabled && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const pseudoEvent = {
            target: {
                files: e.dataTransfer.files
            }
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        onChange(pseudoEvent);
    }
  }, [disabled, onChange]);

  return (
    <div className="w-full">
      <label
        htmlFor="file-upload"
        className={`relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-300
        ${disabled
          ? 'bg-gray-800 border-gray-700 cursor-not-allowed'
          : `bg-gray-800 border-gray-600 hover:bg-gray-700/50 hover:border-teal-500 ${isDragging ? 'scale-105 border-teal-500 bg-gray-700' : ''}`
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center pointer-events-none">
            <UploadCloudIcon className={`w-12 h-12 mb-4 transition-colors ${isDragging ? 'text-teal-400' : 'text-gray-500'}`} />
            <p className={`mb-2 text-lg font-semibold transition-colors ${disabled ? 'text-gray-500' : 'text-gray-300'}`}>
                {isDragging ? 'Dosyayı bırakabilirsiniz' : <>Dosyanızı buraya sürükleyin veya <span className="text-teal-400">tıklayın</span></>}
            </p>
            <p className="text-xs text-gray-500">Excel (XLSX) veya Resim (JPG, PNG)</p>
        </div>
        <input
          id="file-upload"
          type="file"
          className="hidden"
          accept={accept}
          onChange={onChange}
          disabled={disabled}
        />
      </label>
    </div>
  );
};

export default FileUpload;