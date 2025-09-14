import React from "react";
import { motion } from "framer-motion";
import { Button } from "./button";
import { FileText } from "lucide-react";

interface FloatingActionButtonProps {
    onClick: () => void;
    isVisible: boolean;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
    onClick,
    isVisible,
}) => {
    if (!isVisible) return null;

    return (
        <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50"
        >
            <motion.div
                animate={{
                    y: [0, -10, 0],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            >
                <Button
                    onClick={onClick}
                    size="lg"
                    className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-2xl border-0 text-white"
                >
                    <FileText className="h-8 w-8" />
                </Button>
            </motion.div>
        </motion.div>
    );
};
