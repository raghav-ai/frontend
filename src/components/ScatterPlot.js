import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const ScatterPlot = ({ data, width, height, title, xLabel, yLabel }) => {
  const svgRef = useRef();
  const tooltipRef = useRef();
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const margin = { top: 70, right: 30, bottom: 40, left: 80 };
  const parseDate = d3.timeParse("%Y-%m-%d");

  useEffect(() => {
    if (!data || !data.length) return;

    // Clear previous content
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Format the data
    const formattedData = data.map(d => ({
      date: parseDate(d.date),
      value: d.value,
      year: parseDate(d.date).getFullYear()
    }));

    // Create scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(formattedData, d => d.date))
      .nice()
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
      .domain(d3.extent(formattedData, d => d.value))
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Create color scale for years
    const years = [...new Set(formattedData.map(d => d.year))];
    const colorScale = d3.scaleOrdinal()
      .domain(years)
      .range(d3.schemeCategory10);

    // Add axes
    // X-axis
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(
        d3.axisBottom(xScale)
          .ticks(width / 80)
          .tickFormat(d3.timeFormat("%Y"))
      )
      .selectAll("text")
      .style("font-size", "14px");

    // Y-axis
    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale))
      .selectAll("text")
      .style("font-size", "14px");

    // Add grid lines
    svg.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.1)
      .call(
        d3.axisBottom(xScale)
          .tickSize(-height + margin.top + margin.bottom)
          .tickFormat("")
      );

    svg.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(${margin.left},0)`)
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.1)
      .call(
        d3.axisLeft(yScale)
          .tickSize(-width + margin.left + margin.right)
          .tickFormat("")
      );

    // Add points
    svg.selectAll("circle")
      .data(formattedData)
      .enter()
      .append("circle")
      .attr("cx", d => xScale(d.date))
      .attr("cy", d => yScale(d.value))
      .attr("r", 5)
      .style("fill", d => colorScale(d.year))
      .style("stroke", "white")
      .style("stroke-width", 1)
      .style("opacity", 0.7)
      .on("mouseover", (event, d) => {
        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr("r", 8)
          .style("opacity", 1);

        setHoveredPoint(d);
        d3.select(tooltipRef.current)
          .style("display", "block")
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 30}px`);
      })
      .on("mouseout", (event) => {
        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr("r", 5)
          .style("opacity", 0.7);

        setHoveredPoint(null);
        d3.select(tooltipRef.current)
          .style("display", "none");
      });

    // Add title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "20px")
      .style("font-weight", "bold")
      .text(title);

    // Add X-axis label
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text(xLabel);

    // Add Y-axis label
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", margin.left / 3)
      .attr("x", -(height / 2))
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text(yLabel);

    // Add legend
    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${width - margin.right + 10}, ${margin.top})`);

    years.forEach((year, i) => {
      const legendRow = legend.append("g")
        .attr("transform", `translate(0, ${i * 20})`);
      
      legendRow.append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", 5)
        .style("fill", colorScale(year));
      
      legendRow.append("text")
        .attr("x", 10)
        .attr("y", 5)
        .text(year)
        .style("font-size", "12px");
    });

  }, [data, width, height, title, xLabel, yLabel]);

  return (
    <div style={{ position: "relative" }}>
      <svg ref={svgRef} width={width} height={height}></svg>
      <div
        ref={tooltipRef}
        className="bg-white shadow-lg p-3 rounded-md absolute pointer-events-none z-10"
        style={{ display: "none" }}
      >
        {hoveredPoint && (
          <div>
            <div className="text-xl font-bold">
              {hoveredPoint.date.toLocaleDateString()}
            </div>
            <div className="text-lg">
              Value: {hoveredPoint.value.toFixed(2)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScatterPlot;