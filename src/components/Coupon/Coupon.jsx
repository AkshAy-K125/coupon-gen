import React, { useState } from 'react'
import './Coupon.css'
import { generateCouponPDF } from '../../utils/pdfGenerator'
import ConfirmationModal from './ConfirmationModal'
import { delCoupon } from '../../utils/apiService'

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

    const handleDelete = async (coupon) => {
        console.log(coupon)
        try {
            console.log('Attempting to delete coupon:', coupon.code, coupon.name)

            if (onDeleteCoupon) {
                // First try to delete from server
                await delCoupon(coupon)
                console.log('Server deletion successful')

                // Only call local deletion if server deletion succeeds
                onDeleteCoupon(coupon)
                console.log('Local deletion completed')
            }
        } catch (err) {
            console.error('Error deleting coupon from server:', err)

            // Show error message but don't clear the table
            alert(`Failed to delete coupon from server: ${err.message || 'Unknown error'}. Please try again.`)

            // Optionally, still allow local deletion if user confirms
            const confirmLocalDelete = window.confirm(
                'Server deletion failed. Do you want to delete the coupon locally only? ' +
                '(This may cause sync issues later.)'
            )

            if (confirmLocalDelete && onDeleteCoupon) {
                console.log('User chose to delete locally despite server error')
                onDeleteCoupon(coupon)
            }
        }
    }

    const handleGeneratePDF = async (coupon) => {
        try {
            await generateCouponPDF(coupon.name, coupon.code, coupon.seva)
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
            message: `Do you want to generate and download a PDF for the coupon "${coupon.name}"?`,
            confirmText: 'Generate PDF',
            onConfirm: () => {
                handleGeneratePDF(coupon)
                closeModal()
            }
        })
    }

    const showDeleteModal = (coupon) => {
        console.log('Showing delete modal for coupon:', coupon)
        setModalState({
            isOpen: true,
            type: 'delete',
            coupon: coupon,
            title: 'Delete Coupon',
            message: `Are you sure you want to delete the coupon for "${coupon.name}"? This action cannot be undone.`,
            confirmText: 'Delete',
            onConfirm: () => {
                handleDelete(coupon)
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

    // Filter coupons by search term and seva
    const filteredCoupons = coupons.filter(coupon => {
        const matchesSearch = coupon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            coupon.code.includes(searchTerm.toLowerCase())
        const matchesSeva = !sevaFilter || coupon.seva === sevaFilter
        return matchesSearch && matchesSeva
    })

    // Get unique sevas for filter dropdown
    const uniqueSevas = [...new Set(coupons.map(coupon => coupon.seva))].filter(Boolean)

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
                                    {seva}
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
                                    <tr key={coupon.code}>
                                        <td>{coupon.name}</td>
                                        <td>
                                            <span
                                                className="coupon-code"
                                                title={coupon.code || 'No Code'}
                                            >
                                                {coupon.code && coupon.code.length > 4 ? `..${coupon.code.slice(-4)}` : (coupon.code || 'No Code')}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="pdf-btn"
                                                    onClick={() => showPDFModal(coupon)}
                                                    title={`Generate PDF for ${coupon.name}`}
                                                >
                                                    📄
                                                </button>
                                                <button
                                                    className="delete-btn"
                                                    onClick={() => showDeleteModal(coupon)}
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