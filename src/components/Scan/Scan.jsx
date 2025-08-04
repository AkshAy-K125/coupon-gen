import React, { useState, useEffect, useRef } from 'react'
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode'
import './Scan.css'

function Scan({ coupons = [] }) {
    const [isScanning, setIsScanning] = useState(false)
    const [scanResult, setScanResult] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [cameraError, setCameraError] = useState(null)
    const [permissionStatus, setPermissionStatus] = useState('prompt') // 'granted', 'denied', 'prompt'
    const scannerRef = useRef(null)
    const html5QrcodeScannerRef = useRef(null)

    const validateCoupon = (code) => {
        const coupon = coupons.find(c => c.code === code)
        if (!coupon) {
            return { valid: false, message: 'Coupon code not found' }
        }
        if (!coupon.isActive) {
            return { valid: false, message: 'Coupon is inactive' }
        }
        const today = new Date()
        const validUntil = new Date(coupon.validUntil)
        if (today > validUntil) {
            return { valid: false, message: 'Coupon has expired' }
        }
        return { valid: true, coupon }
    }

    const handleScanSuccess = (decodedText) => {
        console.log('QR Code detected:', decodedText)
        setIsScanning(false)
        setIsLoading(true)

        // Stop the scanner
        if (html5QrcodeScannerRef.current) {
            html5QrcodeScannerRef.current.clear()
        }

        // Simulate API call delay
        setTimeout(() => {
            setIsLoading(false)
            const validation = validateCoupon(decodedText)

            if (validation.valid) {
                setScanResult(validation.coupon)
            } else {
                setError(validation.message)
            }
        }, 1000)
    }

    const handleScanError = (errorMessage) => {
        // Ignore errors during scanning, only log them
        console.log('Scan error:', errorMessage)
    }

    // Check if we're on HTTPS (required for camera access on mobile)
    const checkHTTPS = () => {
        return location.protocol === 'https:' || location.hostname === 'localhost'
    }

    // Check basic requirements (no actual camera access)
    const checkBasicRequirements = () => {
        try {
            // Check if mediaDevices is supported
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Camera API not supported in this browser')
            }

            // Check if we're on HTTPS
            if (!checkHTTPS()) {
                throw new Error('Camera access requires HTTPS connection')
            }

            return true
        } catch (error) {
            console.error('Basic requirements check failed:', error)
            setPermissionStatus('denied')

            if (error.message.includes('HTTPS')) {
                setCameraError('Camera access requires a secure HTTPS connection.')
            } else {
                setCameraError(error.message || 'Browser does not support camera access.')
            }

            return false
        }
    }

    const startScanner = async () => {
        if (html5QrcodeScannerRef.current) {
            html5QrcodeScannerRef.current.clear()
        }

        setCameraError(null)
        setScanResult(null)
        setError(null)
        setIsLoading(true)

        // Check basic requirements (no camera access yet)
        if (!checkBasicRequirements()) {
            setIsLoading(false)
            return
        }

        const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
            // Add more specific camera constraints
            videoConstraints: {
                facingMode: 'environment' // Use rear camera on mobile
            }
        }

        try {
            html5QrcodeScannerRef.current = new Html5QrcodeScanner(
                "qr-reader",
                config,
                false
            )

            // Add timeout for scanner initialization
            const initTimeout = setTimeout(() => {
                if (!isScanning) {
                    setCameraError('Camera initialization timed out. Please try again.')
                    setIsLoading(false)
                    setIsScanning(false)
                    setPermissionStatus('denied')
                }
            }, 10000) // 10 second timeout

            // Let Html5QrcodeScanner handle permissions directly
            html5QrcodeScannerRef.current.render(
                (decodedText) => {
                    clearTimeout(initTimeout)
                    handleScanSuccess(decodedText)
                },
                (errorMessage) => {
                    // Clear timeout on any error
                    clearTimeout(initTimeout)
                    handleScanError(errorMessage)
                }
            )

            // Set states after render call
            setIsScanning(true)
            setIsLoading(false)
            setPermissionStatus('granted')

        } catch (err) {
            console.error('Scanner initialization error:', err)
            setIsLoading(false)
            setIsScanning(false)
            setPermissionStatus('denied')

            // More specific error handling
            if (err.message && (err.message.includes('Permission') || err.message.includes('NotAllowed'))) {
                setCameraError('Camera permission denied. Please allow camera access and try again.')
            } else if (err.message && (err.message.includes('NotFound') || err.message.includes('No camera'))) {
                setCameraError('No camera found on this device.')
            } else if (err.message && err.message.includes('NotSupported')) {
                setCameraError('Camera is not supported in this browser.')
            } else if (err.message && err.message.includes('initialise')) {
                setCameraError('Failed to initialize camera. Please refresh the page and try again.')
            } else {
                setCameraError(err.message || 'Failed to initialize camera. Please check permissions and try again.')
            }
        }
    }

    const stopScanner = () => {
        if (html5QrcodeScannerRef.current) {
            html5QrcodeScannerRef.current.clear()
            html5QrcodeScannerRef.current = null
        }
        setIsScanning(false)
    }

    const handleStartScan = () => {
        startScanner()
    }

    const handleStopScan = () => {
        stopScanner()
    }

    const handleReset = () => {
        setScanResult(null)
        setError(null)
        setIsLoading(false)
        setCameraError(null)
        setPermissionStatus('prompt')
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    // Check basic requirements on component mount
    useEffect(() => {
        const checkInitialRequirements = () => {
            // Only check HTTPS and basic browser support on mount
            checkBasicRequirements()
        }

        checkInitialRequirements()
    }, [])

    // Cleanup on component unmount
    useEffect(() => {
        return () => {
            if (html5QrcodeScannerRef.current) {
                html5QrcodeScannerRef.current.clear()
            }
        }
    }, [])

    return (
        <div className="scan-page">
            <h1>QR Code Scanner</h1>
            <p>Scan a QR code to validate your coupon</p>
            <div className="test-link">
                <a href="/qr-test.html" target="_blank" rel="noopener noreferrer">
                    📱 Open QR Test Page (for testing)
                </a>
            </div>

            <div className="scanner-container">
                {!isScanning && !scanResult && !error ? (
                    <div className="scanner-placeholder">
                        <div className="camera-preview">
                            <div className="camera-frame">
                                <div className="scan-overlay">
                                    <div className="corner top-left"></div>
                                    <div className="corner top-right"></div>
                                    <div className="corner bottom-left"></div>
                                    <div className="corner bottom-right"></div>
                                    <div className="scan-line"></div>
                                </div>
                                <div className="camera-text">Camera Preview</div>
                            </div>
                        </div>
                        <button
                            className="scan-btn"
                            onClick={handleStartScan}
                            disabled={isLoading || permissionStatus === 'denied'}
                        >
                            {isLoading ? 'Checking Permissions...' :
                                permissionStatus === 'denied' ? 'Camera Access Required' :
                                    'Start Scanning'}
                        </button>
                    </div>
                ) : isScanning ? (
                    <div className="scanner-active">
                        <div className="qr-scanner-container">
                            <div id="qr-reader"></div>
                        </div>
                        <button
                            className="stop-btn"
                            onClick={handleStopScan}
                        >
                            Stop Scanning
                        </button>
                    </div>
                ) : null}
            </div>

            {cameraError && (
                <div className="scan-result error">
                    <div className="result-header">
                        <h3>❌ Camera Access Issue</h3>
                    </div>
                    <div className="result-content">
                        <div className="error-message">
                            <p><strong>{cameraError}</strong></p>

                            {cameraError.includes('denied') && (
                                <div className="permission-help">
                                    <h4>To enable camera access:</h4>
                                    <ul>
                                        <li><strong>Chrome/Safari:</strong> Look for the camera icon in the address bar and click "Allow"</li>
                                        <li><strong>Firefox:</strong> Click the shield icon and enable camera permissions</li>
                                        <li><strong>Mobile:</strong> Check your browser settings and allow camera access for this site</li>
                                    </ul>
                                </div>
                            )}

                            {cameraError.includes('HTTPS') && (
                                <div className="permission-help">
                                    <p>Camera access requires a secure connection. Please access this site via HTTPS.</p>
                                </div>
                            )}
                        </div>
                        <button className="reset-btn" onClick={handleReset}>
                            Try Again
                        </button>
                    </div>
                </div>
            )}

            {isLoading && (
                <div className="loading-result">
                    <div className="loading-spinner"></div>
                    <p>Validating coupon...</p>
                </div>
            )}

            {scanResult && !isLoading && (
                <div className="scan-result success">
                    <div className="result-header">
                        <h3>✅ Valid Coupon Found!</h3>
                        <div className="coupon-code">{scanResult.code}</div>
                    </div>
                    <div className="result-content">
                        <div className="coupon-details">
                            <div className="detail-row">
                                <span className="label">Discount:</span>
                                <span className="value discount">{scanResult.discount}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Valid Until:</span>
                                <span className="value">{formatDate(scanResult.validUntil)}</span>
                            </div>
                        </div>

                        <div className="user-details">
                            <h4>Customer Information</h4>
                            <div className="detail-row">
                                <span className="label">Name:</span>
                                <span className="value">{scanResult.user.name}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Email:</span>
                                <span className="value">{scanResult.user.email}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Phone:</span>
                                <span className="value">{scanResult.user.phone}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Member Since:</span>
                                <span className="value">{formatDate(scanResult.user.memberSince)}</span>
                            </div>
                        </div>

                        <button className="reset-btn" onClick={handleReset}>
                            Scan Another Coupon
                        </button>
                    </div>
                </div>
            )}

            {error && !isLoading && (
                <div className="scan-result error">
                    <div className="result-header">
                        <h3>❌ Invalid Coupon</h3>
                    </div>
                    <div className="result-content">
                        <div className="error-message">
                            <p>{error}</p>
                        </div>
                        <button className="reset-btn" onClick={handleReset}>
                            Try Again
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Scan 