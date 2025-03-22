import { useState } from "react";
import { useNavigate } from "react-router-dom";

const JoinRoom = () => {
  const [roomCode, setRoomCode] = useState("");
  const navigate = useNavigate();

  const handleJoinRoom = () => {
    if (roomCode.trim() === "") {
      alert("❌ Enter a valid Room Code.");
      return;
    }
    localStorage.removeItem("roomCreator"); // Ensure they're not treated as the creator
    navigate(`/room/${roomCode}`);
  };

  return (
    <div className="container text-center mt-5">
      <h2>Join a Room</h2>
      <input 
        type="text" 
        className="form-control my-2 text-center" 
        value={roomCode} 
        onChange={(e) => setRoomCode(e.target.value)} 
        placeholder="Enter Room Code"
      />
      <button className="btn btn-primary" onClick={handleJoinRoom}>Join Room</button>
    </div>
  );
};

export default JoinRoom;
