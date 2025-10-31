SafeShop AI - Google Chrome AI Challenge 2025
=============================================

**SafeShop AI** is a Chrome Extension that acts as a real-time security co-pilot for online shoppers, built for the Google Chrome Built-in AI Challenge 2025.

It uses on-device AI to analyze e-commerce checkout pages for common security vulnerabilities (identified from real-world fraudster data) and provides a simple, color-coded risk assessment to the user _before_ they enter their credit card.

Problem
-------

Cybercriminals actively hunt for e-commerce sites with specific security flaws, such as those that don't use 3D Secure (like "Verified by Visa") or have weak address verification. Consumers have no way of knowing if a site has these flaws until it's too late.

Solution
--------

This extension uses Chrome's built-in AI APIs to analyze the page in real-time.

1.  **AI Analysis (Prompt API):** The **Prompt API** is used to scan the page's content for critical security signals:
    
    *   Does it have a CVV field?
        
    *   Does it mention 3D Secure (VBV, SecureCode)?
        
    *   Does it offer secure alternatives (PayPal, Google Pay)?
        
2.  **AI Summary (Summarizer API):** The technical JSON report from the Prompt API is then fed into the **Summarizer API** to generate a simple, user-friendly "Green", "Yellow", or "Red" risk report, complete with "Why" and "Advice" sections.
    

This entire process is **100% private**, running on-device with Gemini Nano. No sensitive checkout page data ever leaves the user's browser.

Tech Stack
----------

*   **Google Chrome Built-in AI:**
    
    *   Prompt API (for security analysis)
        
    *   Summarizer API (for user-friendly recommendations)
        
*   **Chrome Extension APIs (Manifest V3)**
    
*   **JavaScript, HTML, CSS**
    

How to Test
-----------

**Note:** This extension relies on experimental APIs.

1.  Download and install **Chrome Canary**.
    
2.  Navigate to chrome://flags and **Enable** all flags related to "Built-in AI" and "Prompt API".
    
3.  Relaunch Canary.
    
4.  Go to chrome://extensions, enable **"Developer mode"**.
    
5.  Click **"Load unpacked"** and select this project's folder.
    
6.  Pin the extension and test it on various e-commerce checkout pages.
    

_**Mock Mode Note:**_ _The AI APIs in Canary can be unreliable. For submission and demo purposes, MOCK\_AI is set to true in popup.js to ensure a consistent, working demo. You can test the three risk states by visiting URLs containing "walmart" (Yellow), "scam-example" (Red), or any other URL (Green)._

Future Roadmap
--------------

This MVP is the foundation for a full B2C and B2B security suite.

*   **Gamified User Engagement:** As you suggested, build user trust by showing them the value. A dashboard would include:
    
    *   **Threat Counter:** "SafeShop has protected you from 3 potential threats this month."
        
    *   **Confidence Score:** A more granular 0-100 score for each site.
        
*   **Proactive Assistance:**
    
    *   **Alternative Finder:** If a site gets a "Red" score, the AI will automatically search for the same products on a known-safe, "Green"-rated website.
        
*   **In-Context Learning:**
    
    *   **Dynamic "Learn More" Link:** Add a "Learn More" link to the risk report. This will direct users to a wiki/help page, auto-scrolling to the specific issue (e.g., "What is 3D Secure?", "Why is a CVV important?") to educate them on the risks.
        
*   **B2B/Enterprise Version:**
    
    *   **Merchant Dashboard:** Sell this technology to e-commerce platforms (like Shopify, BigCommerce) so merchants can run it on their _own_ stores to find and fix vulnerabilities before they're exploited.
        
    *   **SafeShop Trust Seal:** A seal for merchants who score "Green," increasing their customer conversion rates.