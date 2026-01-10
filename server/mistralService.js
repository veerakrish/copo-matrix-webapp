// Import Mistral SDK - using named import
import { Mistral } from '@mistralai/mistralai';

let mistralClient = null;

/**
 * Initialize Mistral client with API key from environment
 */
function getMistralClient() {
  if (!mistralClient) {
    // Try both variable names for compatibility
    let apiKey = process.env.MISTRALAI_API_KEY || process.env.MISTRAL_API_KEY;
    
    // Remove quotes if present (common in .env files)
    if (apiKey) {
      apiKey = apiKey.replace(/^["']|["']$/g, '').trim();
    }
    
    if (!apiKey) {
      console.warn('MISTRALAI_API_KEY not found in environment variables. LLM features will be disabled.');
      console.warn('Available env vars:', Object.keys(process.env).filter(k => k.includes('MISTRAL')));
      return null;
    }
    
    console.log('Mistral API key loaded successfully. LLM features enabled.');
    
    // Verify Mistral is a constructor
    if (typeof Mistral !== 'function') {
      console.error('Mistral is not a constructor. Type:', typeof Mistral, 'Value:', Mistral);
      return null;
    }
    
    // Mistral SDK uses Mistral class with apiKey option
    try {
      mistralClient = new Mistral({ apiKey: apiKey });
    } catch (error) {
      console.error('Failed to create Mistral client:', error);
      return null;
    }
  }
  return mistralClient;
}

/**
 * Generate enhanced justification using Mistral LLM
 */
export async function generateLLMJustification(co, outcomeNumber, outcomeData, correlationValue, matches, syllabusData = null) {
  const client = getMistralClient();
  
  // If Mistral is not available, return null to fall back to template-based reasoning
  if (!client) {
    return null;
  }

  try {
    const coKLevel = parseInt(co.kLevel) || 3;
    const outcomeKLevel = outcomeData.kLevel;
    const outcomeType = outcomeNumber.startsWith('PSO') ? 'PSO' : 'PO';
    
    // Build context for the LLM
    const competencyInfo = matches.map(m => 
      `- ${m.competencyId}: ${m.competencyDesc}\n  Performance Indicators: ${m.matchedPIs.map(pi => `${pi.piId} - ${pi.piDesc}`).join(', ')}`
    ).join('\n');

    // Build syllabus context if available (unit-wise)
    let syllabusContext = '';
    if (syllabusData && syllabusData.units) {
      const relevantUnits = syllabusData.units.slice(0, 5) || []; // Get up to 5 units
      if (relevantUnits.length > 0) {
        syllabusContext = `\n\nCourse Syllabus Units:\n${relevantUnits.map(u => `Unit ${u.number}: ${u.title} - ${(u.content || u.title).substring(0, 200)}`).join('\n')}`;
      }
    }

    // Get primary competency and PI for concise reference with null checks
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
    
    const competencyRef = `${primaryCompetency.competencyId} (${primaryPI.piId})`;
    
    // Create the prompt
    const prompt = `Generate a concise single-sentence justification for CO-PO mapping in this exact format:

Format: "CO X aligned with PO Y based on [competency description] ([PI reference])"

Example: "CO 1 aligned with PO 1 based on demonstrating competence in engineering concepts (1.3.1)"

Context:
- Course Outcome: ${co.id} - "${co.description}"
- Program Outcome: ${outcomeNumber} - "${outcomeData.title}"
- Matching Competency: ${primaryCompetency.competencyId} - "${primaryCompetency.competencyDesc}"
- Performance Indicator: ${primaryPI.piId} - "${primaryPI.piDesc}"
${syllabusContext ? `- Relevant Syllabus Units: ${syllabusContext.split('\n').slice(1).join('; ')}` : ''}

Requirements:
1. Output format: "CO ${co.id.replace('CO', '')} aligned with ${outcomeNumber} based on [brief competency description] (${primaryPI.piId})"
2. Use the competency description from: "${primaryCompetency.competencyDesc}"
3. Keep it concise - maximum 30 words
4. Single sentence only
5. Include the PI reference in parentheses: (${primaryPI.piId})
6. Do NOT include K-level explanation or correlation level details
7. Do NOT include full CO or PO descriptions - just the alignment statement

Generate the justification:`;

    // Try different models in order of preference (fallback if one fails)
    const models = [
      'mistral-small-latest',  // Most available, faster
      'pixtral-small-latest', // Alternative small model
      'mistral-medium-latest', // If available
      'mistral-large-latest'   // Best quality if available
    ];
    
    let lastError = null;
    
    for (const model of models) {
      try {
        // Call Mistral API with retry logic for rate limits
        const chatResponse = await client.chat.complete({
          model: model,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3, // Lower temperature for more consistent, factual output
          maxTokens: 150 // Reduced for single sentence
        }, {
          retries: {
            strategy: 'exponential',
            initialInterval: 1000,
            maxInterval: 10000,
            maxElapsedTime: 30000,
            exponent: 2,
            maxAttempts: 3
          },
          retryCodes: ['429', '500', '502', '503', '504']
        });

        // Extract response
        const justification = chatResponse?.choices?.[0]?.message?.content?.trim() 
          || chatResponse?.data?.choices?.[0]?.message?.content?.trim()
          || chatResponse?.content?.trim();
        
        if (justification) {
          return justification;
        }
      } catch (error) {
        lastError = error;
        
        // If it's a 429 (rate limit) or capacity error, try next model
        if (error.statusCode === 429 || 
            (error.body && error.body.includes('capacity exceeded')) ||
            (error.body && error.body.includes('service_tier_capacity_exceeded'))) {
          console.warn(`Model ${model} unavailable (capacity/rate limit), trying next model...`);
          continue; // Try next model
        }
        
        // For other errors, log and try next model
        if (error.statusCode >= 400 && error.statusCode < 500) {
          console.warn(`Model ${model} error (${error.statusCode}), trying next model...`);
          continue;
        }
        
        // For server errors, try next model
        if (error.statusCode >= 500) {
          console.warn(`Model ${model} server error, trying next model...`);
          continue;
        }
      }
    }
    
    // If all models failed, log and return null
    if (lastError) {
      console.warn('All Mistral models unavailable, falling back to template-based reasoning. Last error:', lastError.message);
    }
    
    return null; // Fall back to template if all models fail
  } catch (error) {
    console.error('Error generating LLM justification:', error.message);
    // Fall back to template-based reasoning on error
    return null;
  }
}

/**
 * Get K-level description
 */
function getKLevelDescription(level) {
  const descriptions = {
    1: 'Remember',
    2: 'Understand',
    3: 'Apply',
    4: 'Analyze',
    5: 'Evaluate',
    6: 'Create'
  };
  return descriptions[level] || 'Unknown';
}

/**
 * Get correlation level description
 */
function getCorrelationDescription(value, coK, poK) {
  if (value === 3) {
    return `CO K-level (${coK}) exceeds ${poK} requirement`;
  } else if (value === 2) {
    return `CO K-level (${coK}) meets ${poK} requirement`;
  } else {
    return `CO K-level (${coK}) partially meets ${poK} requirement`;
  }
}

