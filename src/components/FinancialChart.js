import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
  ReferenceLine,
} from "recharts";
import PropTypes from "prop-types";
import "../css/App.css";

const FinancialChart = ({ data }) => {
  const [tooltipData, setTooltipData] = useState(null);

  // Validate data
  if (!Array.isArray(data) || data.length === 0) {
    return null; // Return null instead of an empty div
  }

  // Function to format value (divides by 1 million and shows 2 decimal places)
  const formatValue = (value) => {
    return (value / 1000000).toFixed(2);
  };

  // Function to handle point click and set tooltip data
  const handlePointClick = (point) => {
    setTooltipData(point.payload);
  };

  // Extracting keys and defining line colors
  const keysToIgnore = ["date", "act_symbol", "period"];
  const keys = Object.keys(data[0]).filter((key) => !keysToIgnore.includes(key));
  const lineColors = ["#6a89cc", "#78e08f", "#f6b93b", "#eb4d4b", "#30336b", "#95afc0", "#badc58"];

  return (
    <div className="financial-chart-container">
      <ResponsiveContainer width="100%" height={600}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="9 9" />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
          <YAxis tickFormatter={formatValue} tick={{ fontSize: 10 }} width={80} />
          <Tooltip
            formatter={(value) => formatValue(value)}
            content={
              tooltipData && (
                <div className="custom-tooltip">
                  {Object.entries(tooltipData).map(([key, value]) => (
                    <div key={key}>
                      <span>{key}:</span> {formatValue(value)}
                    </div>
                  ))}
                </div>
              )
            }
          />
          {keys.map((key, index) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={lineColors[index % lineColors.length]}
              strokeWidth={2}
              dot={false}
              onClick={handlePointClick}
            />
          ))}
          <Brush dataKey="date" height={20} stroke="#8884d8" />
          {tooltipData && (
            <ReferenceLine
              x={tooltipData.date}
              stroke="black"
              label={{
                position: "top",
                value: "Selected Point",
                fill: "black",
                fontSize: 12,
              }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
      <div className="legend-container">
        <Legend wrapperStyle={{ fontSize: 12 }} align="center" verticalAlign="bottom" height={30} />
      </div>
    </div>
  );
};

// Typechecking with PropTypes
FinancialChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default FinancialChart;
