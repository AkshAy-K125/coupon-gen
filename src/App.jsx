import { useState, useEffect } from 'react'
import './App.css'
import gitaData from './data/bhagavadGita.json'
import HamburgerMenu from './components/HamburgerMenu/HamburgerMenu'
import Scan from './components/Scan/Scan'
import Coupon from './components/Coupon/Coupon'
import logo from './assets/Logo.png'
import { generateCouponCode, addCouponToData } from './utils/couponGenerator'
import { generateCouponPDF } from './utils/pdfGenerator'
import couponData from './data/coupons.json'

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
  const [coupons, setCoupons] = useState([])

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

  // Function to save coupons to local storage (for persistence across sessions)
  const saveCouponsToStorage = (updatedCoupons) => {
    try {
      localStorage.setItem('iskconCoupons', JSON.stringify(updatedCoupons))
    } catch (error) {
      console.error('Error saving coupons to storage:', error)
    }
  }

  // Function to load coupons from local storage
  const loadCouponsFromStorage = () => {
    try {
      const storedCoupons = localStorage.getItem('iskconCoupons')
      if (storedCoupons) {
        return JSON.parse(storedCoupons)
      }
    } catch (error) {
      console.error('Error loading coupons from storage:', error)
    }
    return couponData.coupons // Fallback to JSON file
  }

  // Initialize coupons from local storage or local data
  useEffect(() => {
    const storedCoupons = loadCouponsFromStorage()
    setCoupons(storedCoupons)
  }, [])

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

  // Function to clear all coupons (for testing)
  const clearAllCoupons = () => {
    setCoupons([])
    saveCouponsToStorage([])
    setSubmitMessage('All coupons cleared for testing')
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
      // Generate unique coupon code using existing coupons
      const couponCode = generateCouponCode(name.trim(), coupons)
      
      // Add coupon to data with duplicate prevention
      const result = addCouponToData(couponCode, name.trim(), sevaType, coupons)
      
      // Check if there's an error (same name and seva or incomplete name)
      if (result.error) {
        setSubmitMessage(`Error: ${result.message}`)
        setIsSubmitting(false)
        // Don't clear the form on error so user can see what they entered
        return
      }
      
      // Add the new coupon to the state immediately
      const updatedCoupons = [...coupons, result.coupon]
      setCoupons(updatedCoupons)
      
      // Save to local storage for persistence
      saveCouponsToStorage(updatedCoupons)
      
      // Generate and download PDF
      const pdfGenerated = await generateCouponPDF(result.coupon.user.name, couponCode, sevaType)
      
      let message = `Hare Krishna! Coupon generated successfully for ${result.coupon.user.name}.`
      
      // Add warning if name was modified
      if (result.warning) {
        message += ` ${result.warning}`
      }
      
      if (pdfGenerated) {
        message += ' PDF downloaded.'
      }
      
      setSubmitMessage(message)
      setName('')

    } catch (error) {
      console.error('Error generating coupon:', error)
      setSubmitMessage(`Hare Krishna! Thank you ${name.trim()}`)
      setName('')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Function to handle coupon deletion
  const handleCouponDelete = (id) => {
    const updatedCoupons = coupons.filter(coupon => coupon.code !== id)
    setCoupons(updatedCoupons)
    saveCouponsToStorage(updatedCoupons)
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
        return <Scan coupons={coupons} />
      case 'coupons':
        return <Coupon coupons={coupons} onDeleteCoupon={handleCouponDelete} />
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
                    onChange={(e) => {
                      setName(e.target.value)
                      // Clear error message when user starts typing
                      if (submitMessage.includes('Error:')) {
                        setSubmitMessage('')
                      }
                    }}
                    disabled={isSubmitting}
                    className="name-input"
                    title="Please enter your complete name"
                  />
                </div>
                <select 
                  name="seva" 
                  id="seva" 
                  value={sevaType} 
                  onChange={(e) => {
                    setSevaType(e.target.value)
                    // Clear error message when user changes seva
                    if (submitMessage.includes('Error:')) {
                      setSubmitMessage('')
                    }
                  }}
                  className="seva-select"
                >
                  <option value="" disabled>Select Seva</option>
                  <option value="1">ABHISHEKAM SEVA</option>
                  <option value="2">MAHA ARATHI SEVA</option>
                  <option value="3">JHULAN SEVA</option>
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
                  <div className={`submit-message ${submitMessage.includes('Error:') ? 'error' : 'success'}`}>
                    {submitMessage.includes('Error:') && <span style={{ marginRight: '8px' }}>⚠️</span>}
                    {submitMessage}
                  </div>
                )}

              </form>
              <div className="gita-quote">
                {loadingQuote ? (
                  <div className="loading">Loading wisdom...</div>
                ) : (
                  <>
                    <div className="quote-translation">"Whatever you do, whatever you eat, whatever you offer in sacrifice, whatever you give away, and whatever austerities you perform, O son of Kunti, offer it all to Me"</div>
                    <div className="quote-reference">Chapter 9, Verse 27</div>
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
