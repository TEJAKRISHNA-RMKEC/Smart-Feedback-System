import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, increment } from "firebase/firestore";
import "bootstrap/dist/css/bootstrap.min.css";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale } from "chart.js";
import "../styles/room.css";

// Registering Chart.js components
ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

// Generate a random username
const generateUsername = () => {
  const adjectives = [
    "Rare", "Lateral", "Curious", "Gentle", "Majestic", "Vibrant", "Mystic", "Silent",
    "Eccentric", "Mighty", "Bold", "Luminous", "Swift", "Dazzling", "Fierce", "Brave",
    "Clever", "Enigmatic", "Adventurous", "Dynamic", "Playful", "Intrepid", "Serene",
    "Whimsical", "Radiant", "Noble", "Graceful", "Mysterious", "Energetic", "Harmonious",
    "Serene", "Gleaming", "Vivid", "Majestic", "Steady", "Timid", "Hasty", "Shining",
    "Vast", "Agile", "Ethereal", "Graceful"
  ];

  const nouns = [
    "Rabbit", "Moon", "Tiger", "Eagle", "Lion", "Whale", "Phoenix", "Wolf", "Dragon",
    "Panther", "Leopard", "Jaguar", "Falcon", "Shark", "Bear", "Butterfly", "Kangaroo",
    "Elephant", "Hawk", "Owl", "Cheetah", "Zebra", "Giraffe", "Horse", "Panda", "Peacock",
    "Penguin", "Koala", "Cobra", "Vulture", "Alligator", "Otter", "Dolphin", "Swan",
    "Raven", "Turtle", "Falcon", "Coyote", "Bison", "Gorilla", "Rhino", "Buffalo"
  ];
  return ${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]};
};

const Room = () => {
  const { roomId } = useParams();
  const [feedbacks, setFeedbacks] = useState([]);
  const [activeUsers, setActiveUsers] = useState(0);
  const [rating, setRating] = useState(3);
  const [comment, setComment] = useState("");
  const [username, setUsername] = useState(generateUsername());
  const [isCreator, setIsCreator] = useState(false);

  useEffect(() => {
    if (!roomId) return;

    // Check if the user is the room creator
    const storedCreator = localStorage.getItem("roomCreator");
    setIsCreator(storedCreator === roomId);

    // Fetch feedbacks for the room
    const feedbacksRef = collection(db, "feedbacks");
    const feedbackQuery = query(feedbacksRef, where("roomId", "==", roomId));
    const unsubscribeFeedbacks = onSnapshot(feedbackQuery, (snapshot) => {
      setFeedbacks(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    // Listen to the active users in the room
    const activeUsersRef = doc(db, "rooms", roomId);
    const unsubscribeActiveUsers = onSnapshot(activeUsersRef, (doc) => {
      setActiveUsers(doc.data()?.activeUsers || 0);  // Fetch the active user count from Firestore
    });

    // Increment active users when the user enters the room
    const incrementActiveUserCount = async () => {
      await updateDoc(activeUsersRef, {
        activeUsers: increment(1),
      });
    };
    incrementActiveUserCount();

    return () => {
      // Decrement active users when the user leaves the room
      const decrementActiveUserCount = async () => {
        await updateDoc(activeUsersRef, {
          activeUsers: increment(-1),
        });
      };
      decrementActiveUserCount();

      // Cleanup on unmount
      unsubscribeFeedbacks();
      unsubscribeActiveUsers();
    };
  }, [roomId]);

  const submitFeedback = async () => {
    if (rating < 1 || comment.trim() === "") {
      alert("❌ Please provide a rating and a comment.");
      return;
    }
    try {
      await addDoc(collection(db, "feedbacks"), {
        roomId,
        username,
        rating,
        comment,
        timestamp: serverTimestamp(),
      });
      setRating(3);
      setComment("");
      alert(✅ Feedback submitted successfully! (${username}));
    } catch {
      alert("❌ Error submitting feedback.");
    }
  };

  const getRatingDistribution = () => {
    const ratingCounts = [0, 0, 0, 0, 0];

    feedbacks.forEach((fb) => {
      if (fb.rating >= 1 && fb.rating <= 5) {
        ratingCounts[fb.rating - 1]++;
      }
    });

    return {
      labels: ["1⭐", "2⭐", "3⭐", "4⭐", "5⭐"],
      datasets: [
        {
          label: "Ratings Distribution",
          data: ratingCounts,
          backgroundColor: ["#ff4d4d", "#ffcc00", "#99cc33", "#3399ff", "#66cc66"],
        },
      ],
    };
  };

  const getSuggestions = () => {
    if (feedbacks.length === 0) return "No feedback yet.";
    const averageRating =
      feedbacks.reduce((sum, fb) => sum + fb.rating, 0) / feedbacks.length;

    if (averageRating > 4) return "Great job! Keep up the good work! 😊";
    if (averageRating > 3) return "Good work! A few improvements can make it even better. 👍";
    return "Consider addressing key issues to enhance user experience. 🚀";
  };

  return (
    <div className="container">
      <div className="room-content">
        <h2 className="text-center">Room: {roomId}</h2>

        {/* Show Active Users if Creator */}
        {isCreator && <p className="text-muted">👥 Active Users: {activeUsers}</p>}

        {/* Feedback Form */}
        {!isCreator && (
          <>
            <h3>Give Feedback</h3>
            <p className="text-muted">Hey <strong>{username}</strong>, your feedback matters! 😊</p>
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
              className="form-control my-3"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Your feedback"
            />
            <button className="btn btn-primary" style={{ width: "450px" }} onClick={submitFeedback}>
              Submit Feedback
            </button>
          </>
        )}

        {/* Feedback Display */}
        {isCreator && (
          <>
            <h3>Feedbacks from Users:</h3>
            {feedbacks.length === 0 ? (
              <p>No feedback yet.</p>
            ) : (
              <div className="table-container">
                <table className="table table-hover table-bordered mt-3">
                  <thead className="table-dark">
                    <tr>
                      <th>Username</th>
                      <th>Rating</th>
                      <th>Comment</th>
                      <th>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feedbacks.map((fb) => (
                      <tr key={fb.id}>
                        <td>{fb.username}</td>
                        <td>{fb.rating}⭐</td>
                        <td>{fb.comment}</td>
                        <td>
                          {fb.timestamp?.seconds
                            ? new Date(fb.timestamp.seconds * 1000).toLocaleString()
                            : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <h4 className="mt-4">Feedback Rating Distribution:</h4>
            <div className="chart-container">
              <Pie data={getRatingDistribution()} />
            </div>

            <div className="mt-4">
              <h5>Suggestions based on Feedback:</h5>
              <p>{getSuggestions()}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Room;