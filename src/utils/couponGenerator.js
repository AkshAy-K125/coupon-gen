import couponsData from '../data/coupons.json'

// Function to get first name from full name
export const getFirstName = (fullName) => {
  const trimmedName = fullName.trim()
  const nameParts = trimmedName.split(' ')
  return nameParts[0]
}

// Function to convert string to ASCII values
export const convertToASCII = (str) => {
  let asciiString = ''
  for (let i = 0; i < str.length; i++) {
    asciiString += str.charCodeAt(i)
  }
  return asciiString
}

// Function to check if coupon code already exists
export const checkCouponExists = (code) => {
  return couponsData.coupons.some(coupon => coupon.code === code)
}

// Function to generate unique coupon code
export const generateCouponCode = (fullName) => {
  const firstName = getFirstName(fullName)
  const asciiValue = convertToASCII(firstName)
  let baseCode = `COUPON${asciiValue}`
  
  // Check if base code exists
  if (!checkCouponExists(baseCode)) {
    return baseCode
  }
  
  // If exists, add increment counter
  let counter = 1
  let newCode = `${baseCode}_${counter}`
  
  while (checkCouponExists(newCode)) {
    counter++
    newCode = `${baseCode}_${counter}`
  }
  
  return newCode
}

// Function to add new coupon to data
export const addCouponToData = (code, userName) => {
  const newCoupon = {
    code: code,
    discount: "25%",
    validUntil: "2024-12-31",
    user: {
      name: userName,
      email: "",
      phone: "",
      memberSince: new Date().toISOString().split('T')[0]
    },
    isActive: true
  }
  
  // In a real application, this would be saved to a database
  // For now, we'll just return the coupon object
  return newCoupon
} 