/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Artifact } from '../types';
import { XIcon } from './Icons';

interface FullscreenModalProps {
    artifact: Artifact | null;
    onClose: () => void;
    isPaused: boolean;
    speed: number;
}

const FullscreenModal: React.FC<FullscreenModalProps> = ({ artifact, onClose, isPaused, speed }) => {
    if (!artifact) return null;

    return (
        <div className="fullscreen-modal">
            <div className="fullscreen-overlay" onClick={onClose} />
            <div className="fullscreen-content">
                <button className="fullscreen-close-btn" onClick={onClose} aria-label="Close">
                    <XIcon />
                </button>
                <div className="fullscreen-header">
                    <h2>{artifact.styleName}</h2>
                </div>
                <div className="fullscreen-preview">
                    {artifact.html && (
                        <iframe
                            srcDoc={artifact.html}
                            title={artifact.styleName}
                            sandbox="allow-scripts allow-same-origin"
                            style={{
                                width: '100%',
                                height: '100%',
                                border: 'none'
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default FullscreenModal;
