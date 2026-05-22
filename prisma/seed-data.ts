/**
 * 小学 1–6 年级科目与知识点种子数据
 * parent 为 undefined 表示顶级节点
 */

export type KnowledgePointSeed = {
  name: string;
  grade: number;
  order: number;
  children?: KnowledgePointSeed[];
};

export type SubjectSeed = {
  name: string;
  icon: string;
  knowledgePoints: KnowledgePointSeed[];
};

export const subjectSeeds: SubjectSeed[] = [
  {
    name: "数学",
    icon: "🔢",
    knowledgePoints: [
      {
        name: "20以内加减法",
        grade: 1,
        order: 1,
        children: [
          { name: "不进位加法", grade: 1, order: 1 },
          { name: "不退位减法", grade: 1, order: 2 },
          { name: "进位加法", grade: 1, order: 3 },
          { name: "退位减法", grade: 1, order: 4 },
        ],
      },
      { name: "认识图形", grade: 1, order: 2 },
      { name: "认识钟表", grade: 1, order: 3 },
      {
        name: "100以内加减法",
        grade: 2,
        order: 1,
        children: [
          { name: "两位数加一位数", grade: 2, order: 1 },
          { name: "两位数减一位数", grade: 2, order: 2 },
          { name: "两位数加减两位数", grade: 2, order: 3 },
        ],
      },
      { name: "表内乘法", grade: 2, order: 2 },
      { name: "表内除法", grade: 2, order: 3 },
      { name: "长度单位", grade: 2, order: 4 },
      { name: "万以内加减法", grade: 3, order: 1 },
      { name: "有余数的除法", grade: 3, order: 2 },
      {
        name: "分数",
        grade: 3,
        order: 3,
        children: [
          { name: "认识分数", grade: 3, order: 1 },
          { name: "同分母分数加减", grade: 3, order: 2 },
          { name: "通分", grade: 4, order: 3 },
          { name: "约分", grade: 4, order: 4 },
          { name: "分数加减法", grade: 4, order: 5 },
          { name: "分数乘除法", grade: 5, order: 6 },
        ],
      },
      { name: "周长与面积", grade: 3, order: 4 },
      { name: "大数的认识", grade: 4, order: 1 },
      {
        name: "小数",
        grade: 4,
        order: 2,
        children: [
          { name: "小数的意义", grade: 4, order: 1 },
          { name: "小数加减法", grade: 4, order: 2 },
          { name: "小数乘除法", grade: 5, order: 3 },
        ],
      },
      { name: "平行四边形与梯形", grade: 4, order: 3 },
      { name: "简易方程", grade: 5, order: 1 },
      { name: "体积与容积", grade: 5, order: 2 },
      {
        name: "比例",
        grade: 6,
        order: 1,
        children: [
          { name: "比的意义", grade: 6, order: 1 },
          { name: "比例尺", grade: 6, order: 2 },
        ],
      },
      { name: "百分数", grade: 6, order: 2 },
      {
        name: "圆",
        grade: 6,
        order: 3,
        children: [
          { name: "圆的周长", grade: 6, order: 1 },
          { name: "圆的面积", grade: 6, order: 2 },
        ],
      },
      { name: "负数", grade: 6, order: 4 },
    ],
  },
  {
    name: "语文",
    icon: "📖",
    knowledgePoints: [
      {
        name: "拼音",
        grade: 1,
        order: 1,
        children: [
          { name: "声母韵母", grade: 1, order: 1 },
          { name: "整体认读音节", grade: 1, order: 2 },
          { name: "拼读规则", grade: 1, order: 3 },
        ],
      },
      { name: "识字与写字", grade: 1, order: 2 },
      { name: "看图写话", grade: 1, order: 3 },
      { name: "词语积累", grade: 2, order: 1 },
      { name: "标点符号", grade: 2, order: 2 },
      { name: "修辞手法", grade: 3, order: 1 },
      {
        name: "阅读理解",
        grade: 3,
        order: 2,
        children: [
          { name: "记叙文阅读", grade: 3, order: 1 },
          { name: "说明文阅读", grade: 4, order: 2 },
          { name: "议论文入门", grade: 6, order: 3 },
        ],
      },
      {
        name: "古诗文",
        grade: 3,
        order: 3,
        children: [
          { name: "古诗背诵", grade: 3, order: 1 },
          { name: "文言文入门", grade: 5, order: 2 },
        ],
      },
      {
        name: "习作",
        grade: 4,
        order: 1,
        children: [
          { name: "写人记事", grade: 4, order: 1 },
          { name: "写景状物", grade: 4, order: 2 },
          { name: "议论文习作", grade: 6, order: 3 },
        ],
      },
    ],
  },
  {
    name: "英语",
    icon: "🔤",
    knowledgePoints: [
      {
        name: "字母与发音",
        grade: 1,
        order: 1,
        children: [
          { name: "26个字母", grade: 1, order: 1 },
          { name: "自然拼读", grade: 2, order: 2 },
        ],
      },
      {
        name: "基础词汇",
        grade: 2,
        order: 1,
        children: [
          { name: "颜色与数字", grade: 2, order: 1 },
          { name: "家庭成员", grade: 2, order: 2 },
          { name: "动物与食物", grade: 3, order: 3 },
        ],
      },
      {
        name: "常用句型",
        grade: 3,
        order: 1,
        children: [
          { name: "问候与介绍", grade: 3, order: 1 },
          { name: "询问与回答", grade: 3, order: 2 },
          { name: "there be 句型", grade: 4, order: 3 },
        ],
      },
      {
        name: "时态",
        grade: 4,
        order: 2,
        children: [
          { name: "一般现在时", grade: 4, order: 1 },
          { name: "现在进行时", grade: 5, order: 2 },
          { name: "一般过去时", grade: 5, order: 3 },
          { name: "一般将来时", grade: 6, order: 4 },
        ],
      },
      { name: "阅读理解", grade: 5, order: 1 },
      { name: "书面表达", grade: 6, order: 1 },
    ],
  },
];
