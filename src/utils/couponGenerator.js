// Function to get first name from full name
export const getFirstName = (fullName) => {
  const trimmedName = fullName.trim()
  const nameParts = trimmedName.split(' ')
  return nameParts[0]
}

// Function to check if name is incomplete (single word only)
export const checkIncompleteName = (fullName) => {
  const trimmedName = fullName.trim()
  const nameParts = trimmedName.split(' ').filter(part => part.length > 0)
  return nameParts.length <= 1
}

// Function to get initials from remaining names
export const getInitials = (fullName, usedInitials = '') => {
  const trimmedName = fullName.trim()
  const nameParts = trimmedName.split(' ')
  
  if (nameParts.length <= 1) return ''
  
  // Start with first initial of second name
  let initials = nameParts[1].charAt(0).toUpperCase()
  
  // If we already have some initials, add the next one
  if (usedInitials.length > 0) {
    const nextNameIndex = 1 + usedInitials.length
    if (nameParts[nextNameIndex]) {
      initials = usedInitials + nameParts[nextNameIndex].charAt(0).toUpperCase()
    }
  }
  
  return initials
}

// Function to convert string to ASCII values
export const convertToASCII = (str) => {
  let asciiString = ''
  for (let i = 0; i < str.length; i++) {
    asciiString += str.charCodeAt(i)
  }
  return asciiString
}

// Function to check if coupon code already exists in the provided coupons array
export const checkCouponExists = (code, coupons = []) => {
  return coupons.some(coupon => coupon.code === code)
}

// Function to check if name with initials already exists
export const checkNameWithInitialsExists = (firstName, initials, coupons = []) => {
  const searchName = initials ? `${firstName} ${initials}` : firstName
  return coupons.some(coupon => coupon.user.name.toUpperCase() === searchName.toUpperCase())
}

// Function to check if exact name already exists for the same seva
export const checkExactNameExistsForSeva = (fullName, seva, coupons = []) => {
  const trimmedName = fullName.trim().toUpperCase()
  return coupons.some(coupon => 
    coupon.user.name.toUpperCase() === trimmedName && 
    coupon.seva === seva
  )
}

// Function to check if exact name exists (regardless of seva)
export const checkExactNameExists = (fullName, coupons = []) => {
  const trimmedName = fullName.trim().toUpperCase()
  return coupons.some(coupon => coupon.user.name.toUpperCase() === trimmedName)
}

// Function to generate unique coupon code with duplicate prevention
export const generateCouponCode = (fullName, existingCoupons = []) => {
  const firstName = getFirstName(fullName)
  const asciiValue = convertToASCII(firstName)
  let baseCode = `COUPON${asciiValue}`
  
  // Check if base code exists
  if (!checkCouponExists(baseCode, existingCoupons)) {
    return baseCode
  }
  
  // If exists, add increment counter
  let counter = 1
  let newCode = `${baseCode}_${counter}`
  
  while (checkCouponExists(newCode, existingCoupons)) {
    counter++
    newCode = `${baseCode}_${counter}`
  }
  
  return newCode
}

// Function to generate unique name with initials to prevent duplicates
export const generateUniqueName = (fullName, existingCoupons = []) => {
  const firstName = getFirstName(fullName)
  
  // First try with just the first name
  if (!checkNameWithInitialsExists(firstName, '', existingCoupons)) {
    return firstName
  }
  
  // If first name exists, try with first initial of second name
  let initials = getInitials(fullName)
  if (!checkNameWithInitialsExists(firstName, initials, existingCoupons)) {
    return `${firstName} ${initials}`
  }
  
  // If that exists too, keep adding initials from subsequent names
  let usedInitials = initials
  let attempt = 1
  
  while (attempt < 10) { // Prevent infinite loop
    const nextInitials = getInitials(fullName, usedInitials)
    if (!nextInitials || nextInitials === usedInitials) break
    
    usedInitials = nextInitials
    if (!checkNameWithInitialsExists(firstName, usedInitials, existingCoupons)) {
      return `${firstName} ${usedInitials}`
    }
    attempt++
  }
  
  // If all attempts fail, add a number suffix
  let counter = 1
  let finalName = `${firstName} ${usedInitials || 'A'}${counter}`
  
  while (checkNameWithInitialsExists(firstName, `${usedInitials || 'A'}${counter}`, existingCoupons)) {
    counter++
    finalName = `${firstName} ${usedInitials || 'A'}${counter}`
  }
  
  return finalName
}

// Function to add new coupon to data
export const addCouponToData = (code, userName, seva, existingCoupons = []) => {
  // Check if name is incomplete
  const isIncompleteName = checkIncompleteName(userName)
  
  // If name is incomplete, return error to prevent generation
  if (isIncompleteName) {
    return {
      error: true,
      message: 'Please provide a full name (first name and last name) for better identification. Coupon generation halted.'
    }
  }
  
  // Check if exact name exists for the same seva
  if (checkExactNameExistsForSeva(userName, seva, existingCoupons)) {
    const sevaNames = {
      '1': 'ABHISHEKAM SEVA',
      '2': 'MAHA ARATHI SEVA', 
      '3': 'JHULAN SEVA'
    }
    const sevaName = sevaNames[seva] || seva
    return {
      error: true,
      message: `A coupon for "${userName.trim().toUpperCase()}" and "${sevaName}" seva has already been generated. Please select a different seva or contact the administrator if you need assistance.`
    }
  }
  
  // Check if exact name exists (for warning)
  const exactNameExists = checkExactNameExists(userName, existingCoupons)
  
  // Store the original name in uppercase for consistency
  const originalName = userName.trim().toUpperCase()
  
  const newCoupon = {
    code: code,
    discount: "25%",
    validUntil: "2024-12-31",
    seva: seva,
    user: {
      name: originalName,
      email: "",
      phone: "",
      memberSince: new Date().toISOString().split('T')[0]
    },
    isActive: true
  }
  
  return {
    error: false,
    coupon: newCoupon,
    warning: null
  }
} 