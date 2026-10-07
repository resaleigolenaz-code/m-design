import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './milad.css'
import StudioApp from './StudioApp'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StudioApp />
  </StrictMode>,
)
