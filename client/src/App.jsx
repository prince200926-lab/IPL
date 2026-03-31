import { useState, useEffect } from "react";
import socket from "./socket";
import JoinRoom from "./pages/JoinRoom";
import AuctionRoom from "./pages/AuctionRoom";

export default function App() {
  const [screen, setScreen] = useState("join");
  const [roomState, setRoomState] = useState(null);
  const [myId, setMyId] = useState(null);
  const [auctionData, setAuctionData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    socket.connect();

    socket.on("room_joined", ({ roomState, myId }) => {
      setRoomState(roomState);
      setMyId(myId);
      setScreen("room");
      setError("");
    });

    socket.on("room_update", ({ roomState }) => {
      setRoomState(roomState);
    });

    socket.on("auction_started", (data) => {
      setAuctionData(data);
    });

    socket.on("error", ({ message }) => {
      setError(message);
    });

    return () => {
      socket.off("room_joined");
      socket.off("room_update");
      socket.off("auction_started");
      socket.off("error");
      socket.disconnect();
    };
  }, []);

  const handleJoin = ({ roomId, userName, create }) => {
    setError("");
    socket.emit("join_room", { roomId, userName, create });
  };

  if (screen === "join") {
    return <JoinRoom onJoin={handleJoin} error={error} />;
  }

  return (
    <AuctionRoom
      roomState={roomState}
      setRoomState={setRoomState}
      myId={myId}
      initialAuctionData={auctionData}
    />
  );
}
