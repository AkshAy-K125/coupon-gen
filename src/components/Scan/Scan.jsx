import React, { useState } from 'react'
import './Scan.css'

function Scan() {
    const [isScanning, setIsScanning] = useState(false)
    const [scanResult, setScanResult] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleStartScan = () => {
        setIsScanning(true)
        setScanResult('')
        // Simulate QR code scanning
        setTimeout(() => {
            setIsScanning(false)
            setIsLoading(true)
            // Simulate API call delay
            setTimeout(() => {
                setIsLoading(false)
                setScanResult('Sample QR Code Result - PDF file would be returned here')
            }, 2000)
        }, 3000)
    }

    const handleStopScan = () => {
        setIsScanning(false)
    }

    return (
        <div className="scan-page">
            <h1>QR Code Scanner</h1>
            <p>Scan a QR code to get your PDF file</p>

            <div className="scanner-container">
                {!isScanning ? (
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
                ) : (
                    <div className="scanner-active">
                        <div className="camera-preview active">
                            <div className="camera-frame">
                                <div className="scan-overlay">
                                    <div className="corner top-left"></div>
                                    <div className="corner top-right"></div>
                                    <div className="corner bottom-left"></div>
                                    <div className="corner bottom-right"></div>
                                    <div className="scan-line scanning"></div>
                                </div>
                                <div className="camera-text">Scanning...</div>
                            </div>
                        </div>
                        <button
                            className="stop-btn"
                            onClick={handleStopScan}
                        >
                            Stop Scanning
                        </button>
                    </div>
                )}
            </div>

            {isLoading && (
                <div className="loading-result">
                    <div className="loading-spinner"></div>
                    <p>Processing QR code...</p>
                </div>
            )}

            {scanResult && !isLoading && (
                <div className="scan-result">
                    <h3>Scan Result</h3>
                    <div className="result-content">
                        <p>{scanResult}</p>
                        <button className="download-btn">
                            Download PDF
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Scan 