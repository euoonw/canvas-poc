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
}

type CanvasElement = TextElement | RectElement;

const INITIAL_ELEMENTS: CanvasElement[] = [
  {
    id: "1",
    type: "rect",
    x: 50,
    y: 50,
    width: 200,
    height: 100,
    fill: "#e2e8f0",
    draggable: true,
  },
  {
    id: "2",
    type: "text",
    x: 100,
    y: 80,
    text: "텍스트 드래그해보기",
    fontSize: 18,
    fill: "#1a202c",
    draggable: true,
  },
];

export default function CanvasEditor() {
  const [elements, setElements] = useState<CanvasElement[]>(INITIAL_ELEMENTS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const transformerRef = useRef<Konva.Transformer>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 선택된 요소에 Transformer 연결
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

  // textarea가 열릴 때 포커스
  useEffect(() => {
    if (editingId && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [editingId]);

  const handleDragEnd = (id: string, x: number, y: number) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, x, y } : el)),
    );
  };

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target === e.target.getStage()) {
      setSelectedId(null);
    }
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
        prev.map((el) =>
          el.id === editingId ? { ...el, text: trimmed } : el,
        ),
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
      border: "1px dashed #4299e1",
      outline: "none",
      background: "transparent",
      resize: "none",
      overflow: "hidden",
      lineHeight: "1.2",
      minWidth: 50,
      padding: 0,
      margin: 0,
      fontFamily: "sans-serif",
    };
  };

  return (
    <div className="flex flex-col gap-4">
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
            {/* 캔버스 배경 */}
            <Rect x={0} y={0} width={800} height={600} fill="#ffffff" />

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

        {/* 텍스트 인라인 편집 textarea */}
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
                  if (e.key === "Escape") {
                    setEditingId(null);
                  }
                }}
              />
            );
          })()}
      </div>

      {/* 간단한 조작 버튼 */}
      <div className="flex gap-2">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => {
            const newEl: TextElement = {
              id: String(Date.now()),
              type: "text",
              x: 100,
              y: 100,
              text: "새 텍스트",
              fontSize: 20,
              fill: "#000000",
              draggable: true,
            };
            setElements((prev) => [...prev, newEl]);
          }}
        >
          텍스트 추가
        </button>
        <button
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          onClick={() => {
            const newEl: RectElement = {
              id: String(Date.now()),
              type: "rect",
              x: 200,
              y: 200,
              width: 150,
              height: 80,
              fill: "#bee3f8",
              draggable: true,
            };
            setElements((prev) => [...prev, newEl]);
          }}
        >
          박스 추가
        </button>
        {selectedId && (
          <button
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            onClick={() => {
              setElements((prev) => prev.filter((el) => el.id !== selectedId));
              setSelectedId(null);
            }}
          >
            선택 삭제
          </button>
        )}
      </div>

      {/* 현재 상태 JSON 확인용 */}
      <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-40">
        {JSON.stringify(elements, null, 2)}
      </pre>
    </div>
  );
}
