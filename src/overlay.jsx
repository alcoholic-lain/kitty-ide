import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/theme.css'
import SearchResults from './components/SearchBar/SearchResults'

createRoot(document.getElementById('overlay-root')).render(
  <StrictMode>
    <SearchResults />
  </StrictMode>,
)