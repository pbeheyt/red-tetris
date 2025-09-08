# Makefile for Red Tetris Project

.PHONY: dev stop build prod-up prod-down clean help

# Default command
help:
	@echo "Available commands:"
	@echo "  make dev         - Start the development environment (client + server with hot-reload)"
	@echo "  make stop        - Stop the development environment"
	@echo "  make build       - Build the production Docker image"
	@echo "  make prod-up     - Start the production environment in detached mode"
	@echo "  make prod-down   - Stop the production environment"
	@echo "  make clean       - Remove all stopped containers, unused networks, and dangling images"

# --- Development ---
dev:
	@echo "Starting development environment..."
	docker-compose -f docker-compose.yml up

stop:
	@echo "Stopping development environment..."
	docker-compose -f docker-compose.yml down

# --- Production ---
build:
	@echo "Building production Docker image..."
	docker-compose -f docker-compose.prod.yml build

prod-up: build
	@echo "Starting production environment in detached mode..."
	docker-compose -f docker-compose.prod.yml up -d

prod-down:
	@echo "Stopping production environment..."
	docker-compose -f docker-compose.prod.yml down

# --- Utility ---
clean:
	@echo "Cleaning up Docker resources..."
	docker system prune -f
