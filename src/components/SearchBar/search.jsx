import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import SearchResults from './components/SearchBar/SearchResults'

// Add style to make sure no extra elements appear
const style = document.createElement('style')
style.textContent = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  body {
    background-color: transparent !important;
    overflow: visible;
  }
`
document.head.appendChild(style)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SearchResults standalone={true} />
  </StrictMode>
)