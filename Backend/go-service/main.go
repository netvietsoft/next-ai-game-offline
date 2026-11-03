package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"
)

// TelemetryPayload cấu trúc gói tin telemetry từ Android client
// TelemetryPayload represents the telemetry packet from Android client
type TelemetryPayload struct {
	DeviceID        string `json:"device_id"`
	GameName        string `json:"game_name"`
	DurationSeconds int    `json:"duration_seconds"`
	Score           int    `json:"score"`
	Timestamp       string `json:"timestamp"`
}

// TelemetryResponse cấu trúc phản hồi
// TelemetryResponse represents the API response
type TelemetryResponse struct {
	Status    string `json:"status"`
	Message   string `json:"message"`
	Processed int64  `json:"processed_at_unix"`
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status":  "OK",
		"service": "NextAI Go Telemetry Worker",
		"time":    time.Now().Format(time.RFC3339),
	})
}

func telemetryHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var payload TelemetryPayload
	err := json.NewDecoder(r.Body).Decode(&payload)
	if err != nil {
		http.Error(w, "Invalid payload", http.StatusBadRequest)
		return
	}

	// Ghi nhận telemetry xử lý tốc độ cao / High-speed telemetry processing
	log.Printf("[TELEMETRY] Device: %s | Game: %s | Score: %d | Duration: %ds\n",
		payload.DeviceID, payload.GameName, payload.Score, payload.DurationSeconds)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(TelemetryResponse{
		Status:    "SUCCESS",
		Message:   "Telemetry logged successfully",
		Processed: time.Now().Unix(),
	})
}

func main() {
	port := ":6034"
	http.HandleFunc("/health", healthHandler)
	http.HandleFunc("/api/v1/telemetry", telemetryHandler)

	fmt.Println("=======================================================")
	fmt.Printf("⚡ NextAI Go High-Performance Telemetry Worker on Port%s\n", port)
	fmt.Println("=======================================================")

	if err := http.ListenAndServe(port, nil); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
