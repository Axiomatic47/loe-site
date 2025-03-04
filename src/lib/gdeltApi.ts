/**
 * Unified API Client for Supremacism Analysis
 *
 * This module provides functions to interact with the FastAPI backend
 * to fetch both GDELT and ACLED data for conflict visualization.
 */

// Base API URL - Use environment variables or fallback to development URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4041';

/**
 * Fetches country supremacism data from the GDELT analysis API
 * @returns {Promise<Array>} Array of country data with SGM scores
 */
export const fetchSupremacismData = async () => {
  try {
    console.log(`Fetching data from: ${API_BASE_URL}/sgm/countries`);

    // Call the SGM countries endpoint to get supremacism data
    const response = await fetch(`${API_BASE_URL}/sgm/countries`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`Successfully fetched ${data.length} country data points`);

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

    // In case of an error, fallback to sample data
    return getSampleData();
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

    // Fallback to sample data for the specific country
    const sampleData = getSampleData();
    return sampleData.find(country => country.code === countryCode) || null;
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

    // Return a simulated job response
    return {
      jobId: "sample-job-" + Date.now(),
      status: "started"
    };
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

    // Return sample regional data
    return getSampleRegionData();
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

    // Return a simulated status response with progress
    return {
      jobId: jobId,
      status: "in_progress",
      progress: Math.random(), // Random progress between 0 and 1
      message: "Processing GDELT data..."
    };
  }
};

/**
 * Fetches ACLED conflict event data
 * @returns {Promise<Array>} Array of conflict events
 */
export const fetchAcledEvents = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/acled/events`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`Successfully fetched ${data.events?.length || 0} ACLED events`);

    // Return the events array from the response
    return data.events || [];
  } catch (error) {
    console.error('Error fetching ACLED events:', error);
    return getSampleAcledEvents();
  }
};

/**
 * Triggers new ACLED data fetch from the API
 * @param {number} daysBack - Number of days of history to fetch
 * @param {number} limit - Maximum events to fetch
 * @returns {Promise<Object>} Status of the fetch job
 */
export const fetchAcledData = async (daysBack = 30, limit = 500) => {
  try {
    const response = await fetch(`${API_BASE_URL}/acled/fetch?days_back=${daysBack}&limit=${limit}`, {
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
    console.error('Error triggering ACLED fetch:', error);

    // Return a simulated job response
    return {
      jobId: "acled-job-" + Date.now(),
      status: "started"
    };
  }
};

/**
 * Check the status of an ACLED fetch job
 * @param {string} jobId - The ID of the fetch job
 * @returns {Promise<Object>} Status of the fetch job
 */
export const checkAcledFetchStatus = async (jobId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/acled/status/${jobId}`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error checking ACLED fetch status for job ${jobId}:`, error);

    // Return a simulated status response with progress
    return {
      jobId: jobId,
      status: "in_progress",
      progress: Math.random(), // Random progress between 0 and 1
      message: "Fetching ACLED data..."
    };
  }
};

/**
 * Fetches combined conflict event data from both GDELT and ACLED
 * @returns {Promise<Array>} Combined array of conflict events
 */
export const fetchCombinedConflictEvents = async () => {
  try {
    // Fetch both ACLED events and GDELT events in parallel
    const [acledEvents, gdeltEvents] = await Promise.all([
      fetchAcledEvents(),
      fetchGdeltEvents()
    ]);

    // Combine the results
    const combinedEvents = [...acledEvents, ...gdeltEvents];
    console.log(`Combined ${acledEvents.length} ACLED events with ${gdeltEvents.length} GDELT events`);

    return combinedEvents;
  } catch (error) {
    console.error('Error fetching combined conflict events:', error);

    // Return combined sample data if real fetch fails
    return [...getSampleAcledEvents(), ...getSampleGdeltEvents()];
  }
};

/**
 * Fetches GDELT event data for visualization
 * @returns {Promise<Array>} Array of GDELT conflict events
 */
export const fetchGdeltEvents = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/gdelt/events`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Transform GDELT events to the common event format if needed
    return data.map(event => ({
      ...event,
      // Ensure these fields exist
      data_source: 'GDELT',
      intensity: event.intensity ||
        // Calculate intensity if not provided
        (event.goldstein_scale
          ? Math.min(10, Math.max(0, 5 - event.goldstein_scale/2))
          : 5)
    }));
  } catch (error) {
    console.error('Error fetching GDELT events:', error);
    return getSampleGdeltEvents();
  }
};

/**
 * Get sample country data for development and testing when API is unavailable
 * @returns {Array} Sample country data with SGM scores
 */
function getSampleData() {
  return [
    {
      code: "US",
      country: "United States",
      srsD: 4.2,
      srsI: 6.7,
      gscs: 5.2,
      sgm: 5.2,
      latitude: 37.0902,
      longitude: -95.7129,
      sti: 45,
      category: "Soft Supremacism",
      description: "The United States exhibits soft supremacism patterns with institutional inequalities despite formal legal equality. Historical patterns persist in economic and social structures.",
      event_count: 42,
      avg_tone: -2.7,
      updated_at: new Date().toISOString()
    },
    {
      code: "CN",
      country: "China",
      srsD: 7.1,
      srsI: 6.8,
      gscs: 7.0,
      sgm: 7.0,
      latitude: 35.8617,
      longitude: 104.1954,
      sti: 75,
      category: "Structural Supremacism",
      description: "China demonstrates structural supremacism with notable inequalities at societal and governmental levels. Minority populations face systemic discrimination and there are expansionist tendencies in foreign policy.",
      event_count: 37,
      avg_tone: -3.5,
      updated_at: new Date().toISOString()
    },
    {
      code: "RU",
      country: "Russia",
      srsD: 6.9,
      srsI: 7.8,
      gscs: 7.3,
      sgm: 7.3,
      latitude: 61.5240,
      longitude: 105.3188,
      sti: 80,
      category: "Structural Supremacism",
      description: "Russia shows strong structural supremacism internally and aggressive patterns internationally. Power concentration creates significant disparities for non-dominant groups.",
      event_count: 53,
      avg_tone: -5.2,
      updated_at: new Date().toISOString()
    },
    {
      code: "SE",
      country: "Sweden",
      srsD: 1.8,
      srsI: 1.6,
      gscs: 1.7,
      sgm: 1.7,
      latitude: 60.1282,
      longitude: 18.6435,
      sti: 15,
      category: "Non-Supremacist Governance",
      description: "Sweden demonstrates strong egalitarian governance with robust institutions protecting equality. Social welfare systems minimize power disparities between groups.",
      event_count: 8,
      avg_tone: 3.1,
      updated_at: new Date().toISOString()
    },
    {
      code: "DE",
      country: "Germany",
      srsD: 2.9,
      srsI: 2.1,
      gscs: 2.5,
      sgm: 2.5,
      latitude: 51.1657,
      longitude: 10.4515,
      sti: 25,
      category: "Mixed Governance",
      description: "Germany shows mixed governance with strong democratic institutions and acknowledgment of historical supremacist patterns. Legal frameworks promote equality though challenges persist.",
      event_count: 15,
      avg_tone: 1.8,
      updated_at: new Date().toISOString()
    },
    {
      code: "IN",
      country: "India",
      srsD: 5.8,
      srsI: 4.2,
      gscs: 5.0,
      sgm: 5.0,
      latitude: 20.5937,
      longitude: 78.9629,
      sti: 60,
      category: "Soft Supremacism",
      description: "India exhibits soft supremacism with increasing tensions between religious and caste groups. Constitutional protections coexist with supremacist social structures.",
      event_count: 31,
      avg_tone: -1.9,
      updated_at: new Date().toISOString()
    },
    {
      code: "ZA",
      country: "South Africa",
      srsD: 5.1,
      srsI: 3.2,
      gscs: 4.1,
      sgm: 4.1,
      latitude: -30.5595,
      longitude: 22.9375,
      sti: 48,
      category: "Soft Supremacism",
      description: "South Africa shows signs of soft supremacism despite strong constitutional protections. Post-apartheid transition continues with economic disparities along historical lines.",
      event_count: 28,
      avg_tone: -1.2,
      updated_at: new Date().toISOString()
    },
    {
      code: "BR",
      country: "Brazil",
      srsD: 5.6,
      srsI: 3.8,
      gscs: 4.7,
      sgm: 4.7,
      latitude: -14.2350,
      longitude: -51.9253,
      sti: 55,
      category: "Soft Supremacism",
      description: "Brazil demonstrates soft supremacism with persistent racial and economic inequalities despite formal legal equality. Social mobility remains limited for marginalized groups.",
      event_count: 23,
      avg_tone: -1.6,
      updated_at: new Date().toISOString()
    },
    {
      code: "FR",
      country: "France",
      srsD: 3.7,
      srsI: 3.9,
      gscs: 3.8,
      sgm: 3.8,
      latitude: 46.2276,
      longitude: 2.2137,
      sti: 40,
      category: "Mixed Governance",
      description: "France shows mixed governance with strong republican values alongside challenges integrating minority communities. Colonial legacy impacts domestic and international relations.",
      event_count: 19,
      avg_tone: -0.8,
      updated_at: new Date().toISOString()
    }
  ];
}

/**
 * Get sample regional data when API is unavailable
 * @returns {Array} Sample regional data
 */
function getSampleRegionData() {
  return [
    {
      region: "North America",
      avg_sgm: 4.8,
      countries: 3,
      highest_country: "United States",
      highest_sgm: 5.2,
      lowest_country: "Canada",
      lowest_sgm: 2.8
    },
    {
      region: "Europe",
      avg_sgm: 3.2,
      countries: 5,
      highest_country: "Russia",
      highest_sgm: 7.3,
      lowest_country: "Sweden",
      lowest_sgm: 1.7
    },
    {
      region: "Asia",
      avg_sgm: 6.1,
      countries: 6,
      highest_country: "China",
      highest_sgm: 7.0,
      lowest_country: "Japan",
      lowest_sgm: 3.6
    },
    {
      region: "Africa",
      avg_sgm: 5.7,
      countries: 3,
      highest_country: "South Africa",
      highest_sgm: 5.9,
      lowest_country: "Kenya",
      lowest_sgm: 5.1
    },
    {
      region: "South America",
      avg_sgm: 4.5,
      countries: 4,
      highest_country: "Brazil",
      highest_sgm: 4.7,
      lowest_country: "Chile",
      lowest_sgm: 3.9
    }
  ];
}

/**
 * Get sample ACLED events for development and testing
 * @returns {Array} Sample ACLED events
 */
function getSampleAcledEvents() {
  return [
    {
      event_date: "2024-02-15",
      event_type: "Violence against civilians",
      actor1: "Group A",
      actor2: "Civilians",
      country: "Somalia",
      location: "Mogadishu",
      latitude: 2.0469,
      longitude: 46.199616,
      fatalities: 3,
      description: "Armed group attacked civilian population",
      intensity: 7,
      data_source: "ACLED"
    },
    {
      event_date: "2024-02-12",
      event_type: "Riots",
      actor1: "Protesters",
      country: "Ethiopia",
      location: "Addis Ababa",
      latitude: 9.145,
      longitude: 40.489673,
      fatalities: 0,
      description: "Peaceful protest turned violent after police intervention",
      intensity: 4,
      data_source: "ACLED"
    },
    {
      event_date: "2024-02-10",
      event_type: "Battle",
      actor1: "Rebel Group C",
      actor2: "Government Forces",
      country: "Sudan",
      location: "Khartoum",
      latitude: 15.500654,
      longitude: 32.559899,
      fatalities: 12,
      description: "Clash between rebels and government forces",
      intensity: 9,
      data_source: "ACLED"
    },
    {
      event_date: "2024-02-08",
      event_type: "Strategic development",
      actor1: "Government",
      country: "Kenya",
      location: "Nairobi",
      latitude: -1.292066,
      longitude: 36.821946,
      fatalities: 0,
      description: "Government established military checkpoints in disputed areas",
      intensity: 3,
      data_source: "ACLED"
    }
  ];
}

/**
 * Get sample GDELT events for development and testing
 * @returns {Array} Sample GDELT events
 */
function getSampleGdeltEvents() {
  return [
    {
      event_date: "2024-02-16",
      event_type: "14",
      actor1: "GOVERNMENT",
      actor2: "PROTESTERS",
      country: "Egypt",
      latitude: 26.820553,
      longitude: 30.802498,
      description: "Government forces responded to protests",
      intensity: 6,
      data_source: "GDELT"
    },
    {
      event_date: "2024-02-14",
      event_type: "18",
      actor1: "REBEL GROUP",
      actor2: "MILITARY",
      country: "Syria",
      latitude: 34.802075,
      longitude: 38.996815,
      description: "Armed assault against military installation",
      intensity: 8,
      data_source: "GDELT"
    },
    {
      event_date: "2024-02-11",
      event_type: "17",
      actor1: "POLITICAL PARTY",
      actor2: "POLITICAL PARTY",
      country: "Ukraine",
      latitude: 49.054585,
      longitude: 31.466306,
      description: "Verbal threats between political groups",
      intensity: 3,
      data_source: "GDELT"
    }
  ];
}