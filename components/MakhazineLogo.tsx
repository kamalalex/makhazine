import React from 'react';

export function MakhazineLogo({ className = "h-8 w-8", textClassName = "text-xl font-bold" }: { className?: string, textClassName?: string }) {
    return (
        <div className="flex items-center gap-2 group">
            <div className={`${className} relative flex items-center justify-center`}>
                <svg viewBox="0 0 100 100" className="w-full h-full transform transition-transform group-hover:scale-110 duration-500">
                    {/* 3D-like cubes inspired by the image */}
                    {/* Cube 1 (Top) */}
                    <path d="M50 15 L70 25 L50 35 L30 25 Z" fill="#FB923C" />
                    <path d="M70 25 L70 45 L50 55 L50 35 Z" fill="#F97316" />
                    <path d="M30 25 L50 35 L50 55 L30 45 Z" fill="#EA580C" />

                    {/* Cube 2 (Left) */}
                    <path d="M25 45 L40 52 L25 60 L10 52 Z" fill="#FB923C" />
                    <path d="M40 52 L40 67 L25 75 L25 60 Z" fill="#F97316" />
                    <path d="M10 52 L25 60 L25 75 L10 67 Z" fill="#EA580C" />

                    {/* Cube 3 (Right) */}
                    <path d="M75 45 L90 52 L75 60 L60 52 Z" fill="#FB923C" />
                    <path d="M90 52 L90 67 L75 75 L75 60 Z" fill="#F97316" />
                    <path d="M60 52 L75 60 L75 75 L60 67 Z" fill="#EA580C" />

                    {/* Connections (Blue lines) */}
                    <path d="M50 55 L50 75" stroke="#37A8E1" strokeWidth="3" fill="none" strokeDasharray="4 2" />
                    <path d="M25 75 L25 85 L75 85 L75 75" stroke="#37A8E1" strokeWidth="3" fill="none" strokeDasharray="4 2" />
                    <circle cx="50" cy="75" r="3" fill="#37A8E1" />
                </svg>
            </div>
            <span className={`${textClassName} tracking-tight text-slate-900`}>
                Makhazine
            </span>
        </div>
    );
}
