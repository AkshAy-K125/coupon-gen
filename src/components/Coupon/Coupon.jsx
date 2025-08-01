import React, { useState } from 'react'
import './Coupon.css'
import { generateCouponPDF } from '../../utils/pdfGenerator'
import ConfirmationModal from './ConfirmationModal'

function Coupon({ coupons = [], onDeleteCoupon }) {
    const [searchTerm, setSearchTerm] = useState('')
    const [sevaFilter, setSevaFilter] = useState('')
    const [modalState, setModalState] = useState({
        isOpen: false,
        type: null,
        coupon: null,
        title: '',
        message: '',
        confirmText: '',
        onConfirm: null
    })

    const handleDelete = async (code) => {
        try {
            if (onDeleteCoupon) {
                onDeleteCoupon(code)
            }
        } catch (err) {
            console.error('Error deleting coupon:', err)
            // You could show an error message here
        }
    }

    const handleGeneratePDF = async (coupon) => {
        try {
            await generateCouponPDF(coupon.user.name, coupon.code, coupon.seva)
        } catch (error) {
            console.error('Error generating PDF:', error)
            // You could show an error message here
        }
    }

    const showPDFModal = (coupon) => {
        setModalState({
            isOpen: true,
            type: 'pdf',
            coupon: coupon,
            title: 'Generate PDF',
            message: `Do you want to generate and download a PDF for the coupon "${coupon.user.name}"?`,
            confirmText: 'Generate PDF',
            onConfirm: () => {
                handleGeneratePDF(coupon)
                closeModal()
            }
        })
    }

    const showDeleteModal = (coupon) => {
        setModalState({
            isOpen: true,
            type: 'delete',
            coupon: coupon,
            title: 'Delete Coupon',
            message: `Are you sure you want to delete the coupon for "${coupon.user.name}"? This action cannot be undone.`,
            confirmText: 'Delete',
            onConfirm: () => {
                handleDelete(coupon.code)
                closeModal()
            }
        })
    }

    const closeModal = () => {
        setModalState({
            isOpen: false,
            type: null,
            coupon: null,
            title: '',
            message: '',
            confirmText: '',
            onConfirm: null
        })
    }

    // Transform the coupons data to match the table structure
    const transformedCoupons = coupons.map((coupon, index) => ({
        id: index + 1,
        name: coupon.user.name,
        coupon: coupon.code,
        seva: coupon.seva,
        discount: coupon.discount,
        validUntil: coupon.validUntil,
        isActive: coupon.isActive,
        email: coupon.user.email,
        phone: coupon.user.phone,
        originalCoupon: coupon // Keep reference to original coupon object
    }))

    // Filter coupons by search term and seva
    const filteredCoupons = transformedCoupons.filter(coupon => {
        const matchesSearch = coupon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            coupon.coupon.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesSeva = !sevaFilter || coupon.seva === sevaFilter
        return matchesSearch && matchesSeva
    })

    // Get unique sevas for filter dropdown
    const uniqueSevas = [...new Set(transformedCoupons.map(coupon => coupon.seva))].filter(Boolean)

    // Get seva display name
    const getSevaDisplayName = (sevaCode) => {
        const sevaMap = {
            '1': 'ABHISHEKAM SEVA',
            '2': 'MAHA ARATHI SEVA',
            '3': 'JHULAN SEVA'
        }
        return sevaMap[sevaCode] || sevaCode
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
                    <div className="filter-section">
                        <select
                            value={sevaFilter}
                            onChange={(e) => setSevaFilter(e.target.value)}
                            className="seva-filter"
                        >
                            <option value="">ALL SEVA</option>
                            {uniqueSevas.map(seva => (
                                <option key={seva} value={seva}>
                                    {getSevaDisplayName(seva)}
                                </option>
                            ))}
                        </select>
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
                                <th>Actions</th>
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
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="pdf-btn"
                                                    onClick={() => showPDFModal(coupon.originalCoupon)}
                                                    title={`Generate PDF for ${coupon.name}`}
                                                >
                                                    📄
                                                </button>
                                                <button
                                                    className="delete-btn"
                                                    onClick={() => showDeleteModal(coupon.originalCoupon)}
                                                    title="Delete coupon"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="no-results">
                                        {searchTerm || sevaFilter ? 'No coupons found matching your filters.' : 'No coupons available.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmationModal
                isOpen={modalState.isOpen}
                onClose={closeModal}
                onConfirm={modalState.onConfirm}
                title={modalState.title}
                message={modalState.message}
                confirmText={modalState.confirmText}
                type={modalState.type}
            />
        </div>
    )
}

export default Coupon 