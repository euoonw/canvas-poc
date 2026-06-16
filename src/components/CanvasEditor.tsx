"use client";

import { useEffect, useRef, useState } from "react";
import {
  Stage,
  Layer,
  Rect,
  Text,
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
}

type CanvasElement = TextElement | RectElement | ImageElement;

// AI가 반환했다고 가정하는 상품 데이터 구조
const MOCK_AI_RESPONSE = {
  category: "WIRELESS AUDIO",
  name: "프리미엄 무선 이어폰 X1",
  price: "129,000원",
  originalPrice: "정가 189,000원",
  discount: "32% OFF",
  description:
    "완벽한 노이즈 캔슬링과 24시간 배터리로\n어디서든 최고의 음질을 경험하세요.",
  features: ["✓  액티브 노이즈 캔슬링", "✓  24시간 배터리", "✓  IPX5 방수"],
  imageUrl: "https://picsum.photos/seed/earbuds/280/280",
  theme: {
    bg: "#0f172a",
    accent: "#f97316",
    text: "#ffffff",
    subtext: "#94a3b8",
  },
};

type Product = typeof MOCK_AI_RESPONSE;

function buildProductElements(p: Product): CanvasElement[] {
  return [
    {
      id: "bg",
      type: "rect",
      x: 0,
      y: 0,
      width: 800,
      height: 600,
      fill: p.theme.bg,
      draggable: false,
    },
    {
      id: "product-image",
      type: "image",
      x: 40,
      y: 140,
      width: 280,
      height: 280,
      src: p.imageUrl,
      draggable: true,
    },
    {
      id: "cat-bg",
      type: "rect",
      x: 360,
      y: 70,
      width: 170,
      height: 30,
      fill: p.theme.accent,
      draggable: false,
      cornerRadius: 4,
    },
    {
      id: "category",
      type: "text",
      x: 368,
      y: 78,
      text: p.category,
      fontSize: 13,
      fill: "#ffffff",
      draggable: true,
    },
    {
      id: "name",
      type: "text",
      x: 360,
      y: 115,
      text: p.name,
      fontSize: 28,
      fill: p.theme.text,
      draggable: true,
      width: 400,
    },
    {
      id: "originalPrice",
      type: "text",
      x: 360,
      y: 215,
      text: p.originalPrice,
      fontSize: 15,
      fill: p.theme.subtext,
      draggable: true,
    },
    {
      id: "discount-bg",
      type: "rect",
      x: 512,
      y: 210,
      width: 85,
      height: 26,
      fill: "#dc2626",
      draggable: false,
      cornerRadius: 4,
    },
    {
      id: "discount",
      type: "text",
      x: 516,
      y: 217,
      text: p.discount,
      fontSize: 14,
      fill: "#ffffff",
      draggable: true,
    },
    {
      id: "price",
      type: "text",
      x: 360,
      y: 252,
      text: p.price,
      fontSize: 36,
      fill: p.theme.accent,
      draggable: true,
    },
    {
      id: "desc",
      type: "text",
      x: 360,
      y: 318,
      text: p.description,
      fontSize: 15,
      fill: p.theme.subtext,
      draggable: true,
      width: 390,
    },
    ...p.features.map((f, i) => ({
      id: `feature-${i}`,
      type: "text" as const,
      x: 360,
      y: 398 + i * 30,
      text: f,
      fontSize: 15,
      fill: p.theme.text,
      draggable: true,
    })),
    {
      id: "cta-bg",
      type: "rect",
      x: 360,
      y: 512,
      width: 200,
      height: 52,
      fill: p.theme.accent,
      draggable: false,
      cornerRadius: 8,
    },
    {
      id: "cta",
      type: "text",
      x: 360,
      y: 512,
      text: "지금 구매하기",
      fontSize: 18,
      fill: "#ffffff",
      draggable: true,
      width: 200,
      height: 52,
      align: "center",
      verticalAlign: "middle",
    },
  ];
}

export default function CanvasEditor() {
  const [elements, setElements] = useState<CanvasElement[]>([]);
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

  // 이미지 저장 — selection이 사라진 다음 렌더 사이클에서 실행
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
    // AI API 호출을 시뮬레이션
    setTimeout(() => {
      setElements(buildProductElements(MOCK_AI_RESPONSE));
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
      {/* 헤더 */}
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

      {/* 캔버스 */}
      <div
        ref={containerRef}
        className="border border-gray-300 rounded-lg overflow-hidden w-fit relative"
      >
        <Stage
          ref={stageRef}
          width={800}
          height={600}
          onClick={handleStageClick}
        >
          <Layer>
            {elements.length === 0 && (
              <Rect x={0} y={0} width={800} height={600} fill="#f8fafc" />
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

        {/* 텍스트 인라인 편집 */}
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

        {/* 빈 상태 안내 */}
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

        {/* 로딩 오버레이 */}
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
