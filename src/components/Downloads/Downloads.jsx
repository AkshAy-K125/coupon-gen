import React, { useState } from 'react'
import './Downloads.css'
import { getCoupons } from '../../utils/apiService'
import { generateCouponPDF } from '../../utils/pdfGenerator'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

function Downloads() {
    const [isGeneratingZip, setIsGeneratingZip] = useState(false)
    const [isGeneratingCsv, setIsGeneratingCsv] = useState(false)

    // Function to convert JSON data to CSV format
    const convertToCSV = (data) => {
        if (!data || data.length === 0) {
            return 'No data available'
        }

        // Get headers from the first object
        const headers = Object.keys(data[0])
        const csvHeaders = headers.join(',')

        // Convert each row to CSV format
        const csvRows = data.map(row => {
            return headers.map(header => {
                const value = row[header]

                // Handle coupon codes specifically to prevent scientific notation
                if (header === 'code' || header === 'id') {
                    // Force as text with leading apostrophe to prevent Excel auto-formatting
                    return `"'${value}"`
                }

                // Convert all values to strings to ensure proper formatting
                const stringValue = value !== null && value !== undefined ? String(value) : ''

                // Handle values that contain commas, quotes, or newlines
                if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                    return `"${stringValue.replace(/"/g, '""')}"`
                }

                // Wrap all non-empty values in quotes for consistency
                return stringValue ? `"${stringValue}"` : '""'
            }).join(',')
        })

        return [csvHeaders, ...csvRows].join('\n')
    }

    // Function to handle bulk data download (CSV)
    const handleBulkDataDownload = async () => {
        setIsGeneratingCsv(true)

        try {
            console.log('Fetching coupons data...')
            const response = await getCoupons()

            // Extract the actual coupon data from response
            let couponsData = []
            if (response && response.couponData && Array.isArray(response.couponData)) {
                couponsData = response.couponData
            } else if (response && response.data && Array.isArray(response.data)) {
                couponsData = response.data
            } else if (Array.isArray(response)) {
                couponsData = response
            } else {
                console.warn('Unexpected response format:', response)
                couponsData = []
            }

            console.log('Coupons data:', couponsData)

            if (couponsData.length === 0) {
                alert('No coupon data available to download.')
                return
            }

            // Convert to CSV
            const csvContent = convertToCSV(couponsData)

            // Create blob and download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
            const fileName = `coupons_data_${new Date().toISOString().split('T')[0]}.csv`
            saveAs(blob, fileName)

            console.log('CSV download completed successfully')

        } catch (error) {
            console.error('Error downloading bulk data:', error)
            alert('Failed to download bulk data. Please try again.')
        } finally {
            setIsGeneratingCsv(false)
        }
    }

    // Function to handle bulk zip download
    const handleBulkZipDownload = async () => {
        setIsGeneratingZip(true)

        try {
            console.log('Fetching coupons data...')
            const response = await getCoupons()

            // Extract the actual coupon data from response
            let couponsData = []
            if (response && response.couponData && Array.isArray(response.couponData)) {
                couponsData = response.couponData
            } else if (response && response.data && Array.isArray(response.data)) {
                couponsData = response.data
            } else if (Array.isArray(response)) {
                couponsData = response
            } else {
                console.warn('Unexpected response format:', response)
                couponsData = []
            }

            console.log('Coupons data:', couponsData)

            if (couponsData.length === 0) {
                alert('No coupon data available to generate PDFs.')
                return
            }

            // Create a new JSZip instance
            const zip = new JSZip()

            console.log(`Starting PDF generation for ${couponsData.length} coupons...`)

            // Generate PDFs for each coupon and add to zip
            for (let i = 0; i < couponsData.length; i++) {
                const coupon = couponsData[i]
                const userName = coupon.name || coupon.user?.name || 'Unknown User'
                const couponCode = coupon.code || coupon.id || 'Unknown Code'
                const sevaType = coupon.seva || '1'

                try {
                    console.log(`Generating PDF ${i + 1}/${couponsData.length} for ${userName}`)

                    // Generate PDF blob instead of downloading directly
                    const pdfBlob = await generateCouponPDFBlob(userName, couponCode, sevaType)

                    if (pdfBlob) {
                        // Add PDF to zip with a unique filename
                        const fileName = `coupon_${userName.replace(/\s+/g, '_')}_${couponCode}.pdf`
                        zip.file(fileName, pdfBlob)
                    }
                } catch (error) {
                    console.error(`Error generating PDF for ${userName}:`, error)
                    // Continue with next coupon even if one fails
                }
            }

            console.log('Generating zip file...')

            // Generate the zip file
            const zipBlob = await zip.generateAsync({ type: 'blob' })

            // Download the zip file
            const zipFileName = `bulk_coupons_${new Date().toISOString().split('T')[0]}.zip`
            saveAs(zipBlob, zipFileName)

            console.log('Bulk zip download completed successfully')

        } catch (error) {
            console.error('Error generating bulk zip:', error)
            alert('Failed to generate bulk zip. Please try again.')
        } finally {
            setIsGeneratingZip(false)
        }
    }

    // Modified PDF generator that returns blob instead of downloading
    const generateCouponPDFBlob = async (userName, couponCode, sevaType = '1') => {
        try {
            // Import necessary modules here to avoid issues
            const jsPDF = (await import('jspdf')).default
            const QRCode = (await import('qrcode')).default

            // Import images
            const logo = (await import('../../assets/Logo.png')).default
            const gitaGreen = (await import('../../assets/gita_green.png')).default
            const gitaPink = (await import('../../assets/gita_pink.png')).default
            const gitaOther = (await import('../../assets/gita_other.png')).default
            const gitaData = (await import('../../data/bhagavadGita.json')).default

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

            // Function to generate QR code as data URL
            const generateQRCode = async (text) => {
                try {
                    const qrDataURL = await QRCode.toDataURL(text, {
                        width: 150,
                        margin: 2,
                        color: {
                            dark: '#000000',
                            light: '#FFFFFF'
                        }
                    })
                    return qrDataURL
                } catch (error) {
                    console.error('Error generating QR code:', error)
                    return null
                }
            }

            console.log('Starting PDF generation...')

            // Create new PDF document
            const doc = new jsPDF()

            // Set font and colors
            doc.setFont('helvetica')
            doc.setTextColor(0, 0, 0)

            // Get seva display name
            const getSevaDisplayName = (sevaCode) => {
                const sevaMap = {
                    '1': 'ABHISHEKAM SEVA',
                    '2': 'MAHA ARATHI SEVA',
                    '3': 'JHULAN SEVA'
                }
                return sevaMap[sevaCode] || sevaCode
            }

            // Select background image based on seva type
            let backgroundImage
            switch (sevaType) {
                case '1':
                    backgroundImage = gitaGreen
                    break
                case '2':
                    backgroundImage = gitaPink
                    break
                case '3':
                    backgroundImage = gitaOther
                    break
                default:
                    backgroundImage = gitaGreen
            }

            // Add background image
            try {
                doc.addImage(backgroundImage, 'PNG', 0, 0, 210, 297)

                // Add a very subtle white overlay
                doc.setFillColor(255, 255, 255)
                doc.setGlobalAlpha(0.15)
                doc.rect(0, 0, 210, 297, 'F')
                doc.setGlobalAlpha(1.0)
            } catch (imageError) {
                console.error('Error adding background image:', imageError)
            }

            // Add header with logo
            try {
                doc.addImage(logo, 'PNG', 15, 10, 20, 20)
            } catch (logoError) {
                console.error('Error adding logo:', logoError)
            }

            doc.setFontSize(18)
            doc.setFont('helvetica', 'bold')
            doc.text('ISKCON SHRI JAGANNATH MANDIR', 105, 25, { align: 'center' })
            doc.setFontSize(11)
            doc.setFont('helvetica', 'normal')
            doc.text('KUDUPU KATTE, MANGALURU', 105, 35, { align: 'center' })

            // Add separator line
            doc.setDrawColor(0, 0, 0)
            doc.setLineWidth(0.5)
            doc.line(20, 45, 190, 45)

            // Add title
            doc.setFontSize(14)
            doc.setFont('helvetica', 'italic')

            const titleText = 'Hare Krishna Hare Krishna Krishna Krishna Hare Hare Hare Rama Hare Rama Rama Rama Hare Hare'
            const titleMaxWidth = 180
            const titleLines = doc.splitTextToSize(titleText, titleMaxWidth)

            titleLines.forEach((line, index) => {
                doc.text(line, 105, 60 + (index * 8), { align: 'center' })
            })

            // Add spiritual message
            doc.setFontSize(8)
            doc.setFont('helvetica', 'bold')
            const messageY = 60 + (titleLines.length * 8) + 5
            doc.text('Please Chant and be Happy', 105, messageY, { align: 'center' })

            // Add user name
            doc.setFontSize(16)
            doc.setFont('helvetica', 'normal')
            const nameY = messageY + 15
            doc.text(`${userName}`, 105, nameY, { align: 'center' })

            // Add seva type
            doc.setFontSize(14)
            doc.setFont('helvetica', 'bold')
            const sevaName = getSevaDisplayName(sevaType)
            doc.text(`${sevaName}`, 105, nameY + 12, { align: 'center' })

            // Add coupon code
            doc.setFontSize(14)
            doc.setFont('helvetica', 'bold')
            doc.text(`${couponCode}`, 105, nameY + 24, { align: 'center' })

            // Add generation date
            const currentDate = new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
            doc.setFontSize(12)
            doc.setFont('helvetica', 'normal')
            doc.text(`Generated on: ${currentDate}`, 105, nameY + 36, { align: 'center' })

            // Generate and add QR code
            const qrDataURL = await generateQRCode(couponCode)
            if (qrDataURL) {
                doc.addImage(qrDataURL, 'PNG', 75, nameY + 50, 60, 60)
            }

            // Get random Bhagavad Gita quote
            const gitaQuote = getRandomGitaQuote()

            // Add Bhagavad Gita quote
            doc.setFontSize(9)
            doc.setFont('helvetica', 'italic')

            const maxWidth = 160
            const quoteLines = doc.splitTextToSize(`"${gitaQuote.translation}"`, maxWidth)

            const lineHeight = 7
            const quoteStartY = 225 - (quoteLines.length - 1) * lineHeight

            quoteLines.forEach((line, index) => {
                doc.text(line, 105, quoteStartY + (index * lineHeight), { align: 'center' })
            })

            // Add quote reference
            doc.setFontSize(8)
            doc.setFont('helvetica', 'normal')
            const referenceY = quoteStartY + (quoteLines.length * lineHeight) + 10
            doc.text(`Chapter ${gitaQuote.chapter}, Verse ${gitaQuote.verse}`, 105, referenceY, { align: 'center' })

            // Add footer
            doc.setLineWidth(0.5)
            const footerLineY = referenceY + 15
            doc.line(20, footerLineY, 190, footerLineY)

            doc.setFontSize(9)
            doc.setFont('helvetica', 'normal')
            doc.text('Thank you for visiting ISKCON SHRI JAGANNATH MANDIR', 105, footerLineY + 12, { align: 'center' })

            // Return PDF as blob instead of downloading
            return doc.output('blob')

        } catch (error) {
            console.error('Error generating PDF blob:', error)
            return null
        }
    }

    return (
        <div className="downloads-page">
            <div className="downloads-container">
                <h1>Bulk Downloads</h1>
                <div className="downloads-buttons">
                    <button
                        className="download-btn bulk-zip-btn"
                        onClick={handleBulkZipDownload}
                        disabled={isGeneratingZip}
                    >
                        {isGeneratingZip ? (
                            <div className="loading-content">
                                <div className="spinner"></div>
                                <span>Generating PDFs...</span>
                            </div>
                        ) : (
                            <div className="button-content">
                                <span className="button-icon">📦</span>
                                <span>Bulk Zip</span>
                            </div>
                        )}
                    </button>

                    <button
                        className="download-btn bulk-data-btn"
                        onClick={handleBulkDataDownload}
                        disabled={isGeneratingCsv}
                    >
                        {isGeneratingCsv ? (
                            <div className="loading-content">
                                <div className="spinner"></div>
                                <span>Generating CSV...</span>
                            </div>
                        ) : (
                            <div className="button-content">
                                <span className="button-icon">📊</span>
                                <span>Bulk Data</span>
                            </div>
                        )}
                    </button>
                </div>

                <div className="downloads-info">
                    <div className="info-item">
                        <h3>Bulk Zip</h3>
                        <p>Downloads all coupons and zips it</p>
                    </div>
                    <div className="info-item">
                        <h3>Bulk Data</h3>
                        <p>Exports all coupon data as a CSV</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Downloads