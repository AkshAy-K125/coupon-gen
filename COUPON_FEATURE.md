# Coupon Generation Feature

## Overview
This feature allows users to generate unique coupon codes based on their names. When a user submits their name, the system:

1. Extracts the first name from the full name
2. Converts the first name to ASCII values
3. Generates a unique coupon code
4. Creates a PDF with QR code and downloads it automatically

## How it Works

### Name Processing
- Takes the full name from the input field
- Splits by spaces and takes only the first name
- Example: "John Doe" → "John"

### ASCII Conversion
- Converts each character of the first name to its ASCII value
- Example: "John" → "74" + "111" + "104" + "110" = "74111104110"

### Coupon Code Generation
- Creates base code: `COUPON{ASCII_VALUE}`
- Example: `COUPON74111104110`
- If the code already exists, appends increment counter: `COUPON74111104110_1`

### PDF Generation
The generated PDF contains:
- Conditional background image based on selected seva:
  - Puja: gita_green.png
  - Prasadam: gita_pink.png
  - Other: gita_other.png
- ISKCON Logo.png in the header (properly positioned to avoid overlap)
- ISKCON Shri Jagannath Mandir header text
- User's full name
- Generated coupon code
- QR code containing the coupon code
- Date of generation
- "Hare Krishna" message
- Random Bhagavad Gita quote with chapter and verse reference
- Footer with temple information

## Files Modified/Created

### New Files:
- `src/utils/couponGenerator.js` - Coupon generation logic
- `src/utils/pdfGenerator.js` - PDF generation with QR codes
- `src/assets/gita_green.png` - Background image for Puja
- `src/assets/gita_pink.png` - Background image for Prasadam
- `src/assets/gita_other.png` - Background image for Other seva

### Modified Files:
- `src/App.jsx` - Updated form submission logic
- `package.json` - Added jspdf and qrcode dependencies

## Dependencies Added
- `jspdf` - For PDF generation
- `qrcode` - For QR code generation

## Usage
1. Login to the application (admin/password123)
2. Navigate to the Home page
3. Enter your full name in the input field
4. Click "Generate Coupon" button
5. The PDF will be automatically downloaded with your unique coupon

## Example Output
For a user named "Krishna Das":
- First name: "Krishna"
- ASCII value: "751141051151041101097"
- Coupon code: "COUPON751141051151041101097"
- PDF filename: "coupon_Krishna_Das_{timestamp}.pdf" 