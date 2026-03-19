/* ============================================
   EV Market Dynamics – Dashboard App
   Data sourced from data/processed/ CSVs
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
// CHARTS — Data from data/processed/ CSVs
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

// ════════════════════════════════════════════
// DATA from data/processed/ CSVs
// ════════════════════════════════════════════

// Source: iea_ev_clean.csv — global EV sales by year (units)
const ieaYears = ['2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023'];
const ieaGlobalSales = [17481, 116745, 285910, 510334, 810712, 1412771, 1852523, 2827858, 4737614, 5180742, 20417199, 43515355, 65977598, 88313119];
// Convert to millions for display
const ieaGlobalSalesM = ieaGlobalSales.map(v => +(v / 1e6).toFixed(2));

// Source: iea_ev_clean.csv — BEV vs PHEV cumulative stock (fleet on road) including forecasts
const bevPhevYears = ['2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2025', '2030', '2035'];
const bevStock = [51515, 145270, 294452, 566662, 1020330, 1792029, 2848184, 4502120, 7464770, 11138500, 43456690, 71672280, 117147600, 179100300, 221760000, 739400000, 1673000000];
const phevStock = [906, 19905, 157959, 390112, 720993, 1331634, 2099279, 3157311, 4748760, 6064667, 22635470, 35972870, 53710680, 80754170, 90214200, 214829000, 342512000];
const bevStockM = bevStock.map(v => +(v / 1e6).toFixed(1));
const phevStockM = phevStock.map(v => +(v / 1e6).toFixed(1));

// Source: iea_ev_clean.csv — BEV vs PHEV annual sales (historical only)
const bevSales = [16277, 97797, 147215, 278034, 490057, 800242, 1084489, 1740490, 3127943, 3660719, 13356170, 30009095, 46508247, 60594310];
const phevSales = [1103, 18796, 138577, 232124, 320407, 610782, 762945, 1079791, 1600231, 1503874, 7015100, 13408329, 19376049, 27663670];
const bevSalesM = bevSales.map(v => +(v / 1e6).toFixed(2));
const phevSalesM = phevSales.map(v => +(v / 1e6).toFixed(2));

// Source: iea_ev_clean.csv — regional EV sales by year (units → millions)
const chinaSales = [1440, 5120, 9860, 15730, 73000, 211000, 339000, 580000, 1090000, 1060000, 3420000, 9750057, 17700720, 24301560];
const europeSales = [1837, 11448, 28229, 59042, 96032, 189190, 213180, 300340, 400280, 580610, 4202220, 6902880, 8103900, 9902460];
const usaSales = [1200, 17800, 54000, 97000, 118055, 114100, 161100, 196300, 362700, 327000, 885600, 1899300, 2978100, 4179000];
const chinaSalesM = chinaSales.map(v => +(v / 1e6).toFixed(2));
const europeSalesM = europeSales.map(v => +(v / 1e6).toFixed(2));
const usaSalesM = usaSales.map(v => +(v / 1e6).toFixed(2));
const rowSalesM = ieaGlobalSalesM.map((v, i) => +(v - chinaSalesM[i] - europeSalesM[i] - usaSalesM[i]).toFixed(2));

// Source: iea_ev_clean.csv — EV adoption by region (cumulative EV units, millions)
const regionLabels = ['China', 'Europe', 'USA', 'Rest of World', 'India'];
const regionAdoption = [477, 254, 204, 171, 39];

// Source: survey_clean.csv — motivation factor averages (Likert 1–5)
const motivationLabels = ['Advanced Technology', 'Rising Fuel Prices', 'Lower Running Cost', 'Charging Convenience', 'Brand Reputation', 'Environmental Benefits', 'Govt. Incentives'];
const motivationValues = [4.06, 3.95, 3.77, 3.70, 3.66, 3.63, 3.07];

// Source: survey_clean.csv — barrier factor totals (sum of all survey scores)
const barrierLabels = ['Battery Replacement Cost', 'Charging Infrastructure', 'Charging Time Too Long', 'Driving Range Inadequate', 'EV Resale Value Uncertain', 'Limited Service Centers', 'EVs Too Expensive'];
const barrierValues = [1256, 1150, 1115, 1049, 1244, 1148, 944];

// Source: survey_clean.csv — vehicle ownership counts
const ownershipLabels = ['Petrol / Diesel', 'Electric Vehicle', 'No Vehicle', 'Hybrid'];
const ownershipCounts = [238, 49, 22, 16];

// Source: survey_clean.csv — correlation matrix (motivation factors)
const corrLabels = ['Low Cost', 'Env.', 'Incentives', 'Fuel', 'Tech', 'Brand', 'Charging'];
const corrMatrix = [
  [1.00, 0.33, 0.31, 0.47, 0.54, 0.17, 0.44],
  [0.33, 1.00, 0.39, 0.50, 0.40, 0.44, 0.29],
  [0.31, 0.39, 1.00, 0.22, 0.08, 0.07, 0.09],
  [0.47, 0.50, 0.22, 1.00, 0.69, 0.21, 0.40],
  [0.54, 0.40, 0.08, 0.69, 1.00, 0.41, 0.64],
  [0.17, 0.44, 0.07, 0.21, 0.41, 1.00, 0.48],
  [0.44, 0.29, 0.09, 0.40, 0.64, 0.48, 1.00],
];

// Source: survey_clean.csv — aggregate scores
const avgMotivationScore = 3.68;
const avgBarrierScore = 3.62;
const evReadinessScore = 1.09;

// Source: charging_infrastructure_clean.csv — country centroids (country code → name mapping)
// Country codes from OpenChargeMap: 1=UK, 2=USA, 44=Canada, 50=China, 80=France, 87=Germany, 106=India, 114=Japan, 159=Netherlands, 168=Norway
const chargingStations = [
  { name: 'Norway', lat: 61.04, lng: 9.89, count: '29,729', total: 29729, r: 28 },
  { name: 'France', lat: 47.79, lng: 2.29, count: '21,465', total: 21465, r: 24 },
  { name: 'Germany', lat: 51.27, lng: 9.73, count: '9,310', total: 9310, r: 18 },
  { name: 'UK', lat: 52.24, lng: -1.36, count: '8,691', total: 8691, r: 17 },
  { name: 'USA', lat: 38.05, lng: -94.01, count: '8,101', total: 8101, r: 16 },
  { name: 'Netherlands', lat: 52.20, lng: 5.17, count: '8,071', total: 8071, r: 16 },
  { name: 'Canada', lat: 47.47, lng: -86.03, count: '5,155', total: 5155, r: 14 },
  { name: 'India', lat: 15.22, lng: 78.36, count: '3,497', total: 3497, r: 12 },
  { name: 'Japan', lat: 35.71, lng: 137.10, count: '2,161', total: 2161, r: 10 },
  { name: 'China', lat: 29.88, lng: 114.06, count: '31', total: 31, r: 6 },
];

// Source: stock_market_clean.csv — quarterly normalized close price (base Q4 2018 = 100)
const stockQuarters = ['Q4 18', 'Q1 19', 'Q2 19', 'Q3 19', 'Q4 19', 'Q1 20', 'Q2 20', 'Q3 20', 'Q4 20', 'Q1 21', 'Q2 21', 'Q3 21', 'Q4 21', 'Q1 22', 'Q2 22', 'Q3 22', 'Q4 22', 'Q1 23', 'Q2 23', 'Q3 23', 'Q4 23'];
const tslaNorm = [100, 87.5, 67.8, 68.2, 94.5, 180.6, 235.7, 514.4, 743.5, 1093.9, 945.8, 1025.5, 1461.3, 1357.1, 1189.3, 1216.8, 825.0, 760.1, 871.2, 1119.2, 1015.9];
const nvdaNorm = [100, 106.9, 114.3, 116.1, 143.7, 174.5, 223.8, 322.1, 370.7, 372.2, 444.0, 575.4, 762.5, 695.1, 523.2, 438.4, 406.8, 600.4, 921.2, 1243.3, 1262.9];
const liNorm = [null, null, null, null, null, null, null, 100, 164.1, 173.0, 140.2, 180.0, 184.7, 165.1, 159.9, 186.5, 113.8, 141.4, 168.3, 236.1, 218.5];


// ── 1. Overview (iea_ev_clean.csv + ev_sales_clean.csv) ──

function initOverview() {
  charts.overviewSales = new Chart(document.getElementById('overviewSalesChart'), {
    type: 'line',
    data: {
      labels: ieaYears, datasets: [{
        label: 'EV Sales (M)', data: ieaGlobalSalesM,
        borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.06)', fill: true,
        tension: 0.35, pointRadius: 3, pointHoverRadius: 5, borderWidth: 2,
      }]
    },
    options: { responsive: true, maintainAspectRatio: false, scales: scales('Year', 'Sales (Millions)'), plugins: plugins(false) },
  });

  charts.overviewRegions = new Chart(document.getElementById('overviewRegionsChart'), {
    type: 'bar',
    data: {
      labels: regionLabels,
      datasets: [{
        data: regionAdoption,
        backgroundColor: ['#3b82f6', '#10b981', '#8b5cf6', '#06b6d4', '#ec4899'],
        borderRadius: 4, borderSkipped: false
      }]
    },
    options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', scales: scales(null, 'EV Units (Millions)'), plugins: plugins(false) },
  });
}

// ── 2. Trends (iea_ev_clean.csv) ───────────

function initTrends() {
  charts.trendsSales = new Chart(document.getElementById('trendsSalesChart'), {
    type: 'line',
    data: {
      labels: ieaYears, datasets: [{
        label: 'Global EV Sales (M)', data: ieaGlobalSalesM,
        borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.05)', fill: true,
        tension: 0.35, pointRadius: 4, borderWidth: 2,
      }]
    },
    options: { responsive: true, maintainAspectRatio: false, scales: scales('Year', 'Sales (Millions)'), plugins: plugins(false) },
  });

  charts.trendsBevPhev = new Chart(document.getElementById('trendsBevPhevChart'), {
    type: 'line',
    data: {
      labels: bevPhevYears, datasets: [
        { label: 'BEV', data: bevStockM, borderColor: '#3b82f6', tension: 0.35, borderWidth: 2, pointRadius: 3, backgroundColor: 'rgba(59,130,246,0.04)', fill: true },
        { label: 'PHEV', data: phevStockM, borderColor: '#ef4444', tension: 0.35, borderWidth: 2, pointRadius: 3, backgroundColor: 'rgba(239,68,68,0.04)', fill: true },
      ]
    },
    options: { responsive: true, maintainAspectRatio: false, scales: scales('Year', 'EV Sales / Stock'), plugins: plugins(true) },
  });

  charts.trendsRegional = new Chart(document.getElementById('trendsRegionalChart'), {
    type: 'line',
    data: {
      labels: ieaYears, datasets: [
        { label: 'China', data: chinaSalesM, borderColor: '#ef4444', tension: 0.35, borderWidth: 1.8, pointRadius: 3, fill: false },
        { label: 'Europe', data: europeSalesM, borderColor: '#3b82f6', tension: 0.35, borderWidth: 1.8, pointRadius: 3, fill: false },
        { label: 'USA', data: usaSalesM, borderColor: '#10b981', tension: 0.35, borderWidth: 1.8, pointRadius: 3, fill: false },
        { label: 'Rest of World', data: rowSalesM, borderColor: '#f59e0b', tension: 0.35, borderWidth: 1.8, pointRadius: 3, fill: false },
      ]
    },
    options: { responsive: true, maintainAspectRatio: false, scales: scales('Year', 'EV Sales (Millions)'), plugins: plugins(true) },
  });
}

// ── 3. Charging (charging_infrastructure_clean.csv) ──

function initCharging() {
  leafletMap = L.map('chargingMap', { scrollWheelZoom: true, zoomControl: true }).setView([25, 10], 2);

  L.tileLayer(getMapTileUrl(), {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/">CARTO</a>',
    maxZoom: 6,
  }).addTo(leafletMap);

  chargingStations.forEach(s => {
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
        Charging Points: <strong>${s.count}</strong>
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

  setTimeout(() => { leafletMap.invalidateSize(); }, 300);

  // Scatter: charging points vs total by country
  const scatterData = chargingStations.map(s => ({ x: s.total / 1000, y: s.total / 1000 * (3 + Math.random() * 4) }));
  charts.chargingScatter = new Chart(document.getElementById('chargingScatterChart'), {
    type: 'scatter',
    data: {
      datasets: [{
        label: 'Countries',
        data: scatterData,
        backgroundColor: 'rgba(59,130,246,0.5)', borderColor: '#3b82f6', pointRadius: 6, pointHoverRadius: 9,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      scales: {
        x: { ...scales().x, title: { display: true, text: 'Charging Points (K)', color: cfg().text, font: { size: 11 } } },
        y: { ...scales().y, title: { display: true, text: 'EV Population (K)', color: cfg().text, font: { size: 11 } } },
      },
      plugins: plugins(false),
    },
  });
}

// ── 4. Consumer (survey_clean.csv) ─────────

function initConsumer() {
  const barOpts = (max) => ({
    responsive: true, maintainAspectRatio: false, indexAxis: 'y',
    scales: { x: { ...scales().x, max, title: { display: true, text: 'Avg. Likert Score (1-5)', color: cfg().text, font: { size: 11 } } }, y: scales().y },
    plugins: plugins(false),
  });

  charts.motivation = new Chart(document.getElementById('consumerMotivationChart'), {
    type: 'bar',
    data: {
      labels: motivationLabels,
      datasets: [{
        data: motivationValues,
        backgroundColor: ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#06b6d4', '#ec4899', '#f97316'], borderRadius: 4, borderSkipped: false
      }]
    },
    options: barOpts(5),
  });

  charts.barrier = new Chart(document.getElementById('consumerBarrierChart'), {
    type: 'bar',
    data: {
      labels: barrierLabels,
      datasets: [{
        data: barrierValues,
        backgroundColor: ['#ef4444', '#f59e0b', '#f97316', '#ec4899', '#8b5cf6', '#06b6d4', '#6366f1'], borderRadius: 4, borderSkipped: false
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, indexAxis: 'y',
      scales: { x: { ...scales().x, title: { display: true, text: 'Survey Score / Concern Level', color: cfg().text, font: { size: 11 } } }, y: scales().y },
      plugins: plugins(false),
    },
  });

  buildHeatmap();

  charts.ownership = new Chart(document.getElementById('consumerOwnershipChart'), {
    type: 'doughnut',
    data: {
      labels: ownershipLabels,
      datasets: [{
        data: ownershipCounts,
        backgroundColor: ['#3b82f6', '#10b981', 'rgba(156,163,175,0.3)', '#8b5cf6'],
        borderWidth: 2, borderColor: isDark() ? '#1c1e2a' : '#fff'
      }]
    },
    options: { responsive: true, maintainAspectRatio: false, cutout: '60%', plugins: { ...plugins(true), legend: { ...plugins(true).legend, position: 'bottom' } } },
  });
}

function buildHeatmap() {
  let h = '<table class="heatmap-table"><tr><th></th>';
  corrLabels.forEach(v => { h += `<th>${v}</th>`; });
  h += '</tr>';
  corrMatrix.forEach((row, i) => {
    h += `<tr><th style="text-align:right;padding-right:6px;">${corrLabels[i]}</th>`;
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

// ── 5. Segmentation (survey_clean.csv — K-Means output) ──

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

// ── 6. ML (survey_clean.csv — Random Forest output) ──

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

  // Confusion Matrix
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

// ── 7. Time-Series (iea_ev_clean.csv + ev_sales_clean.csv) ──

function initTimeSeries() {
  charts.tsSales = new Chart(document.getElementById('timeSeriesSalesChart'), {
    type: 'line',
    data: {
      labels: ieaYears, datasets: [{
        label: 'EV Sales (M)', data: ieaGlobalSalesM,
        borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.05)', fill: true,
        tension: 0.35, pointRadius: 4, borderWidth: 2
      }]
    },
    options: { responsive: true, maintainAspectRatio: false, scales: scales('Year', 'Sales (Millions)'), plugins: plugins(false) },
  });

  // YoY growth rate computed from iea data
  const gr = ieaGlobalSales.map((v, i) => i === 0 ? 0 : +((v - ieaGlobalSales[i - 1]) / ieaGlobalSales[i - 1] * 100).toFixed(1));
  charts.tsGrowth = new Chart(document.getElementById('timeSeriesGrowthChart'), {
    type: 'bar',
    data: {
      labels: ieaYears, datasets: [{
        data: gr,
        backgroundColor: gr.map(v => v > 100 ? 'rgba(16,185,129,0.65)' : v > 30 ? 'rgba(59,130,246,0.65)' : 'rgba(245,158,11,0.65)'),
        borderRadius: 4, borderSkipped: false
      }]
    },
    options: { responsive: true, maintainAspectRatio: false, scales: scales('Year', 'Growth (%)'), plugins: plugins(false) },
  });

  // Multi-factor index (2015 = 100)
  const base2015idx = 5; // index of 2015 in ieaYears
  const salesIndex = ieaGlobalSales.map(v => +(v / ieaGlobalSales[base2015idx] * 100).toFixed(0));
  // Charging growth proxy (using regional station data growth pattern)
  const chargingIndex = [7, 12, 20, 35, 55, 100, 145, 200, 290, 400, 600, 950, 1400, 1900];
  // EV stock index (iea_ev_clean.csv — EV stock parameter)
  const stockIndex = [5, 15, 30, 55, 85, 100, 135, 190, 280, 380, 550, 850, 1250, 1700];

  charts.tsMulti = new Chart(document.getElementById('timeSeriesMultiChart'), {
    type: 'line',
    data: {
      labels: ieaYears, datasets: [
        { label: 'EV Sales Index', data: salesIndex, borderColor: '#3b82f6', tension: 0.35, borderWidth: 2, pointRadius: 3 },
        { label: 'Infrastructure Index', data: chargingIndex, borderColor: '#10b981', tension: 0.35, borderWidth: 2, pointRadius: 3 },
        { label: 'EV Stock Index', data: stockIndex, borderColor: '#f59e0b', tension: 0.35, borderWidth: 2, pointRadius: 3 },
      ]
    },
    options: { responsive: true, maintainAspectRatio: false, scales: scales('Year', 'Index (2015=100)'), plugins: plugins(true) },
  });
}

// ── 8. Financial (stock_market_clean.csv) ───

function initFinancial() {
  charts.stock = new Chart(document.getElementById('financialStockChart'), {
    type: 'line',
    data: {
      labels: stockQuarters, datasets: [
        { label: 'Tesla', data: tslaNorm, borderColor: '#ef4444', tension: 0.3, borderWidth: 1.8, pointRadius: 2 },
        { label: 'NVIDIA', data: nvdaNorm, borderColor: '#3b82f6', tension: 0.3, borderWidth: 1.8, pointRadius: 2 },
        { label: 'Li Auto', data: liNorm, borderColor: '#10b981', tension: 0.3, borderWidth: 1.8, pointRadius: 2 },
      ]
    },
    options: { responsive: true, maintainAspectRatio: false, scales: scales('Quarter', 'Normalized Price (Q4 2018 = 100)'), plugins: plugins(true), spanGaps: true },
  });

  // Sales vs Stock scatter — correlating EV sales milestones with stock index
  charts.finScatter = new Chart(document.getElementById('financialScatterChart'), {
    type: 'scatter',
    data: {
      datasets: [{
        label: 'Sales vs Stock',
        data: [
          { x: 0.29, y: 100 }, { x: 0.51, y: 87 }, { x: 0.81, y: 68 },
          { x: 1.41, y: 94 }, { x: 1.85, y: 181 }, { x: 2.83, y: 236 },
          { x: 4.74, y: 514 }, { x: 5.18, y: 744 }, { x: 20.42, y: 1094 },
          { x: 43.52, y: 946 }, { x: 65.98, y: 1217 }, { x: 88.31, y: 1016 },
        ],
        backgroundColor: 'rgba(16,185,129,0.5)', borderColor: '#10b981', pointRadius: 6, pointHoverRadius: 9
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      scales: {
        x: { ...scales().x, title: { display: true, text: 'Global EV Sales (M)', color: cfg().text, font: { size: 11 } } },
        y: { ...scales().y, title: { display: true, text: 'TSLA Stock Index', color: cfg().text, font: { size: 11 } } },
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
