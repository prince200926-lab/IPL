import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import {
  createRoom,
  joinRoom,
  leaveRoom,
  startAuction,
  placeBid,
  soldCurrentPlayer,
  getRoom,
  decrementTimer,
  getCurrentAuctionData,
  getRoomPublicState,
  setRoomBudget,
} from "./auctionManager.js";

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

const roomTimers = new Map();

function startTimer(roomId) {
  stopTimer(roomId);
  const interval = setInterval(() => {
    const room = getRoom(roomId);
    if (!room || !room.auctionState) {
      stopTimer(roomId);
      return;
    }

    const newTime = decrementTimer(roomId);
    io.to(roomId).emit("timer_tick", { timer: newTime });

    if (newTime <= 0) {
      stopTimer(roomId);
      const result = soldCurrentPlayer(roomId);
      if (!result) return;

      io.to(roomId).emit("player_sold", {
        player: result.soldPlayer,
        soldTo: result.soldTo,
        roomState: result.roomState,
      });

      if (result.isLastPlayer) {
        const finalState = getRoomPublicState(roomId);
        io.to(roomId).emit("auction_ended", { finalState });
      } else {
        setTimeout(() => {
          const auctionData = getCurrentAuctionData(roomId);
          if (auctionData) {
            io.to(roomId).emit("new_player", auctionData);
            startTimer(roomId);
          }
        }, 2000);
      }
    }
  }, 1000);
  roomTimers.set(roomId, interval);
}

function stopTimer(roomId) {
  if (roomTimers.has(roomId)) {
    clearInterval(roomTimers.get(roomId));
    roomTimers.delete(roomId);
  }
}

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  socket.on("join_room", ({ roomId, userName, create, budget }) => {
    let state;
    if (create) {
      state = createRoom(roomId, socket.id, userName, budget || 100);
    } else {
      state = joinRoom(roomId, socket.id, userName);
      if (!state) {
        socket.emit("error", { message: "Room not found" });
        return;
      }
      if (state.error) {
        socket.emit("error", { message: state.error });
        return;
      }
    }
    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.data.userName = userName;
    socket.emit("room_joined", { roomState: state, myId: socket.id });
    socket.to(roomId).emit("room_update", { roomState: state });
  });

  socket.on("set_budget", ({ budget }) => {
    const roomId = socket.data.roomId;
    if (!roomId) return;
    const state = setRoomBudget(roomId, socket.id, budget);
    if (!state) {
      socket.emit("error", { message: "Cannot change budget (must be host, game not started, 10–10000 Cr)" });
      return;
    }
    io.to(roomId).emit("room_update", { roomState: state });
  });

  socket.on("start_auction", () => {
    const roomId = socket.data.roomId;
    if (!roomId) return;
    const auctionData = startAuction(roomId, socket.id);
    if (!auctionData) {
      socket.emit("error", { message: "Cannot start auction" });
      return;
    }
    io.to(roomId).emit("auction_started", auctionData);
    startTimer(roomId);
  });

  socket.on("place_bid", ({ amount }) => {
    const roomId = socket.data.roomId;
    if (!roomId) return;
    const result = placeBid(roomId, socket.id, amount);
    if (!result) return;
    if (result.error) {
      socket.emit("bid_error", { message: result.error });
      return;
    }
    io.to(roomId).emit("bid_update", result);
    startTimer(roomId);
  });

  socket.on("disconnect", () => {
    const roomId = socket.data.roomId;
    if (!roomId) return;
    const result = leaveRoom(socket.id);
    if (result && !result.deleted) {
      io.to(result.roomId).emit("room_update", { roomState: result.state });
    }
    console.log("Disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));