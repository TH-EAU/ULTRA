import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import SceneContainer from './components/containers/SceneContainer'
import TestScene from './scenes/Test.scene'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SceneContainer>
      <TestScene />
    </SceneContainer>
  </StrictMode>,
)
