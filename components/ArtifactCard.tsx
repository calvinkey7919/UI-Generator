/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Artifact } from '../types';
import { CodeIcon, GlobeIcon, LibraryIcon } from './Icons';

interface ArtifactCardProps {
    artifact: Artifact;
    isFocused: boolean;
    onClick: () => void;
    onFullscreen: (artifact: Artifact) => void;
    onSave: (artifact: Artifact) => void;
    isPaused: boolean;
    speed: number;
}

const ArtifactCard: React.FC<ArtifactCardProps> = ({
    artifact,
    isFocused,
    onClick,
    onFullscreen,
    onSave,
    isPaused,
    speed
}) => {
    const handleCodeClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        // This would typically open a code viewer
        console.log('View code for:', artifact.id);
    };

    const handleFullscreenClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onFullscreen(artifact);
    };

    const handleSaveClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onSave(artifact);
    };

    return (
        <div 
            className={`artifact-card ${isFocused ? 'focused' : ''} ${artifact.status}`}
            onClick={onClick}
        >
            <div className="artifact-header">
                <h3 className="artifact-style-name">{artifact.styleName}</h3>
                <div className="artifact-actions">
                    <button 
                        className="artifact-action-btn" 
                        onClick={handleCodeClick}
                        title="View code"
                    >
                        <CodeIcon />
                    </button>
                    <button 
                        className="artifact-action-btn" 
                        onClick={handleFullscreenClick}
                        title="Fullscreen"
                    >
                        <GlobeIcon />
                    </button>
                    <button 
                        className="artifact-action-btn" 
                        onClick={handleSaveClick}
                        title="Save to library"
                    >
                        <LibraryIcon />
                    </button>
                </div>
            </div>
            <div className="artifact-preview">
                {artifact.status === 'streaming' && (
                    <div className="artifact-loading">Generating...</div>
                )}
                {artifact.status === 'error' && (
                    <div className="artifact-error">Error loading component</div>
                )}
                {(artifact.status === 'complete' || artifact.status === 'streaming') && artifact.html && (
                    <iframe
                        srcDoc={artifact.html}
                        title={artifact.styleName}
                        sandbox="allow-scripts"
                        style={{
                            width: '100%',
                            height: '100%',
                            border: 'none',
                            pointerEvents: isFocused ? 'auto' : 'none'
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default ArtifactCard;
