import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// REMOVEMOS a linha do index.css para não dar erro no Vercel
// O estilo já é garantido pelo Tailwind no index.html

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)