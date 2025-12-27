/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { XIcon } from './Icons';

interface SideDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

const SideDrawer: React.FC<SideDrawerProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <>
            <div className="drawer-overlay" onClick={onClose} />
            <div className={`side-drawer ${isOpen ? 'open' : ''}`}>
                <div className="drawer-header">
                    <h2 className="drawer-title">{title}</h2>
                    <button className="drawer-close-btn" onClick={onClose} aria-label="Close">
                        <XIcon />
                    </button>
                </div>
                <div className="drawer-content">
                    {children}
                </div>
            </div>
        </>
    );
};

export default SideDrawer;
