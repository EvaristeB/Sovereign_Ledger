#!/bin/bash
# Sovereign Ledger Full Stack Launcher

echo "🚀 Starting Sovereign Ledger Game Suite..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if both directories exist
if [ ! -d "src" ]; then
  echo "❌ Error: Backend src directory not found. Run from project root."
  exit 1
fi

if [ ! -d "ui" ]; then
  echo "❌ Error: UI directory not found. Run from project root."
  exit 1
fi

# Terminal multiplexing function (uses tmux if available, otherwise runs sequentially)
start_services() {
  if command -v tmux &> /dev/null; then
    echo -e "${BLUE}Using tmux for concurrent execution${NC}"
    
    # Create new tmux session
    tmux new-session -d -s sovereign -x 200 -y 50
    
    # Window 1: Backend
    tmux new-window -t sovereign -n "backend" -c "$(pwd)"
    tmux send-keys -t sovereign:backend "echo '$(tput bold)Backend Server$(tput sgr0)' && npm start" Enter
    sleep 2
    
    # Window 2: Frontend Dev
    tmux new-window -t sovereign -n "frontend" -c "$(pwd)/ui"
    tmux send-keys -t sovereign:frontend "echo '$(tput bold)Frontend Dev Server$(tput sgr0)' && npm run dev" Enter
    sleep 2
    
    # Window 3: Control
    tmux new-window -t sovereign -n "control" -c "$(pwd)"
    tmux send-keys -t sovereign:control "echo '$(tput bold)📡 Sovereign Ledger Console$(tput sgr0)' && echo '' && echo 'Services:' && echo '  Backend:  http://localhost:3000' && echo '  Frontend: http://localhost:5173' && echo '' && echo 'Stop: exec tmux kill-session -t sovereign' && echo 'Logs: tmux capture-pane -t sovereign:backend -p' && sleep 999999" Enter
    
    # Select control window
    tmux select-window -t sovereign:control
    
    # Attach to session
    echo -e "${GREEN}✅ Starting services in tmux session 'sovereign'${NC}"
    echo ""
    echo "Available commands:"
    echo "  tmux attach -t sovereign          # Attach to session"
    echo "  tmux kill-session -t sovereign    # Stop all services"
    echo "  tmux send-keys -t sovereign:backend 'C-c' # Stop backend"
    echo ""
    tmux attach -t sovereign
  else
    echo -e "${YELLOW}⚠️  tmux not found. Running services sequentially...${NC}"
    echo ""
    
    # Run backend
    echo -e "${BLUE}Starting Backend Server (port 3000)...${NC}"
    npm start &
    BACKEND_PID=$!
    
    sleep 3
    
    # Run frontend
    echo -e "${BLUE}Starting Frontend Dev Server (port 5173)...${NC}"
    (cd ui && npm run dev) &
    FRONTEND_PID=$!
    
    sleep 2
    
    echo ""
    echo -e "${GREEN}✅ Both services started!${NC}"
    echo ""
    echo "Platforms:"
    echo "  Backend:  http://localhost:3000"
    echo "  Frontend: http://localhost:5173"
    echo ""
    echo "Press CTRL+C to stop all services"
    echo ""
    
    # Wait for user interrupt
    wait
  fi
}

# Check dependencies
echo -e "${BLUE}Checking dependencies...${NC}"

if ! command -v node &> /dev/null; then
  echo "❌ Node.js not found. Please install Node.js 16+"
  exit 1
fi

if ! command -v npm &> /dev/null; then
  echo "❌ npm not found. Please install npm"
  exit 1
fi

echo -e "${GREEN}✅ Node.js $(node --version)${NC}"
echo -e "${GREEN}✅ npm $(npm --version)${NC}"
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo -e "${BLUE}Installing backend dependencies...${NC}"
  npm install
fi

if [ ! -d "ui/node_modules" ]; then
  echo -e "${BLUE}Installing frontend dependencies...${NC}"
  cd ui && npm install && cd ..
fi

echo ""
echo -e "${GREEN}✅ All checks passed!${NC}"
echo ""

# Start services
start_services
