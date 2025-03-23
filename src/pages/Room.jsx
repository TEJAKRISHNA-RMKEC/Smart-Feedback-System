import {useState, useEffect} from 'react'
import {useParams} from 'react-router-dom'
import {db} from '../firebase'
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
  increment
} from 'firebase/firestore'
import {Pie} from 'react-chartjs-2'
import {Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale} from 'chart.js'
import {toast} from 'react-toastify'

// Registering Chart.js components
ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale)

// Generate a random username
const generateUsername = () => {
  const adjectives = [
    'Rare',
    'Lateral',
    'Curious',
    'Gentle',
    'Majestic',
    'Vibrant',
    'Mystic',
    'Silent',
    'Eccentric',
    'Mighty',
    'Bold',
    'Luminous',
    'Swift',
    'Dazzling',
    'Fierce',
    'Brave',
    'Clever',
    'Enigmatic',
    'Adventurous',
    'Dynamic',
    'Playful',
    'Intrepid',
    'Serene',
    'Whimsical',
    'Radiant',
    'Noble',
    'Graceful',
    'Mysterious',
    'Energetic',
    'Harmonious',
    'Serene',
    'Gleaming',
    'Vivid',
    'Majestic',
    'Steady',
    'Timid',
    'Hasty',
    'Shining',
    'Vast',
    'Agile',
    'Ethereal',
    'Graceful'
  ]

  const nouns = [
    'Rabbit',
    'Moon',
    'Tiger',
    'Eagle',
    'Lion',
    'Whale',
    'Phoenix',
    'Wolf',
    'Dragon',
    'Panther',
    'Leopard',
    'Jaguar',
    'Falcon',
    'Shark',
    'Bear',
    'Butterfly',
    'Kangaroo',
    'Elephant',
    'Hawk',
    'Owl',
    'Cheetah',
    'Zebra',
    'Giraffe',
    'Horse',
    'Panda',
    'Peacock',
    'Penguin',
    'Koala',
    'Cobra',
    'Vulture',
    'Alligator',
    'Otter',
    'Dolphin',
    'Swan',
    'Raven',
    'Turtle',
    'Falcon',
    'Coyote',
    'Bison',
    'Gorilla',
    'Rhino',
    'Buffalo'
  ]
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`
}

const Room = () => {
  const {roomId} = useParams()
  const [feedbacks, setFeedbacks] = useState([])
  const [activeUsers, setActiveUsers] = useState(0)
  const [rating, setRating] = useState(3)
  const [comment, setComment] = useState('')
  const [username] = useState(generateUsername())
  const [isCreator, setIsCreator] = useState(false)

  useEffect(() => {
    if (!roomId) return

    // Check if the user is the room creator
    const storedCreator = localStorage.getItem('roomCreator')
    setIsCreator(storedCreator === roomId)

    // Fetch feedbacks for the room
    const feedbacksRef = collection(db, 'feedbacks')
    const feedbackQuery = query(feedbacksRef, where('roomId', '==', roomId))
    const unsubscribeFeedbacks = onSnapshot(feedbackQuery, snapshot => {
      setFeedbacks(snapshot.docs.map(doc => ({id: doc.id, ...doc.data()})))
    })

    // Listen to the active users in the room
    const activeUsersRef = doc(db, 'rooms', roomId)
    const unsubscribeActiveUsers = onSnapshot(activeUsersRef, doc => {
      setActiveUsers(doc.data()?.activeUsers || 0) // Fetch the active user count from Firestore
    })

    // Increment active users when the user enters the room
    const incrementActiveUserCount = async () => {
      await updateDoc(activeUsersRef, {
        activeUsers: increment(1)
      })
    }
    incrementActiveUserCount()

    return () => {
      // Decrement active users when the user leaves the room
      const decrementActiveUserCount = async () => {
        await updateDoc(activeUsersRef, {
          activeUsers: increment(-1)
        })
      }
      decrementActiveUserCount()

      // Cleanup on unmount
      unsubscribeFeedbacks()
      unsubscribeActiveUsers()
    }
  }, [roomId])

  const submitFeedback = async () => {
    if (rating < 1 || comment.trim() === '') {
      toast.error('❌ Please provide a rating and a comment.')
      return
    }
    try {
      await addDoc(collection(db, 'feedbacks'), {
        roomId,
        username,
        rating,
        comment,
        timestamp: serverTimestamp()
      })
      setRating(3)
      setComment('')
      toast.success(`✅ Feedback submitted successfully! (${username})`)
    } catch {
      toast.error('❌ Error submitting feedback.')
    }
  }

  const getRatingDistribution = () => {
    const ratingCounts = [0, 0, 0, 0, 0]

    feedbacks.forEach(fb => {
      if (fb.rating >= 1 && fb.rating <= 5) {
        ratingCounts[fb.rating - 1]++
      }
    })

    return {
      labels: ['1⭐', '2⭐', '3⭐', '4⭐', '5⭐'],
      datasets: [
        {
          label: 'Ratings Distribution',
          data: ratingCounts,
          backgroundColor: ['#ff4d4d', '#ffcc00', '#99cc33', '#3399ff', '#66cc66']
        }
      ]
    }
  }

  const getSuggestions = () => {
    if (feedbacks.length === 0) return 'No feedback yet.'
    const averageRating = feedbacks.reduce((sum, fb) => sum + fb.rating, 0) / feedbacks.length

    if (averageRating > 4) return 'Great job! Keep up the good work! 😊'
    if (averageRating > 3) return 'Good work! A few improvements can make it even better. 👍'
    return 'Consider addressing key issues to enhance user experience. 🚀'
  }

  return (
    <div className='mx-auto w-full max-w-4xl rounded-2xl bg-white/10 !p-6 shadow-2xl relative'>
      <div className='space-y-6'>
        <h2 className='text-center text-2xl font-semibold'>Room: {roomId}</h2>

        {/* Show Active Users if Creator */}
        {isCreator && (
          <span className='c absolute top-4 right-4 gap-x-4'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 640 512'
              className='aspect-square w-6 fill-white'>
              <path d='M96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM0 482.3C0 383.8 79.8 304 178.3 304l91.4 0C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7L29.7 512C13.3 512 0 498.7 0 482.3zM609.3 512l-137.8 0c5.4-9.4 8.6-20.3 8.6-32l0-8c0-60.7-27.1-115.2-69.8-151.8c2.4-.1 4.7-.2 7.1-.2l61.4 0C567.8 320 640 392.2 640 481.3c0 17-13.8 30.7-30.7 30.7zM432 256c-31 0-59-12.6-79.3-32.9C372.4 196.5 384 163.6 384 128c0-26.8-6.6-52.1-18.3-74.3C384.3 40.1 407.2 32 432 32c61.9 0 112 50.1 112 112s-50.1 112-112 112z' />
            </svg>
            <p className='font-bold'>Active Users: {activeUsers}</p>
          </span>
        )}

        {/* Feedback Form */}
        {!isCreator && (
          <>
            <h3 className='text-xl font-semibold'>Give Feedback</h3>
            <p className='text-gray-400'>
              Hey <strong>{username}</strong>, your feedback matters! 😊
            </p>
            <label className='block font-medium'>Rating: {rating} ⭐</label>
            <input
              type='range'
              className='mt-2 w-full cursor-pointer'
              min='1'
              max='5'
              step='1'
              value={rating}
              onChange={e => setRating(Number(e.target.value))}
            />
            <input
              type='text'
              className='mt-3 w-full rounded-lg border border-gray-500 bg-gray-800 p-2 text-white focus:ring focus:ring-gray-400'
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder='Your feedback'
            />
            <button
              className='mt-3 w-full rounded-lg bg-blue-600 px-4 py-2 text-white transition-all hover:bg-blue-700'
              onClick={submitFeedback}>
              Submit Feedback
            </button>
          </>
        )}

        {/* Feedback Display */}
        {isCreator && (
          <>
            <h3 className='text-xl font-semibold'>Feedbacks from Users:</h3>
            {feedbacks.length === 0 ? (
              <p className='text-gray-400'>No feedback yet.</p>
            ) : (
              <div className='overflow-x-auto'>
                <table className='w-full border border-gray-700 text-left'>
                  <thead className='bg-gray-800'>
                    <tr>
                      <th className='px-4 py-2'>Username</th>
                      <th className='px-4 py-2'>Rating</th>
                      <th className='px-4 py-2'>Comment</th>
                      <th className='px-4 py-2'>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feedbacks.map(fb => (
                      <tr key={fb.id} className='border-t border-gray-700'>
                        <td className='px-4 py-2'>{fb.username}</td>
                        <td className='px-4 py-2'>{fb.rating}⭐</td>
                        <td className='px-4 py-2'>{fb.comment}</td>
                        <td className='px-4 py-2'>
                          {fb.timestamp?.seconds
                            ? new Date(fb.timestamp.seconds * 1000).toLocaleString()
                            : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <h4 className='mt-6 text-lg font-semibold'>Feedback Rating Distribution:</h4>
            <div className='flex justify-center'>
              <div className='w-64'>
                <Pie data={getRatingDistribution()} />
              </div>
            </div>

            <div className='mt-6'>
              <h5 className='text-lg font-semibold'>Suggestions based on Feedback:</h5>
              <p className='text-gray-400'>{getSuggestions()}</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Room
