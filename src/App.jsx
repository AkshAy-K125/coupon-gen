import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [gitaQuote, setGitaQuote] = useState('')
  const [loadingQuote, setLoadingQuote] = useState(true)

  // Static credentials
  const STATIC_USERNAME = 'admin'
  const STATIC_PASSWORD = 'password123'

  // Fetch Bhagavad Gita quote
  const fetchGitaQuote = async () => {
    setLoadingQuote(true)
    try {
      const response = await fetch('https://bhagavadgitaapi.in/slok/2/47')

      if (response.ok) {
        const data = await response.json()
        setGitaQuote(data)
      } else {
        // Fallback if API fails
        setGitaQuote({
          slok: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥",
          translation: "You have the right to work only, but never to its fruits. Let not the fruits of action be your motive, nor let your attachment be to inaction.",
          chapter: 2,
          verse: 47
        })
      }
    } catch (error) {
      console.error('Error fetching Gita quote:', error)
      // Fallback quote on error
      setGitaQuote({
        slok: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥",
        translation: "You have the right to work only, but never to its fruits. Let not the fruits of action be your motive, nor let your attachment be to inaction.",
        chapter: 2,
        verse: 47
      })
    } finally {
      setLoadingQuote(false)
    }
  }

  useEffect(() => {
    fetchGitaQuote()
  }, [])

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
    // Fetch new quote when logging out
    fetchGitaQuote()
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
        <div className="gita-quote">
          <h3>Bhagavad Gita Wisdom</h3>
          {loadingQuote ? (
            <div className="loading">Loading wisdom...</div>
          ) : (
            <>
              <div className="quote-translation">"{gitaQuote.translation}"</div>
              <div className="quote-reference">Chapter {gitaQuote.chapter}, Verse {gitaQuote.verse}</div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
