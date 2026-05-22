"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const CHAR_SIZE = 176;
const CHAR_CENTER = CHAR_SIZE / 2;
const BUBBLE_SPACE = 48;
/** 提示框相对几何中心的微调：往上、往左 */
const BUBBLE_SHIFT_LEFT = 14;
const BUBBLE_SHIFT_UP = 52;
const BADGE_SHIFT_LEFT = 12;
const BADGE_SHIFT_UP = 52;
const ANTENNA_SHIFT_LEFT = 42;
const MOUTH_COLOR = "#2a2438";
const BROW_COLOR = "#3d3550";
/** 天线与原点：避免 Tailwind bg-primary/60 在 oklch 变量上失效 */
const ANTENNA_PRIMARY_STALK = "oklch(0.65 0.22 340 / 0.7)";
const ANTENNA_PRIMARY_DOT = "oklch(0.65 0.22 340)";
const ANTENNA_SECONDARY_STALK = "oklch(0.85 0.15 200 / 0.7)";
const ANTENNA_SECONDARY_DOT = "oklch(0.85 0.15 200)";

/** 粒子从吉祥物底部中心向下方散开 */
function burstOffset(index: number, total: number) {
  const angleDeg = 30 + (index / (total - 1)) * 120;
  const rad = (angleDeg * Math.PI) / 180;
  const dist = 72;
  return {
    x: Math.cos(rad) * dist,
    y: Math.sin(rad) * dist + 28,
  };
}

export function CuteMascot() {
  const [isHappy, setIsHappy] = useState(false);
  const [clicks, setClicks] = useState(0);
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      if (!isHappy) {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 150);
      }
    }, 3000);
    return () => clearInterval(blinkInterval);
  }, [isHappy]);

  const handleClick = () => {
    setIsHappy(true);
    setClicks((prev) => prev + 1);
    setTimeout(() => setIsHappy(false), 1200);
  };

  const messages = [
    "点我玩！",
    "嘿嘿~",
    "好开心！",
    "再来！",
    "太棒了！",
    "你真厉害！",
    "我们是好朋友！",
    "学习使我快乐！",
    "一起加油！",
    "你是最棒的！",
  ];

  const bubbleText =
    clicks > 0
      ? messages[Math.min(clicks - 1, messages.length - 1)]
      : "点我玩！";

  const badgeLabel =
    clicks >= 20 ? "超级粉丝" : clicks >= 10 ? "好朋友" : "小伙伴";

  const charTop = BUBBLE_SPACE;
  const burstTop = charTop + CHAR_SIZE - 4;

  return (
    <motion.div
      className="relative cursor-pointer select-none overflow-visible"
      style={{ width: CHAR_SIZE, paddingBottom: clicks >= 5 ? 28 : 8 }}
      onClick={handleClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.92 }}
    >
      <motion.div
        className="absolute rounded-full bg-primary/20 blur-2xl"
        style={{
          width: CHAR_SIZE + 32,
          height: CHAR_SIZE + 32,
          left: CHAR_CENTER,
          top: charTop + CHAR_SIZE / 2,
          transform: "translate(-50%, -50%)",
        }}
        animate={{
          scale: isHappy ? [1, 1.3, 1] : [1, 1.1, 1],
          opacity: isHappy ? [0.3, 0.6, 0.3] : [0.2, 0.3, 0.2],
        }}
        transition={{ duration: isHappy ? 0.5 : 2, repeat: Infinity }}
      />

      {/* 顶部气泡 — 居中锚点 + 微调；动画不用 scale，避免盖住 translateX(-50%) */}
      <div
        className="absolute z-40"
        style={{
          left: CHAR_CENTER - BUBBLE_SHIFT_LEFT,
          top: -BUBBLE_SHIFT_UP,
          transform: "translateX(-50%)",
        }}
      >
        <motion.div
          className="whitespace-nowrap rounded-2xl border-2 border-primary/30 bg-card px-4 py-2 shadow-lg"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          key={bubbleText}
        >
          <span className="text-sm font-bold text-foreground">{bubbleText}</span>
          <div
            className="absolute -bottom-2 left-1/2 box-border h-4 w-4 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-primary/30 bg-card"
            aria-hidden
          />
        </motion.div>
      </div>

      {/* 角色 */}
      <motion.div
        className="relative overflow-visible"
        style={{
          width: CHAR_SIZE,
          height: CHAR_SIZE,
          marginTop: charTop,
        }}
        animate={isHappy ? { y: [0, -10, 0] } : { y: [0, -5, 0] }}
        transition={{
          duration: isHappy ? 0.5 : 3,
          repeat: isHappy ? 0 : Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="absolute inset-0 rounded-3xl bg-accent shadow-xl" />
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-accent to-accent/80 shadow-lg">
          <div className="absolute bottom-4 left-3 right-3 space-y-1">
            <div className="h-0.5 rounded bg-foreground/10" />
            <div className="h-0.5 w-4/5 rounded bg-foreground/10" />
            <div className="h-0.5 w-3/5 rounded bg-foreground/10" />
          </div>
        </div>

        <motion.div
          className="absolute -top-6 z-30 flex gap-6"
          style={{
            left: CHAR_CENTER - ANTENNA_SHIFT_LEFT,
            transform: "translateX(-50%)",
          }}
          animate={isHappy ? { y: [-2, -8, -2] } : { y: [0, -3, 0] }}
          transition={{ duration: isHappy ? 0.3 : 2, repeat: Infinity }}
        >
          <motion.div
            className="flex flex-col items-center"
            animate={{ rotate: isHappy ? [-15, 15, -15] : [-5, 5, -5] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            <div
              className="h-8 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: ANTENNA_PRIMARY_STALK }}
            />
            <div
              className="-mt-1 h-4 w-4 shrink-0 rounded-full shadow-lg"
              style={{ backgroundColor: ANTENNA_PRIMARY_DOT }}
            />
          </motion.div>
          <motion.div
            className="flex flex-col items-center"
            animate={{ rotate: isHappy ? [15, -15, 15] : [5, -5, 5] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            <div
              className="h-8 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: ANTENNA_SECONDARY_STALK }}
            />
            <div
              className="-mt-1 h-4 w-4 shrink-0 rounded-full shadow-lg"
              style={{ backgroundColor: ANTENNA_SECONDARY_DOT }}
            />
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute left-8 top-12 z-20"
          animate={isBlinking || isHappy ? { scaleY: [1, 0.1, 1] } : {}}
          transition={{ duration: 0.15, repeat: isHappy ? 3 : 0 }}
        >
          <div className="relative h-9 w-8 overflow-hidden rounded-full bg-foreground">
            <motion.div
              className="absolute left-1.5 top-1.5 h-3 w-3 rounded-full bg-card"
              animate={{
                x: isHappy ? [0, 2, 0] : 0,
                y: isHappy ? [0, -1, 0] : 0,
              }}
            />
            <div className="absolute left-3 top-3 h-1.5 w-1.5 rounded-full bg-card/60" />
          </div>
        </motion.div>
        <motion.div
          className="absolute right-8 top-12 z-20"
          animate={isBlinking || isHappy ? { scaleY: [1, 0.1, 1] } : {}}
          transition={{ duration: 0.15, repeat: isHappy ? 3 : 0 }}
        >
          <div className="relative h-9 w-8 overflow-hidden rounded-full bg-foreground">
            <motion.div
              className="absolute left-1.5 top-1.5 h-3 w-3 rounded-full bg-card"
              animate={{
                x: isHappy ? [0, 2, 0] : 0,
                y: isHappy ? [0, -1, 0] : 0,
              }}
            />
            <div className="absolute left-3 top-3 h-1.5 w-1.5 rounded-full bg-card/60" />
          </div>
        </motion.div>

        <motion.div
          className="absolute left-7 top-7 z-20 h-1.5 w-5 rounded-full"
          style={{ backgroundColor: BROW_COLOR, rotate: "-10deg" }}
          animate={isHappy ? { y: -3 } : { y: 0 }}
        />
        <motion.div
          className="absolute right-7 top-7 z-20 h-1.5 w-5 rounded-full"
          style={{ backgroundColor: BROW_COLOR, rotate: "10deg" }}
          animate={isHappy ? { y: -3 } : { y: 0 }}
        />

        {/* 嘴巴 — flex 居中，避免歪斜 */}
        <div className="absolute inset-x-0 top-[6.75rem] z-20 flex justify-center">
          <motion.div
            className="flex flex-col items-center"
            style={{ transformOrigin: "center center" }}
            animate={isHappy ? { scale: 1.2 } : { scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className="rounded-b-full"
              style={{
                width: isHappy ? 40 : 36,
                height: isHappy ? 20 : 18,
                backgroundColor: MOUTH_COLOR,
              }}
            />
            {isHappy && (
              <div
                className="-mt-2 rounded-b-full bg-primary/80"
                style={{ width: 24, height: 12 }}
              />
            )}
          </motion.div>
        </div>

        <motion.div
          className="absolute left-1 top-20 z-10 h-4 w-6 rounded-full bg-primary/50 blur-sm"
          animate={
            isHappy
              ? { scale: 1.3, opacity: 0.7 }
              : { scale: 1, opacity: 0.5 }
          }
        />
        <motion.div
          className="absolute right-1 top-20 z-10 h-4 w-6 rounded-full bg-primary/50 blur-sm"
          animate={
            isHappy
              ? { scale: 1.3, opacity: 0.7 }
              : { scale: 1, opacity: 0.5 }
          }
        />

        <motion.div
          className="absolute -left-4 top-20 z-30 h-8 w-6 rounded-full bg-accent shadow-md"
          animate={
            isHappy
              ? { rotate: [-30, 30, -30], x: [-5, 5, -5] }
              : { rotate: [-10, -5, -10] }
          }
          transition={{
            duration: isHappy ? 0.3 : 2,
            repeat: isHappy ? 2 : Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -right-4 top-20 z-30 h-8 w-6 rounded-full bg-accent shadow-md"
          animate={
            isHappy
              ? { rotate: [30, -30, 30], x: [5, -5, 5] }
              : { rotate: [10, 5, 10] }
          }
          transition={{
            duration: isHappy ? 0.3 : 2,
            repeat: isHappy ? 2 : Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>

      {/* 烟花 — 从吉祥物底部向下散开，不在脸上 */}
      {isHappy && (
        <div
          className="pointer-events-none absolute z-50"
          style={{
            left: CHAR_CENTER,
            top: burstTop,
            width: 0,
            height: 0,
          }}
        >
          {[...Array(8)].map((_, i) => {
            const end = burstOffset(i, 8);
            return (
              <motion.span
                key={i}
                className="absolute left-0 top-0 text-lg md:text-xl"
                initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                animate={{
                  opacity: 0,
                  scale: 1.5,
                  x: end.x,
                  y: end.y,
                }}
                transition={{ duration: 0.8 }}
              >
                {i % 2 === 0 ? "💖" : "✨"}
              </motion.span>
            );
          })}
        </div>
      )}

      {/* 底部徽章 — 相对吉祥物居中 + 微调 */}
      {clicks >= 5 && (
        <div
          className="absolute z-40"
          style={{
            left: CHAR_CENTER - BADGE_SHIFT_LEFT,
            top: charTop + CHAR_SIZE + 6 - BADGE_SHIFT_UP,
            transform: "translateX(-50%)",
          }}
        >
          <motion.div
            className="rounded-full bg-primary px-3 py-1.5 text-center text-xs font-bold leading-tight text-primary-foreground shadow-lg"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            <span className="block">{badgeLabel}</span>
            <span className="block opacity-90">x{clicks}</span>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
