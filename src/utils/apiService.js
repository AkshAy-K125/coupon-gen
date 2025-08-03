/**
 * API Service utility for handling all API requests
 * Provides centralized API configuration and common request methods
 */

// Base API URL for all requests
const API_BASE_URL = 'https://script.google.com/macros/s/AKfycbyDcRX8aeniCk4dlVLYoShCFkh_xUd-fGkzGG-_di-7j-4S96a20-JqP5DKWRPgwz-eBQ/exec'

/**
 * Generic API request function
 * @param {Object} payload - The data to send in the request body
 * @param {Object} options - Additional fetch options (optional)
 * @returns {Promise<Object>} - Parsed JSON response
 */
export const makeApiRequest = async (payload) => {
    try {
        const requestOptions = {
            method: "POST",
            body: JSON.stringify(payload),
            redirect: "follow",
        }

        console.log('Making API request:', { payload, requestOptions })

        const response = await fetch(API_BASE_URL, requestOptions)



        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const rawResponse = await response.text()
        console.log('Raw API response:', rawResponse)

        // Parse JSON response
        const result = JSON.parse(rawResponse)
        console.log('Parsed API response:', result)

        return result
    } catch (error) {
        console.error('API request failed:', error)
        throw error
    }
}

/**
 * Login check API call
 * @param {string} username - Username for login
 * @param {string} password - Password for login
 * @returns {Promise<Object>} - Login response with authentication status
 */
export const loginCheck = async (username, password) => {
    const payload = {
        "func": "loginCheck",
        "userName": username,
        "passWord": password
    }

    return await makeApiRequest(payload)
}

/**
 * Add coupon API call
 * @param {Object} coupon - Coupon object to add
 * @param {string} name - User name (uppercased)
 * @param {string} seva - Seva type
 * @returns {Promise<Object>} - Add coupon response
 */
export const addCoupon = async (coupon, name, seva) => {
    const payload = {
        "func": "addCoupon",
        "coupon": coupon,
        "name": name.toUpperCase(),
        "seva": seva
    }

    return await makeApiRequest(payload)
}

export const delCoupon = async (coupon, name) => {
    const payload = {
        "func": "delCoupon",
        "coupon": coupon,
        "name": name.toUpperCase()
    }
    return await makeApiRequest(payload)
}

export const getCoupons = async () => {
    const payload = {
        "func": "getCoupons"
    }

    try {
        const response = await makeApiRequest(payload)
        console.log('getCoupons raw response:', response)

        // Handle stringified JSON response - parse again if needed
        if (typeof response === 'string') {
            console.log('Response is stringified, parsing again...')
            const parsedResponse = JSON.parse(response)
            console.log('getCoupons parsed response:', parsedResponse)
            return parsedResponse
        }

        // If response has stringified data property, parse it
        if (response && typeof response.data === 'string') {
            console.log('Response.data is stringified, parsing...')
            try {
                response.data = JSON.parse(response.data)
            } catch (parseError) {
                console.error('Error parsing response.data:', parseError)
            }
        }

        // If response has stringified couponData property, parse it
        if (response && typeof response.couponData === 'string') {
            console.log('Response.couponData is stringified, parsing...')
            try {
                response.couponData = JSON.parse(response.couponData)
            } catch (parseError) {
                console.error('Error parsing response.couponData:', parseError)
            }
        }

        console.log('getCoupons final response:', response)
        return response
    } catch (error) {
        console.error('Error in getCoupons:', error)
        throw error
    }
}

/**
 * Get the base API URL (useful for external references)
 * @returns {string} - The base API URL
 */
export const getApiBaseUrl = () => API_BASE_URL