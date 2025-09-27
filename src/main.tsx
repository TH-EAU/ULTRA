import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PixelArtScene } from './scenes/test.scene.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PixelArtScene />
  </StrictMode>,
)
