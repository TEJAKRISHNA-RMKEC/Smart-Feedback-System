import {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {db} from '../firebase'
import {collection, addDoc} from 'firebase/firestore'

const generateRoomCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  return Array.from({length: 6}, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

const CreateRoom = () => {
  const navigate = useNavigate()
  const [roomCode, setRoomCode] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCreateRoom = async () => {
    const newRoomCode = generateRoomCode()
    setRoomCode(newRoomCode)
    setLoading(true)

    try {
      await addDoc(collection(db, 'rooms'), {code: newRoomCode})
      localStorage.setItem('roomCreator', newRoomCode)
      navigate(`/room/${newRoomCode}`)
    } catch (error) {
      alert('❌ Error creating room.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className='c flex-col gap-y-6 text-center'>
        <h2 className='text-3xl font-semibold'>Create a Room</h2>

        {roomCode && (
          <p className='font-mono text-xl tracking-widest text-green-400'>
            Room Code: <span className='font-bold'>{roomCode}</span>
          </p>
        )}

        <button
          className='mt-3 rounded-xl border border-white bg-white/10 px-6 py-3 backdrop-blur-lg transition-all duration-300 hover:bg-white hover:text-black hover:shadow-xl'
          onClick={handleCreateRoom}
          disabled={loading}>
          {loading ? 'Creating Room...' : 'Generate & Enter Room'}
        </button>
      </div>
    </>
  )
}

export default CreateRoom
