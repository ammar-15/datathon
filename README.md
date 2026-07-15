# LiverScope — Alcohol-Related Liver Risk Dashboard

LiverScope is a React + Vite application built for the 2026 Memorial University / Canadian Medical Datathon. It explores the BUPA liver disorders dataset and provides an educational liver risk calculator based on routine biomarkers and reported alcohol intake.

## What this project does

- Presents a Supabase-backed dashboard for the BUPA liver dataset
- Displays descriptive statistics, distribution histograms, and regression views
- Includes a liver risk calculator that estimates an alcohol-related risk score from:
  - age
  - drinks per day
  - ALP, ALT, AST, and GGT lab values
- Uses an educational risk algorithm inspired by dataset feature importance and clinical liver enzyme criteria
- Includes Python scripts to import the dataset into Supabase and train baseline models on the same data

## Dataset background

This project uses the BUPA liver disorders dataset, which contains adult male patient records and the following variables:

- `drinks` — number of half-pint alcohol equivalents consumed per day
- `alkphos` / `ALP`
- `sgpt` / `ALT`
- `sgot` / `AST`
- `gammagt` / `GGT`
- `mcv`
- `selector` — classification target in the original dataset

The presentation referenced in the Datathon highlights:

- clinical indicators such as AST:ALT ratio and elevated GGT
- the risk of misinterpreting liver enzyme results without alcohol history
- the need for an educational assessment tool rather than a formal diagnosis
- dataset limitations including sample size, male-only cohort, and missing chronic disease information

## Application features

### Dashboard

- dataset record table with sorting and paging
- summary cards for row count, average drinks, average GGT, average ALT, and highest GGT
- statistics table for descriptive analytics
- non-drinker statistics tab
- drinks regression tab
- variable distribution histograms

### Liver risk calculator

- inputs for age, drinks/day, ALP, ALT, AST, and GGT
- validation of numeric inputs and age range (19–65)
- generated risk band: `Low`, `Moderate`, `High`, or `Very High`
- AST:ALT ratio and clinical context summary
- educational guardrails and local resource links

## Tech stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Supabase JavaScript client
- Recharts for charting
- Python for data import and model training
- Scikit-learn-based model training in `scripts/train_bupa_models.py`

## Notes and limitations

- This app is intended for educational and exploratory use only.
- The liver risk calculator is not a medical diagnostic tool.
- The dataset is limited in scope: mainly adult males, modest sample size, and no confirmed clinical outcomes.
- Clinical decision-making should always involve licensed healthcare professionals.

## Recommended next steps

- add actual outcome labels and supervised disease classification
- include broader demographic coverage beyond the original male-only dataset
- move the calculator logic to a backend service for better maintainability
- improve the model with additional clinical variables and larger external datasets
- add end-to-end tests for Supabase integration and form validation
