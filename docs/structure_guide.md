# 📁 Project Folder Structure Guide
Business Analytics – EV Adoption Project

This document explains the purpose of each folder and defines where team members
should create their working files.

---

## 🔹 Root Directory

Contains:
- README.md → Project overview

No analysis files should be created in the root directory.

---

## 🔹 data/

### data/raw/
- Store original, untouched datasets.
- Never modify files in this folder.
- Only Data Engineer uploads files here.

### data/processed/
- Store cleaned and transformed datasets.
- These are the datasets used in notebooks.
- All analysis must use files from this folder.

### data/external/
- External or temporary data (e.g., stock data, survey exports).

---

## 🔹 notebooks/

All Jupyter notebooks must be created here.

Naming format:

e.g: data_preprocessing.ipynb 

Rules:
- Notebooks must run top to bottom.
- Clear markdown explanations required after each analysis.

---

## 🔹 results/

Contains exported outputs only.

### results/figures/
- Final charts for report and presentation.

### results/tables/
- Summary tables and CSV exports.

### results/dashboards/
- Any dashboard files (if created).

---

## 🔹 docs/

Contains documentation files:
- PROJECT_PLAN.md → Execution plan
- STRUCTURE_GUIDE.md → Folder instructions
- Proposal
- Business insights
- Final report

---

## 🔹 survey/

Contains:
- Survey questionnaire
- Cleaned survey responses

---

## 🔹 presentations/

Contains:
- Final presentation slides (if required)

---

# 🔒 Important Rules

1. Never edit files in data/raw/.
2. Always use data from data/processed/.
3. Each member works in their own Git branch.
4. Commit messages must be meaningful.
5. All notebooks must be reproducible.

---
