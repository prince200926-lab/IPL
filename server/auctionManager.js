import { PLAYERS } from "./players.js";

const rooms = new Map();

export function createRoom(roomId, hostSocketId, hostName, budget = 100) {
  const room = {
    id: roomId,
    host: hostSocketId,
    defaultBudget: budget,
    users: new Map(),
    auctionState: null,
    started: false,
  };
  room.users.set(hostSocketId, {
    id: hostSocketId,
    name: hostName,
    budget,
    team: [],
  });
  rooms.set(roomId, room);
  return getRoomPublicState(roomId);
}

export function joinRoom(roomId, socketId, userName) {
  const room = rooms.get(roomId);
  if (!room) return null;
  if (room.started) return { error: "Auction already started" };
  room.users.set(socketId, {
    id: socketId,
    name: userName,
    budget: room.defaultBudget,
    team: [],
  });
  return getRoomPublicState(roomId);
}

export function setRoomBudget(roomId, socketId, budget) {
  const room = rooms.get(roomId);
  if (!room || room.host !== socketId) return null;
  if (room.started) return null;
  const parsed = parseFloat(budget);
  if (isNaN(parsed) || parsed < 10 || parsed > 10000) return null;
  room.defaultBudget = parsed;
  // update all current users who haven't spent yet
  for (const user of room.users.values()) {
    if (user.team.length === 0) user.budget = parsed;
  }
  return getRoomPublicState(roomId);
}

export function leaveRoom(socketId) {
  for (const [roomId, room] of rooms.entries()) {
    if (room.users.has(socketId)) {
      room.users.delete(socketId);
      if (room.users.size === 0) {
        rooms.delete(roomId);
        return { roomId, deleted: true };
      }
      if (room.host === socketId) {
        room.host = room.users.keys().next().value;
      }
      return { roomId, state: getRoomPublicState(roomId) };
    }
  }
  return null;
}

export function startAuction(roomId, socketId) {
  const room = rooms.get(roomId);
  if (!room || room.host !== socketId) return null;
  if (room.started) return null;

  const shuffled = [...PLAYERS].sort(() => Math.random() - 0.5);
  room.auctionState = {
    players: shuffled,
    currentIndex: 0,
    currentBid: shuffled[0].basePrice,
    highestBidder: null,
    highestBidderName: null,
    timer: 10,
    sold: [],
    unsold: [],
  };
  room.started = true;
  return getCurrentAuctionData(roomId);
}

export function placeBid(roomId, socketId, amount) {
  const room = rooms.get(roomId);
  if (!room || !room.auctionState) return null;

  const state = room.auctionState;
  const user = room.users.get(socketId);
  if (!user) return null;

  // round to 1 decimal to avoid float issues
  const roundedAmount = Math.round(amount * 10) / 10;

  if (roundedAmount <= state.currentBid) return { error: "Bid must be higher than current bid" };
  if (user.budget < roundedAmount) return { error: "Insufficient budget" };

  state.currentBid = roundedAmount;
  state.highestBidder = socketId;
  state.highestBidderName = user.name;
  state.timer = 10;

  return getBidUpdateData(roomId);
}

export function soldCurrentPlayer(roomId) {
  const room = rooms.get(roomId);
  if (!room || !room.auctionState) return null;

  const state = room.auctionState;
  const currentPlayer = state.players[state.currentIndex];

  let soldTo = null;
  if (state.highestBidder) {
    const buyer = room.users.get(state.highestBidder);
    if (buyer) {
      buyer.budget = Math.round((buyer.budget - state.currentBid) * 10) / 10;
      buyer.team.push({ ...currentPlayer, soldPrice: state.currentBid });
      soldTo = { id: state.highestBidder, name: state.highestBidderName, price: state.currentBid };
    }
    state.sold.push({ ...currentPlayer, soldTo: state.highestBidderName, price: state.currentBid });
  } else {
    state.unsold.push(currentPlayer);
  }

  state.currentIndex++;
  const isLastPlayer = state.currentIndex >= state.players.length;

  if (!isLastPlayer) {
    const next = state.players[state.currentIndex];
    state.currentBid = next.basePrice;
    state.highestBidder = null;
    state.highestBidderName = null;
    state.timer = 10;
  }

  return {
    soldPlayer: currentPlayer,
    soldTo,
    isLastPlayer,
    roomState: getRoomPublicState(roomId),
    nextPlayer: isLastPlayer ? null : state.players[state.currentIndex],
    nextBasePrice: isLastPlayer ? null : state.players[state.currentIndex].basePrice,
  };
}

export function getRoom(roomId) {
  return rooms.get(roomId);
}

export function decrementTimer(roomId) {
  const room = rooms.get(roomId);
  if (!room || !room.auctionState) return null;
  room.auctionState.timer = Math.max(0, room.auctionState.timer - 1);
  return room.auctionState.timer;
}

export function getRoomPublicState(roomId) {
  const room = rooms.get(roomId);
  if (!room) return null;
  return {
    id: room.id,
    host: room.host,
    started: room.started,
    defaultBudget: room.defaultBudget,
    users: Array.from(room.users.values()).map((u) => ({
      id: u.id,
      name: u.name,
      budget: u.budget,
      teamCount: u.team.length,
      team: u.team,
    })),
  };
}

export function getCurrentAuctionData(roomId) {
  const room = rooms.get(roomId);
  if (!room || !room.auctionState) return null;
  const state = room.auctionState;
  const currentPlayer = state.players[state.currentIndex];
  return {
    currentPlayer,
    currentBid: state.currentBid,
    highestBidder: state.highestBidder,
    highestBidderName: state.highestBidderName,
    timer: state.timer,
    totalPlayers: state.players.length,
    currentIndex: state.currentIndex,
    sold: state.sold,
    roomState: getRoomPublicState(roomId),
  };
}

export function getBidUpdateData(roomId) {
  const room = rooms.get(roomId);
  if (!room || !room.auctionState) return null;
  const state = room.auctionState;
  return {
    currentBid: state.currentBid,
    highestBidder: state.highestBidder,
    highestBidderName: state.highestBidderName,
    timer: state.timer,
    roomState: getRoomPublicState(roomId),
  };
}