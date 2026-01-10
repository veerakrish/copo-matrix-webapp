import { PO_DATA, getPONumbers, PSO_DATA, getPSONumbers } from './poData.js';
import { findRelevantSyllabusContent } from './syllabusParser.js';
import { generateLLMJustification } from './mistralService.js';

/**
 * Convert K-level string (K1-K6) to numeric value
 */
function kLevelToNumber(kLevel) {
  if (typeof kLevel === 'number') {
    return kLevel;
  }
  
  const kLevelStr = String(kLevel).toUpperCase();
  if (kLevelStr.startsWith('K')) {
    return parseInt(kLevelStr.substring(1)) || 1;
  }
  
  return parseInt(kLevelStr) || 1;
}

/**
 * Check if CO text matches competency/PI descriptions using keyword matching
 */
function checkTextMatch(coText, competencyDesc, piDescriptions) {
  const coTextLower = coText.toLowerCase();
  const competencyLower = competencyDesc.toLowerCase();
  
  // Extract keywords from competency description
  const competencyKeywords = competencyLower
    .split(/\s+/)
    .filter(word => word.length > 3)
    .map(word => word.replace(/[^\w]/g, ''));
  
  // Check if CO text contains competency keywords
  let competencyMatch = false;
  for (const keyword of competencyKeywords) {
    if (coTextLower.includes(keyword)) {
      competencyMatch = true;
      break;
    }
  }
  
  // Check PI descriptions
  const matchedPIs = [];
  for (const [piId, piDesc] of Object.entries(piDescriptions)) {
    const piLower = piDesc.toLowerCase();
    const piKeywords = piLower
      .split(/\s+/)
      .filter(word => word.length > 3)
      .map(word => word.replace(/[^\w]/g, ''));
    
    let piMatch = false;
    for (const keyword of piKeywords) {
      if (coTextLower.includes(keyword)) {
        piMatch = true;
        break;
      }
    }
    
    if (piMatch) {
      matchedPIs.push(piId);
    }
  }
  
  return {
    matches: competencyMatch || matchedPIs.length > 0,
    matchedPIs: matchedPIs
  };
}

/**
 * Find matching competencies and PIs for a CO against a PO
 */
function findMatchingCompetencies(coText, poData) {
  const matches = [];
  
  for (const [compId, competency] of Object.entries(poData.competencies)) {
    const matchResult = checkTextMatch(
      coText,
      competency.description,
      competency.performanceIndicators
    );
    
    if (matchResult.matches) {
      // Get matched PIs, or use first PI from competency if none matched
      let matchedPIs = matchResult.matchedPIs.map(piId => ({
        piId: piId,
        piDesc: competency.performanceIndicators[piId]
      }));
      
      // If no PIs matched, use the first PI from the competency as a fallback
      if (matchedPIs.length === 0 && competency.performanceIndicators) {
        const firstPIId = Object.keys(competency.performanceIndicators)[0];
        if (firstPIId) {
          matchedPIs = [{
            piId: firstPIId,
            piDesc: competency.performanceIndicators[firstPIId]
          }];
        }
      }
      
      matches.push({
        competencyId: compId,
        competencyDesc: competency.description,
        matchedPIs: matchedPIs
      });
    }
  }
  
  return matches;
}

/**
 * Determine CO-PO correlation value based on K-levels
 */
function determineCorrelationValue(coKLevel, poKLevel) {
  const coK = kLevelToNumber(coKLevel);
  const poK = kLevelToNumber(poKLevel);
  
  if (coK > poK) {
    return 3;
  } else if (coK === poK) {
    return 2;
  } else if (coK < poK) {
    return 1;
  }
  
  return null;
}

/**
 * Generate reasoning explanation for a CO-PO/PSO mapping (with syllabus and LLM support)
 */
async function generateReasoning(co, outcomeNumber, outcomeData, correlationValue, matches, syllabusData = null) {
  const coKLevel = kLevelToNumber(co.kLevel);
  const outcomeKLevel = outcomeData.kLevel;
  const outcomeType = outcomeNumber.startsWith('PSO') ? 'PSO' : 'PO';
  
  if (matches.length === 0) {
    return null; // No match, no reasoning
  }
  
  // Try to generate LLM-based justification first
  try {
    const llmJustification = await generateLLMJustification(
      co,
      outcomeNumber,
      outcomeData,
      correlationValue,
      matches,
      syllabusData
    );
    
    if (llmJustification) {
      return llmJustification;
    }
  } catch (error) {
    console.warn(`LLM justification failed for ${co.id}-${outcomeNumber}, falling back to template:`, error.message);
  }
  
  // Fall back to template-based reasoning if LLM is unavailable or fails (also in single sentence)
  let reason = '';
  
  // Find relevant syllabus units if available (for template fallback)
  let syllabusReference = '';
  if (syllabusData && syllabusData.units) {
    const relevantUnits = findRelevantSyllabusContent(co.description, syllabusData);
    if (relevantUnits.length > 0) {
      const topUnit = relevantUnits[0].unit;
      syllabusReference = ` as covered in Unit ${topUnit.number}`;
    }
  }
  
  // Build competency and PI info with null checks
  if (!matches || matches.length === 0) {
    return null;
  }
  
  const primaryCompetency = matches[0];
  if (!primaryCompetency || !primaryCompetency.matchedPIs || primaryCompetency.matchedPIs.length === 0) {
    return null;
  }
  
  const primaryPI = primaryCompetency.matchedPIs[0];
  if (!primaryPI || !primaryPI.piId) {
    return null;
  }
  
  // Generate concise format: "CO X aligned with PO Y based on [competency description] (PI reference)"
  const coNumber = co.id.replace('CO', '');
  const competencyDesc = (primaryCompetency.competencyDesc || 'relevant competency').toLowerCase();
  const piId = primaryPI.piId || 'N/A';
  
  // Create concise alignment statement
  reason = `CO ${coNumber} aligned with ${outcomeNumber} based on ${competencyDesc} (${piId})${syllabusReference}.`;
  
  return reason;
}

/**
 * Generate CO-PO Matrix (includes PSOs) with optional syllabus enhancement
 */
export async function generateCOPOMatrix(courseOutcomes, syllabusData = null) {
  const poNumbers = getPONumbers();
  const psoNumbers = getPSONumbers();
  const matrix = {};
  const reasoning = {};
  
  // Initialize matrix structure for both POs and PSOs
  for (const co of courseOutcomes) {
    matrix[co.id] = {};
    reasoning[co.id] = {};
    
    // Initialize PO columns
    for (const poNumber of poNumbers) {
      matrix[co.id][poNumber] = null; // null means blank
      reasoning[co.id][poNumber] = null;
    }
    
    // Initialize PSO columns
    for (const psoNumber of psoNumbers) {
      matrix[co.id][psoNumber] = null; // null means blank
      reasoning[co.id][psoNumber] = null;
    }
  }
  
  // Process each CO against each PO
  for (const co of courseOutcomes) {
    for (const poNumber of poNumbers) {
      const poData = PO_DATA[poNumber];
      
      // Find matching competencies and PIs
      const matches = findMatchingCompetencies(co.description, poData);
      
      if (matches.length > 0) {
        // Determine correlation value
        const correlationValue = determineCorrelationValue(co.kLevel, poData.kLevel);
        
        if (correlationValue !== null) {
          matrix[co.id][poNumber] = correlationValue;
          
          // Generate reasoning (with syllabus data and LLM if available)
          reasoning[co.id][poNumber] = await generateReasoning(
            co,
            poNumber,
            poData,
            correlationValue,
            matches,
            syllabusData
          );
        }
      }
    }
    
    // Process each CO against each PSO
    for (const psoNumber of psoNumbers) {
      const psoData = PSO_DATA[psoNumber];
      
      // Find matching competencies and PIs
      const matches = findMatchingCompetencies(co.description, psoData);
      
      if (matches.length > 0) {
        // Determine correlation value
        const correlationValue = determineCorrelationValue(co.kLevel, psoData.kLevel);
        
        if (correlationValue !== null) {
          matrix[co.id][psoNumber] = correlationValue;
          
          // Generate reasoning (with syllabus data and LLM if available)
          reasoning[co.id][psoNumber] = await generateReasoning(
            co,
            psoNumber,
            psoData,
            correlationValue,
            matches,
            syllabusData
          );
        }
      }
    }
  }
  
  // Calculate averages for each PO column (only considering non-null values)
  // Average = sum of mapped CO values / number of COs that are mapped
  const averages = {};
  for (const poNumber of poNumbers) {
    const values = [];
    for (const coId of Object.keys(matrix)) {
      const value = matrix[coId][poNumber];
      // Only include values that are 1, 2, or 3 (mapped COs)
      // Convert to number to handle any type issues
      const numValue = Number(value);
      if (!isNaN(numValue) && numValue >= 1 && numValue <= 3) {
        values.push(numValue);
      }
    }
    if (values.length > 0) {
      const sum = values.reduce((acc, val) => acc + val, 0);
      const avg = sum / values.length;
      averages[poNumber] = Math.round(avg * 100) / 100; // Round to 2 decimal places
    } else {
      averages[poNumber] = null;
    }
  }
  
  // Calculate averages for each PSO column
  for (const psoNumber of psoNumbers) {
    const values = [];
    for (const coId of Object.keys(matrix)) {
      const value = matrix[coId][psoNumber];
      const numValue = Number(value);
      if (!isNaN(numValue) && numValue >= 1 && numValue <= 3) {
        values.push(numValue);
      }
    }
    if (values.length > 0) {
      const sum = values.reduce((acc, val) => acc + val, 0);
      const avg = sum / values.length;
      averages[psoNumber] = Math.round(avg * 100) / 100; // Round to 2 decimal places
    } else {
      averages[psoNumber] = null;
    }
  }
  
  // Debug: Log averages to verify calculation
  console.log('Averages calculated:', JSON.stringify(averages, null, 2));
  
  return {
    matrix: matrix,
    reasoning: reasoning,
    poNumbers: poNumbers,
    psoNumbers: psoNumbers,
    averages: averages
  };
}

