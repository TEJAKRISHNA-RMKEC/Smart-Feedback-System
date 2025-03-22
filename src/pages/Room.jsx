import {useState, useEffect} from 'react'
import {useParams} from 'react-router-dom'
import {db} from '../firebase'
import {collection, query, where, onSnapshot, addDoc} from 'firebase/firestore'
import {toast} from 'react-toastify'

const getEmotionFromRating = rating => {
  switch (rating) {
    case 1:
      return 'Angry'
    case 2:
      return 'Sad'
    case 3:
      return 'Neutral'
    case 4:
      return 'Happy'
    case 5:
      return 'Excited'
    default:
      return 'Neutral'
  }
}

const generateUsername = () => {
  const adjectives = ['Rare', 'Lateral', 'Curious', 'Gentle']
  const nouns = ['Rabbit', 'Moon', 'Tiger', 'Eagle']
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`
}

export default function Room() {
  const {roomId} = useParams()
  const [feedbacks, setFeedbacks] = useState([])
  const [activeUsers, setActiveUsers] = useState(0)
  const [rating, setRating] = useState(3)
  const [comment, setComment] = useState('')
  const [username] = useState(generateUsername())
  const [isCreator, setIsCreator] = useState(true)

  useEffect(() => {
    if (!roomId) return

    const storedCreator = localStorage.getItem('roomCreator')
    setIsCreator(storedCreator === roomId)

    const feedbacksRef = collection(db, 'feedbacks')
    const feedbackQuery = query(feedbacksRef, where('roomId', '==', roomId))
    const unsubscribeFeedbacks = onSnapshot(feedbackQuery, snapshot => {
      setFeedbacks(snapshot.docs.map(doc => ({id: doc.id, ...doc.data()})))
    })

    const usersRef = collection(db, 'roomUsers')
    const usersQuery = query(usersRef, where('roomId', '==', roomId))
    const unsubscribeUsers = onSnapshot(usersQuery, snapshot => {
      setActiveUsers(snapshot.docs.length)
    })

    const addUserToRoom = async () => {
      try {
        await addDoc(usersRef, {roomId, joinedAt: new Date(), username})
      } catch (error) {
        toast.error('Error adding user:', error)
      }
    }

    addUserToRoom()

    return () => {
      unsubscribeFeedbacks()
      unsubscribeUsers()
    }
  }, [roomId, username])

  const submitFeedback = async () => {
    if (rating < 1 || comment.trim() === '') {
      toast.error('❌ Please provide a rating and a comment.')
      return
    }

    const emotion = getEmotionFromRating(rating)
    const timestamp = new Date()

    try {
      await addDoc(collection(db, 'feedbacks'), {
        roomId,
        username,
        rating,
        comment,
        emotion,
        timestamp
      })
      setRating(4)
      setComment('')
      toast.success(`✅ Feedback submitted successfully! (${username})`)
    } catch {
      toast.error('❌ Error submitting feedback.')
    }
  }

  return (
    <>
      <div className='c w-full max-w-3xl flex-col gap-y-6 rounded-2xl bg-white/10 !p-6 backdrop-blur-lg'>
        <h2 className='text-center text-2xl'>
          Room ID <p className='font-bold'>{roomId}</p>
        </h2>

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

        {isCreator ? (
          <>
            <h3 className='mt-6 text-center text-xl font-medium'>Feedbacks from Users</h3>

            {feedbacks.length === 0 ? (
              <p className='mt-2 text-center text-gray-400'>No feedback yet.</p>
            ) : (
              <div className='mt-3 grid grid-cols-1 gap-4 p-10 sm:grid-cols-2 lg:grid-cols-3'>
                {feedbacks.map(fb => (
                  <div
                    key={fb.id}
                    className='w-full rounded-2xl border border-gray-700 bg-white/10 !p-5 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl'>
                    <h4 className='text-lg font-semibold'>{fb.username}</h4>
                    <p className='mt-2 text-sm'>{fb.comment}</p>
                    <div className='mt-4 flex items-center justify-between text-gray-400'>
                      <span className='text-sm'>⭐ {fb.rating}</span>
                      <span>{fb.emotion}</span>
                    </div>
                    <span className='text-sm text-gray-400'>
                      {new Date(fb.timestamp.seconds * 1000).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <h3 className='mt-6 text-center text-2xl font-medium'> Feedback</h3>
            <p className='mt-1 text-center text-gray-300'>
              Hey <strong>{username}</strong>, your feedback matters a lot!
            </p>

            <div className='mt-4 w-1/2 space-y-4'>
              <div>
                <label className='block text-gray-300'>Rating: {rating} ⭐</label>
                <input
                  type='range'
                  className='w-full accent-white'
                  min='1'
                  max='5'
                  step='1'
                  value={rating}
                  onChange={e => setRating(Number(e.target.value))}
                />
              </div>

              <span className='c gap-x-2'>
                <input
                  type='text'
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder='Your feedback'
                />
                <button onClick={submitFeedback}>Submit</button>
              </span>
            </div>
          </>
        )}
      </div>
    </>
  )
}
