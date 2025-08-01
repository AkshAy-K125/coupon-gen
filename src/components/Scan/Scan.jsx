import React, { useState, useEffect, useRef } from 'react'
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode'
import './Scan.css'

function Scan({ coupons = [] }) {
    const [isScanning, setIsScanning] = useState(false)
    const [scanResult, setScanResult] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [cameraError, setCameraError] = useState(null)
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

    const startScanner = () => {
        if (html5QrcodeScannerRef.current) {
            html5QrcodeScannerRef.current.clear()
        }

        setCameraError(null)
        setIsScanning(true)
        setScanResult(null)
        setError(null)

        const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
        }

        try {
            html5QrcodeScannerRef.current = new Html5QrcodeScanner(
                "qr-reader",
                config,
                false
            )

            html5QrcodeScannerRef.current.render(handleScanSuccess, handleScanError)
        } catch (err) {
            console.error('Scanner initialization error:', err)
            setCameraError('Failed to initialize camera. Please check permissions.')
            setIsScanning(false)
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
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

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
                            disabled={isLoading}
                        >
                            Start Scanning
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
                        <h3>❌ Camera Error</h3>
                    </div>
                    <div className="result-content">
                        <div className="error-message">
                            <p>{cameraError}</p>
                            <p>Please allow camera permissions and try again.</p>
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