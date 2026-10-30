"use client";

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { DeathRecord, ObituaryRecord } from "@/types";

interface TimelineProps {
  deaths: Array<DeathRecord & { obituary: ObituaryRecord; hauntingCount: number }>;
  selectedDeathId: string | null;
  onSelectDeath: (deathId: string) => void;
}

export function Timeline({ deaths, selectedDeathId, onSelectDeath }: TimelineProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [hoveredDeath, setHoveredDeath] = useState<
    (DeathRecord & { obituary: ObituaryRecord; hauntingCount: number }) | null
  >(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!svgRef.current || deaths.length === 0) return;

    const container = svgRef.current.parentElement;
    const width = container ? container.clientWidth : 800;
    const height = 140;
    const margin = { top: 35, right: 30, bottom: 35, left: 30 };

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    svg.attr("width", width).attr("height", height);

    // Compute date extent
    const dates = deaths.map((d) => new Date(d.died_date).getTime());
    let minDate = Math.min(...dates);
    let maxDate = Math.max(...dates);

    // Pad extent by 3 days if single day or very tight
    if (minDate === maxDate || maxDate - minDate < 86400000 * 2) {
      minDate -= 86400000 * 3;
      maxDate += 86400000 * 3;
    }

    const xScale = d3
      .scaleTime()
      .domain([new Date(minDate), new Date(maxDate)])
      .range([margin.left, width - margin.right]);

    const axisY = height - margin.bottom;

    // Subtle background gridlines
    const timeTicks = xScale.ticks(Math.max(3, Math.floor(width / 160)));
    timeTicks.forEach((tickDate) => {
      const gx = xScale(tickDate);
      svg
        .append("line")
        .attr("x1", gx)
        .attr("x2", gx)
        .attr("y1", margin.top - 10)
        .attr("y2", axisY)
        .attr("stroke", "var(--hairline)")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "2,4")
        .attr("opacity", 0.5);
    });

    // Timeline baseline rule
    svg
      .append("line")
      .attr("x1", margin.left)
      .attr("x2", width - margin.right)
      .attr("y1", axisY)
      .attr("y2", axisY)
      .attr("stroke", "var(--hairline)")
      .attr("stroke-width", 1);

    // Time Axis
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(Math.max(3, Math.floor(width / 160)))
      .tickSize(6)
      .tickFormat(d3.timeFormat("%b %Y") as any);

    const axisGroup = svg
      .append("g")
      .attr("transform", `translate(0, ${axisY})`)
      .call(xAxis);

    axisGroup.select(".domain").remove();
    axisGroup.selectAll("line").attr("stroke", "var(--hairline)");
    axisGroup
      .selectAll("text")
      .attr("fill", "var(--ash)")
      .attr("font-family", "var(--font-ibm-plex-mono)")
      .attr("font-size", "10px")
      .attr("dy", "12px");

    // Plot death markers (vertical ticks lifting up from baseline)
    const markersGroup = svg.append("g");

    deaths.forEach((d, idx) => {
      const cx = xScale(new Date(d.died_date));
      const isSelected = d.id === selectedDeathId;
      const isHaunting = d.hauntingCount > 0;

      // Height varies slightly by lifespan or emphasis (30px to 55px)
      const baseHeight = 32;
      const lifespanBonus = Math.min(24, Math.log2(Math.max(1, d.lifespan_days)) * 3);
      const markerHeight = isSelected ? 60 : baseHeight + lifespanBonus;

      const strokeColor = isHaunting
        ? "var(--marigold)"
        : isSelected
        ? "var(--content)"
        : "var(--ash)";

      const tick = markersGroup
        .append("g")
        .attr("class", "cursor-pointer group")
        .on("click", () => onSelectDeath(d.id))
        .on("mouseenter", (event) => {
          setHoveredDeath(d);
          const rect = svgRef.current?.getBoundingClientRect();
          if (rect) {
            setTooltipPos({
              x: event.clientX - rect.left,
              y: axisY - markerHeight - 10,
            });
          }
        })
        .on("mouseleave", () => {
          setHoveredDeath(null);
          setTooltipPos(null);
        });

      // Hover hit target (wider invisible bar for easy hovering)
      tick
        .append("rect")
        .attr("x", cx - 8)
        .attr("y", axisY - markerHeight - 8)
        .attr("width", 16)
        .attr("height", markerHeight + 12)
        .attr("fill", "transparent");

      // Vertical tick stem
      tick
        .append("line")
        .attr("x1", cx)
        .attr("x2", cx)
        .attr("y1", axisY)
        .attr("y2", axisY - markerHeight)
        .attr("stroke", strokeColor)
        .attr("stroke-width", isSelected || isHaunting ? 1.5 : 1)
        .attr("opacity", 0)
        .transition()
        .delay(Math.min(1000, idx * 40)) // 40ms stagger
        .duration(150)
        .attr("opacity", 1);

      // Top marker pip
      tick
        .append("circle")
        .attr("cx", cx)
        .attr("cy", axisY - markerHeight)
        .attr("r", isSelected ? 4 : isHaunting ? 3.5 : 2.5)
        .attr("fill", strokeColor)
        .attr("stroke", "var(--ground)")
        .attr("stroke-width", 1)
        .attr("opacity", 0)
        .transition()
        .delay(Math.min(1000, idx * 40))
        .duration(150)
        .attr("opacity", 1);

      // If haunting, add subtle outer ring
      if (isHaunting) {
        tick
          .append("circle")
          .attr("cx", cx)
          .attr("cy", axisY - markerHeight)
          .attr("r", 7)
          .attr("fill", "none")
          .attr("stroke", "var(--marigold)")
          .attr("stroke-width", 1)
          .attr("stroke-opacity", 0.4);
      }
    });
  }, [deaths, selectedDeathId, onSelectDeath]);

  if (deaths.length === 0) return null;

  return (
    <div className="w-full relative">
      {/* Desktop D3 Canvas */}
      <div className="hidden sm:block border-y border-hairline py-3 my-8 bg-ground-elevated/40">
        <div className="flex items-center justify-between text-xs text-ash font-mono px-3 mb-1">
          <div className="flex items-center gap-3">
            <span className="tracking-widest uppercase text-ash-light font-medium">CHRONOLOGICAL NECROPOLIS</span>
            <span className="text-ash-dark">|</span>
            <span className="text-[10px] text-ash">Click mark to view headstone</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 text-ash">
              <span className="w-2 h-2 rounded-full bg-ash" /> Deceased
            </span>
            <span className="flex items-center gap-1.5 text-marigold font-medium">
              <span className="w-2 h-2 rounded-full bg-marigold animate-pulse" /> Still Haunting
            </span>
            <span className="tabular-nums text-ash-light font-medium">{deaths.length} deaths</span>
          </div>
        </div>

        <div className="w-full overflow-x-auto relative">
          <svg ref={svgRef} className="w-full block" />

          {/* Interactive Floating Tooltip */}
          {hoveredDeath && tooltipPos && (
            <div
              className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full bg-ground border border-hairline-light p-2.5 shadow-2xl text-xs font-mono max-w-xs transition-transform duration-75"
              style={{
                left: `${tooltipPos.x}px`,
                top: `${tooltipPos.y}px`,
              }}
            >
              <div className="flex items-center justify-between gap-2 border-b border-hairline pb-1 mb-1.5">
                <span className="text-content font-medium truncate">{hoveredDeath.path}</span>
                {hoveredDeath.hauntingCount > 0 && (
                  <span className="text-[9px] px-1 py-0.2 border border-marigold text-marigold uppercase">
                    Ghost ({hoveredDeath.hauntingCount})
                  </span>
                )}
              </div>
              <div className="text-[11px] text-ash-light flex items-center justify-between mb-1">
                <span className="capitalize">{hoveredDeath.obituary.cause.replace("_", " ")}</span>
                <span className="tabular-nums">{hoveredDeath.lifespan_days}d alive</span>
              </div>
              <div className="text-[10px] text-ash italic truncate">
                "{hoveredDeath.last_words}"
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Vertical Month List */}
      <div className="block sm:hidden border-y border-hairline my-6 py-3 bg-ground-elevated/40">
        <span className="text-xs text-ash font-mono uppercase tracking-wider block mb-2 px-2">
          Deletions Timeline (Mobile Index)
        </span>
        <div className="divide-y divide-hairline/60">
          {deaths.slice(0, 15).map((d) => (
            <button
              key={d.id}
              onClick={() => onSelectDeath(d.id)}
              className="w-full text-left flex items-center justify-between py-2 px-2.5 text-xs font-mono hover:bg-surface transition-colors"
            >
              <div className="truncate max-w-[210px]">
                <span className="text-content block truncate font-medium">{d.path}</span>
                <span className="text-ash-dark text-[10px] capitalize">
                  {d.obituary.cause.replace("_", " ")} • {d.lifespan_days}d
                </span>
              </div>
              <div className="shrink-0 text-right">
                <span className="text-ash tabular-nums text-[11px] block">
                  {new Date(d.died_date).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                {d.hauntingCount > 0 && (
                  <span className="text-[9px] text-marigold font-medium block">
                    GHOST ({d.hauntingCount})
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
