import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const AnimatedButton = ({ children, to, onClick, variant = 'primary', className = '', ...props }) => {
    const baseStyle = "relative inline-flex items-center justify-center font-medium transition-all duration-300 overflow-hidden";
    const rounded = "rounded-xl";
    const sizes = "px-6 py-3 text-sm";
    
    let variants = {
        primary: "text-white bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)]",
        secondary: "text-white bg-slate-800/50 hover:bg-slate-700/80 backdrop-blur-md border border-slate-700/50 hover:border-slate-500/50",
        ghost: "text-slate-300 hover:text-white hover:bg-white/5"
    };

    const combinedStyle = `${baseStyle} ${rounded} ${sizes} ${variants[variant] || variants.primary} ${className}`;

    const content = (
        <>
            <span className="relative z-10 flex items-center gap-2">{children}</span>
        </>
    );

    if (to) {
        return (
            <Link to={to} className={combinedStyle} onClick={onClick} {...props}>
                {content}
            </Link>
        );
    }

    return (
        <motion.button
            whileTap={{ scale: 0.96 }}
            className={combinedStyle}
            onClick={onClick}
            {...props}
        >
            {content}
        </motion.button>
    );
};

export default AnimatedButton;
