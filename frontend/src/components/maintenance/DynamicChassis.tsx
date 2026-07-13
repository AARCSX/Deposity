"use client";

import React from "react";

export interface AxleConfig {
  left: number;
  right: number;
}

interface DynamicChassisProps {
  axles: AxleConfig[];
  selectedTyre: string | null;
  onTyreClick: (tyreId: string) => void;
}

export default function DynamicChassis({ axles, selectedTyre, onTyreClick }: DynamicChassisProps) {
  // SVG dimensions
  const svgWidth = 280;
  const chassisWidth = 50;
  const chassisX = (svgWidth - chassisWidth) / 2; // 115
  
  // Layout math
  const startY = 40; // Front of chassis
  const firstAxleY = 70; // Front axle Y
  const axleSpacing = 55; 
  const rearAxleStartY = 180;
  
  const getAxleY = (index: number) => {
    if (index === 0) return firstAxleY;
    // Special spacing logic: if more than 2 axles, create a gap after the first one
    if (axles.length > 2) {
      return rearAxleStartY + (index - 1) * axleSpacing;
    }
    // If only 2 axles, space them out more
    return 200; 
  };

  const totalLength = axles.length > 1 
    ? getAxleY(axles.length - 1) + 40 
    : firstAxleY + 40;
  
  const svgHeight = Math.max(300, totalLength + 40);

  // Tyre dimensions
  const tyreWidth = 14;
  const tyreHeight = 32;
  const tyreGap = 6; // Gap between dual tyres

  const renderTyres = (axleIndex: number, side: "left" | "right", count: number, y: number) => {
    const tyres = [];
    
    for (let i = 0; i < count; i++) {
      const isInner = side === "left" ? i === count - 1 : i === 0;
      const isOuter = !isInner;
      
      const tyreId = `axle-${axleIndex}-${side}${count > 1 ? (isInner ? '-inner' : '-outer') : ''}${count > 2 ? `-${i}` : ''}`;
      const isSelected = selectedTyre === tyreId;
      
      // Calculate X position
      let x = 0;
      if (side === "left") {
        // Draw from outer to inner
        const baseLeft = chassisX - tyreWidth - 6; // gap from chassis
        x = baseLeft - (count - 1 - i) * (tyreWidth + tyreGap);
      } else {
        const baseRight = chassisX + chassisWidth + 6;
        x = baseRight + i * (tyreWidth + tyreGap);
      }

      tyres.push(
        <rect
          key={`${tyreId}-${i}`}
          x={x}
          y={y - tyreHeight / 2}
          width={tyreWidth}
          height={tyreHeight}
          rx={3}
          className={`cursor-pointer transition-all duration-200 stroke-[1.5px] ${
            isSelected 
              ? "fill-primary stroke-primary-container drop-shadow-md scale-105 origin-center" 
              : "fill-surface-container-highest stroke-outline hover:fill-primary/20 hover:stroke-primary"
          }`}
          style={{ transformOrigin: `${x + tyreWidth/2}px ${y}px` }}
          onClick={() => onTyreClick(tyreId)}
        />
      );
    }
    return tyres;
  };

  return (
    <div className="w-full flex justify-center py-6 px-4 overflow-x-auto">
      <svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="overflow-visible min-w-[280px]">
        {/* Chassis Main Rails */}
        <rect x={chassisX} y={startY} width={8} height={totalLength - startY} className="fill-surface-container-high stroke-outline-variant/50 stroke-1" />
        <rect x={chassisX + chassisWidth - 8} y={startY} width={8} height={totalLength - startY} className="fill-surface-container-high stroke-outline-variant/50 stroke-1" />
        
        {/* Cross members (drawing a few to make it look like a ladder frame) */}
        {Array.from({ length: Math.floor((totalLength - startY) / 40) }).map((_, i) => (
          <rect key={`cross-chassis-${i}`} x={chassisX} y={startY + 20 + i * 40} width={chassisWidth} height={6} className="fill-surface-container-high stroke-outline-variant/30 stroke-1" />
        ))}

        {/* Engine/Cab placeholder at the front */}
        <path 
          d={`M ${chassisX - 12} ${startY + 25} L ${chassisX + chassisWidth + 12} ${startY + 25} L ${chassisX + chassisWidth + 8} ${startY - 10} L ${chassisX - 8} ${startY - 10} Z`}
          className="fill-surface-container-highest stroke-outline-variant/50 stroke-2 drop-shadow-sm"
        />
        {/* Windshield */}
        <rect x={chassisX - 4} y={startY - 2} width={chassisWidth + 8} height={8} rx={1} className="fill-outline/20" />
        {/* Front bumper */}
        <rect x={chassisX - 14} y={startY - 14} width={chassisWidth + 28} height={6} rx={2} className="fill-outline-variant/70" />

        {/* Tyres and Axles */}
        {axles.map((axle, index) => {
          const y = getAxleY(index);
          const maxLeftCount = axle.left;
          const maxRightCount = axle.right;
          
          const leftRodEnd = chassisX - 4 - maxLeftCount * tyreWidth - (maxLeftCount - 1) * tyreGap;
          const rightRodEnd = chassisX + chassisWidth + 4 + maxRightCount * tyreWidth + (maxRightCount - 1) * tyreGap;
          
          return (
            <g key={`axle-group-${index}`}>
              {/* Axle Rod */}
              <line 
                x1={leftRodEnd + 5} 
                y1={y} 
                x2={rightRodEnd - 5} 
                y2={y} 
                className="stroke-outline-variant stroke-[5px]"
                strokeLinecap="round"
              />
              <line 
                x1={leftRodEnd + 5} 
                y1={y} 
                x2={rightRodEnd - 5} 
                y2={y} 
                className="stroke-surface-container-high stroke-[2px]"
                strokeLinecap="round"
              />
              
              {/* Tyres */}
              {renderTyres(index, "left", axle.left, y)}
              {renderTyres(index, "right", axle.right, y)}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
