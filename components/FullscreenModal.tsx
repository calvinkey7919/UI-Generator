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
}

export default function FullscreenModal({ artifact, onClose }: FullscreenModalProps) {
    if (!artifact) return null;

    return (
        <div className="fullscreen-modal-overlay">
            <button className="fullscreen-close-btn" onClick={onClose}>
                <XIcon />
            </button>
            <iframe 
                srcDoc={artifact.html} 
                className="fullscreen-iframe"
                title="Fullscreen Preview"
                sandbox="allow-scripts allow-forms allow-modals allow-popups allow-presentation allow-same-origin"
            />
        </div>
    );
}