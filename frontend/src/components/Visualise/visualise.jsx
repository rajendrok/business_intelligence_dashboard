import React from "react";
import { ResponsiveLine } from "@nivo/line";
import { ResponsivePie } from "@nivo/pie";
import ReactECharts from "echarts-for-react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, RadarChart, Radar,
  ScatterChart, Scatter, AreaChart, Area, RadialBarChart, RadialBar, Treemap,
  CartesianGrid, Tooltip, XAxis, YAxis, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Cell
} from "recharts";

const COLORS = ["#e6194b", "#3cb44b", "#ffe119", "#4363d8", "#f58231", "#911eb4", "#46f0f0", "#f032e6", "#bcf60c", "#fabebe"];

const data = [
  { name: "A", value: 400, uv: 2400, pv: 2400 },
  { name: "B", value: 300, uv: 1398, pv: 2210 },
  { name: "C", value: 200, uv: 9800, pv: 2290 },
  { name: "D", value: 278, uv: 3908, pv: 2000 },
  { name: "E", value: 189, uv: 4800, pv: 2181 },
];

const nivoLineData = [{ id: "Series 1", data: data.map((d) => ({ x: d.name, y: d.value })) }];
const nivoPieData = data.map((item, index) => ({ id: item.name, label: item.name, value: item.value, color: COLORS[index % COLORS.length] }));

function getChart(type, size = 160) {
  switch (type) {
    case 0:
      return (
        <LineChart width={size} height={size} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="uv" stroke={COLORS[0]} />
        </LineChart>
      );
    case 1:
      return (
        <BarChart width={size} height={size} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="pv" fill={COLORS[1]} />
        </BarChart>
      );
    case 2:
      return (
        <PieChart width={size} height={size}>
          <Pie data={data} dataKey="value" outerRadius={size / 2.5}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      );
    case 3:
      return (
        <RadarChart outerRadius={size / 2.5} width={size} height={size} data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="name" />
          <PolarRadiusAxis />
          <Radar dataKey="uv" stroke={COLORS[2]} fill={COLORS[2]} fillOpacity={0.6} />
        </RadarChart>
      );
    case 4:
      return (
        <ScatterChart width={size} height={size}>
          <CartesianGrid />
          <XAxis dataKey="name" type="category" />
          <YAxis dataKey="value" />
          <Tooltip />
          <Scatter data={data} fill={COLORS[3]} />
        </ScatterChart>
      );
    case 5:
      return (
        <AreaChart width={size} height={size} data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          <Area dataKey="uv" stroke={COLORS[4]} fill={COLORS[4]} />
        </AreaChart>
      );
    case 6:
      return (
        <RadialBarChart width={size} height={size} innerRadius="20%" outerRadius="80%" data={data} startAngle={180} endAngle={0}>
          <RadialBar background dataKey="uv" />
          <Tooltip />
        </RadialBarChart>
      );
    case 7:
      return (
        <Treemap width={size} height={size} data={data} dataKey="value" ratio={4 / 3} stroke="#fff" fill={COLORS[5]} />
      );
    case 8:
      return (
        <ReactECharts
          option={{
            tooltip: {},
            xAxis: { type: "category", data: data.map((d) => d.name) },
            yAxis: {},
            series: [{ data: data.map((d) => d.value), type: "bar", itemStyle: { color: COLORS[6] } }],
          }}
          style={{ width: size, height: size }}
        />
      );
    case 9:
      return (
        <ReactECharts
          option={{
            tooltip: {},
            series: [
              {
                type: "pie",
                radius: ["40%", "70%"],
                data: data.map((item) => ({ value: item.value, name: item.name })),
                color: COLORS,
              },
            ],
          }}
          style={{ width: size, height: size }}
        />
      );
    case 10:
      return (
        <div style={{ width: size, height: size }}>
          <ResponsiveLine data={nivoLineData} colors={COLORS} />
        </div>
      );
    case 11:
      return (
        <div style={{ width: size, height: size }}>
          <ResponsivePie data={nivoPieData} colors={COLORS} />
        </div>
      );
    default:
      return (
        <div
          style={{
            width: size,
            height: size,
            backgroundColor: COLORS[0],
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "#fff",
            fontSize: "1rem",
          }}
        >
          Custom Box
        </div>
      );
  }
}

const Visualise = ({ onSelectChart }) => {
  const charts = [];

  for (let i = 0; i < 20; i++) {
    charts.push(
      <div
        key={i}
        style={{
          cursor: "pointer",
          border: "1px solid #ccc",
          borderRadius: "8px",
          padding: "8px",
          width: "100%", // full width for one per row
          boxSizing: "border-box",
          backgroundColor: "#f9f9f9",
          marginBottom: "8px", // spacing between charts
        }}
        onClick={() => onSelectChart(getChart(i % 12, 500))}
      >
        {getChart(i % 12, 180)}
        <div style={{ fontSize: "12px", marginTop: "5px", textAlign: "center" }}>
          Chart {i + 1}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column", // ✅ vertical layout
        maxHeight: "200px",
        // overflowY: "auto",
        overflowX: "hidden",
        padding: "2px",
      }}
    >
      {charts}
    </div>
  );
};

export default Visualise;
