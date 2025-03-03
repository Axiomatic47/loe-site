/**
 * GDELT API Client for Supremacism Analysis
 *
 * This module provides functions to interact with your Python-based GDELT API backend
 * based on your existing FastAPI structure running on port 4041.
 */

// Base API URL - pointing to your FastAPI backend on port 4041
const API_BASE_URL = 'http://localhost:4041';

/**
 * Fetches country supremacism data from the GDELT analysis API
 * @returns {Promise<Array>} Array of country data with SGM scores
 */
export const fetchSupremacismData = async () => {
  try {
    // Call the SGM countries endpoint to get supremacism data
    const response = await fetch(`${API_BASE_URL}/sgm/countries`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Transform data to ensure it has the required properties for the heatmap
    return data.map(country => ({
      ...country,
      // Ensure SGM is set (using gscs as fallback if needed)
      sgm: country.sgm || country.gscs || 0,
      // Ensure coordinates are numbers
      latitude: parseFloat(country.latitude) || 0,
      longitude: parseFloat(country.longitude) || 0
    }));
  } catch (error) {
    console.error('Error fetching supremacism data:', error);
    throw error;
  }
};

/**
 * Fetches detailed GDELT analysis for a specific country
 * @param {string} countryCode - The ISO country code
 * @returns {Promise<Object>} Detailed country analysis data
 */
export const fetchCountryAnalysis = async (countryCode) => {
  try {
    const response = await fetch(`${API_BASE_URL}/sgm/countries/${countryCode}`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching analysis for country ${countryCode}:`, error);
    throw error;
  }
};

/**
 * Triggers a new SGM analysis run based on latest GDELT data
 * @returns {Promise<Object>} Status of the analysis job
 */
export const runGdeltAnalysis = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/sgm/run-analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error triggering GDELT analysis:', error);
    throw error;
  }
};

/**
 * Fetches regional supremacism summary data
 * @returns {Promise<Object>} Regional summary data
 */
export const fetchRegionalSummary = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/sgm/regions`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching regional summary:', error);
    throw error;
  }
};

/**
 * Fetches GDELT event counts and analysis for visualization
 * @returns {Promise<Object>} Event data for visualization
 */
export const fetchEventData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/gdelt/events`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching GDELT event data:', error);
    throw error;
  }
};

/**
 * Fetches NLP analysis results from your Python backend
 * @returns {Promise<Object>} NLP analysis results
 */
export const fetchNlpAnalysis = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/nlp/results`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching NLP analysis:', error);
    throw error;
  }
};

/**
 * Check the status of a running GDELT analysis job
 * @param {string} jobId - The ID of the analysis job
 * @returns {Promise<Object>} Status of the analysis job
 */
export const checkAnalysisStatus = async (jobId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/sgm/analysis-status/${jobId}`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error checking analysis status for job ${jobId}:`, error);
    throw error;
  }
};