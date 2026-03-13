package handlers

import (
	"encoding/json"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"time"
)

type fileInfo struct {
	Filename  string    `json:"filename"`
	Size      int64     `json:"size"`
	CreatedAt time.Time `json:"createdAt"`
	Path      string    `json:"path"`
}

type uploadResponse struct {
	Success bool       `json:"success"`
	Message string     `json:"message"`
	File    uploadFile `json:"file"`
}

type uploadFile struct {
	Filename string `json:"filename"`
	Size     int64  `json:"size"`
	Mimetype string `json:"mimetype"`
	Path     string `json:"path"`
}

type FileHandler struct {
	UploadsDir string
}

func (h *FileHandler) Upload(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "No file uploaded"})
		return
	}
	defer file.Close()

	dstPath := filepath.Join(h.UploadsDir, header.Filename)
	dst, err := os.Create(dstPath)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to save file"})
		return
	}
	defer dst.Close()

	written, err := io.Copy(dst, file)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to write file"})
		return
	}

	writeJSON(w, http.StatusOK, uploadResponse{
		Success: true,
		Message: "File uploaded successfully",
		File: uploadFile{
			Filename: header.Filename,
			Size:     written,
			Mimetype: header.Header.Get("Content-Type"),
			Path:     "/uploads/" + header.Filename,
		},
	})
}

func (h *FileHandler) List(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	entries, err := os.ReadDir(h.UploadsDir)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Error reading files directory"})
		return
	}

	files := make([]fileInfo, 0, len(entries))
	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}
		info, err := entry.Info()
		if err != nil {
			continue
		}
		files = append(files, fileInfo{
			Filename:  entry.Name(),
			Size:      info.Size(),
			CreatedAt: info.ModTime(),
			Path:      "/uploads/" + entry.Name(),
		})
	}

	writeJSON(w, http.StatusOK, files)
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}
