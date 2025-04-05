import React, { useRef, useState } from 'react';
import './FileUploader.css';

interface FileUploaderProps {
  onUpload: (file: File) => void;
  isLoading: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onUpload, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Handle the upload button click
  const handleUpload = () => {
    if (selectedFile) {
      onUpload(selectedFile);
      setSelectedFile(null);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle the file selection button click
  const handleSelectClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle drop event
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div 
      className={`file-uploader ${dragActive ? 'drag-active' : ''}`}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
    >
      <div className="file-uploader-content">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        
        {isLoading ? (
          <div className="upload-loading">
            <div className="spinner"></div>
            <p>Uploading file...</p>
          </div>
        ) : (
          <>
            <div className="file-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
            </div>
            
            <h2>Upload a file</h2>
            <p>Click the button below or drag & drop a file</p>
            
            <button 
              className="select-button" 
              onClick={handleSelectClick}
            >
              Select File
            </button>
            
            {selectedFile && (
              <div className="selected-file">
                <p>{selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)</p>
                <button 
                  className="upload-button" 
                  onClick={handleUpload}
                >
                  Upload
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FileUploader;
