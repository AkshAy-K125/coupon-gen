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

// Function to check if coupon code already exists in the provided coupons array
export const checkCouponExists = (code, coupons = []) => {
  return coupons.some(coupon => coupon.code === code)
}

// Function to check if name with initials already exists
export const checkNameWithInitialsExists = (firstName, initials, coupons = []) => {
  const searchName = initials ? `${firstName} ${initials}` : firstName
  return coupons.some(coupon => {
    const couponName = coupon.user?.name || coupon.name || ''
    return couponName.toUpperCase() === searchName.toUpperCase()
  })
}

// Function to check if exact name already exists for the same seva
export const checkExactNameExistsForSeva = (fullName, seva, coupons = []) => {
  const trimmedName = fullName.trim().toUpperCase()
  return coupons.some(coupon => {
    const couponName = coupon.user?.name || coupon.name || ''
    return couponName.toUpperCase() === trimmedName && coupon.seva === seva
  })
}

// Function to check if exact name exists (regardless of seva)
export const checkExactNameExists = (fullName, coupons = []) => {
  const trimmedName = fullName.trim().toUpperCase()
  return coupons.some(coupon => {
    const couponName = coupon.user?.name || coupon.name || ''
    return couponName.toUpperCase() === trimmedName
  })
}

// Function to generate 12-digit random number
export const generateRandomCode = () => {
  // Generate a random number between 100000000000 (12 digits) and 999999999999 (12 digits)
  const min = 100000000000 // 12-digit minimum
  const max = 999999999999 // 12-digit maximum
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Function to generate unique coupon code with duplicate prevention
export const generateCouponCode = (existingCoupons = []) => {
  let code = generateRandomCode().toString()

  // Keep generating new codes until we find one that doesn't exist
  while (checkCouponExists(code, existingCoupons)) {
    code = generateRandomCode().toString()
    console.log('Code already exists, generating new one:', code)
  }

  console.log('Generated unique coupon code:', code)
  return code
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


// Function to add new coupon to data (supports both traditional and server data formats)
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
    return {
      error: true,
      message: `A coupon for "${userName.trim().toUpperCase()}" and "${seva}" has already been generated. Please select a different seva or contact the administrator if you need assistance.`
    }
  }

  // Check if exact name exists (for warning)
  const exactNameExists = checkExactNameExists(userName, existingCoupons)

  // Store the original name in uppercase for consistency
  const originalName = userName.trim().toUpperCase()

  // Use server data if provided, otherwise use traditional format
  const newCoupon = {
    code: code,
    seva: seva,
    name: originalName,
    memberSince: new Date().toISOString().split('T')[0],
    isActive: true
  }

  return {
    error: false,
    coupon: newCoupon,
    warning: null
  }
}
