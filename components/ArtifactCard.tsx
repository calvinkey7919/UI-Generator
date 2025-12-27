/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Artifact } from '../types';

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
    onClick
}) => {
    return (
        <div 
            className={`artifact-card ${isFocused ? 'focused' : ''} ${artifact.status}`}
            onClick={onClick}
        >
            <div className="artifact-header">
                {artifact.styleName}
            </div>
            <div className="artifact-card-inner">
                <iframe
                    className="artifact-iframe"
                    srcDoc={artifact.html}
                    title={artifact.styleName}
                    sandbox="allow-scripts"
                />
            </div>
        </div>
    );
};

export default ArtifactCard;
