export default function Layout({children}) {
  return (
    <main className='relative flex h-screen items-center justify-center bg-black text-white'>
      <div className='bg-ripples pointer-events-none absolute inset-0'></div>
      {children}
    </main>
  )
}
