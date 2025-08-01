import React, { useState } from 'react'
import './Coupon.css'
import { generateCouponPDF } from '../../utils/pdfGenerator'
import ConfirmationModal from './ConfirmationModal'

function Coupon({ coupons = [], onDeleteCoupon }) {
    const [searchTerm, setSearchTerm] = useState('')
    const [serviceFilter, setServiceFilter] = useState('')
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
            await generateCouponPDF(coupon.user.name, coupon.code, coupon.service)
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
                handleDelete(coupon.coupon)
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
        service: coupon.service,
        discount: coupon.discount,
        validUntil: coupon.validUntil,
        isActive: coupon.isActive,
        email: coupon.user.email,
        phone: coupon.user.phone,
        originalCoupon: coupon // Keep reference to original coupon object
    }))

    // Filter coupons by search term and service
    const filteredCoupons = transformedCoupons.filter(coupon => {
        const matchesSearch = coupon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            coupon.coupon.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesService = !serviceFilter || coupon.service === serviceFilter
        return matchesSearch && matchesService
    })

    // Get unique services for filter dropdown
    const uniqueServices = [...new Set(transformedCoupons.map(coupon => coupon.service))].filter(Boolean)

    // Get service display name
    const getServiceDisplayName = (serviceCode) => {
        const serviceMap = {
            '1': 'Puja',
            '2': 'Prasadam',
            '3': 'Other'
        }
        return serviceMap[serviceCode] || serviceCode
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
                            value={serviceFilter}
                            onChange={(e) => setServiceFilter(e.target.value)}
                            className="service-filter"
                        >
                            <option value="">All Services</option>
                            {uniqueServices.map(service => (
                                <option key={service} value={service}>
                                    {getServiceDisplayName(service)}
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
                                        {searchTerm || serviceFilter ? 'No coupons found matching your filters.' : 'No coupons available.'}
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