/* ============================================
   EV Market Dynamics – Dashboard App (Refined)
   ============================================ */

// ── Navigation ─────────────────────────────

function navigateTo(sectionId) {
  document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
  const nav = document.querySelector(`.nav-item[data-section="${sectionId}"]`);
  if (nav) nav.classList.add('active');

  document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
  const target = document.getElementById('section-' + sectionId);
  if (target) {
    target.classList.add('active');
    target.style.animation = 'none';
    void target.offsetHeight;
    target.style.animation = 'fadeUp 0.3s ease';
  }

  const titles = {
    'overview': ['Dashboard Overview', 'Real-time EV market intelligence'],
    'global-trends': ['Global EV Trends', 'Worldwide adoption patterns'],
    'charging': ['Charging Infrastructure', 'Global charging network analysis'],
    'consumer': ['Consumer Insights', 'Motivation, barriers, and readiness'],
    'segmentation': ['Segmentation Analysis', 'K-Means consumer clustering'],
    'ml-model': ['Driver Analysis (ML)', 'Random Forest feature importance'],
    'time-series': ['Market Growth', 'Time-series analysis'],
    'financial': ['Financial Signals', 'Stock market correlations'],
    'recommendations': ['Business Insights', 'Strategic recommendations'],
    'about': ['About Project', 'Team, methodology, and data sources'],
  };

  const [title, subtitle] = titles[sectionId] || ['Dashboard', ''];
  document.getElementById('pageTitle').textContent = title;
  document.getElementById('pageSubtitle').textContent = subtitle;
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('active');

  initChartsForSection(sectionId);
}

// ── Sidebar ────────────────────────────────

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebarOverlay').classList.toggle('active');
}

document.getElementById('sidebarOverlay').addEventListener('click', () => {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('active');
});

// ── Theme ──────────────────────────────────

function toggleTheme() {
  const html = document.documentElement;
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('ev-theme', next);
  document.getElementById('themeLabel').textContent = next === 'dark' ? 'Dark' : 'Light';
  updateChartColors();

  // Re-init leaflet map tiles if map exists
  if (leafletMap) {
    leafletMap.eachLayer(layer => {
      if (layer._url && layer._url.includes('{s}')) leafletMap.removeLayer(layer);
    });
    L.tileLayer(getMapTileUrl(), {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 6,
    }).addTo(leafletMap);
  }
}

function getMapTileUrl() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  return isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
}

(function () {
  const saved = localStorage.getItem('ev-theme');
  if (saved) {
    document.documentElement.setAttribute('data-theme', saved);
    const label = document.getElementById('themeLabel');
    if (label) label.textContent = saved === 'dark' ? 'Dark' : 'Light';
  }
})();

function updateChartColors() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const text = isDark ? '#9ca3af' : '#6b7280';
  const grid = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';

  Chart.defaults.color = text;
  Chart.defaults.borderColor = grid;

  Object.values(charts).forEach(c => {
    if (!c) return;
    if (c.options.scales) {
      Object.values(c.options.scales).forEach(s => {
        if (s.ticks) s.ticks.color = text;
        if (s.grid) s.grid.color = grid;
        if (s.title) s.title.color = text;
      });
    }
    c.update('none');
  });
}



// ============================================
// CHARTS
// ============================================

const charts = {};
const initializedSections = new Set();
let leafletMap = null;

function isDark() { return document.documentElement.getAttribute('data-theme') === 'dark'; }

function cfg() {
  const d = isDark();
  return {
    text: d ? '#9ca3af' : '#6b7280',
    grid: d ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
    font: "'Inter', sans-serif",
    tooltipBg: d ? '#1c1e2a' : '#111827',
  };
}

function scales(xLabel, yLabel) {
  const c = cfg();
  const base = { grid: { color: c.grid, drawBorder: false }, ticks: { color: c.text, font: { family: c.font, size: 10.5 } } };
  return {
    x: { ...base, title: xLabel ? { display: true, text: xLabel, color: c.text, font: { family: c.font, size: 11 } } : undefined },
    y: { ...base, beginAtZero: true, title: yLabel ? { display: true, text: yLabel, color: c.text, font: { family: c.font, size: 11 } } : undefined },
  };
}

function plugins(legend = true) {
  const c = cfg();
  return {
    legend: { display: legend, labels: { color: c.text, font: { family: c.font, size: 11 }, padding: 14, usePointStyle: true, pointStyleWidth: 8 } },
    tooltip: {
      backgroundColor: c.tooltipBg, titleColor: '#e5e7eb', bodyColor: '#9ca3af',
      borderColor: 'rgba(255,255,255,0.06)', borderWidth: 1, cornerRadius: 6,
      padding: 10, titleFont: { family: c.font, size: 12, weight: 600 }, bodyFont: { family: c.font, size: 11 },
    },
  };
}

function initChartsForSection(id) {
  if (initializedSections.has(id)) return;
  initializedSections.add(id);
  const fn = {
    'overview': initOverview, 'global-trends': initTrends, 'charging': initCharging,
    'consumer': initConsumer, 'segmentation': initSegmentation, 'ml-model': initML,
    'time-series': initTimeSeries, 'financial': initFinancial
  }[id];
  if (fn) fn();
}

// ── 1. Overview ────────────────────────────

function initOverview() {
  const yrs = ['2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'];
  charts.overviewSales = new Chart(document.getElementById('overviewSalesChart'), {
    type: 'line',
    data: {
      labels: yrs, datasets: [{
        label: 'EV Sales (M)', data: [0.02, 0.05, 0.12, 0.2, 0.32, 0.55, 0.78, 1.2, 2.1, 2.3, 3.2, 6.8, 10.5, 14.2, 17.4],
        borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.06)', fill: true,
        tension: 0.35, pointRadius: 3, pointHoverRadius: 5, borderWidth: 2,
      }]
    },
    options: { responsive: true, maintainAspectRatio: false, scales: scales('Year', 'Sales (M)'), plugins: plugins(false) },
  });

  charts.overviewRegions = new Chart(document.getElementById('overviewRegionsChart'), {
    type: 'bar',
    data: {
      labels: ['China', 'Europe', 'USA', 'Japan', 'S. Korea', 'India', 'Canada', 'Australia'],
      datasets: [{
        data: [8.1, 3.2, 1.9, 0.45, 0.38, 0.15, 0.12, 0.09],
        backgroundColor: ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#f97316', '#6366f1'],
        borderRadius: 4, borderSkipped: false
      }]
    },
    options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', scales: scales(null, 'Sales (M)'), plugins: plugins(false) },
  });
}

// ── 2. Trends ──────────────────────────────

function initTrends() {
  const yrs = ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'];
  charts.trendsSales = new Chart(document.getElementById('trendsSalesChart'), {
    type: 'line',
    data: {
      labels: yrs, datasets: [{
        label: 'Global EV Sales (M)', data: [0.55, 0.78, 1.2, 2.1, 2.3, 3.2, 6.8, 10.5, 14.2, 17.4],
        borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.05)', fill: true,
        tension: 0.35, pointRadius: 4, borderWidth: 2,
      }]
    },
    options: { responsive: true, maintainAspectRatio: false, scales: scales('Year', 'Sales (M)'), plugins: plugins(false) },
  });

  charts.trendsBevPhev = new Chart(document.getElementById('trendsBevPhevChart'), {
    type: 'line',
    data: {
      labels: yrs, datasets: [
        { label: 'BEV', data: [0.33, 0.48, 0.78, 1.4, 1.6, 2.3, 5.1, 7.8, 10.5, 13.2], borderColor: '#3b82f6', tension: 0.35, borderWidth: 2, pointRadius: 3, backgroundColor: 'rgba(59,130,246,0.04)', fill: true },
        { label: 'PHEV', data: [0.22, 0.30, 0.42, 0.7, 0.7, 0.9, 1.7, 2.7, 3.7, 4.2], borderColor: '#10b981', tension: 0.35, borderWidth: 2, pointRadius: 3, backgroundColor: 'rgba(16,185,129,0.04)', fill: true },
      ]
    },
    options: { responsive: true, maintainAspectRatio: false, scales: scales('Year', 'Sales (M)'), plugins: plugins(true) },
  });

  charts.trendsRegional = new Chart(document.getElementById('trendsRegionalChart'), {
    type: 'line',
    data: {
      labels: yrs, datasets: [
        { label: 'China', data: [0.21, 0.34, 0.58, 1.1, 1.2, 1.4, 3.5, 5.9, 8.1, 10.2], borderColor: '#ef4444', tension: 0.35, borderWidth: 1.8, pointRadius: 3, fill: false },
        { label: 'Europe', data: [0.19, 0.21, 0.31, 0.39, 0.56, 1.4, 2.3, 2.7, 3.2, 3.8], borderColor: '#3b82f6', tension: 0.35, borderWidth: 1.8, pointRadius: 3, fill: false },
        { label: 'USA', data: [0.11, 0.16, 0.2, 0.36, 0.33, 0.33, 0.67, 1.0, 1.9, 2.2], borderColor: '#10b981', tension: 0.35, borderWidth: 1.8, pointRadius: 3, fill: false },
        { label: 'Rest of World', data: [0.04, 0.07, 0.11, 0.25, 0.21, 0.07, 0.33, 0.9, 1.0, 1.2], borderColor: '#f59e0b', tension: 0.35, borderWidth: 1.8, pointRadius: 3, fill: false },
      ]
    },
    options: { responsive: true, maintainAspectRatio: false, scales: scales('Year', 'EV Sales (M)'), plugins: plugins(true) },
  });
}

// ── 3. Charging (Leaflet Map) ──────────────

function initCharging() {
  // Leaflet interactive map
  leafletMap = L.map('chargingMap', { scrollWheelZoom: true, zoomControl: true }).setView([25, 10], 2);

  L.tileLayer(getMapTileUrl(), {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/">CARTO</a>',
    maxZoom: 6,
  }).addTo(leafletMap);

  const stations = [
    { name: 'China', lat: 35.86, lng: 104.19, count: '1.8M', r: 28 },
    { name: 'USA', lat: 39.83, lng: -98.58, count: '180K', r: 18 },
    { name: 'Germany', lat: 51.17, lng: 10.45, count: '70K', r: 14 },
    { name: 'France', lat: 46.60, lng: 2.21, count: '95K', r: 15 },
    { name: 'UK', lat: 55.38, lng: -3.44, count: '55K', r: 13 },
    { name: 'Netherlands', lat: 52.13, lng: 5.29, count: '110K', r: 16 },
    { name: 'Japan', lat: 36.20, lng: 138.25, count: '45K', r: 12 },
    { name: 'South Korea', lat: 35.91, lng: 127.77, count: '60K', r: 13 },
    { name: 'India', lat: 20.59, lng: 78.96, count: '12K', r: 9 },
    { name: 'Norway', lat: 60.47, lng: 8.47, count: '25K', r: 11 },
    { name: 'Canada', lat: 56.13, lng: -106.35, count: '25K', r: 10 },
    { name: 'Australia', lat: -25.27, lng: 133.78, count: '8K', r: 8 },
    { name: 'Brazil', lat: -14.24, lng: -51.93, count: '5K', r: 7 },
    { name: 'Sweden', lat: 60.13, lng: 18.64, count: '30K', r: 11 },
  ];

  stations.forEach(s => {
    const circle = L.circleMarker([s.lat, s.lng], {
      radius: s.r / 2,
      fillColor: '#3b82f6',
      fillOpacity: 0.6,
      color: '#3b82f6',
      weight: 1,
      opacity: 0.8,
    }).addTo(leafletMap);

    circle.bindPopup(
      `<div style="font-family:Inter,sans-serif;font-size:13px;line-height:1.5;">
        <strong>${s.name}</strong><br>
        Charging Stations: <strong>${s.count}</strong>
      </div>`,
      { closeButton: false, offset: [0, -5] }
    );

    circle.bindTooltip(s.name, {
      permanent: s.r >= 14,
      direction: 'top',
      offset: [0, -s.r / 2 - 4],
      className: 'map-label',
    });
  });

  // Fix map rendering inside hidden container
  setTimeout(() => { leafletMap.invalidateSize(); }, 300);

  // Scatter chart
  charts.chargingScatter = new Chart(document.getElementById('chargingScatterChart'), {
    type: 'scatter',
    data: {
      datasets: [{
        label: 'Countries',
        data: [
          { x: 1800, y: 10200 }, { x: 450, y: 3800 }, { x: 180, y: 2200 }, { x: 45, y: 450 }, { x: 60, y: 380 },
          { x: 12, y: 150 }, { x: 25, y: 120 }, { x: 8, y: 90 }, { x: 35, y: 210 }, { x: 70, y: 520 }, { x: 95, y: 680 }, { x: 110, y: 890 },
        ],
        backgroundColor: 'rgba(59,130,246,0.5)', borderColor: '#3b82f6', pointRadius: 6, pointHoverRadius: 9,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      scales: {
        x: { ...scales().x, title: { display: true, text: 'Charging Stations (K)', color: cfg().text, font: { size: 11 } } },
        y: { ...scales().y, title: { display: true, text: 'EV Population (K)', color: cfg().text, font: { size: 11 } } },
      },
      plugins: plugins(false),
    },
  });
}

// ── 4. Consumer ────────────────────────────

function initConsumer() {
  const barOpts = (max) => ({
    responsive: true, maintainAspectRatio: false, indexAxis: 'y',
    scales: { x: { ...scales().x, max, title: { display: true, text: 'Avg. Likert Score (1-5)', color: cfg().text, font: { size: 11 } } }, y: scales().y },
    plugins: plugins(false),
  });

  charts.motivation = new Chart(document.getElementById('consumerMotivationChart'), {
    type: 'bar',
    data: {
      labels: ['Lower Running Cost', 'Environmental Benefits', 'Govt. Incentives', 'Rising Fuel Prices', 'Advanced Technology', 'Brand Reputation', 'Charging Convenience'],
      datasets: [{
        data: [4.12, 3.95, 3.84, 3.78, 3.62, 3.28, 3.45],
        backgroundColor: ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#06b6d4', '#ec4899', '#f97316'], borderRadius: 4, borderSkipped: false
      }]
    },
    options: barOpts(5),
  });

  charts.barrier = new Chart(document.getElementById('consumerBarrierChart'), {
    type: 'bar',
    data: {
      labels: ['EVs Too Expensive', 'Insufficient Charging', 'Battery Replacement Cost', 'Inadequate Range', 'Long Charging Time', 'Uncertain Resale Value', 'Limited Service Centers'],
      datasets: [{
        data: [3.45, 3.38, 3.22, 3.15, 2.98, 2.85, 2.78],
        backgroundColor: ['#ef4444', '#f59e0b', '#f97316', '#ec4899', '#8b5cf6', '#06b6d4', '#6366f1'], borderRadius: 4, borderSkipped: false
      }]
    },
    options: barOpts(5),
  });

  buildHeatmap();

  charts.ownership = new Chart(document.getElementById('consumerOwnershipChart'), {
    type: 'doughnut',
    data: {
      labels: ['Petrol', 'Diesel', 'Electric (BEV)', 'Hybrid/PHEV', 'No Vehicle'],
      datasets: [{
        data: [42, 18, 12, 8, 20],
        backgroundColor: ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', 'rgba(156,163,175,0.3)'],
        borderWidth: 2, borderColor: isDark() ? '#1c1e2a' : '#fff'
      }]
    },
    options: { responsive: true, maintainAspectRatio: false, cutout: '60%', plugins: { ...plugins(true), legend: { ...plugins(true).legend, position: 'bottom' } } },
  });
}

function buildHeatmap() {
  const vars = ['Low Cost', 'Env.', 'Incentives', 'Fuel', 'Tech', 'Brand', 'Charging'];
  const m = [
    [1.00, 0.42, 0.38, 0.55, 0.31, 0.22, 0.45],
    [0.42, 1.00, 0.35, 0.28, 0.48, 0.18, 0.33],
    [0.38, 0.35, 1.00, 0.41, 0.27, 0.21, 0.52],
    [0.55, 0.28, 0.41, 1.00, 0.19, 0.15, 0.38],
    [0.31, 0.48, 0.27, 0.19, 1.00, 0.44, 0.36],
    [0.22, 0.18, 0.21, 0.15, 0.44, 1.00, 0.25],
    [0.45, 0.33, 0.52, 0.38, 0.36, 0.25, 1.00],
  ];
  let h = '<table class="heatmap-table"><tr><th></th>';
  vars.forEach(v => { h += `<th>${v}</th>`; });
  h += '</tr>';
  m.forEach((row, i) => {
    h += `<tr><th style="text-align:right;padding-right:6px;">${vars[i]}</th>`;
    row.forEach(val => {
      const t = Math.abs(val);
      const bg = `rgba(59,130,246,${(0.08 + t * 0.55).toFixed(2)})`;
      h += `<td style="background:${bg};color:${t > 0.4 ? '#fff' : 'var(--text-secondary)'}">${val.toFixed(2)}</td>`;
    });
    h += '</tr>';
  });
  h += '</table>';
  document.getElementById('heatmapContainer').innerHTML = h;
}

// ── 5. Segmentation ────────────────────────

function initSegmentation() {
  const clusters = [
    { cx: 4.2, cy: 1.8, color: 'rgba(59,130,246,0.55)', label: 'EV Enthusiasts', n: 40 },
    { cx: 2.8, cy: 3.5, color: 'rgba(16,185,129,0.55)', label: 'Price-Sensitive', n: 35 },
    { cx: 3.8, cy: 3.2, color: 'rgba(245,158,11,0.55)', label: 'Infra-Constrained', n: 30 },
    { cx: 1.8, cy: 3.8, color: 'rgba(139,92,246,0.55)', label: 'Traditional', n: 25 },
  ];
  const ds = clusters.map(c => {
    const d = [];
    for (let i = 0; i < c.n; i++) d.push({ x: c.cx + (Math.random() - 0.5) * 1.4, y: c.cy + (Math.random() - 0.5) * 1.4 });
    return { label: c.label, data: d, backgroundColor: c.color, pointRadius: 5, pointHoverRadius: 7 };
  });
  charts.segment = new Chart(document.getElementById('segmentScatterChart'), {
    type: 'scatter', data: { datasets: ds },
    options: {
      responsive: true, maintainAspectRatio: false,
      scales: {
        x: { ...scales().x, min: 0, max: 5, title: { display: true, text: 'EV Motivation Score', color: cfg().text, font: { size: 11 } } },
        y: { ...scales().y, min: 0, max: 5, title: { display: true, text: 'EV Barrier Score', color: cfg().text, font: { size: 11 } } },
      },
      plugins: plugins(true),
    },
  });
}

// ── 6. ML ──────────────────────────────────

function initML() {
  const features = ['Charging Infra.', 'Govt. Incentives', 'Cost Savings', 'Income Level', 'Env. Awareness', 'Tech Interest', 'Fuel Prices', 'Brand Rep.', 'Driving Distance', 'Age Group'];
  const imp = [0.182, 0.156, 0.142, 0.118, 0.098, 0.085, 0.072, 0.058, 0.048, 0.041];
  charts.feature = new Chart(document.getElementById('featureImportanceChart'), {
    type: 'bar',
    data: {
      labels: features, datasets: [{
        data: imp,
        backgroundColor: imp.map((_, i) => `rgba(59,130,246,${0.4 + (1 - i / features.length) * 0.5})`),
        borderRadius: 4, borderSkipped: false
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, indexAxis: 'y',
      scales: { x: { ...scales().x, title: { display: true, text: 'Relative Importance', color: cfg().text, font: { size: 11 } } }, y: scales().y },
      plugins: plugins(false)
    },
  });

  // Confusion Matrix as a grouped bar chart
  charts.confusion = new Chart(document.getElementById('confusionMatrixChart'), {
    type: 'bar',
    data: {
      labels: ['Predicted Non-Adopter', 'Predicted Adopter'],
      datasets: [
        { label: 'Actual Non-Adopter', data: [122, 20], backgroundColor: 'rgba(59,130,246,0.65)', borderRadius: 4, borderSkipped: false },
        { label: 'Actual Adopter', data: [18, 165], backgroundColor: 'rgba(16,185,129,0.65)', borderRadius: 4, borderSkipped: false },
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      scales: {
        x: { ...scales().x, stacked: false },
        y: { ...scales().y, title: { display: true, text: 'Number of Samples', color: cfg().text, font: { size: 11 } } },
      },
      plugins: {
        ...plugins(true), tooltip: {
          ...plugins().tooltip, callbacks: {
            label: (ctx) => {
              const labels = [['True Negative (122)', 'False Positive (20)'], ['False Negative (18)', 'True Positive (165)']];
              return labels[ctx.datasetIndex][ctx.dataIndex];
            }
          }
        }
      }
    },
  });
}

// ── 7. Time-Series ─────────────────────────

function initTimeSeries() {
  const yrs = ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'];
  charts.tsSales = new Chart(document.getElementById('timeSeriesSalesChart'), {
    type: 'line',
    data: {
      labels: yrs, datasets: [{
        label: 'EV Sales (M)', data: [0.55, 0.78, 1.2, 2.1, 2.3, 3.2, 6.8, 10.5, 14.2, 17.4],
        borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.05)', fill: true,
        tension: 0.35, pointRadius: 4, borderWidth: 2
      }]
    },
    options: { responsive: true, maintainAspectRatio: false, scales: scales('Year', 'Sales (M)'), plugins: plugins(false) },
  });

  const gr = [0, 41.8, 53.8, 75.0, 9.5, 39.1, 112.5, 54.4, 35.2, 22.5];
  charts.tsGrowth = new Chart(document.getElementById('timeSeriesGrowthChart'), {
    type: 'bar',
    data: {
      labels: yrs, datasets: [{
        data: gr,
        backgroundColor: gr.map(v => v > 50 ? 'rgba(16,185,129,0.65)' : v > 20 ? 'rgba(59,130,246,0.65)' : 'rgba(245,158,11,0.65)'),
        borderRadius: 4, borderSkipped: false
      }]
    },
    options: { responsive: true, maintainAspectRatio: false, scales: scales('Year', 'Growth (%)'), plugins: plugins(false) },
  });

  charts.tsMulti = new Chart(document.getElementById('timeSeriesMultiChart'), {
    type: 'line',
    data: {
      labels: yrs, datasets: [
        { label: 'EV Sales Index', data: [100, 142, 218, 382, 418, 582, 1236, 1909, 2582, 3164], borderColor: '#3b82f6', tension: 0.35, borderWidth: 2, pointRadius: 3 },
        { label: 'Infrastructure Index', data: [100, 135, 175, 240, 320, 450, 720, 1050, 1450, 1900], borderColor: '#10b981', tension: 0.35, borderWidth: 2, pointRadius: 3 },
        { label: 'EV Stock Index', data: [100, 125, 155, 200, 250, 340, 520, 780, 1050, 1350], borderColor: '#f59e0b', tension: 0.35, borderWidth: 2, pointRadius: 3 },
      ]
    },
    options: { responsive: true, maintainAspectRatio: false, scales: scales('Year', 'Index (2015=100)'), plugins: plugins(true) },
  });
}

// ── 8. Financial ───────────────────────────

function initFinancial() {
  const q = ['Q1 20', 'Q2 20', 'Q3 20', 'Q4 20', 'Q1 21', 'Q2 21', 'Q3 21', 'Q4 21', 'Q1 22', 'Q2 22', 'Q3 22', 'Q4 22', 'Q1 23', 'Q2 23', 'Q3 23', 'Q4 23'];
  charts.stock = new Chart(document.getElementById('financialStockChart'), {
    type: 'line',
    data: {
      labels: q, datasets: [
        { label: 'Tesla', data: [100, 150, 320, 690, 640, 580, 720, 890, 820, 640, 510, 390, 450, 520, 480, 510], borderColor: '#ef4444', tension: 0.3, borderWidth: 1.8, pointRadius: 2 },
        { label: 'BYD', data: [100, 110, 130, 180, 220, 280, 350, 410, 380, 420, 480, 520, 580, 640, 600, 650], borderColor: '#3b82f6', tension: 0.3, borderWidth: 1.8, pointRadius: 2 },
        { label: 'NIO', data: [100, 130, 180, 420, 380, 320, 350, 280, 200, 150, 120, 110, 130, 140, 100, 95], borderColor: '#10b981', tension: 0.3, borderWidth: 1.8, pointRadius: 2 },
        { label: 'Rivian', data: [null, null, null, null, null, null, null, 100, 78, 55, 42, 38, 45, 52, 40, 35], borderColor: '#f59e0b', tension: 0.3, borderWidth: 1.8, pointRadius: 2 },
      ]
    },
    options: { responsive: true, maintainAspectRatio: false, scales: scales('Quarter', 'Normalized Price'), plugins: plugins(true), spanGaps: true },
  });

  charts.finScatter = new Chart(document.getElementById('financialScatterChart'), {
    type: 'scatter',
    data: {
      datasets: [{
        label: 'Sales vs Stock',
        data: [{ x: 3.2, y: 150 }, { x: 6.8, y: 690 }, { x: 10.5, y: 820 }, { x: 14.2, y: 510 }, { x: 4.5, y: 280 }, { x: 7.2, y: 410 }, { x: 11, y: 520 }, { x: 15, y: 650 }, { x: 3.5, y: 180 }, { x: 5.8, y: 350 }, { x: 9, y: 480 }, { x: 12.5, y: 600 }],
        backgroundColor: 'rgba(16,185,129,0.5)', borderColor: '#10b981', pointRadius: 6, pointHoverRadius: 9
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      scales: {
        x: { ...scales().x, title: { display: true, text: 'EV Sales (M)', color: cfg().text, font: { size: 11 } } },
        y: { ...scales().y, title: { display: true, text: 'Stock Index', color: cfg().text, font: { size: 11 } } },
      },
      plugins: plugins(false),
    },
  });
}

// ── Init ───────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  updateChartColors();
  initChartsForSection('overview');
});
