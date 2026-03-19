import { motion } from 'framer-motion';
import logo from '../assets/logo.png';

export default function SplashScreen() {
    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[999] bg-[#0a0e1a] flex flex-col items-center justify-center p-6 overflow-hidden"
        >
            {/* Ambient background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

            <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{
                    duration: 1.2,
                    ease: "easeOut",
                    delay: 0.2
                }}
                className="relative flex flex-col items-center"
            >
                <div className="w-32 h-32 md:w-40 md:h-40 mb-8 relative">
                    <motion.div
                        animate={{
                            boxShadow: ["0 0 20px rgba(255,255,255,0.1)", "0 0 50px rgba(255,255,255,0.3)", "0 0 20px rgba(255,255,255,0.1)"]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 rounded-full blur-2xl opacity-50"
                    />
                    <img
                        src={logo}
                        alt="SilverTriverse Logo"
                        className="w-full h-full object-contain relative z-10 filter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                    />
                </div>

                <div className="overflow-hidden">
                    <motion.h1
                        initial={{ y: 50 }}
                        animate={{ y: 0 }}
                        transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
                        className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-widest text-center"
                    >
                        SILVERTRIVERSE
                    </motion.h1>
                </div>

                <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 1, delay: 1, ease: "easeInOut" }}
                    className="w-24 h-[1px] bg-gradient-to-r from-transparent via-gold to-transparent mt-4"
                />

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 1.5 }}
                    className="text-gray-500 text-xs md:text-sm tracking-[0.5em] uppercase mt-6 ml-2"
                >
                    Entertainment Reimagined
                </motion.p>
            </motion.div>

            {/* Bottom loading indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
            >
                <div className="w-48 h-1 bg-navy-800 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: "0%" }}
                        transition={{ duration: 2.2, ease: "easeInOut" }}
                        className="w-full h-full bg-gradient-to-r from-transparent via-gold to-transparent"
                    />
                </div>
                <span className="text-[10px] text-gray-500 tracking-widest uppercase opacity-60">Initializing Core</span>
            </motion.div>
        </motion.div>
    );
}
