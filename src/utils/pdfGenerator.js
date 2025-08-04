import jsPDF from 'jspdf'
import QRCode from 'qrcode'
import logo from '../assets/Logo.png'
import gitaGreen from '../assets/gita_green.png'
import gitaPink from '../assets/gita_pink.png'
import gitaOther from '../assets/gita_other.png'
import gitaData from '../data/bhagavadGita.json'

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

// Function to generate and download PDF
export const generateCouponPDF = async (userName, couponCode, sevaType = '1') => {
  try {
    console.log('Starting PDF generation...')
    console.log('User name:', userName)
    console.log('Coupon code:', couponCode)
    console.log('Seva type:', sevaType)
    console.log('Gita Green image loaded:', !!gitaGreen)
    console.log('Gita Pink image loaded:', !!gitaPink)
    console.log('Gita Other image loaded:', !!gitaOther)
    console.log('Logo image loaded:', !!logo)

    // Create new PDF document
    const doc = new jsPDF()

    // Set font and colors
    doc.setFont('helvetica')
    doc.setTextColor(0, 0, 0)

    // Select background image based on seva type
    let backgroundImage
    switch (sevaType) {
      case 'ABHISHEKAM SEVA': // Puja
        backgroundImage = gitaGreen
        console.log('Using gita_green.png for Puja')
        break
      case 'MAHA ARATHI SEVA': // Prasadam
        backgroundImage = gitaPink
        console.log('Using gita_pink.png for Prasadam')
        break
      case 'JHULAN SEVA': // Other
        backgroundImage = gitaOther
        console.log('Using gita_other.png for Other')
        break
      default:
        backgroundImage = gitaGreen // Default to green
        console.log('Using default gita_green.png')
    }

    // Add background image to fill the entire PDF
    try {
      doc.addImage(backgroundImage, 'PNG', 0, 0, 210, 297) // Full page background
      console.log('Background image added successfully')

      // Add a very subtle white overlay to improve text readability
      doc.setFillColor(255, 255, 255)
      doc.setGlobalAlpha(0.15) // Very light overlay
      doc.rect(0, 0, 210, 297, 'F')
      doc.setGlobalAlpha(1.0) // Reset opacity for text
    } catch (imageError) {
      console.error('Error adding background image:', imageError)
      // Continue without background image if there's an error
    }

    // Add header with logo - repositioned to avoid overlap
    try {
      doc.addImage(logo, 'PNG', 15, 10, 20, 20) // Logo on the left, smaller and higher
      console.log('Logo added successfully')
    } catch (logoError) {
      console.error('Error adding logo:', logoError)
      // Continue without logo if there's an error
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

    // Add title with word wrapping
    doc.setFontSize(14)
    doc.setFont('helvetica', 'italic')

    // Split the title into lines for better formatting
    const titleText = 'Hare Krishna Hare Krishna Krishna Krishna Hare Hare Hare Rama Hare Rama Rama Rama Hare Hare'

    const titleMaxWidth = 180 // Maximum width for title text
    const titleLines = doc.splitTextToSize(titleText, titleMaxWidth)

    // Add each line of the title
    titleLines.forEach((line, index) => {
      doc.text(line, 105, 60 + (index * 8), { align: 'center' })
    })

    // Add spiritual message after Hare Krishna lines
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
    const sevaName = sevaType
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

    // Add Hare Krishna message
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')

    // Add Bhagavad Gita quote with word wrapping
    doc.setFontSize(9)
    doc.setFont('helvetica', 'italic')

    // Split quote into lines for better formatting
    const maxWidth = 160 // Reduced maximum width for better line breaks
    const quoteLines = doc.splitTextToSize(`"${gitaQuote.translation}"`, maxWidth)

    // Calculate starting Y position for quote (adjust based on number of lines)
    const lineHeight = 7 // Increased line height for better spacing
    const quoteStartY = 225 - (quoteLines.length - 1) * lineHeight

    // Add each line of the quote with better spacing
    quoteLines.forEach((line, index) => {
      doc.text(line, 105, quoteStartY + (index * lineHeight), { align: 'center' })
    })

    // Add quote reference with more spacing
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    const referenceY = quoteStartY + (quoteLines.length * lineHeight) + 10
    doc.text(`Chapter ${gitaQuote.chapter}, Verse ${gitaQuote.verse}`, 105, referenceY, { align: 'center' })

    // Add footer line with more spacing
    doc.setLineWidth(0.5)
    const footerLineY = referenceY + 15
    doc.line(20, footerLineY, 190, footerLineY)

    // Add footer text with more spacing
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text('Thank you for visiting ISKCON SHRI JAGANNATH MANDIR', 105, footerLineY + 12, { align: 'center' })

    // Generate filename
    const fileName = `coupon_${userName.replace(/\s+/g, '_')}_${Date.now()}.pdf`

    // Save the PDF
    doc.save(fileName)

    console.log('PDF generated successfully')
    return true
  } catch (error) {
    console.error('Error generating PDF:', error)
    console.error('Error details:', error.message)
    console.error('Error stack:', error.stack)
    return false
  }
} 