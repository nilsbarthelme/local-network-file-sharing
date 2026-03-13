package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"local-network-file-sharing/server/internal/handlers"
	"local-network-file-sharing/server/internal/middleware"
	"local-network-file-sharing/server/internal/network"
)

func spaHandler(dir string) http.Handler {
	fs := http.Dir(dir)
	fileServer := http.FileServer(fs)

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Try to serve the requested file directly
		if f, err := fs.Open(r.URL.Path); err == nil {
			f.Close()
			fileServer.ServeHTTP(w, r)
			return
		}
		// Fall back to index.html for client-side routing
		http.ServeFile(w, r, filepath.Join(dir, "index.html"))
	})
}

func main() {
	uploadsDir := filepath.Join(".", "uploads")
	if err := os.MkdirAll(uploadsDir, 0o755); err != nil {
		log.Fatalf("Failed to create uploads directory: %v", err)
	}

	webDir := filepath.Join(".", "web")
	if err := os.MkdirAll(webDir, 0o755); err != nil {
		log.Fatalf("Failed to create web directory: %v", err)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "3001"
	}

	files := &handlers.FileHandler{UploadsDir: uploadsDir}

	mux := http.NewServeMux()
	mux.HandleFunc("/api/upload", files.Upload)
	mux.HandleFunc("/api/files", files.List)
	mux.Handle("/uploads/", http.StripPrefix("/uploads/", http.FileServer(http.Dir(uploadsDir))))
	mux.Handle("/", spaHandler(webDir))

	handler := middleware.CORS(mux)

	localIP := network.LocalIP()
	fmt.Printf("Server running on port %s\n", port)
	fmt.Printf("Local URL: http://localhost:%s\n", port)
	if localIP != "" {
		fmt.Printf("Network URL: http://%s:%s\n", localIP, port)
		fmt.Printf("Access the file sharing application at: http://%s:%s\n", localIP, port)
	}

	log.Fatal(http.ListenAndServe(":"+port, handler))
}
