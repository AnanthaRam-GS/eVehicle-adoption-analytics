# Data Dictionary

**Project:** Business Analytics of Electric Vehicle Markets\
**Purpose:** Documentation of all processed dataset variables used for
analysis and modeling.

------------------------------------------------------------------------

# 1. IEA Global EV Dataset

**File:** `data/processed/iea_ev_clean.csv`

This dataset represents global EV adoption metrics across regions and
years.

  Column       Description                                    Example
  ------------ ---------------------------------------------- -----------
  region       Geographic region or country for EV data       Australia
  parameter    Type of EV metric being measured               EV sales
  powertrain   Type of electric vehicle technology            BEV
  year         Year of the recorded data                      2022
  value        Numeric value corresponding to the parameter   340000

------------------------------------------------------------------------

# 2. EV Population Dataset

**File:** `data/processed/ev_population_clean.csv`

Aggregated EV registration data grouped by vehicle characteristics.

  -----------------------------------------------------------------------
  Column                  Description             Example
  ----------------------- ----------------------- -----------------------
  model_year              Manufacturing year of   2021
                          the EV                  

  make                    Vehicle manufacturer    Tesla

  model                   Vehicle model name      Model 3

  electric_vehicle_type   Type of EV powertrain   Battery Electric
                                                  Vehicle

  vehicle_count           Number of registered    420
                          vehicles with these     
                          attributes              
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 3. Charging Infrastructure Dataset

**File:** `data/processed/charging_infrastructure_clean.csv`

Information about EV charging station locations and density.

  -----------------------------------------------------------------------
  Column                  Description             Example
  ----------------------- ----------------------- -----------------------
  country                 Country where the       India
                          charging station is     
                          located                 

  latitude                Geographic latitude     12.9716
                          coordinate              

  longitude               Geographic longitude    77.5946
                          coordinate              

  charging_points         Number of charging      4
                          points available at the 
                          station                 
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 4. Survey Dataset (Cleaned)

**File:** `data/processed/survey_clean.csv`

This dataset contains responses from the EV adoption perception survey.

  -------------------------------------------------------------------------------------------
  Column                                      Description             Example
  ------------------------------------------- ----------------------- -----------------------
  country_of_residence                        Country of the survey   India
                                              respondent              

  area_type                                   Type of residential     Urban
                                              area                    

  age_group                                   Age category of         26--35
                                              respondent              

  annual_income_range                         Income bracket relative Above average national
                                              to national average     income

  occupation                                  Respondent occupation   Salaried employee
                                              category                

  do_you_currently_own_a_vehicle              Indicates if respondent Yes
                                              owns a vehicle          

  what_type_of_vehicle_do_you_currently_own   Current vehicle type    Petrol
                                              owned                   

  average_daily_driving_distance              Daily driving distance  20--50 km
                                              category                

  preferred_ev_price_range                    Price range respondent  Mid-range
                                              is willing to pay for   
                                              an EV                   
  -------------------------------------------------------------------------------------------

------------------------------------------------------------------------

# 5. Survey Motivation Factors

These variables represent factors that motivate consumers to adopt EVs.\
Values are recorded on a **Likert scale (1--5)**.

  Column                                 Description
  -------------------------------------- --------------------------------------------
  lower_running_cost                     Importance of reduced operating cost
  environmental_benefits                 Importance of environmental sustainability
  government_incentives\_\_\_subsidies   Impact of government subsidies
  rising_fuel_prices                     Influence of increasing fuel prices
  advanced_technology\_&\_features       Interest in advanced EV technology
  brand_reputation                       Influence of vehicle brand
  charging_convenience                   Importance of charging accessibility

------------------------------------------------------------------------

# 6. Survey Barrier Factors

These represent perceived challenges to EV adoption.

  -----------------------------------------------------------------------------
  Column                                    Description
  ----------------------------------------- -----------------------------------
  evs_are_too_expensive                     Perception that EV purchase price
                                            is high

  charging_infrastructure_is_insufficient   Lack of adequate charging stations

  battery_replacement_cost_is_high          Concerns about battery replacement
                                            cost

  driving_range_is_inadequate               Concerns about limited EV range

  charging_time_is_too_long                 Concerns about long charging time

  ev_resale_value_is_uncertain              Uncertainty in resale value

  limited_service_centers                   Lack of EV maintenance centers
  -----------------------------------------------------------------------------

------------------------------------------------------------------------

# 7. Derived Analytical Features

These variables were created during preprocessing to support analytics
and modeling.

  -----------------------------------------------------------------------
  Column                  Description             Formula
  ----------------------- ----------------------- -----------------------
  ev_motivation_score     Average of EV           Mean of motivation
                          motivation factors      variables

  ev_barrier_score        Average of EV adoption  Mean of barrier
                          barriers                variables

  ev_readiness_score      Consumer readiness to   Motivation Score −
                          adopt EV                Barrier Score
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 8. Survey Dataset

**File:** `data/processed/survey_clean.csv`

This dataset is an expanded version of the survey dataset created
through **bootstrap sampling** to improve statistical robustness.

  Attribute             Description
  --------------------- --------------------------------------------
  Original responses    119
  Augmented responses   325
  Method                Sampling with replacement + Gaussian noise