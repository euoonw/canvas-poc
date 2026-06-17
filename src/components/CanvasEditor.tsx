"use client";

import { useEffect, useRef, useState } from "react";
import {
  Stage,
  Layer,
  Rect,
  Text,
  Line,
  Image as KonvaImage,
  Transformer,
} from "react-konva";
import Konva from "konva";

interface TextElement {
  id: string;
  type: "text";
  x: number;
  y: number;
  text: string;
  fontSize: number;
  fontStyle?: string;
  fill: string;
  draggable: boolean;
  width?: number;
  height?: number;
  align?: string;
  verticalAlign?: string;
}

interface RectElement {
  id: string;
  type: "rect";
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  draggable: boolean;
  cornerRadius?: number;
}

interface ImageElement {
  id: string;
  type: "image";
  x: number;
  y: number;
  width: number;
  height: number;
  src: string;
  draggable: boolean;
  cornerRadius?: number;
}

interface LineElement {
  id: string;
  type: "line";
  x: number;
  y: number;
  points: number[];
  stroke: string;
  strokeWidth: number;
  draggable: boolean;
}

export type CanvasElement =
  | TextElement
  | RectElement
  | ImageElement
  | LineElement;

interface AIResponse {
  version: number;
  canvas: { width: number; height: number };
  elements: CanvasElement[];
}

// AI가 반환하는 데이터 형식 그대로 사용
const MOCK_AI_RESPONSE: AIResponse = {
  version: 1,
  canvas: { width: 800, height: 600 },
  elements: [
    {
      id: "bg",
      type: "rect",
      x: 0,
      y: 0,
      width: 800,
      height: 600,
      fill: "#0f172a",
      draggable: false,
    },
    {
      id: "product-img",
      type: "image",
      x: 40,
      y: 140,
      width: 280,
      height: 280,
      src: "https://example.com/product.jpg",
      cornerRadius: 8,
      draggable: true,
    },
    {
      id: "badge-bg",
      type: "rect",
      x: 360,
      y: 70,
      width: 120,
      height: 28,
      fill: "#f97316",
      cornerRadius: 4,
      draggable: false,
    },
    {
      id: "badge-text",
      type: "text",
      x: 360,
      y: 78,
      text: "NEW ARRIVAL",
      fontSize: 12,
      fontStyle: "bold",
      fill: "#ffffff",
      draggable: true,
    },
    {
      id: "title",
      type: "text",
      x: 360,
      y: 120,
      text: "프리미엄 제품명",
      fontSize: 28,
      fontStyle: "bold",
      fill: "#ffffff",
      width: 400,
      draggable: true,
    },
    {
      id: "price",
      type: "text",
      x: 360,
      y: 220,
      text: "129,000원",
      fontSize: 32,
      fontStyle: "bold",
      fill: "#f97316",
      draggable: true,
    },
    {
      id: "divider",
      type: "line",
      x: 0,
      y: 0,
      points: [360, 260, 760, 260],
      stroke: "#334155",
      strokeWidth: 1,
      draggable: false,
    },
    {
      id: "cta-bg",
      type: "rect",
      x: 360,
      y: 500,
      width: 200,
      height: 52,
      fill: "#f97316",
      cornerRadius: 8,
      draggable: false,
    },
    {
      id: "cta-text",
      type: "text",
      x: 360,
      y: 500,
      text: "지금 구매하기",
      fontSize: 18,
      fontStyle: "bold",
      fill: "#ffffff",
      width: 200,
      height: 52,
      align: "center",
      verticalAlign: "middle",
      draggable: false,
    },
  ],
};

// AI가 반환하는 데이터 형식 그대로 사용
const MOCK_AI_RESPONSE_2: AIResponse = {
  version: 1,
  canvas: { width: 800, height: 600 },
  elements: [
    {
      id: "bg",
      type: "rect",
      x: 0,
      y: 0,
      width: 800,
      height: 600,
      fill: "#0f172a",
      draggable: false,
    },
    {
      id: "product-img",
      type: "image",
      x: 40,
      y: 140,
      width: 280,
      height: 280,
      src: "https://picsum.photos/seed/earbuds/280/280",
      cornerRadius: 8,
      draggable: true,
    },
    {
      id: "badge-bg",
      type: "rect",
      x: 360,
      y: 70,
      width: 120,
      height: 28,
      fill: "#f97316",
      cornerRadius: 4,
      draggable: false,
    },
    {
      id: "badge-text",
      type: "text",
      x: 368,
      y: 78,
      text: "NEW ARRIVAL",
      fontSize: 12,
      fontStyle: "bold",
      fill: "#ffffff",
      draggable: true,
    },
    {
      id: "title",
      type: "text",
      x: 360,
      y: 120,
      text: "프리미엄 무선 이어폰 X1",
      fontSize: 28,
      fontStyle: "bold",
      fill: "#ffffff",
      width: 400,
      draggable: true,
    },
    {
      id: "price",
      type: "text",
      x: 360,
      y: 220,
      text: "129,000원",
      fontSize: 32,
      fontStyle: "bold",
      fill: "#f97316",
      draggable: true,
    },
    {
      id: "divider",
      type: "line",
      x: 0,
      y: 0,
      points: [360, 270, 760, 270],
      stroke: "#334155",
      strokeWidth: 1,
      draggable: false,
    },
    {
      id: "desc",
      type: "text",
      x: 360,
      y: 290,
      text: "완벽한 노이즈 캔슬링과 24시간 배터리로\n어디서든 최고의 음질을 경험하세요.",
      fontSize: 15,
      fill: "#94a3b8",
      width: 390,
      draggable: true,
    },
    {
      id: "feature-0",
      type: "text",
      x: 360,
      y: 370,
      text: "✓  액티브 노이즈 캔슬링",
      fontSize: 14,
      fill: "#ffffff",
      draggable: true,
    },
    {
      id: "feature-1",
      type: "text",
      x: 360,
      y: 398,
      text: "✓  24시간 배터리",
      fontSize: 14,
      fill: "#ffffff",
      draggable: true,
    },
    {
      id: "feature-2",
      type: "text",
      x: 360,
      y: 426,
      text: "✓  IPX5 방수",
      fontSize: 14,
      fill: "#ffffff",
      draggable: true,
    },
    {
      id: "cta-bg",
      type: "rect",
      x: 360,
      y: 500,
      width: 200,
      height: 52,
      fill: "#f97316",
      cornerRadius: 8,
      draggable: false,
    },
    {
      id: "cta-text",
      type: "text",
      x: 360,
      y: 500,
      text: "지금 구매하기",
      fontSize: 18,
      fontStyle: "bold",
      fill: "#ffffff",
      width: 200,
      height: 52,
      align: "center",
      verticalAlign: "middle",
      draggable: false,
    },
  ],
};

// ─── 슬라이드(캐러셀) 스키마 타입 ───────────────────────────────────────────

interface SlideTextElement {
  type: "text";
  x: number;
  y: number;
  width: number;
  height: number | null;
  value: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  letterSpacing: string;
  lineHeight: number;
  color: string;
  textAlign: string;
  paddingX?: number;
  paddingY?: number;
}

interface SlideRectElement {
  type: "rect";
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  borderRadius: number;
}

interface SlideImageElement {
  type: "image";
  x: number;
  y: number;
  width: number;
  height: number;
  src: string;
  borderRadius: number;
  objectFit: string;
}

interface SlideLineElement {
  type: "line";
  points: number[];
  stroke: string;
  strokeWidth: number;
  lineCap?: string;
}

interface SlideEllipseElement {
  type: "ellipse";
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  fill: string;
}

interface SlideCircleElement {
  type: "circle";
  cx: number;
  cy: number;
  r: number;
  fill: string;
}

type SlideLeafElement =
  | SlideTextElement
  | SlideRectElement
  | SlideImageElement
  | SlideLineElement
  | SlideEllipseElement
  | SlideCircleElement;

interface SlideGroupElement {
  type: "group";
  id?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  elements: SlideLeafElement[];
}

type SlideElement = SlideLeafElement | SlideGroupElement;

interface Slide {
  id: string;
  type: string;
  series: string;
  width: number;
  height: number;
  elements: SlideElement[];
}

interface SlideResponse {
  slides: Slide[];
}

const MOCK_SLIDES: SlideResponse = {
  slides: [
    {
      id: "slide-01",
      type: "title-slide",
      series: "claude",
      width: 1080,
      height: 1350,
      elements: [
        {
          type: "rect",
          x: 0,
          y: 0,
          width: 1080,
          height: 1350,
          fill: "#F7F3E5",
          borderRadius: 0,
        },
        {
          type: "rect",
          x: 88,
          y: 88,
          width: 280,
          height: 64,
          fill: "#0D0D0D",
          borderRadius: 7,
        },
        {
          type: "text",
          x: 88,
          y: 88,
          width: 280,
          height: 64,
          value: "Design Trend",
          fontFamily: "SUIT",
          fontSize: 30,
          fontWeight: 600,
          letterSpacing: "-2%",
          lineHeight: 1.51,
          color: "#FFFFFF",
          textAlign: "center",
          paddingX: 22,
          paddingY: 10,
        },
        {
          type: "text",
          x: 88,
          y: 200,
          width: 840,
          height: null,
          value: "디자이너는\nClaude,\n어떻게\n사용할까?",
          fontFamily: "SUIT",
          fontSize: 126,
          fontWeight: 600,
          letterSpacing: "-4%",
          lineHeight: 1.156,
          color: "#0D0D0D",
          textAlign: "left",
        },
        {
          type: "text",
          x: 88,
          y: 920,
          width: 700,
          height: null,
          value:
            "Claude · Claude Design · Claude Code\n세 가지를 하나의 흐름으로 연결해요.",
          fontFamily: "SUIT",
          fontSize: 39,
          fontWeight: 400,
          letterSpacing: "-3%",
          lineHeight: 1.6,
          color: "#0D0D0D",
          textAlign: "left",
        },
        {
          type: "image",
          x: 579,
          y: 835,
          width: 501,
          height: 501,
          src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Claude_AI_logo.svg/512px-Claude_AI_logo.svg.png",
          borderRadius: 48,
          objectFit: "contain",
        },
        {
          type: "text",
          x: 88,
          y: 1268,
          width: 400,
          height: null,
          value: "@design_front",
          fontFamily: "SUIT",
          fontSize: 42,
          fontWeight: 300,
          letterSpacing: "-3%",
          lineHeight: 1.248,
          color: "#0D0D0D",
          textAlign: "left",
        },
      ],
    },
    {
      id: "slide-02",
      type: "overview-slide",
      series: "claude",
      width: 1080,
      height: 1350,
      elements: [
        {
          type: "rect",
          x: 0,
          y: 0,
          width: 1080,
          height: 1350,
          fill: "#F7F3E5",
          borderRadius: 0,
        },
        {
          type: "text",
          x: 88,
          y: 88,
          width: 904,
          height: null,
          value:
            "클로드? 클로드 디자인?\n클로드 코드? 각각 뭐가\n다르고, 어떻게 디자인에\n활용할까요?",
          fontFamily: "SUIT",
          fontSize: 47,
          fontWeight: 700,
          letterSpacing: "-2%",
          lineHeight: 1.45,
          color: "#0D0D0D",
          textAlign: "left",
        },
        {
          type: "text",
          x: 88,
          y: 530,
          width: 904,
          height: null,
          value:
            "세 가지 도구를 '아이디어 → 디자인 → 코드'\n하나의 흐름으로 연결해서 사용해요.",
          fontFamily: "SUIT",
          fontSize: 39,
          fontWeight: 400,
          letterSpacing: "-3%",
          lineHeight: 1.6,
          color: "#0D0D0D",
          textAlign: "left",
        },
        {
          type: "rect",
          x: 88,
          y: 665,
          width: 904,
          height: 1,
          fill: "#D1D7DF",
          borderRadius: 0,
        },
        {
          type: "group",
          id: "orbital-diagram",
          x: 180,
          y: 690,
          width: 720,
          height: 600,
          elements: [
            {
              type: "ellipse",
              cx: 360,
              cy: 324,
              rx: 190,
              ry: 190,
              fill: "#FFFFFF",
            },
            {
              type: "line",
              points: [360, 120, 120, 480],
              stroke: "rgba(233,112,80,0.8)",
              strokeWidth: 10,
              lineCap: "round",
            },
            {
              type: "line",
              points: [360, 120, 600, 480],
              stroke: "rgba(233,112,80,0.5)",
              strokeWidth: 10,
              lineCap: "round",
            },
            {
              type: "line",
              points: [120, 480, 600, 480],
              stroke: "rgba(233,112,80,0.3)",
              strokeWidth: 10,
              lineCap: "round",
            },
            { type: "circle", cx: 360, cy: 120, r: 120, fill: "#E95524" },
            {
              type: "text",
              x: 280,
              y: 90,
              width: 160,
              height: 60,
              value: "Claude",
              fontFamily: "SUIT",
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: "-2%",
              lineHeight: 1.51,
              color: "#FFFFFF",
              textAlign: "center",
            },
            {
              type: "text",
              x: 280,
              y: 118,
              width: 160,
              height: 40,
              value: "아이디어 구체화",
              fontFamily: "SUIT",
              fontSize: 22,
              fontWeight: 400,
              letterSpacing: "-2%",
              lineHeight: 1.4,
              color: "#FFFFFF",
              textAlign: "center",
            },
            { type: "circle", cx: 120, cy: 480, r: 120, fill: "#D97757" },
            {
              type: "text",
              x: 40,
              y: 452,
              width: 160,
              height: 60,
              value: "Claude\nDesign",
              fontFamily: "SUIT",
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: "-2%",
              lineHeight: 1.3,
              color: "#FFFFFF",
              textAlign: "center",
            },
            {
              type: "text",
              x: 40,
              y: 510,
              width: 160,
              height: 40,
              value: "프로토타입 제작",
              fontFamily: "SUIT",
              fontSize: 20,
              fontWeight: 400,
              letterSpacing: "-2%",
              lineHeight: 1.4,
              color: "#FFFFFF",
              textAlign: "center",
            },
            { type: "circle", cx: 600, cy: 480, r: 120, fill: "#D97757" },
            {
              type: "text",
              x: 520,
              y: 452,
              width: 160,
              height: 60,
              value: "Claude\nCode",
              fontFamily: "SUIT",
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: "-2%",
              lineHeight: 1.3,
              color: "#FFFFFF",
              textAlign: "center",
            },
            {
              type: "text",
              x: 520,
              y: 510,
              width: 160,
              height: 40,
              value: "UI 코드 변환",
              fontFamily: "SUIT",
              fontSize: 20,
              fontWeight: 400,
              letterSpacing: "-2%",
              lineHeight: 1.4,
              color: "#FFFFFF",
              textAlign: "center",
            },
          ],
        },
        {
          type: "text",
          x: 88,
          y: 1290,
          width: 400,
          height: null,
          value: "@design_front",
          fontFamily: "SUIT",
          fontSize: 42,
          fontWeight: 300,
          letterSpacing: "-3%",
          lineHeight: 1.248,
          color: "#0D0D0D",
          textAlign: "left",
        },
      ],
    },
    {
      id: "slide-03",
      type: "content-slide",
      series: "claude",
      width: 1080,
      height: 1350,
      elements: [
        {
          type: "rect",
          x: 0,
          y: 0,
          width: 1080,
          height: 1350,
          fill: "#F7F3E5",
          borderRadius: 0,
        },
        {
          type: "text",
          x: 88,
          y: 88,
          width: 904,
          height: null,
          value: "실제로 이런 순서로 사용해요.",
          fontFamily: "SUIT",
          fontSize: 47,
          fontWeight: 700,
          letterSpacing: "-2%",
          lineHeight: 1.45,
          color: "#0D0D0D",
          textAlign: "left",
        },
        {
          type: "text",
          x: 88,
          y: 230,
          width: 904,
          height: null,
          value: "아이디어부터 배포까지, 하나의 흐름으로!",
          fontFamily: "SUIT",
          fontSize: 39,
          fontWeight: 400,
          letterSpacing: "-3%",
          lineHeight: 1.6,
          color: "#0D0D0D",
          textAlign: "left",
        },
        {
          type: "rect",
          x: 88,
          y: 340,
          width: 904,
          height: 176,
          fill: "#FFFFFF",
          borderRadius: 16,
        },
        {
          type: "rect",
          x: 88,
          y: 340,
          width: 12,
          height: 176,
          fill: "#E95524",
          borderRadius: 16,
        },
        {
          type: "text",
          x: 128,
          y: 364,
          width: 64,
          height: 64,
          value: "1",
          fontFamily: "SUIT",
          fontSize: 30,
          fontWeight: 800,
          letterSpacing: "-2%",
          lineHeight: 1.51,
          color: "#E95524",
          textAlign: "center",
        },
        {
          type: "text",
          x: 200,
          y: 356,
          width: 760,
          height: null,
          value: "Claude - 아이디어 구체화",
          fontFamily: "SUIT",
          fontSize: 42,
          fontWeight: 700,
          letterSpacing: "-3%",
          lineHeight: 1.55,
          color: "#0D0D0D",
          textAlign: "left",
        },
        {
          type: "text",
          x: 200,
          y: 422,
          width: 760,
          height: null,
          value: "경쟁사 분석 자동화 · 개선 방향 도출",
          fontFamily: "SUIT",
          fontSize: 32,
          fontWeight: 400,
          letterSpacing: "-3%",
          lineHeight: 1.6,
          color: "#666666",
          textAlign: "left",
        },
        {
          type: "rect",
          x: 88,
          y: 532,
          width: 904,
          height: 176,
          fill: "#FFFFFF",
          borderRadius: 16,
        },
        {
          type: "rect",
          x: 88,
          y: 532,
          width: 12,
          height: 176,
          fill: "#D97757",
          borderRadius: 16,
        },
        {
          type: "text",
          x: 128,
          y: 556,
          width: 64,
          height: 64,
          value: "2",
          fontFamily: "SUIT",
          fontSize: 30,
          fontWeight: 800,
          letterSpacing: "-2%",
          lineHeight: 1.51,
          color: "#D97757",
          textAlign: "center",
        },
        {
          type: "text",
          x: 200,
          y: 548,
          width: 760,
          height: null,
          value: "Claude Design - 프로토타입 제작",
          fontFamily: "SUIT",
          fontSize: 42,
          fontWeight: 700,
          letterSpacing: "-3%",
          lineHeight: 1.55,
          color: "#0D0D0D",
          textAlign: "left",
        },
        {
          type: "text",
          x: 200,
          y: 614,
          width: 760,
          height: null,
          value: "스펙 문서 없이 바로 변환",
          fontFamily: "SUIT",
          fontSize: 32,
          fontWeight: 400,
          letterSpacing: "-3%",
          lineHeight: 1.6,
          color: "#666666",
          textAlign: "left",
        },
        {
          type: "rect",
          x: 88,
          y: 724,
          width: 904,
          height: 176,
          fill: "#FFFFFF",
          borderRadius: 16,
        },
        {
          type: "rect",
          x: 88,
          y: 724,
          width: 12,
          height: 176,
          fill: "#0D0D0D",
          borderRadius: 16,
        },
        {
          type: "text",
          x: 128,
          y: 748,
          width: 64,
          height: 64,
          value: "3",
          fontFamily: "SUIT",
          fontSize: 30,
          fontWeight: 800,
          letterSpacing: "-2%",
          lineHeight: 1.51,
          color: "#0D0D0D",
          textAlign: "center",
        },
        {
          type: "text",
          x: 200,
          y: 740,
          width: 760,
          height: null,
          value: "Claude Code - 코드 구현",
          fontFamily: "SUIT",
          fontSize: 42,
          fontWeight: 700,
          letterSpacing: "-3%",
          lineHeight: 1.55,
          color: "#0D0D0D",
          textAlign: "left",
        },
        {
          type: "text",
          x: 200,
          y: 806,
          width: 760,
          height: null,
          value: "디자인 시스템 자동 인식 → UI 바로 배포",
          fontFamily: "SUIT",
          fontSize: 32,
          fontWeight: 400,
          letterSpacing: "-3%",
          lineHeight: 1.6,
          color: "#666666",
          textAlign: "left",
        },
        {
          type: "rect",
          x: 88,
          y: 940,
          width: 904,
          height: 2,
          fill: "#D1D7DF",
          borderRadius: 0,
        },
        {
          type: "text",
          x: 88,
          y: 974,
          width: 904,
          height: null,
          value:
            "화면 캡처 → UX리뷰 → 개선 방향 도출\n이 흐름을 Claude 하나로 연결할 수 있어요.",
          fontFamily: "Pretendard",
          fontSize: 39,
          fontWeight: 400,
          letterSpacing: "-3%",
          lineHeight: 1.6,
          color: "#0D0D0D",
          textAlign: "left",
        },
        {
          type: "text",
          x: 88,
          y: 1290,
          width: 400,
          height: null,
          value: "@design_front",
          fontFamily: "SUIT",
          fontSize: 42,
          fontWeight: 300,
          letterSpacing: "-3%",
          lineHeight: 1.248,
          color: "#0D0D0D",
          textAlign: "left",
        },
      ],
    },
  ],
};

export default function CanvasEditor() {
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [exportPending, setExportPending] = useState(false);
  const [loadedImages, setLoadedImages] = useState<
    Record<string, HTMLImageElement>
  >({});
  const loadingStarted = useRef<Set<string>>(new Set());
  const transformerRef = useRef<Konva.Transformer>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 이미지 프리로드
  useEffect(() => {
    elements
      .filter((el): el is ImageElement => el.type === "image")
      .forEach((el) => {
        if (loadingStarted.current.has(el.src)) return;
        loadingStarted.current.add(el.src);
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.onload = () =>
          setLoadedImages((prev) => ({ ...prev, [el.src]: img }));
        img.src = el.src;
      });
  }, [elements]);

  // Transformer 연결
  useEffect(() => {
    if (!transformerRef.current || !stageRef.current) return;
    if (selectedId && !editingId) {
      const node = stageRef.current.findOne(`#${selectedId}`);
      if (node) {
        transformerRef.current.nodes([node]);
        transformerRef.current.getLayer()?.batchDraw();
      }
    } else {
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [selectedId, editingId]);

  // textarea 포커스
  useEffect(() => {
    if (editingId && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [editingId]);

  // selection이 사라진 다음 렌더 사이클에서 export 실행
  useEffect(() => {
    if (!exportPending || !stageRef.current) return;
    setExportPending(false);
    const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
    const link = document.createElement("a");
    link.download = "product-detail.png";
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [exportPending]);

  const handleGenerate = () => {
    setIsLoading(true);
    setSelectedId(null);
    setEditingId(null);
    // 실제 서비스: const data: AIResponse = await fetch("/api/generate").then(r => r.json())
    setTimeout(() => {
      const data = MOCK_AI_RESPONSE_2;
      setCanvasSize(data.canvas);
      setElements(data.elements);
      setIsLoading(false);
      setIsGenerated(true);
    }, 1500);
  };

  const handleExport = () => {
    setSelectedId(null);
    setEditingId(null);
    setExportPending(true);
  };

  const handleDragEnd = (id: string, x: number, y: number) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, x, y } : el)),
    );
  };

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target === e.target.getStage()) setSelectedId(null);
  };

  const startEditing = (el: TextElement) => {
    setEditingId(el.id);
    setEditingValue(el.text);
    setSelectedId(null);
  };

  const finishEditing = () => {
    if (!editingId) return;
    const trimmed = editingValue.trim();
    if (trimmed) {
      setElements((prev) =>
        prev.map((el) => (el.id === editingId ? { ...el, text: trimmed } : el)),
      );
    }
    setEditingId(null);
  };

  const getTextareaStyle = (el: TextElement): React.CSSProperties => {
    const containerRect = containerRef.current?.getBoundingClientRect();
    const stageRect = stageRef.current?.container().getBoundingClientRect();
    if (!containerRect || !stageRect) return {};
    const offsetX = stageRect.left - containerRect.left;
    const offsetY = stageRect.top - containerRect.top;
    return {
      position: "absolute",
      left: offsetX + el.x,
      top: offsetY + el.y,
      fontSize: el.fontSize,
      fontWeight: el.fontStyle === "bold" ? "bold" : "normal",
      color: el.fill,
      border: "1px dashed #60a5fa",
      outline: "none",
      background: "rgba(255,255,255,0.08)",
      resize: "none",
      overflow: "hidden",
      lineHeight: "1.2",
      width: el.width ?? 200,
      padding: 0,
      margin: 0,
      fontFamily: "sans-serif",
    };
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            AI 상품 상세페이지 에디터
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            텍스트를 더블클릭하면 직접 편집할 수 있습니다
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2 text-sm font-medium"
            onClick={handleGenerate}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                AI 생성 중...
              </>
            ) : isGenerated ? (
              "↺ 재생성"
            ) : (
              "✨ AI 상품페이지 생성"
            )}
          </button>
          {isGenerated && (
            <button
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium"
              onClick={handleExport}
            >
              ↓ 이미지 저장
            </button>
          )}
        </div>
      </div>

      <div
        ref={containerRef}
        className="border border-gray-300 rounded-lg overflow-hidden w-fit relative"
      >
        <Stage
          ref={stageRef}
          width={canvasSize.width}
          height={canvasSize.height}
          onClick={handleStageClick}
        >
          <Layer>
            {elements.length === 0 && (
              <Rect
                x={0}
                y={0}
                width={canvasSize.width}
                height={canvasSize.height}
                fill="#f8fafc"
              />
            )}

            {elements.map((el) => {
              if (el.type === "rect") {
                return (
                  <Rect
                    key={el.id}
                    id={el.id}
                    x={el.x}
                    y={el.y}
                    width={el.width}
                    height={el.height}
                    fill={el.fill}
                    cornerRadius={el.cornerRadius}
                    draggable={el.draggable}
                    onClick={() => el.draggable && setSelectedId(el.id)}
                    onDragEnd={(e) =>
                      handleDragEnd(el.id, e.target.x(), e.target.y())
                    }
                  />
                );
              }

              if (el.type === "line") {
                return (
                  <Line
                    key={el.id}
                    id={el.id}
                    x={el.x}
                    y={el.y}
                    points={el.points}
                    stroke={el.stroke}
                    strokeWidth={el.strokeWidth}
                    draggable={el.draggable}
                    onDragEnd={(e) =>
                      handleDragEnd(el.id, e.target.x(), e.target.y())
                    }
                  />
                );
              }

              if (el.type === "image") {
                const img = loadedImages[el.src];
                if (!img) {
                  return (
                    <Rect
                      key={el.id}
                      x={el.x}
                      y={el.y}
                      width={el.width}
                      height={el.height}
                      fill="#1e293b"
                      cornerRadius={el.cornerRadius}
                    />
                  );
                }
                return (
                  <KonvaImage
                    key={el.id}
                    id={el.id}
                    x={el.x}
                    y={el.y}
                    width={el.width}
                    height={el.height}
                    image={img}
                    cornerRadius={el.cornerRadius}
                    draggable={el.draggable}
                    onClick={() => setSelectedId(el.id)}
                    onDragEnd={(e) =>
                      handleDragEnd(el.id, e.target.x(), e.target.y())
                    }
                  />
                );
              }

              if (el.type === "text") {
                return (
                  <Text
                    key={el.id}
                    id={el.id}
                    x={el.x}
                    y={el.y}
                    text={el.text}
                    fontSize={el.fontSize}
                    fontStyle={el.fontStyle}
                    fill={el.fill}
                    width={el.width}
                    height={el.height}
                    align={el.align}
                    verticalAlign={el.verticalAlign}
                    draggable={el.draggable && editingId !== el.id}
                    visible={editingId !== el.id}
                    onClick={() => setSelectedId(el.id)}
                    onDblClick={() => startEditing(el)}
                    onDragEnd={(e) =>
                      handleDragEnd(el.id, e.target.x(), e.target.y())
                    }
                  />
                );
              }
            })}

            <Transformer ref={transformerRef} />
          </Layer>
        </Stage>

        {editingId &&
          (() => {
            const el = elements.find((e) => e.id === editingId);
            if (!el || el.type !== "text") return null;
            return (
              <textarea
                ref={textareaRef}
                rows={1}
                value={editingValue}
                style={getTextareaStyle(el)}
                onChange={(e) => setEditingValue(e.target.value)}
                onBlur={finishEditing}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    finishEditing();
                  }
                  if (e.key === "Escape") setEditingId(null);
                }}
              />
            );
          })()}

        {elements.length === 0 && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-gray-400">
              <div className="text-5xl mb-3">✨</div>
              <p className="text-lg font-medium">
                위 버튼을 눌러 AI 상품페이지를 생성하세요
              </p>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-purple-700 font-medium">
                AI가 상품 페이지를 디자인하는 중...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
