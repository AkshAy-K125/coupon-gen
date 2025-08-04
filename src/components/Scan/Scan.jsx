import React, { useState, useEffect, useRef } from 'react'
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode'
import './Scan.css'

function Scan() {
    const [isScanning, setIsScanning] = useState(false)
    const [permissionGranted, setPermissionGranted] = useState(false)
    const [error, setError] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const html5QrcodeScannerRef = useRef(null)

    const handleScanSuccess = (decodedText) => {
        console.log('QR Code detected:', decodedText)
        alert(`QR Code scanned: ${decodedText}`)
    }

    const handleScanError = (errorMessage) => {
        // Ignore scanning errors, only log them
        console.log('Scan error:', errorMessage)
    }

    const startScanner = async () => {
        console.log('Starting scanner...')
        setError(null)
        setIsLoading(true)

        try {
            if (html5QrcodeScannerRef.current) {
                await html5QrcodeScannerRef.current.clear()
            }

            const config = {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0,
                supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
                videoConstraints: {
                    facingMode: 'environment'
                }
            }

            console.log('Creating scanner with config:', config)
            html5QrcodeScannerRef.current = new Html5QrcodeScanner("qr-reader", config, false)

            console.log('Rendering scanner...')
            html5QrcodeScannerRef.current.render(
                (decodedText) => {
                    console.log('Scanner started successfully')
                    setIsLoading(false)
                    setIsScanning(true)
                    setPermissionGranted(true)
                    handleScanSuccess(decodedText)
                },
                (error) => {
                    console.log('Scan error (normal):', error)
                    handleScanError(error)
                }
            )

            // Give scanner time to initialize
            setTimeout(() => {
                if (isLoading) {
                    console.log('Scanner initialized')
                    setIsLoading(false)
                    setIsScanning(true)
                    setPermissionGranted(true)
                }
            }, 2000)

        } catch (err) {
            console.error('Scanner initialization error:', err)
            setError(`Failed to start camera: ${err.message}`)
            setIsLoading(false)
            setIsScanning(false)
        }
    }

    const stopScanner = () => {
        if (html5QrcodeScannerRef.current) {
            html5QrcodeScannerRef.current.clear()
            html5QrcodeScannerRef.current = null
        }
        setIsScanning(false)
        setPermissionGranted(false)
    }

    // Auto-start scanner when component mounts
    useEffect(() => {
        startScanner()

        // Cleanup on unmount
        return () => {
            if (html5QrcodeScannerRef.current) {
                html5QrcodeScannerRef.current.clear()
            }
        }
    }, [])

    return (
        <div className="scan-page">
            {isLoading && (
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Starting camera...</p>
                </div>
            )}

            {error && (
                <div className="error-state">
                    <h3>❌ Camera Error</h3>
                    <p>{error}</p>
                    <button onClick={() => {
                        setError(null)
                        startScanner()
                    }}>
                        Try Again
                    </button>
                </div>
            )}

            <div className="scanner-container" style={{ display: isLoading || error ? 'none' : 'flex' }}>
                <div id="qr-reader"></div>
            </div>
        </div>
    )
}

export default Scan 