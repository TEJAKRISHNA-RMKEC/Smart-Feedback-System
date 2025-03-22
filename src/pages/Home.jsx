import {useNavigate} from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()

  return (
    <>
      <div className='relative z-10 space-y-8 text-center'>
        <h1 className='text-5xl font-bold tracking-wide'>Real-Time Feedback System</h1>
        <p className='text-lg text-gray-400'>Instant feedback, seamless experience.</p>
        <div className='flex translate-y-5 justify-center gap-x-6'>
          <button onClick={() => navigate('/create-room')}>Create Room</button>
          <button onClick={() => navigate('/join-room')}>Join Room</button>
        </div>
      </div>
    </>
  )
}
