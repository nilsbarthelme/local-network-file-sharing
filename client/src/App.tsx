import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import FileUploader from './components/FileUploader';
import FileList from './components/FileList';

// Define file interface
interface FileData {
  filename: string;
  size: number;
  createdAt: string;
  path: string;
}

function App() {
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | null }>({ message: '', type: null });

  // Load files on component mount
  useEffect(() => {
    fetchFiles();
  }, []);

  // Fetch the list of uploaded files
  const fetchFiles = async () => {
    try {
      const response = await axios.get('/api/files');
      setFiles(response.data);
    } catch (error) {
      console.error('Error fetching files:', error);
      showNotification('Failed to fetch files', 'error');
    }
  };

  // Handle file upload
  const handleUpload = async (file: File) => {
    setLoading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Refresh file list after successful upload
      await fetchFiles();
      showNotification(`File "${file.name}" was uploaded successfully`, 'success');
    } catch (error) {
      console.error('Upload error:', error);
      showNotification('File upload failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Show notification
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    // Clear notification after 5 seconds
    setTimeout(() => {
      setNotification({ message: '', type: null });
    }, 5000);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Local Network File Sharing</h1>
        <p>Upload and share files on your local network</p>
      </header>
      
      <main className="app-content">
        <FileUploader onUpload={handleUpload} isLoading={loading} />
        
        {notification.type && (
          <div className={`notification ${notification.type}`}>
            <p>{notification.message}</p>
          </div>
        )}
        
        <FileList files={files} />
      </main>
      
      <footer className="app-footer">
        <p>Local Network File Sharing Application</p>
      </footer>
    </div>
  );
}

export default App;
