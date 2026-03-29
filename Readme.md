# IPL Mock Auction — Real-Time Multiplayer

## Quick Start

### 1. Install & run the server
```bash
npm install
npm run dev
```

### 2. Install & run the client
```bash
cd client
npm install
npm run dev
```

### 3. Open http://localhost:5173 in multiple browser tabs

## How to Play
1. Player 1: Enter name, enter a Room ID (e.g. IPL2024), click **Create Room**
2. Player 2+: Enter name, enter same Room ID, click **Join Room**
3. Host clicks **Start Auction**
4. Bid using +1, +2, +5, +10 buttons
5. Timer resets on every new bid
6. When timer hits 0, player is sold to highest bidder
7. Final teams shown after all 20 players are auctioned

## Tech Stack
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express + Socket.io
- **Storage**: In-memory (no database needed)