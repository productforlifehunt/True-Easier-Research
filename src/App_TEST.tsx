import React from 'react'

function App() {
  console.log('🚀 MINIMAL APP COMPONENT RENDERING')
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: 'white',
      display: 'flex',
      alignItems: 'center', 
      justifyContent: 'center',
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#333'
    }}>
      ✅ REACT APP IS WORKING!
    </div>
  )
}

export default App
