import React, { useState } from 'react'
import './Coupon.css'

function Coupon() {
    const [searchTerm, setSearchTerm] = useState('')
    const [coupons, setCoupons] = useState([
        { id: 1, name: 'Krishna Das', coupon: 'KRISHNA2024', date: '2024-01-15' },
        { id: 2, name: 'Radha Rani', coupon: 'RADHA2024', date: '2024-01-16' },
        { id: 3, name: 'Gopal Krishna', coupon: 'GOPAL2024', date: '2024-01-17' },
        { id: 4, name: 'Hare Krishna', coupon: 'HARE2024', date: '2024-01-18' },
        { id: 5, name: 'Bhagavan Das', coupon: 'BHAGAVAN2024', date: '2024-01-19' },
        { id: 6, name: 'Lakshmi Devi', coupon: 'LAKSHMI2024', date: '2024-01-20' },
        { id: 7, name: 'Narayana Das', coupon: 'NARAYANA2024', date: '2024-01-21' },
        { id: 8, name: 'Sita Ram', coupon: 'SITA2024', date: '2024-01-22' },
        { id: 9, name: 'Hanuman Das', coupon: 'HANUMAN2024', date: '2024-01-23' },
        { id: 10, name: 'Durga Devi', coupon: 'DURGA2024', date: '2024-01-24' }
    ])

    const handleDelete = (id) => {
        setCoupons(coupons.filter(coupon => coupon.id !== id))
    }

    const filteredCoupons = coupons.filter(coupon =>
        coupon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coupon.coupon.toLowerCase().includes(searchTerm.toLowerCase())
    )

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
                                            <span className="coupon-code">{coupon.coupon}</span>
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