import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, TimeScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
import 'chartjs-adapter-date-fns';
import annotationPlugin from 'chartjs-plugin-annotation';
import { parse, format, isValid } from 'date-fns';
import './LineGraph.css'; 
import oplogo from "./OP.png"

ChartJS.register(TimeScale, LinearScale, PointElement, LineElement, Tooltip, Legend, annotationPlugin);

const LineGraph = () => {
  const [chartData, setChartData] = useState(null);
  const [view, setView] = useState('daily'); 
  const [lastUpdateDate, setLastUpdateDate] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('/output_hhi_cpi.json');
      const data = await response.json();
      const formattedData = parseJSON(data);

      // Find the last date from the data
      const lastDate = formattedData.labels.length > 0 ? formattedData.labels[formattedData.labels.length - 1] : null;
      setLastUpdateDate(lastDate ? format(lastDate, 'dd MMMM yyyy') : 'N/A');

      setChartData(formattedData);
    };

    fetchData();
  }, [view]);

  const parseJSON = (data) => {
    const labels = [];
    const cpiData = [];

    data.forEach(item => {
      const date = parse(item.date, 'dd-MM-yyyy', new Date()); 
      const cpi = parseFloat(item.CPI);
      if (date && !isNaN(cpi)) {
        labels.push(date);
        cpiData.push(cpi);
      }
    });

    const calculateMovingAverage = (data, windowSize) => {
      const result = [];
      for (let i = 0; i < data.length; i++) {
        const window = data.slice(Math.max(0, i - windowSize + 1), i + 1);
        const average = window.reduce((sum, value) => sum + value, 0) / window.length;
        result.push(average);
      }
      return result;
    };

    const datasets = [
      {
        label: view === 'movingAverage' ? '7-Day Moving Average CPI' : 'Daily CPI',
        data: view === 'movingAverage' ? calculateMovingAverage(cpiData, 7) : cpiData,
        borderColor: 'rgba(228,48,45,255)',
        fill: false,
      },
    ];

    const events = [
      { name: 'RPGF Round 2', startDate: '01-06-2022', endDate: '30-03-2023', color: 'rgba(255,0,0,0.7)' },
      { name: 'RPGF Round 3', startDate: '14-10-2023', endDate: '11-01-2024', color: 'rgba(255,0,0,0.7)' },
      { name: 'RPGF Round 4', startDate: '03-06-2024', endDate: '11-01-2024', color: 'rgba(255,0,0,0.7)' },
      { name: 'Season 3', startDate: '26-01-2023', endDate: '05-04-2023', color: 'rgba(128,0,128,0.7)' },
      { name: 'Season 4', startDate: '08-06-2023', endDate: '20-09-2023', color: 'rgba(128,0,128,0.7)' },
      { name: 'Season 5', startDate: '04-01-2024', endDate: '00-00-0000', color: 'rgba(128,0,128,0.7)' },
      { name: 'Season 6', startDate: '27-06-2024', endDate: '00-00-0000', color: 'rgba(128,0,128,0.7)' }
    ];

    const annotations = {};

    events.forEach((event, index) => {
      const start = parse(event.startDate, 'dd-MM-yyyy', new Date());
    
      const isRPGF = event.name.includes('RPGF');
      const yPosition = isRPGF ? '1%' : '15%'; 
    
      annotations[`startLine${index}`] = {
        type: 'line',
        xMin: start,
        xMax: start,
        borderColor: event.color,
        borderWidth: 2,
        borderDash: [6, 6],
      };
    
      annotations[`eventLabel${index}`] = {
        type: 'label',
        xValue: start, 
        yValue: yPosition,
        content: `${event.name}`,
        font: {
          size: 14,
          weight: 'bold',
        },
        color: event.color,
        textAlign: 'center',
        xAdjust: isRPGF ? 55 : 40, 
        yAdjust: isRPGF ? -20 : 20, 
        padding: {
          bottom: isRPGF ? 250 : 200,
        },
      };
    });

    return {
      labels,
      datasets,
      annotations,
    };
  };

  return (
    <div className="line-graph-container">
      <div className="header">
        <img src={oplogo} alt="OP Logo" className="op-logo" />
        <div className="header-content">
          <h2 className="line-graph-title">Optimism CPI Over Time</h2>
          <div className="view-selector">
            <label>
              View :  &nbsp;
              <select onChange={(e) => setView(e.target.value)} value={view}>
                <option value="daily">Daily CPI</option>
                <option value="movingAverage">7-Day Moving Average</option>
              </select>
            </label>
          </div>
          <div className="last-updated">
            {`Data was last updated on ${lastUpdateDate}`}
          </div>
        </div>
      </div>
      {chartData && (
        <div className="line-graph">
          <Line
            data={chartData}
            options={{
              plugins: {
                legend: {
                  display: false,  
                },
                tooltip: {
                  callbacks: {
                    title: function (tooltipItem) {
                      const date = tooltipItem[0].label;
                      return `Date - ${format(new Date(date), 'yyyy-MM-dd')}`; 
                    },
                    label: function (tooltipItem) {
                      const value = tooltipItem.raw;
                      const formattedValue = value.toFixed(2);
                      const isMovingAverage = chartData.datasets[0].label.includes('Moving Average');
                      return isMovingAverage
                        ? `7-D MACPI - ${formattedValue}`
                        : `CPI - ${formattedValue}`;
                    },
                  },
                },
                annotation: {
                  annotations: chartData.annotations,
                },
              },
              scales: {
                x: {
                  type: 'time',
                  time: {
                    unit: 'day',
                    tooltipFormat: 'yyyy-MM-dd',
                    displayFormats: {
                      day: 'MMM yyyy',
                    },
                  },
                  title: {
                    display: true,
                    text: 'Date',
                  },
                  ticks: {
                    autoSkip: true,
                    maxTicksLimit: 10,
                  },
                },
                y: {
                  min: 40,  
                  max: 360, 
                  ticks: {
                    stepSize: 40, 
                  },
                  title: {
                    display: true,
                    text: 'CPI',
                  },
                },
              },
              responsive: true,
              maintainAspectRatio: false,
              animation: {
                duration: 2000, 
                easing: 'easeOutQuart',
                onComplete: () => {
                  console.log('Animation complete');
                },
              },
            }}
          />
        </div>
      )}
    </div>
  );
};

export default LineGraph;
