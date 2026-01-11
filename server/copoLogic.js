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
 * Count total number of Performance Indicators (PIs) for a PO/PSO
 */
function countTotalPIs(outcomeData) {
  let totalPIs = 0;
  if (outcomeData && outcomeData.competencies) {
    for (const competency of Object.values(outcomeData.competencies)) {
      if (competency.performanceIndicators) {
        totalPIs += Object.keys(competency.performanceIndicators).length;
      }
    }
  }
  return totalPIs;
}

/**
 * Collect all matched PI IDs from matches array
 */
function collectMatchedPIs(matches) {
  const matchedPIIds = new Set();
  for (const match of matches) {
    if (match.matchedPIs && Array.isArray(match.matchedPIs)) {
      for (const pi of match.matchedPIs) {
        if (pi.piId) {
          matchedPIIds.add(pi.piId);
        }
      }
    }
  }
  return Array.from(matchedPIIds);
}

/**
 * Get all Performance Indicators (PIs) for a PO/PSO with their IDs and descriptions
 */
function getAllPIs(outcomeData) {
  const allPIs = [];
  if (outcomeData && outcomeData.competencies) {
    for (const competency of Object.values(outcomeData.competencies)) {
      if (competency.performanceIndicators) {
        for (const [piId, piDesc] of Object.entries(competency.performanceIndicators)) {
          allPIs.push({
            piId: piId,
            piDesc: piDesc
          });
        }
      }
    }
  }
  return allPIs;
}

/**
 * Determine CO-PO correlation value based on K-levels (Qualitative approach)
 */
function determineCorrelationValueQualitative(coKLevel, poKLevel) {
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
 * Determine CO-PO correlation value based on PI coverage (Quantitative approach)
 * Following AICTE Examination Reform Policy and new NBA pattern
 * Level 3 (High): >60% of PIs covered
 * Level 2 (Medium): 40-60% of PIs covered
 * Level 1 (Low): <40% of PIs covered
 */
function determineCorrelationValueQuantitative(matchedPICount, totalPICount) {
  if (totalPICount === 0) {
    return null;
  }
  
  const coveragePercentage = (matchedPICount / totalPICount) * 100;
  
  if (coveragePercentage > 60) {
    return 3;
  } else if (coveragePercentage >= 40) {
    return 2;
  } else {
    return 1;
  }
}

/**
 * Determine CO-PO correlation value using both qualitative and quantitative approaches
 * Priority: Quantitative (PI coverage) takes precedence, but K-level must be compatible
 */
function determineCorrelationValue(coKLevel, poKLevel, matches, outcomeData) {
  // Get total PIs for the outcome
  const totalPIs = countTotalPIs(outcomeData);
  
  // Get matched PIs
  const matchedPIs = collectMatchedPIs(matches);
  const matchedPICount = matchedPIs.length;
  
  // Calculate quantitative mapping strength based on PI coverage
  const quantitativeValue = determineCorrelationValueQuantitative(matchedPICount, totalPIs);
  
  // Calculate qualitative mapping strength based on K-levels
  const qualitativeValue = determineCorrelationValueQualitative(coKLevel, poKLevel);
  
  // If quantitative approach gives a value, use it (as per new NBA pattern)
  // But ensure K-level compatibility: CO K-level should not be too low compared to PO K-level
  if (quantitativeValue !== null) {
    const coK = kLevelToNumber(coKLevel);
    const poK = kLevelToNumber(poKLevel);
    
    // If CO K-level is significantly lower than PO K-level, reduce the mapping strength
    // This ensures alignment between cognitive level and PI coverage
    if (coK < poK - 1 && quantitativeValue > 1) {
      // If CO is 2+ levels below PO, cap at level 1
      return 1;
    } else if (coK < poK && quantitativeValue === 3) {
      // If CO is below PO but quantitative says 3, reduce to 2
      return 2;
    }
    
    return quantitativeValue;
  }
  
  // Fallback to qualitative approach if no PIs matched
  return qualitativeValue;
}

/**
 * Generate reasoning explanation for a CO-PO/PSO mapping (with syllabus and LLM support)
 * Now includes both qualitative (K-level) and quantitative (PI coverage) justifications
 */
async function generateReasoning(co, outcomeNumber, outcomeData, correlationValue, matches, syllabusData = null, piCoverageInfo = null, qualitativeValue = null) {
  const coKLevel = kLevelToNumber(co.kLevel);
  const outcomeKLevel = outcomeData.kLevel;
  const outcomeType = outcomeNumber.startsWith('PSO') ? 'PSO' : 'PO';
  
  if (matches.length === 0) {
    return null; // No match, no reasoning
  }
  
  // Build competency and PI info with null checks
  if (!matches || matches.length === 0) {
    return null;
  }
  
  const primaryCompetency = matches[0];
  if (!primaryCompetency || !primaryCompetency.matchedPIs || primaryCompetency.matchedPIs.length === 0) {
    return null;
  }
  
  // Collect all matched PIs for display
  const allMatchedPIs = collectMatchedPIs(matches);
  const piList = allMatchedPIs.length > 0 ? allMatchedPIs.join(', ') : primaryCompetency.matchedPIs[0].piId;
  
  const coNumber = co.id.replace('CO', '');
  const competencyDesc = (primaryCompetency.competencyDesc || 'relevant competency').toLowerCase();
  
  // Find relevant syllabus units if available
  let syllabusReference = '';
  if (syllabusData && syllabusData.units) {
    const relevantUnits = findRelevantSyllabusContent(co.description, syllabusData);
    if (relevantUnits.length > 0) {
      const topUnit = relevantUnits[0].unit;
      syllabusReference = ` as covered in Unit ${topUnit.number}`;
    }
  }
  
  // Get all PIs for the outcome to show what's available
  const allPIsForOutcome = getAllPIs(outcomeData);
  const allPIIds = allPIsForOutcome.map(pi => pi.piId).sort();
  
  // Build qualitative justification - Show list of PIs that CO aligns with
  let qualitativeJustification = '';
  if (piCoverageInfo && piCoverageInfo.matchedPIs && piCoverageInfo.matchedPIs.length > 0) {
    const sortedMatchedPIs = [...piCoverageInfo.matchedPIs].sort();
    qualitativeJustification = `Qualitative: CO aligns with the following Performance Indicators (PIs) of ${outcomeNumber}: ${sortedMatchedPIs.join(', ')}.`;
  } else if (allMatchedPIs.length > 0) {
    const sortedMatchedPIs = [...allMatchedPIs].sort();
    qualitativeJustification = `Qualitative: CO aligns with the following Performance Indicators (PIs) of ${outcomeNumber}: ${sortedMatchedPIs.join(', ')}.`;
  }
  
  // Build quantitative justification (PI coverage based) - PRIMARY JUSTIFICATION
  // Show ratio of matched PIs to total PIs clearly
  let quantitativeJustification = '';
  if (piCoverageInfo && piCoverageInfo.totalPIs > 0) {
    const levelDescription = piCoverageInfo.coveragePercentage > 60 ? 'High' : piCoverageInfo.coveragePercentage >= 40 ? 'Medium' : 'Low';
    const sortedMatchedPIs = piCoverageInfo.matchedPIs ? [...piCoverageInfo.matchedPIs].sort() : allMatchedPIs.sort();
    const sortedAllPIs = allPIIds;
    
    quantitativeJustification = `Quantitative (Primary): CO aligns with ${piCoverageInfo.matchedPICount} out of ${piCoverageInfo.totalPIs} PIs of ${outcomeNumber} (Ratio: ${piCoverageInfo.matchedPICount}/${piCoverageInfo.totalPIs} = ${piCoverageInfo.coveragePercentage.toFixed(1)}% coverage). Matched PIs: [${sortedMatchedPIs.join(', ')}]. Total PIs for ${outcomeNumber}: [${sortedAllPIs.join(', ')}]. This ${piCoverageInfo.coveragePercentage.toFixed(1)}% coverage determines mapping strength of ${correlationValue} (${levelDescription}) according to AICTE Examination Reform Policy.`;
  }
  
  // Try to generate LLM-based justification first (for the alignment statement)
  let alignmentStatement = '';
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
      alignmentStatement = llmJustification;
    }
  } catch (error) {
    console.warn(`LLM justification failed for ${co.id}-${outcomeNumber}, falling back to template:`, error.message);
  }
  
  // Fallback alignment statement if LLM unavailable
  if (!alignmentStatement) {
    alignmentStatement = `CO ${coNumber} aligned with ${outcomeNumber} based on ${competencyDesc} addressing PIs ${piList}${syllabusReference}.`;
  }
  
  // Combine all justifications - Quantitative (PRIMARY) first, then Qualitative (SECONDARY)
  let reason = alignmentStatement;
  
  // Add quantitative justification first (PRIMARY)
  if (quantitativeJustification) {
    reason += ' ' + quantitativeJustification;
  }
  
  // Add qualitative justification second (SECONDARY/VALIDATION)
  if (qualitativeJustification) {
    reason += ' ' + qualitativeJustification;
  }
  
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
        // Calculate qualitative value (K-level based)
        const qualitativeValue = determineCorrelationValueQualitative(co.kLevel, poData.kLevel);
        
        // Determine correlation value using both qualitative and quantitative approaches
        const correlationValue = determineCorrelationValue(co.kLevel, poData.kLevel, matches, poData);
        
        if (correlationValue !== null) {
          matrix[co.id][poNumber] = correlationValue;
          
          // Calculate PI coverage information for quantitative justification
          const totalPIs = countTotalPIs(poData);
          const matchedPIs = collectMatchedPIs(matches);
          const matchedPICount = matchedPIs.length;
          const coveragePercentage = totalPIs > 0 ? (matchedPICount / totalPIs) * 100 : 0;
          
          const piCoverageInfo = {
            totalPIs: totalPIs,
            matchedPICount: matchedPICount,
            matchedPIs: matchedPIs,
            coveragePercentage: coveragePercentage
          };
          
          // Generate reasoning (with syllabus data, LLM, PI coverage info, and qualitative value)
          reasoning[co.id][poNumber] = await generateReasoning(
            co,
            poNumber,
            poData,
            correlationValue,
            matches,
            syllabusData,
            piCoverageInfo,
            qualitativeValue
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
        // Calculate qualitative value (K-level based)
        const qualitativeValue = determineCorrelationValueQualitative(co.kLevel, psoData.kLevel);
        
        // Determine correlation value using both qualitative and quantitative approaches
        const correlationValue = determineCorrelationValue(co.kLevel, psoData.kLevel, matches, psoData);
        
        if (correlationValue !== null) {
          matrix[co.id][psoNumber] = correlationValue;
          
          // Calculate PI coverage information for quantitative justification
          const totalPIs = countTotalPIs(psoData);
          const matchedPIs = collectMatchedPIs(matches);
          const matchedPICount = matchedPIs.length;
          const coveragePercentage = totalPIs > 0 ? (matchedPICount / totalPIs) * 100 : 0;
          
          const piCoverageInfo = {
            totalPIs: totalPIs,
            matchedPICount: matchedPICount,
            matchedPIs: matchedPIs,
            coveragePercentage: coveragePercentage
          };
          
          // Generate reasoning (with syllabus data, LLM, PI coverage info, and qualitative value)
          reasoning[co.id][psoNumber] = await generateReasoning(
            co,
            psoNumber,
            psoData,
            correlationValue,
            matches,
            syllabusData,
            piCoverageInfo,
            qualitativeValue
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

