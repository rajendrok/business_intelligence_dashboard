import React from "react";
import { ResponsiveLine } from '@nivo/line';
import { ResponsivePie } from '@nivo/pie';
import ReactECharts from 'echarts-for-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, RadarChart, Radar, ScatterChart, Scatter,
  AreaChart, Area, RadialBarChart, RadialBar, Treemap, CartesianGrid, Tooltip, XAxis, YAxis, Legend,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Cell
} from "recharts";

const COLORS = ['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe'];

const data = [
  { name: 'A', value: 400, uv: 2400, pv: 2400 },
  { name: 'B', value: 300, uv: 1398, pv: 2210 },
  { name: 'C', value: 200, uv: 9800, pv: 2290 },
  { name: 'D', value: 278, uv: 3908, pv: 2000 },
  { name: 'E', value: 189, uv: 4800, pv: 2181 },
];

const nivoLineData = [
  {
    id: "Series 1",
    data: [
      { x: "A", y: 10 },
      { x: "B", y: 30 },
      { x: "C", y: 15 },
      { x: "D", y: 45 },
      { x: "E", y: 20 },
    ]
  }
];
const getChartLabel = (type) => {
  switch (type) {
    case 0: return "Line Chart";
    case 1: return "Bar Chart";
    case 2: return "Pie Chart";
    case 3: return "Radar Chart";
    case 4: return "Scatter Chart";
    case 5: return "Area Chart";
    case 6: return "Radial Bar Chart";
    case 7: return "Treemap";
    case 8: return "ECharts Bar";
    case 9: return "ECharts Pie";
    case 10: return "Nivo Line";
    case 11: return "Nivo Pie";
    default: return "Custom Box";
  }
};

const nivoPieData = data.map((item, index) => ({
  id: item.name,
  label: item.name,
  value: item.value,
  color: COLORS[index % COLORS.length]
}));

const Visualise = () => {
  const chartList = [];

  for (let i = 1; i <= 100; i++) {
    const type = i % 15;
    const chartLabel = getChartLabel(type);

    const ChartWrapper = (chart) => (
      <div key={i} style={{ width: 300, textAlign: "center" }}>
        {chart}
        <p style={{ marginTop: "0.5rem", fontWeight: "bold" }}>{chartLabel} {i}</p>
      </div>
    );

    if (type === 0) {
      chartList.push(ChartWrapper(
        <LineChart key={i} width={300} height={200} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="uv" stroke={COLORS[i % COLORS.length]} />
        </LineChart>
      ));
    } else if (type === 1) {
      chartList.push(ChartWrapper(
        <BarChart key={i} width={300} height={200} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="pv" fill={COLORS[i % COLORS.length]} />
        </BarChart>
      ));
    } else if (type === 2) {
      chartList.push(ChartWrapper(
        <PieChart key={i} width={300} height={200}>
          <Pie data={data} dataKey="value" outerRadius={80}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      ));
    } else if (type === 3) {
      chartList.push(ChartWrapper(
        <RadarChart key={i} outerRadius={80} width={300} height={200} data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="name" />
          <PolarRadiusAxis />
          <Radar dataKey="uv" stroke={COLORS[i % COLORS.length]} fill={COLORS[i % COLORS.length]} fillOpacity={0.6} />
        </RadarChart>
      ));
    } else if (type === 4) {
      chartList.push(ChartWrapper(
        <ScatterChart key={i} width={300} height={200}>
          <CartesianGrid />
          <XAxis dataKey="name" type="category" />
          <YAxis dataKey="value" />
          <Tooltip />
          <Scatter data={data} fill={COLORS[i % COLORS.length]} />
        </ScatterChart>
      ));
    } else if (type === 5) {
      chartList.push(ChartWrapper(
        <AreaChart key={i} width={300} height={200} data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          <Area dataKey="uv" stroke={COLORS[i % COLORS.length]} fill={COLORS[i % COLORS.length]} />
        </AreaChart>
      ));
    } else if (type === 6) {
      chartList.push(ChartWrapper(
        <RadialBarChart key={i} width={300} height={200} innerRadius="20%" outerRadius="80%" data={data} startAngle={180} endAngle={0}>
          <RadialBar background dataKey="uv" />
          <Tooltip />
        </RadialBarChart>
       ) );
    } else if (type === 7) {
      chartList.push(ChartWrapper(
        <Treemap key={i} width={300} height={200} data={data} dataKey="value" ratio={4/3} stroke="#fff" fill={COLORS[i % COLORS.length]} />
      ));
    } else if (type === 8) {
      const option = {
        tooltip: {},
        xAxis: { type: 'category', data: data.map(d => d.name) },
        yAxis: {},
        series: [{
          data: data.map(d => d.value),
          type: 'bar',
          itemStyle: { color: COLORS[i % COLORS.length] }
        }]
      };
      chartList.push(ChartWrapper(<ReactECharts key={i} option={option} style={{ height: 200, width: 300 }} />));
    } else if (type === 9) {
      const option = {
        tooltip: {},
        series: [
          {
            type: 'pie',
            radius: ['40%', '70%'],
            data: data.map((item, index) => ({ value: item.value, name: item.name })),
            color: COLORS
          }
        ]
      };
      chartList.push(ChartWrapper(<ReactECharts key={i} option={option} style={{ height: 200, width: 300 }} />));
    } else if (type === 10) {
      chartList.push(ChartWrapper(
        <div key={i} style={{ height: 200, width: 300 }}>
          <ResponsiveLine data={nivoLineData} colors={COLORS[i % COLORS.length]} />
        </div>
      ));
    } else if (type === 11) {
      chartList.push(ChartWrapper(
        <div key={i} style={{ height: 200, width: 300 }}>
          <ResponsivePie data={nivoPieData} colors={COLORS} />
        </div>
      ));
    } else {
      chartList.push(ChartWrapper(
        <div key={i} style={{ height: 200, width: 300, background: COLORS[i % COLORS.length], display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff' }}>
          <h3>Custom Box {i}</h3>
        </div>
      ));
    }
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1rem", padding: "1rem" }}>
      {chartList}
    </div> 
  );
};

export default Visualise;