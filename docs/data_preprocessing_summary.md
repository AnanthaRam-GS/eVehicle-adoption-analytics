# Data Preprocessing Documentation

**Project:** Business Analytics of Electric Vehicle Markets\
**Stage:** Data Cleaning, Feature Engineering & Survey Augmentation

------------------------------------------------------------------------

# 1. Overview

This document summarizes the preprocessing steps applied to all datasets
used in the project. The goal of preprocessing was to ensure that the
datasets are **clean, structured, and ready for analytical modeling and
visualization**.

The preprocessing stage included:

-   Data cleaning
-   Column standardization
-   Feature extraction
-   Aggregation
-   Handling missing values
-   Feature engineering
-   Survey dataset augmentation

All cleaned datasets are stored in:

    data/processed/

------------------------------------------------------------------------

# 2. Datasets Used

  -----------------------------------------------------------------------
  Dataset                 Source                  Purpose
  ----------------------- ----------------------- -----------------------
  Consumer Behavior       Opendatabay             Consumer purchase
  Dataset                                         behavior insights

  EV Population Dataset   Data.gov                Electric vehicle
                                                  registration analysis

  Global EV Market        IEA Global EV Explorer  EV adoption trends
  Dataset                                         

  Global EV Sales Dataset Kaggle                  Time-series EV market
                                                  growth

  EV Survey Dataset       Google Form Survey      Consumer perception and
                                                  adoption behavior

  Charging Infrastructure OpenChargeMap API       EV charging
  Dataset                                         infrastructure
                                                  availability

  Stock Market Dataset    Financial dataset       Market signals and
                                                  EV-related stock trends
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 3. Data Preprocessing Pipeline

The preprocessing pipeline consisted of the following stages:

    Raw Data
       ↓
    Column Standardization
       ↓
    Filtering Relevant Features
       ↓
    Handling Missing Values
       ↓
    Feature Engineering
       ↓
    Aggregation
       ↓
    Survey Encoding
       ↓
    Data Augmentation
       ↓
    Processed Dataset

------------------------------------------------------------------------

# 4. IEA Global EV Dataset Processing

### Source

International Energy Agency -- Global EV Data Explorer

### Raw Features

    region
    category
    parameter
    mode
    powertrain
    year
    unit
    value

### Cleaning Steps

1.  Converted column names to lowercase.
2.  Filtered relevant parameters:
    -   EV sales
    -   EV stock
    -   EV charging points
3.  Selected only **car segment data**.
4.  Removed unnecessary metadata columns.
5.  Retained analytical columns:

```{=html}
<!-- -->
```
    region
    parameter
    powertrain
    year
    value

### Output File

    data/processed/iea_ev_clean.csv

------------------------------------------------------------------------

# 5. EV Population Dataset Processing

### Source

U.S. Government Open Data Portal

### Raw Columns Included

-   VIN
-   county
-   city
-   state
-   model year
-   make
-   model
-   electric vehicle type
-   electric range

### Processing Steps

1.  Converted column names to lowercase.
2.  Removed location-specific identifiers not required for analysis.
3.  Aggregated vehicle data by:

```{=html}
<!-- -->
```
    model_year
    make
    model
    electric_vehicle_type

4.  Created aggregated variable:

```{=html}
<!-- -->
```
    vehicle_count

### Output File

    data/processed/ev_population_clean.csv

------------------------------------------------------------------------

# 6. Charging Infrastructure Dataset Processing

### Source

OpenChargeMap API

### Selected Analytical Features

    country
    latitude
    longitude
    charging_points

### Processing Steps

1.  Extracted country and geographic coordinates.
2.  Removed administrative metadata.
3.  Standardized column names.
4.  Checked missing values.

### Output File

    data/processed/charging_infrastructure_clean.csv

------------------------------------------------------------------------

# 7. Survey Dataset Processing

### Source

Public EV Adoption Survey (Google Forms)

Total Responses:

    119 respondents

### Cleaning Steps

1.  Converted column names to snake_case.
2.  Standardized categorical responses.
3.  Encoded Yes/No responses to numerical values.
4.  Converted Likert scale responses (1--5) to numeric values.

### Feature Engineering

#### EV Motivation Score

Calculated from factors such as:

-   Lower running cost
-   Environmental benefits
-   Government incentives
-   Rising fuel prices
-   Advanced technology
-   Brand reputation
-   Charging convenience

Formula:

    EV Motivation Score = Average of motivation factors

------------------------------------------------------------------------

#### EV Barrier Score

Calculated from perceived adoption barriers:

-   EV cost
-   Charging infrastructure availability
-   Battery replacement cost
-   Driving range limitations
-   Charging time
-   Resale value uncertainty
-   Service center availability

Formula:

    EV Barrier Score = Average of barrier factors

------------------------------------------------------------------------

#### EV Readiness Score

Consumer readiness to adopt EVs was estimated as:

    EV Readiness Score =
    EV Motivation Score − EV Barrier Score

This metric represents the **overall likelihood of EV adoption** among
respondents.

------------------------------------------------------------------------

# 9. Final Processed Datasets

  File                                Description
  ----------------------------------- -------------------------------
  iea_ev_clean.csv                    Global EV adoption trends
  ev_population_clean.csv             EV population distribution
  charging_infrastructure_clean.csv   Charging station availability
  survey_clean.csv                    Clean survey responses

------------------------------------------------------------------------

# 10. Data Ready for Analysis

After preprocessing, the datasets are ready for:

-   Exploratory Data Analysis (EDA)
-   Market trend visualization
-   Consumer behavior analysis
-   EV adoption prediction models
-   Market segmentation analysis

------------------------------------------------------------------------

# 11. Next Stage of the Project

The next phase includes:

    Exploratory Data Analysis
    Consumer Segmentation
    EV Adoption Prediction Modeling
    Market Insights Visualization
