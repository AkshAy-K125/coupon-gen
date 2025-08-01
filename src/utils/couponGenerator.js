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
  return coupons.some(coupon => coupon.user.name === searchName)
}

// Function to check if exact name already exists for the same service
export const checkExactNameExistsForService = (fullName, service, coupons = []) => {
  const trimmedName = fullName.trim()
  return coupons.some(coupon => 
    coupon.user.name === trimmedName && 
    coupon.service === service
  )
}

// Function to check if exact name exists (regardless of service)
export const checkExactNameExists = (fullName, coupons = []) => {
  const trimmedName = fullName.trim()
  return coupons.some(coupon => coupon.user.name === trimmedName)
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
export const addCouponToData = (code, userName, service, existingCoupons = []) => {
  // Check if name is incomplete
  const isIncompleteName = checkIncompleteName(userName)
  
  // If name is incomplete, return error to prevent generation
  if (isIncompleteName) {
    return {
      error: true,
      message: 'Please provide a full name (first name and last name) for better identification. Coupon generation halted.'
    }
  }
  
  // Check if exact name exists for the same service
  if (checkExactNameExistsForService(userName, service, existingCoupons)) {
    return {
      error: true,
      message: 'A coupon for this name and service already exists. Please use a different service or add more details to the name.'
    }
  }
  
  // Check if exact name exists (for warning)
  const exactNameExists = checkExactNameExists(userName, existingCoupons)
  
  // Generate unique name to prevent duplicates
  const uniqueName = generateUniqueName(userName, existingCoupons)
  
  const newCoupon = {
    code: code,
    discount: "25%",
    validUntil: "2024-12-31",
    service: service,
    user: {
      name: uniqueName,
      email: "",
      phone: "",
      memberSince: new Date().toISOString().split('T')[0]
    },
    isActive: true
  }
  
  // Build warning messages (only for name modifications, not incomplete names)
  let warnings = []
  if (exactNameExists) {
    warnings.push('Name already exists in the system. A unique name has been generated.')
  }
  
  return {
    error: false,
    coupon: newCoupon,
    warning: warnings.length > 0 ? warnings.join(' ') : null
  }
} 