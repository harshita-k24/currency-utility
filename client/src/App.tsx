import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const API_BASE = 'http://localhost:5000/api';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'SGD'];

export default function App() {
  const [isTravelMode, setIsTravelMode] = useState<boolean>(false);
  const [sourceCurrency, setSourceCurrency] = useState<string>('USD');
  const [targetCurrency, setTargetCurrency] = useState<string>('EUR');
  const [amount, setAmount] = useState<number>(100);

  // Dual conversion state (calculated by backend)
  const [convertedResult, setConvertedResult] = useState<number | null>(null);
  const [currentRate, setCurrentRate] = useState<number | null>(null);

  // 30-Day trend chart state
  const [trendLabels, setTrendLabels] = useState<string[]>([]);
  const [trendValues, setTrendValues] = useState<number[]>([]);

  // Travel budgeting comparison results
  const [travelResults, setTravelResults] = useState<any[]>([]);

  // SQLite favorites state
  const [favorites, setFavorites] = useState<{ id: number; source_currency: string; target_currency: string }[]>([]);

  // Fetch conversion from backend
  const fetchConversion = async (from: string, to: string, amt: number) => {
    try {
      const res = await fetch(`${API_BASE}/convert?from=${from}&to=${to}&amount=${amt}`);
      const data = await res.json();
      if (res.ok) {
        setConvertedResult(data.convertedAmount);
        setCurrentRate(data.rate);
      }
    } catch (err) {
      console.error('Failed to convert', err);
    }
  };

  // Fetch 30-day historical trend data from backend
  const fetchTrends = async (from: string, to: string) => {
    try {
      const res = await fetch(`${API_BASE}/history/trends?from=${from}&to=${to}`);
      const data = await res.json();
      if (res.ok && data.trends) {
        setTrendLabels(data.trends.map((t: any) => t.date.slice(5)));
        setTrendValues(data.trends.map((t: any) => t.rate));
      }
    } catch (err) {
      console.error('Failed to fetch trends', err);
    }
  };

  // Fetch travel budgeting results
  const fetchTravelBudget = async (base: string, amt: number) => {
    try {
      const res = await fetch(`${API_BASE}/travel-budget?base=${base}&amount=${amt}`);
      const data = await res.json();
      if (res.ok) {
        setTravelResults(data.results);
      }
    } catch (err) {
      console.error('Failed to fetch travel budget', err);
    }
  };

  // Fetch favorites from SQLite
  const fetchFavorites = async () => {
    try {
      const res = await fetch(`${API_BASE}/favorites`);
      const data = await res.json();
      if (Array.isArray(data)) setFavorites(data);
    } catch (err) {
      console.error('Failed to fetch favorites', err);
    }
  };

  // Add pair to favorites
  const addFavorite = async () => {
    try {
      await fetch(`${API_BASE}/favorites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: sourceCurrency, target: targetCurrency })
      });
      fetchFavorites();
    } catch (err) {
      console.error('Failed to add favorite', err);
    }
  };

  // Delete pair from favorites
  const deleteFavorite = async (id: number) => {
    try {
      await fetch(`${API_BASE}/favorites/${id}`, { method: 'DELETE' });
      fetchFavorites();
    } catch (err) {
      console.error('Failed to delete favorite', err);
    }
  };

  // Swap currencies
  const swapCurrencies = () => {
    setSourceCurrency(targetCurrency);
    setTargetCurrency(sourceCurrency);
  };

  // Triggers conversion and trends on input change
  useEffect(() => {
    if (!isTravelMode) {
      fetchConversion(sourceCurrency, targetCurrency, amount);
      fetchTrends(sourceCurrency, targetCurrency);
    } else {
      fetchTravelBudget(sourceCurrency, amount);
    }
  }, [sourceCurrency, targetCurrency, amount, isTravelMode]);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const chartData = {
    labels: trendLabels,
    datasets: [
      {
        label: `${sourceCurrency} to ${targetCurrency} (30 Days)`,
        data: trendValues,
        fill: true,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3
      }
    ]
  };

  return (
    <div className="container">
      <div className="header">
        <div>
          <h1 className="title">Currency Utility</h1>
          <p className="sub-text">Real-time conversion with server-side computation & trends</p>
        </div>
        <button
          className={`toggle-btn ${isTravelMode ? 'active' : ''}`}
          onClick={() => setIsTravelMode(!isTravelMode)}
        >
          {isTravelMode ? '✈ Travel Mode Active' : 'Switch to Travel Mode'}
        </button>
      </div>

      {/* Dual Converter OR Travel Budgeting Mode */}
      {!isTravelMode ? (
        <div className="card">
          <div className="input-row">
            <div className="input-group">
              <label>Amount</label>
              <input
                type="number"
                min="0"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="input-group">
              <label>From</label>
              <select value={sourceCurrency} onChange={(e) => setSourceCurrency(e.target.value)}>
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <button className="swap-btn" onClick={swapCurrencies} title="Swap currencies">⇄</button>
            <div className="input-group">
              <label>To</label>
              <select value={targetCurrency} onChange={(e) => setTargetCurrency(e.target.value)}>
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <button className="fav-btn" onClick={addFavorite} title="Bookmark currency pair">★</button>
          </div>

          <div className="result-box">
            <div className="result-val">
              {amount} {sourceCurrency} = {convertedResult !== null ? convertedResult : '...'} {targetCurrency}
            </div>
            <div className="sub-text">
              1 {sourceCurrency} = {currentRate} {targetCurrency}
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <h3>✈ Travel Budgeting Comparison</h3>
          <p className="sub-text">Simultaneous conversion against 5 major global currencies</p>
          <div className="input-row" style={{ marginTop: '1rem' }}>
            <div className="input-group">
              <label>Base Amount</label>
              <input
                type="number"
                min="0"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="input-group">
              <label>Home Currency</label>
              <select value={sourceCurrency} onChange={(e) => setSourceCurrency(e.target.value)}>
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Currency</th>
                <th>Code</th>
                <th>Rate (per {sourceCurrency})</th>
                <th>Converted Total</th>
              </tr>
            </thead>
            <tbody>
              {travelResults.map((item) => (
                <tr key={item.code}>
                  <td>{item.name}</td>
                  <td><strong>{item.code}</strong></td>
                  <td>{item.rate}</td>
                  <td><strong>{item.symbol} {item.convertedValue}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Favorites List */}
      <div className="card">
        <h4>Saved Favorites</h4>
        <div className="badge-list">
          {favorites.length === 0 ? (
            <p className="sub-text">No favorites saved yet. Click the ★ icon above to save pairs.</p>
          ) : (
            favorites.map((fav) => (
              <div
                key={fav.id}
                className="badge"
                onClick={() => {
                  setSourceCurrency(fav.source_currency);
                  setTargetCurrency(fav.target_currency);
                }}
              >
                {fav.source_currency} → {fav.target_currency}
                <span onClick={(e) => { e.stopPropagation(); deleteFavorite(fav.id); }}>×</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 30-Day Trend Line Chart */}
      {!isTravelMode && (
        <div className="card">
          <h4>30-Day Historical Trend ({sourceCurrency}/{targetCurrency})</h4>
          <div style={{ marginTop: '1rem', height: '260px' }}>
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
