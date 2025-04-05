import React from 'react';
import './FileList.css';

interface FileData {
  filename: string;
  size: number;
  createdAt: string;
  path: string;
}

interface FileListProps {
  files: FileData[];
}

const FileList: React.FC<FileListProps> = ({ files }) => {
  // Format file size to human-readable format
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date to a more readable format
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Get appropriate icon based on file extension
  const getFileIcon = (filename: string): string => {
    const extension = filename.split('.').pop()?.toLowerCase();
    
    switch(extension) {
      case 'pdf':
        return '📄';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'svg':
        return '🖼️';
      case 'mp3':
      case 'wav':
      case 'ogg':
        return '🎵';
      case 'mp4':
      case 'avi':
      case 'mov':
      case 'mkv':
        return '🎬';
      case 'zip':
      case 'rar':
      case '7z':
        return '🗜️';
      case 'doc':
      case 'docx':
        return '📝';
      case 'xls':
      case 'xlsx':
        return '📊';
      case 'ppt':
      case 'pptx':
        return '📽️';
      default:
        return '📁';
    }
  };

  return (
    <div className="file-list-container">
      <h2>Uploaded Files</h2>
      
      {files.length === 0 ? (
        <div className="no-files">
          <p>No files have been uploaded yet.</p>
        </div>
      ) : (
        <div className="file-list">
          {files.map((file, index) => (
            <div className="file-item" key={index}>
              <div className="file-icon">{getFileIcon(file.filename)}</div>
              <div className="file-info">
                <h3 className="file-name">{file.filename}</h3>
                <p className="file-details">
                  <span>{formatFileSize(file.size)}</span>
                  <span className="dot">•</span>
                  <span>{formatDate(file.createdAt)}</span>
                </p>
              </div>
              <a 
                href={file.path} 
                className="download-button" 
                download
                title="Download file"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileList;
