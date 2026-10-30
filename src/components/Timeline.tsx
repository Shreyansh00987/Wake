"use client";

import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { DeathRecord, ObituaryRecord } from "@/types";

interface TimelineProps {
  deaths: Array<DeathRecord & { obituary: ObituaryRecord; hauntingCount: number }>;
  selectedDeathId: string | null;
  onSelectDeath: (deathId: string) => void;
}

export function Timeline({ deaths, selectedDeathId, onSelectDeath }: TimelineProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || deaths.length === 0) return;

    const container = svgRef.current.parentElement;
    const width = container ? container.clientWidth : 800;
    const height = 120;
    const margin = { top: 25, right: 30, bottom: 35, left: 30 };

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    svg.attr("width", width).attr("height", height);

    // Compute date extent
    const dates = deaths.map((d) => new Date(d.died_date).getTime());
    let minDate = Math.min(...dates);
    let maxDate = Math.max(...dates);

    // If all deaths on same day, pad by 3 days
    if (minDate === maxDate) {
      minDate -= 86400000 * 3;
      maxDate += 86400000 * 3;
    }

    const xScale = d3
      .scaleTime()
      .domain([new Date(minDate), new Date(maxDate)])
      .range([margin.left, width - margin.right]);

    // Timeline baseline rule
    const axisY = height - margin.bottom;
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
      .ticks(Math.max(3, Math.floor(width / 140)))
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
      .attr("font-size", "10px");

    // Plot death markers (vertical ticks lifting up from baseline)
    const markersGroup = svg.append("g");

    deaths.forEach((d, idx) => {
      const cx = xScale(new Date(d.died_date));
      const isSelected = d.id === selectedDeathId;
      const isHaunting = d.hauntingCount > 0;

      const markerHeight = isSelected ? 36 : 24;
      const strokeColor = isHaunting
        ? "var(--marigold)"
        : isSelected
        ? "var(--content)"
        : "var(--ash)";

      const tick = markersGroup
        .append("g")
        .attr("class", "cursor-pointer group")
        .on("click", () => onSelectDeath(d.id));

      // Tick line
      tick
        .append("line")
        .attr("x1", cx)
        .attr("x2", cx)
        .attr("y1", axisY)
        .attr("y2", axisY - markerHeight)
        .attr("stroke", strokeColor)
        .attr("stroke-width", isSelected ? 2 : 1)
        .attr("opacity", 0)
        .transition()
        .delay(Math.min(1000, idx * 40)) // 40ms stagger per spec
        .duration(150)
        .attr("opacity", 1);

      // Top pip
      tick
        .append("circle")
        .attr("cx", cx)
        .attr("cy", axisY - markerHeight)
        .attr("r", isSelected ? 3 : 2)
        .attr("fill", strokeColor)
        .attr("opacity", 0)
        .transition()
        .delay(Math.min(1000, idx * 40))
        .duration(150)
        .attr("opacity", 1);
    });
  }, [deaths, selectedDeathId, onSelectDeath]);

  if (deaths.length === 0) return null;

  return (
    <div className="w-full">
      {/* Desktop D3 Canvas */}
      <div className="hidden sm:block border-y border-hairline py-2 my-6">
        <div className="flex items-center justify-between text-xs text-ash font-mono mb-1">
          <span>TIMELINE OF DELETIONS</span>
          <span className="tabular-nums">{deaths.length} deaths recorded</span>
        </div>
        <div className="w-full overflow-x-auto">
          <svg ref={svgRef} className="w-full block" />
        </div>
      </div>

      {/* Mobile Vertical Month List */}
      <div className="block sm:hidden border-y border-hairline my-4 py-2">
        <span className="text-xs text-ash font-mono uppercase block mb-2">
          Deletions by Month
        </span>
        <div className="space-y-1">
          {deaths.slice(0, 10).map((d) => (
            <button
              key={d.id}
              onClick={() => onSelectDeath(d.id)}
              className="w-full text-left flex items-center justify-between py-1.5 px-2 text-xs font-mono border-b border-hairline/40 hover:bg-surface"
            >
              <span className="truncate max-w-[200px] text-content">{d.path}</span>
              <span className="text-ash tabular-nums">
                {new Date(d.died_date).toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
