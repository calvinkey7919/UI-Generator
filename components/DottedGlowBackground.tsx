/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';

interface DottedGlowBackgroundProps {
    gap?: number;
    radius?: number;
    color?: string;
    glowColor?: string;
    speedScale?: number;
}

const DottedGlowBackground: React.FC<DottedGlowBackgroundProps> = ({
    gap = 24,
    radius = 1.5,
    color = 'rgba(255, 255, 255, 0.02)',
    glowColor = 'rgba(255, 255, 255, 0.15)',
    speedScale = 0.5
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameRef = useRef<number>();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        
        // Debounce resize handler to improve performance
        let resizeTimeout: number;
        const debouncedResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(resize, 100) as unknown as number;
        };
        
        window.addEventListener('resize', debouncedResize);

        let time = 0;
        const animate = () => {
            if (!ctx || !canvas) return;
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const cols = Math.ceil(canvas.width / gap);
            const rows = Math.ceil(canvas.height / gap);
            
            time += 0.01 * speedScale;
            
            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    const x = i * gap;
                    const y = j * gap;
                    
                    // Create a subtle wave effect
                    const wave = Math.sin(time + i * 0.1 + j * 0.1) * 0.5 + 0.5;
                    
                    // Draw dot
                    ctx.beginPath();
                    ctx.arc(x, y, radius, 0, Math.PI * 2);
                    ctx.fillStyle = color;
                    ctx.fill();
                    
                    // Draw glow on some dots
                    if (wave > 0.7) {
                        ctx.beginPath();
                        ctx.arc(x, y, radius * 3, 0, Math.PI * 2);
                        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 3);
                        gradient.addColorStop(0, glowColor);
                        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                        ctx.fillStyle = gradient;
                        ctx.fill();
                    }
                }
            }
            
            animationFrameRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            clearTimeout(resizeTimeout);
            window.removeEventListener('resize', debouncedResize);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [gap, radius, color, glowColor, speedScale]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 0
            }}
        />
    );
};

export default DottedGlowBackground;
