import React, { useState } from 'react'
import './Coupon.css'
import { generateCouponPDF } from '../../utils/pdfGenerator'
import ConfirmationModal from './ConfirmationModal'
import { delCoupon } from '../../utils/apiService'

function Coupon({ coupons = [], onDeleteCoupon }) {
    const [searchTerm, setSearchTerm] = useState('')
    const [sevaFilter, setSevaFilter] = useState('')
    const [deletingCoupons, setDeletingCoupons] = useState(new Set())
    const [fadingCoupons, setFadingCoupons] = useState(new Set())
    const [expandedAccordions, setExpandedAccordions] = useState(new Set())
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
        const couponId = coupon.code || coupon.id

        // Start delete animation
        setDeletingCoupons(prev => new Set([...prev, couponId]))

        try {
            console.log('Attempting to delete coupon:', coupon.code, coupon.name)

            if (onDeleteCoupon) {
                // First try to delete from server
                await delCoupon(coupon)
                console.log('Server deletion successful')

                // Start fade out animation
                setFadingCoupons(prev => new Set([...prev, couponId]))

                // Wait for fade animation to complete
                setTimeout(() => {
                    // Only call local deletion if server deletion succeeds
                    onDeleteCoupon(coupon)
                    console.log('Local deletion completed')

                    // Clean up animation states
                    setDeletingCoupons(prev => {
                        const newSet = new Set(prev)
                        newSet.delete(couponId)
                        return newSet
                    })
                    setFadingCoupons(prev => {
                        const newSet = new Set(prev)
                        newSet.delete(couponId)
                        return newSet
                    })
                }, 300) // Match CSS animation duration
            }
        } catch (err) {
            console.error('Error deleting coupon from server:', err)

            // Reset delete state on error
            setDeletingCoupons(prev => {
                const newSet = new Set(prev)
                newSet.delete(couponId)
                return newSet
            })

            // Show error message but don't clear the table
            alert(`Failed to delete coupon from server: ${err.message || 'Unknown error'}. Please try again.`)

            // Optionally, still allow local deletion if user confirms
            const confirmLocalDelete = window.confirm(
                'Server deletion failed. Do you want to delete the coupon locally only? ' +
                '(This may cause sync issues later.)'
            )

            if (confirmLocalDelete && onDeleteCoupon) {
                console.log('User chose to delete locally despite server error')

                // Start fade out animation for local delete
                setFadingCoupons(prev => new Set([...prev, couponId]))
                setTimeout(() => {
                    onDeleteCoupon(coupon)
                    setFadingCoupons(prev => {
                        const newSet = new Set(prev)
                        newSet.delete(couponId)
                        return newSet
                    })
                }, 300)
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

    const toggleAccordion = (couponCode) => {
        setExpandedAccordions(prev => {
            const newSet = new Set(prev)
            if (newSet.has(couponCode)) {
                newSet.delete(couponCode)
            } else {
                newSet.add(couponCode)
            }
            return newSet
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

                <div className="accordion-container">
                    {filteredCoupons.length > 0 ? (
                        filteredCoupons.map(coupon => {
                            const couponId = coupon.code || coupon.id
                            const isDeleting = deletingCoupons.has(couponId)
                            const isFading = fadingCoupons.has(couponId)
                            const isExpanded = expandedAccordions.has(coupon.code)

                            return (
                                <div
                                    key={coupon.code}
                                    className={`accordion-item ${isFading ? 'fade-out' : ''} ${isDeleting ? 'deleting' : ''}`}
                                >
                                    <div
                                        className="accordion-header"
                                        onClick={() => toggleAccordion(coupon.code)}
                                    >
                                        <div className="accordion-header-content">
                                            <div className="status-indicator">
                                                <div className={`status-circle ${coupon.isActive ? 'active' : 'inactive'}`}></div>
                                            </div>
                                            <div className="coupon-name">{coupon.name}</div>
                                            <div className="accordion-toggle">
                                                <span className={`accordion-arrow ${isExpanded ? 'expanded' : ''}`}>▼</span>
                                            </div>
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="accordion-body">
                                            <div className="accordion-content">
                                                <div className="coupon-details">
                                                    <div className="detail-row">
                                                        <span className="detail-label">Coupon Code:</span>
                                                        <span className="detail-value">{coupon.code || 'N/A'}</span>
                                                    </div>
                                                    <div className="detail-row">
                                                        <span className="detail-label">Generated on:</span>
                                                        <span className="detail-value">{coupon.memberSince || 'N/A'}</span>
                                                    </div>
                                                    <div className="detail-row">
                                                        <span className="detail-label">Seva:</span>
                                                        <span className="detail-value">{coupon.seva || 'N/A'}</span>
                                                    </div>
                                                </div>

                                                <div className="accordion-actions">
                                                    <button
                                                        className={`delete-btn ${isDeleting ? 'loading' : ''}`}
                                                        onClick={() => showDeleteModal(coupon)}
                                                        title="Delete coupon"
                                                        disabled={isDeleting}
                                                    >
                                                        {isDeleting ? (
                                                            <div className="spinner"></div>
                                                        ) : (
                                                            '🗑️'
                                                        )}
                                                    </button>
                                                    <button
                                                        className="pdf-btn"
                                                        onClick={() => showPDFModal(coupon)}
                                                        title={`Generate PDF for ${coupon.name}`}
                                                        disabled={isDeleting}
                                                    >
                                                        📄
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })
                    ) : (
                        <div className="no-results">
                            {searchTerm || sevaFilter ? 'No coupons found matching your filters.' : 'No coupons available.'}
                        </div>
                    )}
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