// Test file to demonstrate the coupon generation logic with duplicate prevention
import { generateCouponCode, addCouponToData, generateUniqueName } from './src/utils/couponGenerator.js'

// Test the duplicate prevention logic
console.log('Testing Coupon Generation with Duplicate Prevention\n')

// Simulate existing coupons
const existingCoupons = []

// Test 1: First coupon for "John Doe"
console.log('Test 1: Generating coupon for "John Doe"')
const coupon1 = addCouponToData('COUPON7411110032', 'John Doe', existingCoupons)
existingCoupons.push(coupon1)
console.log(`Generated: ${coupon1.user.name} - ${coupon1.code}`)

// Test 2: Another person with same first name "John Smith"
console.log('\nTest 2: Generating coupon for "John Smith"')
const coupon2 = addCouponToData('COUPON7411110032_1', 'John Smith', existingCoupons)
existingCoupons.push(coupon2)
console.log(`Generated: ${coupon2.user.name} - ${coupon2.code}`)

// Test 3: Another "John" with different last name "John Wilson"
console.log('\nTest 3: Generating coupon for "John Wilson"')
const coupon3 = addCouponToData('COUPON7411110032_2', 'John Wilson', existingCoupons)
existingCoupons.push(coupon3)
console.log(`Generated: ${coupon3.user.name} - ${coupon3.code}`)

// Test 4: Another "John" with middle name "John Michael Wilson"
console.log('\nTest 4: Generating coupon for "John Michael Wilson"')
const coupon4 = addCouponToData('COUPON7411110032_3', 'John Michael Wilson', existingCoupons)
existingCoupons.push(coupon4)
console.log(`Generated: ${coupon4.user.name} - ${coupon4.code}`)

// Test 5: Another "John" with multiple names "John Michael David Wilson"
console.log('\nTest 5: Generating coupon for "John Michael David Wilson"')
const coupon5 = addCouponToData('COUPON7411110032_4', 'John Michael David Wilson', existingCoupons)
existingCoupons.push(coupon5)
console.log(`Generated: ${coupon5.user.name} - ${coupon5.code}`)

// Test 6: Try to add another "John Doe" - should get initials
console.log('\nTest 6: Trying to add another "John Doe"')
const coupon6 = addCouponToData('COUPON7411110032_5', 'John Doe', existingCoupons)
existingCoupons.push(coupon6)
console.log(`Generated: ${coupon6.user.name} - ${coupon6.code}`)

console.log('\nFinal coupon list:')
existingCoupons.forEach((coupon, index) => {
  console.log(`${index + 1}. ${coupon.user.name} - ${coupon.code}`)
})

console.log('\nAll tests completed!') 