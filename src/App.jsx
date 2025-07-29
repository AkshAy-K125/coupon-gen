import { useState } from 'react'
import './App.css'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  // Static credentials
  const STATIC_USERNAME = 'admin'
  const STATIC_PASSWORD = 'password123'

  const handleLogin = (e) => {
    e.preventDefault()
    setError('')

    if (username === STATIC_USERNAME && password === STATIC_PASSWORD) {
      setIsLoggedIn(true)
    } else {
      setError('Invalid username or password')
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUsername('')
    setPassword('')
    setError('')
  }

  if (isLoggedIn) {
    return (
      <div className="app">
        <div className="hi-page">
          <h1>Hi!</h1>
          <p>Welcome to the application</p>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <div className="login-container">
        <h1>Login</h1>
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="error">{error}</div>}
          <button type="submit" className="login-btn">
            Login
          </button>
        </form>
        <div className="credentials-info">
          <p><strong>Static Credentials:</strong></p>
          <p>Username: admin</p>
          <p>Password: password123</p>
        </div>
      </div>
    </div>
  )
}

export default App
