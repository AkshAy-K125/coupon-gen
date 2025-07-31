import { useState, useEffect } from 'react'
import './App.css'
import gitaData from './data/bhagavadGita.json'
import HamburgerMenu from './components/HamburgerMenu/HamburgerMenu'
import Scan from './components/Scan/Scan'
import Coupon from './components/Coupon/Coupon'
import logo from './assets/Logo.png'
import { generateCouponCode, addCouponToData } from './utils/couponGenerator'
import { generateCouponPDF } from './utils/pdfGenerator'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [gitaQuote, setGitaQuote] = useState('')
  const [loadingQuote, setLoadingQuote] = useState(true)
  const [currentPage, setCurrentPage] = useState('home')
  const [name, setName] = useState('')
  const [sevaType, setSevaType] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')

  // Static credentials
  const STATIC_USERNAME = 'admin'
  const STATIC_PASSWORD = 'password123'

  // Session storage functions
  const setSessionData = (data) => {
    const sessionData = {
      ...data,
      timestamp: Date.now(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours from now
    }
    sessionStorage.setItem('iskconAppSession', JSON.stringify(sessionData))
  }

  const getSessionData = () => {
    try {
      const sessionData = sessionStorage.getItem('iskconAppSession')
      if (!sessionData) return null

      const data = JSON.parse(sessionData)
      const now = Date.now()

      // Check if session has expired
      if (now > data.expiresAt) {
        sessionStorage.removeItem('iskconAppSession')
        return null
      }

      return data
    } catch (error) {
      console.error('Error reading session data:', error)
      sessionStorage.removeItem('iskconAppSession')
      return null
    }
  }

  const clearSessionData = () => {
    sessionStorage.removeItem('iskconAppSession')
  }

  // Function to get random quote from local data
  const getRandomGitaQuote = () => {
    const chapters = Object.keys(gitaData.chapters)
    const randomChapter = chapters[Math.floor(Math.random() * chapters.length)]
    const chapterData = gitaData.chapters[randomChapter]
    const verses = chapterData.verses
    const randomVerse = verses[Math.floor(Math.random() * verses.length)]

    return {
      translation: randomVerse.translation,
      chapter: parseInt(randomChapter),
      verse: randomVerse.verse
    }
  }

  // Fetch Bhagavad Gita quote from local data
  const fetchGitaQuote = async () => {
    setLoadingQuote(true)
    try {
      // Simulate loading delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500))

      const quote = getRandomGitaQuote()
      console.log('Random Quote:', quote)
      setGitaQuote(quote)
    } catch (error) {
      console.error('Error loading quote:', error)
      // Fallback quote on error
      setGitaQuote({
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

  // Check for existing session on app load
  useEffect(() => {
    const sessionData = getSessionData()
    if (sessionData) {
      setIsLoggedIn(true)
      setUsername(sessionData.username)
      setPassword(sessionData.password)
    }
  }, [])

  const handleLogin = (e) => {
    e.preventDefault()
    setError('')

    if (username === STATIC_USERNAME && password === STATIC_PASSWORD) {
      setIsLoggedIn(true)
      setSessionData({ username, password })
    } else {
      setError('Invalid username or password')
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUsername('')
    setPassword('')
    setError('')
    setCurrentPage('home')
    clearSessionData()
    // Fetch new quote when logging out
    fetchGitaQuote()
  }

  const handleNavigation = (page) => {
    setCurrentPage(page)
  }

  const handleNameSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setSubmitMessage('Please enter a name')
      return
    }

    if (!sevaType) {
      setSubmitMessage('Please select a seva type')
      return
    }

    setIsSubmitting(true)
    setSubmitMessage('')

    try {
      // Generate unique coupon code
      const couponCode = generateCouponCode(name.trim())
      
      // Add coupon to data (in real app, this would save to database)
      const newCoupon = addCouponToData(couponCode, name.trim())
      
      // Generate and download PDF
      const pdfGenerated = await generateCouponPDF(name.trim(), couponCode, sevaType || '1')
      
      if (pdfGenerated) {
        setSubmitMessage(`Hare Krishna! Coupon generated successfully for ${name.trim()}. PDF downloaded.`)
        setName('')
      } else {
        setSubmitMessage(`Hare Krishna! Thank you ${name.trim()}. Coupon: ${couponCode}`)
        setName('')
      }

    } catch (error) {
      console.error('Error generating coupon:', error)
      setSubmitMessage(`Hare Krishna! Thank you ${name.trim()}`)
      setName('')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Render different pages based on currentPage
  const renderPage = () => {
    if (!isLoggedIn) {
      return (
        <div className="app">
          <div className="login-container">
            <div className="login-header">
              <img src={logo} alt="ISKCON Logo" className="login-logo" />
              <h1>ISKCON Shri Jagannath Mandir</h1>
              <p>Kudupu Katte, Mangaluru</p>
            </div>
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
          </div>
        </div>
      )
    }

    // Render different pages when logged in
    switch (currentPage) {
      case 'scan':
        return <Scan />
      case 'coupons':
        return <Coupon />
      case 'home':
      default:
        return (
          <div className="app">
            <div className="hi-page">
              <form onSubmit={handleNameSubmit} className="name-form">
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isSubmitting}
                    className="name-input"
                  />
                </div>
                <select 
                  name="service" 
                  id="service" 
                  value={sevaType} 
                  onChange={(e) => setSevaType(e.target.value)}
                  className="seva-select"
                >
                  <option value="" disabled>Select Seva</option>
                  <option value="1">Puja</option>
                  <option value="2">Prasadam</option>
                  <option value="3">Other</option>
                </select>
                <div className="landing-coupon-section">
                  <h3>Click below to generate coupon code</h3>
                  <button
                    type="submit"
                    className="hare-krishna-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Generating Coupon...' : 'Generate Coupon'}
                  </button>
                </div>
                {submitMessage && (
                  <div className={`submit-message ${submitMessage.includes('Thank you') ? 'success' : 'error'}`}>
                    {submitMessage}
                  </div>
                )}
              </form>
              <div className="gita-quote">
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
  }

  return (
    <>
      {isLoggedIn && (
        <HamburgerMenu
          onNavigate={handleNavigation}
          currentPage={currentPage}
          onLogout={handleLogout}
        />
      )}
      {renderPage()}
    </>
  )
}

export default App
