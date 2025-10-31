// --- 1. Get references to all our NEW HTML elements ---
const analyzeButton = document.getElementById('analyzeButton');
const loadingArea = document.getElementById('loadingArea');
const errorArea = document.getElementById('errorArea');

// Report Card Elements
const reportArea = document.getElementById('reportArea');
const reportIcon = document.getElementById('reportIcon');
const reportTitle = document.getElementById('reportTitle');
const reportWhy = document.getElementById('reportWhy');
const reportAdvice = document.getElementById('reportAdvice');

// --- NEW MOCK DATA ---
const MOCK_AI = true; // SET TO false TO TRY THE REAL AI

const MOCK_REPORT_GREEN = {
  risk_level: "Green",
  icon: "✓",
  title: "Risk Level: Low",
  why: "This site uses standard security checks, including a CVV field and 3D Secure.",
  advice: "You are good to go. Happy shopping!"
};
const MOCK_REPORT_YELLOW = {
  risk_level: "Yellow",
  icon: "!",
  title: "Risk Level: Medium",
  why: "This site has a CVV field but does not appear to use 3D Secure (like 'Verified by Visa').",
  advice: "For extra safety, we recommend using a secure alternative like PayPal or Google Pay if available."
};
const MOCK_REPORT_RED = {
  risk_level: "Red",
  icon: "X",
  title: "Risk Level: High",
  why: "This site does NOT appear to ask for a CVV/Security Code. This is a major red flag.",
  advice: "We strongly advise *against* entering your card details. Try to find this product on a different, more secure website."
};
// --- END MOCK DATA ---


// --- Pre-flight Check ---
document.addEventListener('DOMContentLoaded', async () => {
  // If we're in mock mode, just enable the button and stop
  if (MOCK_AI) {
    analyzeButton.disabled = false;
    return;
  }
  
  // --- REAL AI CHECK (if MOCK_AI is false) ---
  try {
    if (!window.ai || typeof window.ai.canCreateTextSession !== 'function') {
      showError("`window.ai` or its functions are not yet available. Please restart Chrome Canary and wait 30 seconds.");
      return;
    }
    const status = await window.ai.canCreateTextSession();
    if (status === 'no') {
      showError("AI model is available, but not ready ('no' status). Please wait, restart Canary, and try again.");
    } else {
      analyzeButton.disabled = false;
    }
  } catch (e) {
    showError(`Error during AI pre-flight check: ${e.message}.`);
  }
});


// --- 2. Add the main click listener ---
analyzeButton.addEventListener('click', analyzePage);

async function analyzePage() {
  // --- 3. Set up the UI for loading ---
  hideAllSections();
  loadingArea.classList.remove('hidden');
  analyzeButton.disabled = true;

  try {
    // --- MOCK BYPASS ---
    if (MOCK_AI) {
      await new Promise(resolve => setTimeout(resolve, 1500)); 
      const pageText = await getPageText();
      const lowerPageText = pageText.toLowerCase();

      // NEW: Logic for all 3 cases
      if (lowerPageText.includes('walmart')) { // Yellow Case
        showReport(MOCK_REPORT_YELLOW);
      } else if (lowerPageText.includes('bing.com')) { // Red Case (you can just edit the URL to include this)
        showReport(MOCK_REPORT_RED);
      } else { // Green Case
        showReport(MOCK_REPORT_GREEN);
      }
      
    } else {
      // --- REAL AI LOGIC (Unchanged) ---
      const pageText = await getPageText();
      if (!pageText || pageText.trim().length < 100) {
        throw new Error("Could not get enough text from this page.");
      }
      if (!window.ai || typeof window.ai.createTextSession !== 'function') {
        throw new Error("AI function `createTextSession` is missing.");
      }
      const analysisReport = await runSecurityAnalysis(pageText);
      const summary = await runSummary(analysisReport);
      // We need to map the AI text to our new object
      const iconMap = { "Green": "✓", "Yellow": "!", "Red": "X" };
      const titleMap = { "Green": "Risk Level: Low", "Yellow": "Risk Level: Medium", "Red": "Risk Level: High" };
      
      showReport({
        risk_level: summary.risk_level,
        icon: iconMap[summary.risk_level] || "!",
        title: titleMap[summary.risk_level] || "Risk Level: Unknown",
        why: summary.why_text, // We need to update the AI prompt to ask for 'why_text'
        advice: summary.advice_text // and 'advice_text'
      });
    }

  } catch (error) {
    console.error('SafeShop AI Error:', error);
    showError(error.message);
  } finally {
    analyzeButton.disabled = false;
  }
}

// --- Helper Functions ---

async function getPageText() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) throw new Error("Could not find an active tab.");

  // NEW: Simple trick for mock mode
  if(MOCK_AI) {
      return tab.url.toLowerCase();
  }
  // ---

  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content_script.js'],
    });
    if (results && results[0] && results[0].result) {
      return results[0].result;
    } else {
      throw new Error("Could not get text from the page.");
    }
  } catch (e) {
    throw new Error("Could not access this page. Try refreshing the tab.");
  }
}


async function runSecurityAnalysis(pageText) {
  // ... (This function remains the same as before) ...
  // ... (Make sure the check is in here: if (!window.ai || ...)) ...
    const systemPrompt = `
    You are a 'Checkout Page Security Analyzer'. Your task is to analyze text
    from an e-commerce checkout page. You must identify three key features:
    1.  If the page asks for a card security code (CVV, CVC, Security Code).
    2.  If the page mentions 3D Secure trust signals (Verified by Visa, MasterCard SecureCode, SafeKey).
    3.  If the page offers alternative, secure payment methods (PayPal, Google Pay, Apple Pay, Shop Pay).

    You MUST return your findings ONLY as a minified JSON object with three
    boolean keys: "has_cvv", "has_3d_secure", "has_alternatives".
  `;
  // ...
  const session = await window.ai.createTextSession();
  const result = await session.prompt(systemPrompt + userPrompt);
  const jsonResult = result.replace('```json', '').replace('```', '').trim();
  return JSON.parse(jsonResult);
}

async function runSummary(analysisReport) {
  // ... (This function needs to be updated for the new report) ...
  // ... (Make sure the check is in here: if (!window.ai || ...)) ...
  
  // NEW PROMPT to ask for the "why" and "advice"
  const summarySystemPrompt = `
    You are 'SafeShop AI', a friendly security assistant. Your job is to take a
    technical JSON report and turn it into a simple, 1-2 sentence recommendation
    for a non-technical user.

    - If "has_cvv" is false, set risk_level to "Red".
    - If "has_cvv" is true and "has_3d_secure" is false, set risk_level to "Yellow".
    - If "has_cvv" is true and "has_3d_secure" is true, set risk_level to "Green".
    
    You MUST return ONLY a minified JSON object with three keys:
    1. "risk_level": "Green", "Yellow", or "Red".
    2. "why_text": A 1-sentence explanation of *why* it got that rating.
    3. "advice_text": A 1-sentence piece of advice. If alternatives are available and risk is Yellow/Red, suggest them.
  `;
  
  const summaryUserPrompt = `Report: ${JSON.stringify(analysisReport)}`;

  const session = await window.ai.createTextSession();
  const result = await session.prompt(summarySystemPrompt + summaryUserPrompt);
  const jsonResult = result.replace('```json', '').replace('```', '').trim();
  return JSON.parse(jsonResult);
}


function showReport(report) {
  hideAllSections();
  // Set text and icon
  reportIcon.textContent = report.icon;
  reportTitle.textContent = report.title;
  reportWhy.textContent = report.why;
  reportAdvice.textContent = report.advice;

  // Set color
  reportArea.classList.remove('green', 'yellow', 'red');
  reportArea.classList.add(report.risk_level.toLowerCase());
  
  // Show it
  reportArea.classList.remove('hidden');
}

function showError(message) {
  hideAllSections();
  errorArea.querySelector('p').textContent = `Error: ${message}`;
  errorArea.classList.remove('hidden');
}

function hideAllSections() {
  loadingArea.classList.add('hidden');
  errorArea.classList.add('hidden');
  reportArea.classList.add('hidden');
}

