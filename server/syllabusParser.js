import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import fs from 'fs';
import path from 'path';

/**
 * Extract text from uploaded syllabus file
 */
export async function extractSyllabusText(filePath, mimeType) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    
    if (mimeType === 'application/pdf') {
      // Parse PDF
      const data = await pdfParse(fileBuffer);
      return data.text;
    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
               mimeType === 'application/msword') {
      // Parse DOCX or DOC
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      return result.value;
    } else if (mimeType === 'text/plain') {
      // Plain text file
      return fileBuffer.toString('utf-8');
    } else {
      throw new Error('Unsupported file type. Please upload PDF, DOCX, or TXT file.');
    }
  } catch (error) {
    console.error('Error extracting syllabus text:', error);
    throw new Error(`Failed to extract text from syllabus: ${error.message}`);
  }
}

/**
 * Extract units/modules from syllabus text (unit-wise, not topic-wise)
 */
export function extractSyllabusTopics(syllabusText) {
  const units = [];
  const lines = syllabusText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Look for unit/module patterns
  const unitPatterns = [
    /^(module|unit|chapter)\s+(\d+)[:\.\s]+(.+)/i,
    /^(\d+)[:\.]\s+(.+)/,
    /^(unit|module|chapter)\s+(\d+)/i,
  ];
  
  let currentUnit = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let matched = false;
    
    // Check for unit/module headers
    for (const pattern of unitPatterns) {
      const match = line.match(pattern);
      if (match) {
        // Save previous unit if exists
        if (currentUnit) {
          units.push(currentUnit);
        }
        
        // Start new unit
        const unitNumber = match[2] || match[1];
        const unitTitle = match[3] || match[2] || line;
        currentUnit = {
          number: unitNumber,
          title: unitTitle.trim(),
          content: line // Include the header line as content
        };
        matched = true;
        break;
      }
    }
    
    // If we're in a unit, collect content until next unit
    if (currentUnit && !matched) {
      // Stop collecting if we hit another unit pattern or major section
      if (line.length > 0 && !line.match(/^(module|unit|chapter|course|outcome|reference)/i)) {
        currentUnit.content += ' ' + line;
      }
    }
  }
  
  // Add last unit
  if (currentUnit) {
    units.push(currentUnit);
  }
  
  // If no structured units found, try to extract by numbered sections
  if (units.length === 0) {
    const numberedSections = syllabusText.match(/(?:^|\n)(\d+[\.:]\s+[^\n]+(?:\n(?!\d+[\.:])[^\n]+)*)/gm);
    if (numberedSections) {
      numberedSections.forEach((section, index) => {
        const lines = section.trim().split('\n');
        const title = lines[0];
        const content = lines.slice(1).join(' ').trim();
        units.push({
          number: index + 1,
          title: title,
          content: content || title
        });
      });
    }
  }
  
  return {
    fullText: syllabusText,
    units: units, // Changed from topics to units
    summary: extractSummary(syllabusText)
  };
}

/**
 * Extract summary from syllabus
 */
function extractSummary(text) {
  // Extract first few paragraphs as summary
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 50);
  return paragraphs.slice(0, 3).join('\n\n');
}

/**
 * Find relevant syllabus units for a CO description
 */
export function findRelevantSyllabusContent(coDescription, syllabusData) {
  const relevantUnits = [];
  const coLower = coDescription.toLowerCase();
  const coKeywords = extractKeywords(coDescription);
  
  // Search through units (not topics)
  const units = syllabusData.units || [];
  for (const unit of units) {
    const unitText = (unit.title + ' ' + (unit.content || '')).toLowerCase();
    
    // Check keyword matches
    let matchScore = 0;
    for (const keyword of coKeywords) {
      if (unitText.includes(keyword.toLowerCase())) {
        matchScore++;
      }
    }
    
    if (matchScore > 0) {
      relevantUnits.push({
        unit: unit,
        score: matchScore,
        relevance: matchScore / coKeywords.length
      });
    }
  }
  
  // Sort by relevance
  relevantUnits.sort((a, b) => b.score - a.score);
  
  return relevantUnits.slice(0, 3); // Return top 3 most relevant units
}

/**
 * Extract keywords from text
 */
function extractKeywords(text) {
  // Remove common stop words
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be',
    'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
    'would', 'should', 'could', 'may', 'might', 'must', 'can', 'this',
    'that', 'these', 'those', 'it', 'its', 'they', 'them', 'their'
  ]);
  
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word));
  
  // Return unique words
  return [...new Set(words)];
}

