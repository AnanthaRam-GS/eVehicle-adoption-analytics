# EV Market Dynamics: Analyzing Consumer Trends and Financial Signals

> **Business Analytics Capstone — Semester 6**
> Department of Computer Science, Amrita Vishwa Vidyapeetham

This project analyzes **global electric vehicle (EV) adoption, market performance, charging infrastructure readiness, and financial market signals**. It combines seven secondary datasets from reliable public sources with primary survey data (325 responses) to derive actionable business insights for manufacturers, governments, investors, and infrastructure companies.

---

## Key Results

### ML Model — Random Forest Classification

| Metric    | Score  |
|-----------|--------|
| Accuracy  | 87.2%  |
| Precision | 85.6%  |
| Recall    | 88.1%  |
| F1 Score  | 86.8%  |

**Top adoption drivers (by Gini importance):**

| Rank | Feature                    | Importance |
|------|----------------------------|------------|
| 1    | Charging Infrastructure    | 0.182      |
| 2    | Government Incentives      | 0.156      |
| 3    | Cost Savings               | 0.142      |
| 4    | Income Level               | 0.118      |
| 5    | Environmental Awareness    | 0.098      |
| 6    | Technology Interest        | 0.085      |

The top 3 features alone account for **48%** of the model's predictive power.

### Consumer Segmentation (K-Means, k=4)

| Cluster | Label                    | Key Traits                                                  |
|---------|--------------------------|-------------------------------------------------------------|
| 1       | EV Enthusiasts           | High motivation, low barriers; tech-savvy early adopters    |
| 2       | Price-Sensitive Buyers   | Moderate motivation, high cost concerns                     |
| 3       | Infrastructure-Constrained | High motivation, concerned about charging availability    |
| 4       | Traditional Users        | Low motivation, high barriers; prefer conventional vehicles |

- **Motivation Score (avg):** 3.72 / 5
- **Barrier Score (avg):** 3.04 / 5
- **EV Readiness Score:** 0.68

### Market & Financial Signals

| Metric                               | Value     |
|---------------------------------------|-----------|
| Global EV Sales (2024)               | ~17.4M    |
| Year-over-Year Growth                | 35.4%     |
| Global Charging Stations             | ~2.7M     |
| Vehicle-to-Charger Ratio             | 6.2 : 1   |
| EV Sales ↔ Stock Correlation (r)    | +0.78     |
| BEV Share of New EV Sales            | >70%      |

### Time-Series Insights

- The EV market entered a decisive **acceleration phase post-2020**, transitioning from early adoption to mass-market growth.
- Growth rates peaked at over **100% YoY in 2021** before normalizing to 35–40%.
- Infrastructure expansion consistently **precedes** adoption surges by 6–12 months.

---

## Datasets

### Raw Data (`data/raw/`)

| File | Description | Size |
|------|-------------|------|
| `consumer_dataset_raw.csv` | Consumer preferences, awareness, demographics (Opendatabay) | 10.6 MB |
| `iea_global_ev_raw.csv` | IEA Global EV Data Explorer — country-level adoption stats | 855 KB |
| `global_ev_growth.xlsx` | Global EV sales trends 2010–2024 | 914 KB |
| `us_ev_population_raw.csv` | U.S. EV registrations by model, year, region (data.gov) | 63.7 MB |
| `openchargemap_global_raw.csv` | Charging station locations worldwide (Open Charge Map) | 23.5 MB |
| `stock_details_raw.csv` | EV manufacturer stock price data | 62.5 MB |
| `survey_details.csv` | Primary survey responses (Google Forms, 325 respondents) | 39 KB |

### Processed Data (`data/processed/`)

| File | Description |
|------|-------------|
| `ev_sales_clean.csv` | Cleaned global EV sales data |
| `iea_ev_clean.csv` | Cleaned IEA country-level EV data |
| `ev_population_clean.csv` | Cleaned U.S. EV population data |
| `charging_infrastructure_clean.csv` | Cleaned charging station data |
| `stock_market_clean.csv` | Cleaned EV company stock data |
| `survey_clean.csv` | Cleaned and augmented survey data |

### Primary Survey

A public survey titled **"Global Electric Vehicle (EV) Adoption & Market Behaviour Survey"** was conducted via Google Forms to collect primary data on:
- EV awareness and adoption intent
- Perceived benefits and barriers
- Resale confidence and infrastructure perception
- Market and investment outlook

325 responses were collected and augmented using **bootstrap sampling** for statistical robustness.

---

## Repository Structure

```
eVehicle-adoption-analytics/
├── dashboard/                  # Interactive BI Dashboard (HTML/CSS/JS)
│   ├── index.html              # Single-page application with 10 sections
│   ├── styles.css              # Design system (dark/light themes)
│   └── app.js                  # Chart.js visualizations + Leaflet.js map
│
├── data/
│   ├── raw/                    # Original unprocessed datasets
│   └── processed/              # Cleaned datasets ready for analysis
│
├── notebooks/                  # Jupyter notebooks for analysis
│   ├── data_preprocessing.ipynb
│   ├── eda.ipynb               # Exploratory Data Analysis
│   ├── consumer_segmentation.ipynb  # K-Means clustering + Random Forest
│   ├── time_series.ipynb       # Market growth & forecasting
│   ├── openchargemap.ipynb     # Charging infrastructure analysis
│   └── global_openchargemap.ipynb
│
├── results/
│   ├── tables/                 # 132 EDA output tables
│   └── dashboards/             # Tableau workbooks (.twbx)
│       ├── consumer_segmentation.twbx
│       └── time_series.twbx
│
├── docs/                       # Project documentation
│   ├── data_dictionary.md
│   ├── data_preprocessing_summary.md
│   ├── project_execution_plan.md
│   ├── report_structure.md
│   └── structure_guide.md
│
├── survey/                     # Survey design and raw responses
└── presentations/              # Project presentation materials
```

---

## Methodology

The project follows a structured **Business Analytics workflow**:

1. **Data Collection & Preprocessing** — Ingested 7 datasets, handled missing values, standardized formats, performed feature engineering
2. **Exploratory Data Analysis (EDA)** — Statistical profiling, distribution analysis, correlation studies across all datasets
3. **Consumer Segmentation** — K-Means clustering (k=4) to identify distinct consumer segments based on motivation and barrier scores
4. **Driver Analysis (ML)** — Random Forest classification (100 estimators, max depth=12) to identify key adoption predictors; 5-fold cross-validation (σ=0.015)
5. **Time-Series Analysis** — Longitudinal EV market growth trends and forecasting
6. **Financial Market Analysis** — Correlation between EV adoption metrics and manufacturer stock performance
7. **Business Interpretation** — Stakeholder-specific recommendations for manufacturers, governments, investors, and infrastructure companies

### Tools & Technologies

| Category | Technologies |
|----------|-------------|
| Analysis | Python, Pandas, NumPy, Scikit-learn, Matplotlib, Seaborn |
| Notebooks | Jupyter Notebook |
| Dashboards | Tableau, Chart.js, Leaflet.js |
| Dashboard Frontend | HTML5, CSS3, JavaScript |
| Survey | Google Forms |

---

## Interactive Dashboard

The project includes a **web-based BI dashboard** at `dashboard/index.html` with:
- 10 navigable sections (Overview, Global Trends, Charging, Consumer, Segmentation, ML Model, Time-Series, Financial, Business Insights, About)
- Interactive charts powered by **Chart.js**
- Interactive world map powered by **Leaflet.js** with CartoDB tiles
- Dark/Light theme toggle
- No server required — open directly in a browser

---

## Business Recommendations

| Stakeholder | Key Recommendation |
|-------------|-------------------|
| **Manufacturers** | Develop affordable BEVs in the $25K–$35K range; target price-sensitive (Cluster 2) and infrastructure-constrained (Cluster 3) segments |
| **Governments** | Extend purchase subsidies and tax credits; mandate EV-ready building codes; invest in rural charging infrastructure |
| **Investors** | Diversify into battery supply chain, charging networks, and EV software platforms; use infrastructure deployment as a leading indicator |
| **Infrastructure** | Prioritize highway corridor fast-charging (150kW+); partner with retail/hospitality for destination charging; invest in V2G capabilities |

---

## Team

| Name | Role |
|------|------|
| Anantha Ram G S | Data Engineer |
| Ravindran G | Data Analyst |
| Kalyani H K | Project Manager |
| Akshay R | ML Engineer |
| Nitin R S | Business Analyst |

**Mentor:** Department of Computer Science, Amrita Vishwa Vidyapeetham

---

## References

- **IEA Global EV Data Explorer** — [iea.org/data-and-statistics/data-tools/global-ev-data-explorer](https://www.iea.org/data-and-statistics/data-tools/global-ev-data-explorer)
- **U.S. Electric Vehicle Population Data** — [data.gov](https://catalog.data.gov/dataset/electric-vehicle-population-data)
- **Open Charge Map** — [openchargemap.org](https://openchargemap.org/)
- **Opendatabay** — Consumer EV Adoption & Market Datasets
- **Mendeley Data** — EV Adoption Survey Dataset
- **Global EV Sales Dataset (2010–2024)**

Additional academic literature and industry reports on EV adoption, infrastructure, market dynamics, and financial performance are referenced in the project proposal document (`docs/`).