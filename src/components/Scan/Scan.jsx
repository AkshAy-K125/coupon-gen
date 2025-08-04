import React, { useState, useEffect, useRef } from 'react'
import QrScanner from 'qr-scanner'
import { toggleIsActive } from '../../utils/apiService'
import './Scan.css'

function Scan({ coupons = [], onCouponUpdate }) {
    const [isScanning, setIsScanning] = useState(false)
    const [error, setError] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [modalMessage, setModalMessage] = useState('')
    const [modalType, setModalType] = useState('') // 'success' or 'warning'
    const videoRef = useRef(null)
    const qrScannerRef = useRef(null)

    const validateCoupon = (scannedCode) => {
        const coupon = coupons.find(c => c.code === scannedCode)

        if (!coupon) {
            return {
                valid: false,
                type: 'error',
                message: 'Coupon code not found'
            }
        }

        if (coupon.isActive) {
            return {
                valid: true,
                type: 'success',
                message: `${coupon.name} is allowed for ${coupon.seva}`,
                coupon: coupon
            }
        } else {
            return {
                valid: false,
                type: 'warning',
                message: `${coupon.name} has already used the Coupon for ${coupon.seva}`,
                coupon: coupon
            }
        }
    }

    const handleScanSuccess = async (result) => {
        console.log('QR Code detected:', result.data)

        // Pause scanning while showing modal
        if (qrScannerRef.current) {
            qrScannerRef.current.stop()
        }

        const validation = validateCoupon(result.data)

        if (validation.valid && validation.coupon) {
            // Mark coupon as used
            const updatedCoupon = { ...validation.coupon, isActive: false }
            console.log('Updated coupon:', updatedCoupon)
            await toggleIsActive(updatedCoupon)
            if (onCouponUpdate) {
                onCouponUpdate(updatedCoupon)
            } else {
                console.log('No onCouponUpdate function provided')
            }
        }

        setModalMessage(validation.message)
        setModalType(validation.type)
        setShowModal(true)
    }

    const startScanner = async () => {
        console.log('Starting QR scanner...')
        setError(null)
        setIsLoading(true)

        try {
            // Check if camera is supported
            const hasCamera = await QrScanner.hasCamera()
            if (!hasCamera) {
                throw new Error('No camera found on this device')
            }

            // Create QR Scanner instance
            qrScannerRef.current = new QrScanner(
                videoRef.current,
                handleScanSuccess,
                {
                    returnDetailedScanResult: true,
                    highlightScanRegion: true,
                    highlightCodeOutline: true,
                    preferredCamera: 'environment', // Use back camera
                }
            )

            // Start scanning
            await qrScannerRef.current.start()

            console.log('QR Scanner started successfully')
            setIsLoading(false)
            setIsScanning(true)

        } catch (err) {
            console.error('Scanner initialization error:', err)
            setError(`Failed to start camera: ${err.message}`)
            setIsLoading(false)
            setIsScanning(false)
        }
    }

    const stopScanner = () => {
        if (qrScannerRef.current) {
            qrScannerRef.current.stop()
            qrScannerRef.current.destroy()
            qrScannerRef.current = null
        }
        setIsScanning(false)
    }

    const closeModal = () => {
        setShowModal(false)
        setModalMessage('')
        setModalType('')
        // Resume scanning
        startScanner()
    }

    // Auto-start scanner when component mounts
    useEffect(() => {
        startScanner()

        // Cleanup on unmount
        return () => {
            stopScanner()
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
                <video ref={videoRef} className="qr-video"></video>
            </div>

            {/* Modal for scan results */}
            {showModal && (
                <div className="modal-overlay">
                    <div className={`modal-content ${modalType}`}>
                        <div className="modal-header">
                            <h3>
                                {modalType === 'success' && '✅ Coupon Valid'}
                                {modalType === 'warning' && '⚠️ Coupon Already Used'}
                                {modalType === 'error' && '❌ Invalid Coupon'}
                            </h3>
                        </div>
                        <div className="modal-body">
                            <p>{modalMessage}</p>
                        </div>
                        <div className="modal-footer">
                            <button onClick={closeModal} className="modal-close-btn">
                                Continue Scanning
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Scan 