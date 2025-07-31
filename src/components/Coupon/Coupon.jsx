import React, { useState, useEffect } from 'react'
import './Coupon.css'
import couponData from '../../data/coupons.json'

function Coupon() {
    const [searchTerm, setSearchTerm] = useState('')
    const [coupons, setCoupons] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Function to fetch coupons - can be easily replaced with API call
    const fetchCoupons = async () => {
        try {
            setLoading(true)
            setError(null)
            
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 500))
            
            // For now, using local JSON data
            // TODO: Replace with actual API call when backend is ready
            // const response = await fetch('/api/coupons')
            // const data = await response.json()
            
            const data = couponData
            
            // Transform the data to match the table structure
            const transformedCoupons = data.coupons.map((coupon, index) => ({
                id: index + 1,
                name: coupon.user.name,
                coupon: coupon.code,
                date: coupon.user.memberSince,
                discount: coupon.discount,
                validUntil: coupon.validUntil,
                isActive: coupon.isActive,
                email: coupon.user.email,
                phone: coupon.user.phone
            }))
            
            setCoupons(transformedCoupons)
        } catch (err) {
            console.error('Error fetching coupons:', err)
            setError('Failed to load coupons. Please try again later.')
        } finally {
            setLoading(false)
        }
    }

    // Fetch coupons on component mount
    useEffect(() => {
        fetchCoupons()
    }, [])

    const handleDelete = async (id) => {
        try {
            // TODO: Replace with actual API call when backend is ready
            // await fetch(`/api/coupons/${id}`, { method: 'DELETE' })
            
            // For now, just remove from local state
            setCoupons(coupons.filter(coupon => coupon.id !== id))
        } catch (err) {
            console.error('Error deleting coupon:', err)
            // You could show an error message here
        }
    }

    const filteredCoupons = coupons.filter(coupon =>
        coupon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coupon.coupon.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) {
        return (
            <div className="coupon-page">
                <div className="coupon-container">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading coupons...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="coupon-page">
                <div className="coupon-container">
                    <div className="error-container">
                        <p className="error-message">{error}</p>
                        <button onClick={fetchCoupons} className="retry-btn">
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="coupon-page">
            <div className="coupon-container">
                <div className="search-section">
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Search by name or coupon code..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        <div className="search-icon">🔍</div>
                    </div>
                    <div className="coupon-stats">
                        <span>Total: {coupons.length}</span>
                        <span>Showing: {filteredCoupons.length}</span>
                    </div>
                </div>

                <div className="table-container">
                    <table className="coupon-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Coupon Code</th>
                                <th>Date</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCoupons.length > 0 ? (
                                filteredCoupons.map(coupon => (
                                    <tr key={coupon.id}>
                                        <td>{coupon.name}</td>
                                        <td>
                                            <span 
                                                className="coupon-code"
                                                title={coupon.coupon}
                                            >
                                                {coupon.coupon.length > 4 ? `..${coupon.coupon.slice(-4)}` : coupon.coupon}
                                            </span>
                                        </td>
                                        <td>{coupon.date}</td>
                                        <td>
                                            <button
                                                className="delete-btn"
                                                onClick={() => handleDelete(coupon.id)}
                                                title="Delete coupon"
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="no-results">
                                        {searchTerm ? 'No coupons found matching your search.' : 'No coupons available.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default Coupon 