import React from 'react';
import './SizeChart.css';

const SizeChart = () => {
  const sizes = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];
  const chest = [34, 36, 38, 40, 42, 44, 46];
  const length = [24, 25, 26, 27, 28, 29, 30];
  const sleeveLength = [7.5, 8, 8, 8.5, 8.5, 9, 10];
  const shoulder = [15.5, 16, 17, 17.5, 18, 19, 20];

  return (
    <div className="size-chart-container">

      <h1 className="size-chart-title">T-Shirt Size Chart</h1>

      <div className="size-chart-image">
        <img
          src="/images/size.png"
          alt="T-shirt Size Measurement"
        />
      </div>

      {/* Desktop Table */}
      <div className="size-table-container desktop-table">
        <table className="size-table">
          <thead>
            <tr>
              <th>Size</th>
              <th>Chest (inches)</th>
              <th>Length (inches)</th>
              <th>Sleeve Length (inches)</th>
              <th>Shoulder (inches)</th>
            </tr>
          </thead>
          <tbody>
            {sizes.map((size, index) => (
              <tr key={size}>
                <td>{size}</td>
                <td>{chest[index]}</td>
                <td>{length[index]}</td>
                <td>{sleeveLength[index]}</td>
                <td>{shoulder[index]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Table */}
      <div className="size-table-container mobile-table">
        <div className="mobile-scroll">
          <table className="size-table mobile-version">
            <thead>
              <tr>
                <th>Size</th>
                <th>Chest</th>
                <th>Length</th>
                <th>Sleeve</th>
                <th>Shoulder</th>
              </tr>
            </thead>
            <tbody>
              {sizes.map((size, index) => (
                <tr key={size}>
                  <td>{size}</td>
                  <td>{chest[index]}</td>
                  <td>{length[index]}</td>
                  <td>{sleeveLength[index]}</td>
                  <td>{shoulder[index]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ⭐ IMPORTANT NOTE SECTION (Included as requested) */}
      <div className="important-note">
        <h2>Important Size Note</h2>
        <ul>
          <li>Choose one size larger</li>
          <li>Some products have separate size charts</li>
          <li>For five-sleeve designs, chest and sleeves increase by 2 inches</li>
        </ul>
      </div>

    </div>
  );
};

export default SizeChart;
