# Law of Supremacism-Egalitarianism Global Tracking System

## Project Overview

This project implements the Supremacist Governance Methodology (SGM) to quantify, visualize, and analyze governance structures worldwide. Based on the Fundamental Laws of Supremacism and Egalitarianism, this system measures how governance ranges from egalitarian to supremacist, both domestically and internationally.

The project consists of two main components:
1. A FastAPI backend that processes GDELT data and calculates SGM scores
2. A React frontend that visualizes this data on an interactive global map

## Project Structure

```
project/
├── api/                      # FastAPI backend
│   ├── app/                  # Application code
│   │   ├── api_routes/       # API endpoints
│   │   ├── api_services/     # Service layer
│   │   └── main.py           # FastAPI application entry point
│   ├── core/                 # Core functionality
│   │   ├── sgm_data_service.py  # SGM implementation
│   │   ├── bigquery_client.py   # GDELT BigQuery client
│   │   └── nlp_pipeline.py      # NLP processing for GDELT data
│   ├── database/             # Database operations
│   ├── data/                 # Sample data for testing
│   └── requirements.txt      # Python dependencies
│
└── frontend/                 # React frontend
    ├── src/                  # Source code
    │   ├── components/       # React components
    │   │   └── LeafletHeatMap.jsx  # Map visualization
    │   ├── lib/              # Utility functions
    │   │   └── gdeltApi.ts   # API client
    │   └── pages/            # Page components
    │       └── WorldMap.tsx  # Main map page
    ├── public/               # Static assets
    └── package.json          # JavaScript dependencies
```

## Setup Instructions

### Backend Setup

1. Create a Python virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install the required packages:
   ```
   pip install -r requirements.txt
   ```

3. Create a data directory for sample data:
   ```
   mkdir -p data
   ```

4. Copy the sample_countries.json file to the data directory:
   ```
   cp sample_countries.json data/
   ```

5. Start the FastAPI server:
   ```
   uvicorn app.main:app --reload --port 4041
   ```

### Frontend Setup

1. Install the necessary npm packages:
   ```
   npm install
   ```

2. Create a `.env` file with the API URL:
   ```
   echo "VITE_API_URL=http://localhost:4041" > .env
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Open your browser and navigate to http://localhost:3000/worldmap

## Key Features

- **Interactive World Map**: Visualizes the global distribution of supremacist and egalitarian governance using a heatmap
- **Country Analysis**: Detailed breakdown of each country's SGM metrics
- **Dual Scoring**: Separate analysis of domestic (SRS-D) and international (SRS-I) supremacist tendencies
- **GDELT Integration**: Real-time data analysis from the GDELT Project
- **Stability and Transition Index (STI)**: Tracking governance transitions

## Data Flow

1. GDELT data is fetched and analyzed through the Python backend
2. The SGM methodology is applied to calculate country scores
3. This data is exposed through RESTful API endpoints
4. The React frontend fetches and visualizes this data
5. Users can trigger new analyses, view detailed country reports, and download the data

## Methodology Implementation

The SGM implementation follows the methodology outlined in "Section 10: Methodology for Identifying and Assessing Supremacism and Egalitarianism," particularly:

- **Supremacism Spectrum**: Categorizing governance from overtly supremacist to egalitarian
- **Dual Risk Scores**: Distinguishing domestic from international supremacist patterns
- **GSCS/SGM Integration**: Combining domestic and international scores into a single metric
- **Stability Tracking**: Measuring governance trends over time

## Development Notes

- For local development, the API can be accessed at http://localhost:4041/docs
- Sample data is used when the GDELT API is unavailable
- The map uses Leaflet with a heatmap layer for visualization
- For production deployment, update the CORS settings in main.py

## Credits

This project implements the theoretical framework of the Fundamental Laws of Supremacism and Egalitarianism, applying these concepts to real-world data analysis.