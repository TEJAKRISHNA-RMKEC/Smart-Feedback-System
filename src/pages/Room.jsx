import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import { collection, query, where, onSnapshot, addDoc } from "firebase/firestore";
import "bootstrap/dist/css/bootstrap.min.css";

// Helper function to determine emotion based on rating
const getEmotionFromRating = (rating) => {
  switch (rating) {
    case 1:
      return "Angry";
    case 2:
      return "Sad";
    case 3:
      return "Neutral";
    case 4:
      return "Happy";
    case 5:
      return "Excited";
    default:
      return "Neutral";
  }
};

const generateUsername = () => {
  const adjectives = ["Rare", "Lateral", "Curious", "Gentle"];
  const nouns = ["Rabbit", "Moon", "Tiger", "Eagle"];
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`;
};

const Room = () => {
  const { roomId } = useParams();
  const [feedbacks, setFeedbacks] = useState([]);
  const [activeUsers, setActiveUsers] = useState(0);
  const [rating, setRating] = useState(3); // Default rating at 3
  const [comment, setComment] = useState("");
  const [username, setUsername] = useState(generateUsername());
  const [isCreator, setIsCreator] = useState(false);

  useEffect(() => {
    if (!roomId) return;

    const storedCreator = localStorage.getItem("roomCreator");
    setIsCreator(storedCreator === roomId);

    const feedbacksRef = collection(db, "feedbacks");
    const feedbackQuery = query(feedbacksRef, where("roomId", "==", roomId));
    const unsubscribeFeedbacks = onSnapshot(feedbackQuery, (snapshot) => {
      setFeedbacks(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    const usersRef = collection(db, "roomUsers");
    const usersQuery = query(usersRef, where("roomId", "==", roomId));
    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      setActiveUsers(snapshot.docs.length);
    });

    const addUserToRoom = async () => {
      try {
        await addDoc(usersRef, { roomId, joinedAt: new Date(), username });
      } catch (error) {
        console.error("Error adding user:", error);
      }
    };

    addUserToRoom();

    return () => {
      unsubscribeFeedbacks();
      unsubscribeUsers();
    };
  }, [roomId]);

  const submitFeedback = async () => {
    if (rating < 1 || comment.trim() === "") {
      alert("❌ Please provide a rating and a comment.");
      return;
    }

    const emotion = getEmotionFromRating(rating); // Get the emotion based on the rating
    const timestamp = new Date(); // Get current timestamp

    try {
      await addDoc(collection(db, "feedbacks"), {
        roomId,
        username,
        rating,
        comment,
        emotion, // Save the guessed emotion
        timestamp, // Save the timestamp
      });
      setRating(3); // Reset to default after submission
      setComment("");
      alert(`✅ Feedback submitted successfully! (${username})`);
    } catch {
      alert("❌ Error submitting feedback.");
    }
  };

  return (
    <div className="container mt-5">
      <h2>Room: {roomId}</h2>

      {isCreator && <p>👥 Active Users: {activeUsers}</p>}

      {isCreator ? (
        <>
          <h3>Feedbacks from Users:</h3>
          {feedbacks.length === 0 ? (
            <p>No feedback yet.</p>
          ) : (
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Rating</th>
                  <th>Emotion</th>
                  <th>Comment</th>
                  <th>Time</th> {/* Add Time column */}
                </tr>
              </thead>
              <tbody>
                {feedbacks.map((fb) => (
                  <tr key={fb.id}>
                    <td>{fb.username}</td>
                    <td>{fb.rating}⭐</td>
                    <td>{fb.emotion}</td>
                    <td>{fb.comment}</td>
                    <td>{new Date(fb.timestamp.seconds * 1000).toLocaleString()}</td> {/* Format timestamp */}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      ) : (
        <>
          <h3>Give Feedback</h3>
          <p>Hey <strong>{username}</strong>, your feedback matters a lot! 😊</p>

          {/* 🔥 SLIDER FOR RATING */}
          <label className="form-label">Rating: {rating} ⭐</label>
          <input
            type="range"
            className="form-range"
            min="1"
            max="5"
            step="1"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
          />

          <input
            type="text"
            className="form-control my-2"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Your feedback"
          />

          <button className="btn btn-primary" onClick={submitFeedback}>
            Submit Feedback
          </button>
        </>
      )}
    </div>
  );
};

export default Room;
