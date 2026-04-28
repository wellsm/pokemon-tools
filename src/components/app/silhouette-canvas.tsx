import { useEffect, useRef, useState } from 'react'
import { ARTWORK_URL } from '@/pokemon-data'

interface Props { id: number }

export function SilhouetteCanvas({ id }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    setReady(false)
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
      ctx.globalCompositeOperation = 'source-in'
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      setReady(true)
    }

    img.onerror = () => setReady(true)
    img.src = ARTWORK_URL(id)
  }, [id])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full object-contain"
      style={{ opacity: ready ? 1 : 0, transition: 'opacity 0.3s' }}
    />
  )
}
