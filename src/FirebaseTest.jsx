import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { db } from "./firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

const FirebaseTest = () => {
  const [rooms, setRooms] = useState([]);
  const [roomCode, setRoomCode] = useState(""); // Stores user-entered room code
  const [message, setMessage] = useState(""); // Stores success/error messages

  // Function to generate a unique room code and save it to Firestore
  const addRoom = async () => {
    try {
      const randomCode = uuidv4().slice(0, 6).toUpperCase();
      await addDoc(collection(db, "rooms"), {
        roomCode: randomCode,
        createdAt: new Date(),
      });
      console.log("Room added with Code:", randomCode);
      fetchRooms(); // Refresh room list
    } catch (error) {
      console.error("Error adding room:", error);
    }
  };

  // Function to fetch all rooms from Firestore
  const fetchRooms = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "rooms"));
      const roomList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRooms(roomList);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  // Function to check if a room exists
  const joinRoom = () => {
    const roomExists = rooms.some((room) => room.roomCode === roomCode.toUpperCase());
    if (roomExists) {
      setMessage(`✅ Successfully joined Room: ${roomCode}`);
    } else {
      setMessage("❌ Room not found. Please check the code.");
    }
  };

  // Fetch rooms on component mount
  useEffect(() => {
    fetchRooms();
  }, []);

  return (
    <div className="container mt-5">
      <h2>Firebase Test</h2>

      {/* Create Room Button */}
      <button className="btn btn-primary mb-3" onClick={addRoom}>
        Add Test Room
      </button>

      {/* Display Created Rooms */}
      <ul className="list-group">
        {rooms.map((room) => (
          <li key={room.id} className="list-group-item">
            Room Code: {room.roomCode}
          </li>
        ))}
      </ul>

      <hr />

      {/* Join Room Section */}
      <h3>Join a Room</h3>
      <input
        type="text"
        className="form-control"
        placeholder="Enter Room Code"
        value={roomCode}
        onChange={(e) => setRoomCode(e.target.value)}
      />
      <button className="btn btn-success mt-2" onClick={joinRoom}>
        Join Room
      </button>

      {/* Message */}
      {message && <p className="mt-2">{message}</p>}
    </div>
  );
};

export default FirebaseTest;
