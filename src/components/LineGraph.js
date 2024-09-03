import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, TimeScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
import 'chartjs-adapter-date-fns';

ChartJS.register(TimeScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const LineGraph = () => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('/output_hhi_cpi.csv');
      const text = await response.text();
      const data = parseCSV(text);
      setChartData(data);
    };

    fetchData();
  }, []);

  const parseCSV = (text) => {
    const lines = text.trim().split('\n');
    const labels = [];
    const cpiData = [];

    lines.slice(1).forEach(line => {
      const [date, , cpi] = line.split(',');
      if (date && cpi) {
        labels.push(new Date(date));
        cpiData.push(parseFloat(cpi));
      }
    });

    return {
      labels,
      datasets: [
        {
          label: 'CPI',
          data: cpiData,
          borderColor: 'rgba(75,192,192,1)',
          fill: false,
        },
      ],
    };
  };

  return (
    chartData && (
      <div style={{ position: 'relative', height: '500px', width: '100%' }}>
        <Line
          data={chartData}
          options={{
            scales: {
              x: {
                type: 'time',
                time: {
                  unit: 'day',
                  tooltipFormat: 'yyyy-MM-dd',
                  displayFormats: {
                    day: 'MMM d',  // Update this line to use 'd' instead of 'D'
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
                title: {
                  display: true,
                  text: 'CPI',
                },
              },
            },
            responsive: true,
            maintainAspectRatio: false,
          }}
        />
      </div>
    )
  );
};

export default LineGraph;
