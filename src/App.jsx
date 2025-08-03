import { useState, useEffect } from 'react'
import './App.css'
import gitaData from './data/bhagavadGita.json'
import HamburgerMenu from './components/HamburgerMenu/HamburgerMenu'
import Scan from './components/Scan/Scan'
import Coupon from './components/Coupon/Coupon'
import logo from './assets/Logo.png'
import { generateCouponCode, addCouponToData, addCouponFromServerData, sevaNameToCode, sevaCodeToName } from './utils/couponGenerator'
import { generateCouponPDF } from './utils/pdfGenerator'
import { loginCheck, addCoupon, getCoupons } from './utils/apiService'
import couponData from './data/coupons.json'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [gitaQuote, setGitaQuote] = useState('')
  const [loadingQuote, setLoadingQuote] = useState(true)
  const [currentPage, setCurrentPage] = useState('home')
  const [name, setName] = useState('')
  const [sevaType, setSevaType] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')
  const [coupons, setCoupons] = useState([])
  const [serverData, setServerData] = useState([])
  const [showServerDataSection, setShowServerDataSection] = useState(false)
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(false)



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

  // Function to load coupons from server and update local storage
  const loadCouponsFromServer = async (forceReload = false) => {
    // Prevent multiple simultaneous loads
    if (isLoadingCoupons && !forceReload) {
      console.log('Already loading coupons, skipping...')
      return
    }

    setIsLoadingCoupons(true)

    try {
      console.log('Loading coupons from server...')
      const response = await getCoupons()

      if (response && response.couponData && Array.isArray(response.couponData)) {
        console.log('Coupons loaded from server:', response.couponData.length)

        // Update local storage with server data
        saveCouponsToStorage(response.couponData)

        // Update state (always set, even if empty array)
        setCoupons(response.couponData)
        console.log('State updated with server data:', response.couponData.length, 'coupons')
        return response.couponData
      } else {
        console.log('Invalid response from server, falling back to local storage')
        const localCoupons = loadCouponsFromStorage()
        console.log('Loaded from localStorage:', localCoupons.length, 'coupons')
        setCoupons(localCoupons)
        return localCoupons
      }
    } catch (error) {
      console.error('Error loading coupons from server:', error)
      console.log('Falling back to local storage due to server error')

      // Fallback to local storage but don't clear existing state if localStorage is empty
      const localCoupons = loadCouponsFromStorage()
      console.log('Fallback loaded:', localCoupons.length, 'coupons')

      // Only update state if we have local data or if current state is empty
      if (localCoupons.length > 0 || coupons.length === 0) {
        setCoupons(localCoupons)
      } else {
        console.log('Keeping existing state to prevent data loss')
      }

      return localCoupons
    } finally {
      setIsLoadingCoupons(false)
    }
  }

  // Function to manually refresh coupon data
  const refreshCoupons = async () => {
    console.log('Manual refresh requested')
    setSubmitMessage('Refreshing coupon data...')
    await loadCouponsFromServer(true)
    setSubmitMessage('Coupon data refreshed')
    setTimeout(() => setSubmitMessage(''), 2000)
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

  // Load coupons when user logs in and when landing page renders
  useEffect(() => {
    if (isLoggedIn && coupons.length === 0) {
      console.log('Loading initial coupon data...')
      loadCouponsFromServer()
    }
  }, [isLoggedIn])

  // Also load coupons on app startup if session exists
  useEffect(() => {
    const sessionData = getSessionData()
    if (sessionData && coupons.length === 0) {
      console.log('Loading coupons from existing session...')
      loadCouponsFromServer()
    }
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoggingIn(true)

    try {
      const result = await loginCheck(username, password)

      if (result.authentication == 200) {
        setIsLoggedIn(true)
        setSessionData({ username, password })

        // Load coupons immediately after successful login
        console.log('Login successful, loading coupons...')
        loadCouponsFromServer()
      } else {
        setError('Invalid username or password')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('Login failed. Please check your connection and try again.')
    } finally {
      setIsLoggingIn(false)
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

  // Function to process server data and generate coupons
  const processServerData = (serverDataArray) => {
    if (!Array.isArray(serverDataArray)) {
      setSubmitMessage('Error: Invalid server data format')
      return
    }

    let successCount = 0
    let errorCount = 0
    const errors = []

    const newCoupons = []

    serverDataArray.forEach((serverItem, index) => {
      try {
        const result = addCouponFromServerData(serverItem, [...coupons, ...newCoupons])

        if (result.error) {
          errorCount++
          errors.push(`Item ${index + 1} (${serverItem.name}): ${result.message}`)
        } else {
          successCount++
          newCoupons.push(result.coupon)
        }
      } catch (error) {
        errorCount++
        errors.push(`Item ${index + 1}: ${error.message}`)
      }
    })

    if (newCoupons.length > 0) {
      const updatedCoupons = [...coupons, ...newCoupons]
      setCoupons(updatedCoupons)
      saveCouponsToStorage(updatedCoupons)

      // Try to sync with server
      newCoupons.forEach(async (coupon) => {
        try {
          await addCoupon(coupon, coupon.user.name, coupon.seva)
        } catch (error) {
          console.error('Error syncing coupon to server:', error)
        }
      })
    }

    let message = `Server data processed: ${successCount} successful, ${errorCount} errors`
    if (errors.length > 0) {
      message += `\n\nErrors:\n${errors.join('\n')}`
    }

    setSubmitMessage(message)
  }

  // Function to handle manual server data input
  const handleServerDataSubmit = (e) => {
    e.preventDefault()

    if (!serverData || serverData.length === 0) {
      setSubmitMessage('No server data to process')
      return
    }

    processServerData(serverData)
    setServerData([])
    setShowServerDataSection(false)
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

      // Add the new coupon to the state and localStorage immediately
      const updatedCoupons = [...coupons, result.coupon]
      setCoupons(updatedCoupons)
      saveCouponsToStorage(updatedCoupons)

      // Try to sync with server (but don't roll back on failure)
      try {
        await addCoupon(result.coupon, name.trim(), sevaType)
        console.log('Coupon synced to server successfully')
      } catch (error) {
        console.error('Error syncing coupon to server:', error)
        // Don't remove from local storage - keep the coupon locally
        console.log('Coupon kept locally despite server sync failure')
      }

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

  // Function to handle coupon deletion - called after server deletion succeeds
  const handleCouponDelete = (couponCode, userName) => {
    console.log('Deleting coupon locally:', couponCode, userName)

    // Remove from local state
    const updatedCoupons = coupons.filter(coupon => coupon.code !== couponCode)
    console.log('Updated coupons after deletion:', updatedCoupons.length)

    // Update state and localStorage
    setCoupons(updatedCoupons)
    saveCouponsToStorage(updatedCoupons)

    // Show success message
    setSubmitMessage(`Coupon ${couponCode} for ${userName} deleted successfully`)
    setTimeout(() => setSubmitMessage(''), 3000)
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
                  disabled={isLoggingIn}
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
                  disabled={isLoggingIn}
                  required
                />
              </div>
              {error && <div className="error">{error}</div>}
              <button type="submit" className="login-btn" disabled={isLoggingIn}>
                {isLoggingIn ? 'Logging in...' : 'Login'}
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

              {/* Server Data Section */}
              <div className="server-data-section" style={{ marginTop: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                <button
                  onClick={() => setShowServerDataSection(!showServerDataSection)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginBottom: '10px'
                  }}
                >
                  {showServerDataSection ? 'Hide' : 'Show'} Server Data Import
                </button>

                {showServerDataSection && (
                  <div>
                    <h4>Import Server Data</h4>
                    <p style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
                      Paste server data array in JSON format:
                    </p>
                    <textarea
                      placeholder='[{"name": "AKSHAY K", "id": "636493414012", "seva": "MAHA ARATHI SEVA", "date": "2025-08-02", "status": true}]'
                      value={JSON.stringify(serverData, null, 2)}
                      onChange={(e) => {
                        try {
                          const parsed = JSON.parse(e.target.value)
                          setServerData(parsed)
                        } catch (error) {
                          // Keep the raw text for user to fix
                          console.log('Invalid JSON, keeping raw text')
                        }
                      }}
                      style={{
                        width: '100%',
                        height: '120px',
                        padding: '8px',
                        fontSize: '12px',
                        fontFamily: 'monospace',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        marginBottom: '10px'
                      }}
                    />
                    <button
                      onClick={handleServerDataSubmit}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Process Server Data
                    </button>
                    <button
                      onClick={() => {
                        // Auto-fill with the provided sample data
                        const sampleData = [
                          {
                            "name": "AKSHAY K",
                            "id": "636493414012",
                            "seva": "MAHA ARATHI SEVA",
                            "date": "2025-08-02",
                            "status": true
                          },
                          {
                            "name": "AKSHAY K",
                            "id": "275398578847",
                            "seva": "JHULAN SEVA",
                            "date": "2025-08-02",
                            "status": true
                          }
                        ]
                        setServerData(sampleData)
                      }}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#FF9800',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginLeft: '10px'
                      }}
                    >
                      Load Sample Data
                    </button>
                    <button
                      onClick={refreshCoupons}
                      disabled={isLoadingCoupons}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#9C27B0',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: isLoadingCoupons ? 'not-allowed' : 'pointer',
                        marginLeft: '10px',
                        opacity: isLoadingCoupons ? 0.6 : 1
                      }}
                    >
                      {isLoadingCoupons ? 'Refreshing...' : 'Refresh Coupons'}
                    </button>
                  </div>
                )}
              </div>
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
