import React, { useState } from 'react'
import './HamburgerMenu.css'

function HamburgerMenu({ onNavigate, currentPage, onLogout }) {
    const [isOpen, setIsOpen] = useState(false)

    const toggleMenu = () => {
        setIsOpen(!isOpen)
    }

    const handleNavigation = (page) => {
        onNavigate(page)
        setIsOpen(false)
    }

    const handleLogout = () => {
        onLogout()
        setIsOpen(false)
    }

    return (
        <div className="hamburger-container">
            <button className="hamburger-button" onClick={toggleMenu}>
                <span className={`hamburger-line ${isOpen ? 'open' : ''}`}></span>
                <span className={`hamburger-line ${isOpen ? 'open' : ''}`}></span>
                <span className={`hamburger-line ${isOpen ? 'open' : ''}`}></span>
            </button>

            <nav className={`hamburger-menu ${isOpen ? 'open' : ''}`}>
                <ul className="menu-list">
                    <li className={`menu-item ${currentPage === 'home' ? 'active' : ''}`}>
                        <button onClick={() => handleNavigation('home')}>
                            Home
                        </button>
                    </li>
                    <li className={`menu-item ${currentPage === 'scan' ? 'active' : ''}`}>
                        <button onClick={() => handleNavigation('scan')}>
                            Scan
                        </button>
                    </li>
                    <li className={`menu-item ${currentPage === 'coupons' ? 'active' : ''}`}>
                        <button onClick={() => handleNavigation('coupons')}>
                            Coupons
                        </button>
                    </li>
                    <li className="menu-item logout-item">
                        <button onClick={handleLogout}>
                            Logout
                        </button>
                    </li>
                </ul>
            </nav>

            {isOpen && (
                <div className="menu-overlay" onClick={toggleMenu}></div>
            )}
        </div>
    )
}

export default HamburgerMenu 