"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  GraduationCap,
  Rocket,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import { CuteMascot } from "@/components/auth/cute-mascot";

const STATS = [
  { icon: Users, label: "活跃学员", value: "100万+", color: "from-blue-500 to-blue-400" },
  { icon: BookOpen, label: "精品课程", value: "5000+", color: "from-green-500 to-green-400" },
  { icon: Trophy, label: "完成挑战", value: "1亿+", color: "from-amber-500 to-amber-400" },
];

export function LoginBrandPanel() {
  const [hoveredStat, setHoveredStat] = useState<number | null>(null);

  return (
    <motion.div
      className="flex max-w-lg flex-col items-center text-center lg:items-start lg:text-left"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="mb-4 flex items-center gap-3 lg:mb-5"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <motion.div
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/30"
          whileHover={{ rotate: 360, scale: 1.1 }}
          transition={{ duration: 0.6 }}
        >
          <GraduationCap className="h-8 w-8 text-primary-foreground" />
        </motion.div>
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">
            <span className="text-primary">学霸</span>
            <span className="text-foreground">星球</span>
          </h1>
          <p className="text-xs text-muted-foreground">让学习充满乐趣</p>
        </div>
      </motion.div>

      <motion.div
        className="mb-4 w-full overflow-visible py-1 pb-6 lg:mb-5 lg:self-start"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
      >
        <CuteMascot />
      </motion.div>

      <motion.h2
        className="mb-3 text-2xl font-extrabold leading-tight text-foreground md:text-3xl lg:text-4xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        让学习变成
        <motion.span
          className="relative mx-2 inline-flex items-center text-primary"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          快乐
          <Sparkles className="absolute -right-4 -top-2 h-5 w-5 text-accent" />
        </motion.span>
        的冒险
      </motion.h2>

      <motion.p
        className="mb-4 max-w-md text-pretty text-base leading-relaxed text-muted-foreground lg:mb-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        加入我们的学习社区，和百万小伙伴一起探索知识的海洋，收获成长的快乐！
      </motion.p>

      <motion.div
        className="flex flex-wrap justify-center gap-4 lg:justify-start"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        {STATS.map((stat, index) => (
          <motion.div
            key={stat.label}
            className="relative flex cursor-pointer items-center gap-2 overflow-hidden rounded-2xl border-2 border-border/50 bg-card/70 px-3 py-2.5 backdrop-blur-sm lg:px-4 lg:py-3"
            whileHover={{ scale: 1.05, y: -3 }}
            onHoverStart={() => setHoveredStat(index)}
            onHoverEnd={() => setHoveredStat(null)}
          >
            <motion.div
              className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0`}
              animate={{ opacity: hoveredStat === index ? 0.1 : 0 }}
            />
            <div
              className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}
            >
              <stat.icon className="h-6 w-6 text-white" />
            </div>
            <div className="relative z-10">
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        className="mt-4 hidden items-center gap-2 text-sm text-muted-foreground lg:flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <Rocket className="h-4 w-4 text-primary" />
        <span>每天都有新知识等你来探索</span>
      </motion.div>
    </motion.div>
  );
}
