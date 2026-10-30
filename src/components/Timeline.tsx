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
    const height = 150;
    const margin = { top: 38, right: 36, bottom: 36, left: 36 };

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
        .attr("y1", margin.top - 12)
        .attr("y2", axisY)
        .attr("stroke", "var(--hairline)")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "2,4")
        .attr("opacity", 0.6);
    });

    // Timeline baseline rule
    svg
      .append("line")
      .attr("x1", margin.left)
      .attr("x2", width - margin.right)
      .attr("y1", axisY)
      .attr("y2", axisY)
      .attr("stroke", "var(--hairline)")
      .attr("stroke-width", 1.5);

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

      // Marker stem height (34px to 62px)
      const baseHeight = 36;
      const lifespanBonus = Math.min(26, Math.log2(Math.max(1, d.lifespan_days)) * 3.5);
      const markerHeight = isSelected ? 66 : baseHeight + lifespanBonus;

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
            // Clamp tooltip within viewport
            const rawX = event.clientX - rect.left;
            const clampedX = Math.max(140, Math.min(width - 140, rawX));
            setTooltipPos({
              x: clampedX,
              y: axisY - markerHeight - 12,
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
        .attr("x", cx - 10)
        .attr("y", axisY - markerHeight - 10)
        .attr("width", 20)
        .attr("height", markerHeight + 14)
        .attr("fill", "transparent");

      // Vertical tick stem
      tick
        .append("line")
        .attr("x1", cx)
        .attr("x2", cx)
        .attr("y1", axisY)
        .attr("y2", axisY - markerHeight)
        .attr("stroke", strokeColor)
        .attr("stroke-width", isSelected || isHaunting ? 1.75 : 1)
        .attr("opacity", 0)
        .transition()
        .delay(Math.min(800, idx * 35))
        .duration(160)
        .attr("opacity", 1);

      // If haunting, add pulsating outer glow ring
      if (isHaunting) {
        tick
          .append("circle")
          .attr("cx", cx)
          .attr("cy", axisY - markerHeight)
          .attr("r", 8)
          .attr("fill", "var(--marigold-dim)")
          .attr("stroke", "var(--marigold)")
          .attr("stroke-width", 1.25)
          .attr("stroke-opacity", 0.7);
      }

      // Top marker pip
      tick
        .append("circle")
        .attr("cx", cx)
        .attr("cy", axisY - markerHeight)
        .attr("r", isSelected ? 4.5 : isHaunting ? 3.5 : 2.5)
        .attr("fill", strokeColor)
        .attr("stroke", "var(--ground)")
        .attr("stroke-width", 1)
        .attr("opacity", 0)
        .transition()
        .delay(Math.min(800, idx * 35))
        .duration(160)
        .attr("opacity", 1);
    });
  }, [deaths, selectedDeathId, onSelectDeath]);

  if (deaths.length === 0) return null;

  return (
    <div className="w-full relative">
      {/* Desktop D3 Canvas */}
      <div className="hidden sm:block border border-hairline py-4 px-4 my-8 bg-ground-elevated/70 rounded-sm shadow-md">
        <div className="flex items-center justify-between text-xs text-ash font-mono pb-2 border-b border-hairline mb-2">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-content/60" />
            <span className="tracking-widest uppercase text-content font-medium text-[11px]">
              CHRONOLOGICAL NECROPOLIS TIMELINE
            </span>
            <span className="text-ash-dark">|</span>
            <span className="text-[10px] text-ash">Click any pip to inspect forensic headstone</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 text-ash">
              <span className="w-2 h-2 rounded-full bg-ash" /> Deceased
            </span>
            <span className="flex items-center gap-1.5 text-marigold font-medium">
              <span className="w-2 h-2 rounded-full bg-marigold animate-pulse" /> Still Haunting
            </span>
            <span className="tabular-nums text-content font-medium px-2 py-0.5 border border-hairline bg-surface/40">
              {deaths.length} deaths recorded
            </span>
          </div>
        </div>

        <div className="w-full overflow-x-auto relative">
          <svg ref={svgRef} className="w-full block" />

          {/* Interactive Floating Tooltip */}
          {hoveredDeath && tooltipPos && (
            <div
              className="absolute z-30 pointer-events-none transform -translate-x-1/2 -translate-y-full bg-ground border border-hairline-light p-3 shadow-2xl text-xs font-mono max-w-sm rounded-sm transition-transform duration-75"
              style={{
                left: `${tooltipPos.x}px`,
                top: `${tooltipPos.y}px`,
              }}
            >
              <div className="flex items-center justify-between gap-3 border-b border-hairline pb-1.5 mb-1.5">
                <span className="text-content font-medium truncate flex items-center gap-1.5">
                  <span className="text-ash-dark">†</span>
                  <span>{hoveredDeath.path}</span>
                </span>
                {hoveredDeath.hauntingCount > 0 ? (
                  <span className="text-[9px] px-1.5 py-0.2 border border-marigold text-marigold uppercase font-medium bg-marigold-dim shrink-0">
                    GHOST ({hoveredDeath.hauntingCount})
                  </span>
                ) : (
                  <span className="text-[9px] text-ash-dark uppercase shrink-0">At Peace</span>
                )}
              </div>
              <div className="text-[11px] text-ash-light flex items-center justify-between mb-1.5">
                <span className="capitalize px-1.5 py-0.2 border border-hairline text-[10px] bg-surface/50">
                  {hoveredDeath.obituary.cause.replace("_", " ")}
                </span>
                <span className="tabular-nums text-content font-medium">
                  {hoveredDeath.lifespan_days} days alive
                </span>
              </div>
              <div className="text-[10px] text-ash italic line-clamp-2 bg-surface/30 p-1.5 border border-hairline/50">
                "{hoveredDeath.last_words}"
              </div>
              <div className="text-[9px] text-marigold mt-1.5 text-right font-medium">
                Click marker to view headstone →
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Vertical Month List */}
      <div className="block sm:hidden border border-hairline my-6 py-3 px-3 bg-ground-elevated/70 rounded-sm">
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-hairline">
          <span className="text-xs text-content font-mono uppercase tracking-wider font-medium">
            Chronological Timeline
          </span>
          <span className="text-[10px] text-ash font-mono">{deaths.length} deaths</span>
        </div>
        <div className="divide-y divide-hairline">
          {deaths.slice(0, 15).map((d) => (
            <button
              key={d.id}
              onClick={() => onSelectDeath(d.id)}
              className="w-full text-left flex items-center justify-between py-2.5 px-2 text-xs font-mono hover:bg-surface transition-colors"
            >
              <div className="truncate max-w-[210px]">
                <div className="flex items-center gap-1.5">
                  <span className="text-ash-dark text-[11px]">†</span>
                  <span className="text-content block truncate font-medium">{d.path}</span>
                </div>
                <span className="text-ash text-[10px] capitalize block mt-0.5">
                  {d.obituary.cause.replace("_", " ")} • {d.lifespan_days}d alive
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
