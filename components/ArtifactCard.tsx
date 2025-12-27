/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useEffect, useRef } from 'react';
import { Artifact } from '../types';
import { MaximizeIcon, ThinkingIcon, SaveIcon } from './Icons';

interface ArtifactCardProps {
    artifact: Artifact;
    isFocused: boolean;
    onClick: () => void;
    onFullscreen: (artifact: Artifact) => void;
    onSave?: (artifact: Artifact) => void;
}

const ArtifactCard = React.memo(({ 
    artifact, 
    isFocused, 
    onClick,
    onFullscreen,
    onSave
}: ArtifactCardProps) => {
    const codeRef = useRef<HTMLPreElement>(null);

    // Auto-scroll logic for this specific card
    useEffect(() => {
        if (codeRef.current) {
            codeRef.current.scrollTop = codeRef.current.scrollHeight;
        }
    }, [artifact.html]);

    const isStreaming = artifact.status === 'streaming';

    const handleMaximize = (e: React.MouseEvent) => {
        e.stopPropagation();
        onFullscreen(artifact);
    };

    const handleSave = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onSave) onSave(artifact);
    };

    return (
        <div 
            className={`artifact-card ${isFocused ? 'focused' : ''} ${isStreaming ? 'generating' : ''}`}
            onClick={onClick}
        >
            <div className="artifact-header">
                <span className="artifact-style-tag">{artifact.styleName}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'absolute', right: '12px' }}>
                     {isStreaming && (
                        <div className="card-loading-indicator">
                            <ThinkingIcon />
                        </div>
                    )}
                    {!isStreaming && artifact.status === 'complete' && onSave && (
                        <button className="card-action-btn" onClick={handleSave} title="Save to Library">
                            <SaveIcon />
                        </button>
                    )}
                    <button className="card-action-btn" onClick={handleMaximize} title="Fullscreen" style={{ position: 'static' }}>
                        <MaximizeIcon />
                    </button>
                </div>
            </div>
            <div className="artifact-card-inner">
                {isStreaming && (
                    <div className="generating-overlay">
                        <div className="overlay-spinner">
                            <ThinkingIcon />
                        </div>
                        <pre ref={codeRef} className="code-stream-preview">
                            {artifact.html}
                        </pre>
                    </div>
                )}
                <iframe 
                    srcDoc={artifact.html} 
                    title={artifact.id} 
                    sandbox="allow-scripts allow-forms allow-modals allow-popups allow-presentation allow-same-origin"
                    className="artifact-iframe"
                />
            </div>
        </div>
    );
});

export default ArtifactCard;