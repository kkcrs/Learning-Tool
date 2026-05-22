"use client";

import { motion } from "framer-motion";

const ELEMENTS = [
  { icon: "📚", delay: 0, x: "8%", y: "15%", size: "text-4xl md:text-5xl" },
  { icon: "✏️", delay: 0.5, x: "88%", y: "12%", size: "text-3xl md:text-4xl" },
  { icon: "🎨", delay: 1, x: "12%", y: "75%", size: "text-3xl md:text-4xl" },
  { icon: "🔬", delay: 1.5, x: "82%", y: "68%", size: "text-4xl md:text-5xl" },
  { icon: "🎵", delay: 2, x: "3%", y: "45%", size: "text-2xl md:text-3xl" },
  { icon: "⭐", delay: 0.3, x: "92%", y: "35%", size: "text-3xl md:text-4xl" },
  { icon: "💡", delay: 0.8, x: "20%", y: "88%", size: "text-3xl md:text-4xl" },
  { icon: "🚀", delay: 1.2, x: "78%", y: "85%", size: "text-4xl md:text-5xl" },
  { icon: "🌈", delay: 0.6, x: "45%", y: "5%", size: "text-5xl md:text-6xl" },
  { icon: "🎮", delay: 1.8, x: "95%", y: "55%", size: "text-2xl md:text-3xl" },
  { icon: "🎯", delay: 2.2, x: "5%", y: "60%", size: "text-2xl md:text-3xl" },
];

const DECORATIONS = [
  { x: "15%", y: "25%", size: 60, color: "bg-primary/20", delay: 0.2 },
  { x: "85%", y: "30%", size: 40, color: "bg-secondary/30", delay: 0.4 },
  { x: "70%", y: "75%", size: 80, color: "bg-accent/20", delay: 0.6 },
  { x: "25%", y: "65%", size: 50, color: "bg-primary/15", delay: 0.8 },
];

export function FloatingElements() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {DECORATIONS.map((dec, index) => (
        <motion.div
          key={`dec-${index}`}
          className={`absolute rounded-full ${dec.color} blur-xl`}
          style={{
            left: dec.x,
            top: dec.y,
            width: dec.size,
            height: dec.size,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: [1, 1.2, 1] }}
          transition={{
            opacity: { delay: dec.delay, duration: 0.8 },
            scale: {
              delay: dec.delay + 0.8,
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
        />
      ))}
      {ELEMENTS.map((el, index) => (
        <motion.div
          key={index}
          className={`absolute ${el.size}`}
          style={{ left: el.x, top: el.y }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: 0.7,
            scale: 1,
            y: [0, -20, 0],
          }}
          transition={{
            opacity: { delay: el.delay, duration: 0.5 },
            y: {
              delay: el.delay + 0.5,
              duration: 3 + index * 0.2,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
        >
          {el.icon}
        </motion.div>
      ))}
    </div>
  );
}
