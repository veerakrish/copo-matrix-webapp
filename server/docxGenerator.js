import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, WidthType, AlignmentType, HeadingLevel } from 'docx';

/**
 * Generate a DOCX document from the CO-PO-PSO matrix
 */
export async function generateDOCX(matrixResult, courseName, courseCode, courseOutcomes) {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        // Title
        new Paragraph({
          text: "CO-PO-PSO Mapping Matrix",
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),
        
        // Course Information
        new Paragraph({
          text: `Course: ${courseName}`,
          spacing: { after: 100 },
        }),
        new Paragraph({
          text: `Course Code: ${courseCode}`,
          spacing: { after: 300 },
        }),
        
        // Matrix Table
        ...generateMatrixTable(matrixResult, courseOutcomes),
        
        // Spacing before legend
        new Paragraph({
          text: "",
          spacing: { before: 400, after: 200 },
        }),
        
        // Legend
        new Paragraph({
          text: "Legend:",
          heading: HeadingLevel.HEADING_2,
          spacing: { after: 200 },
        }),
        new Paragraph({
          text: "3 - CO K-level > PO/PSO K-level",
          spacing: { after: 100 },
        }),
        new Paragraph({
          text: "2 - CO K-level = PO/PSO K-level",
          spacing: { after: 100 },
        }),
        new Paragraph({
          text: "1 - CO K-level < PO/PSO K-level (but still satisfies)",
          spacing: { after: 100 },
        }),
        new Paragraph({
          text: "- - No correlation",
          spacing: { after: 400 },
        }),
        
        // Reasoning Section
        ...generateReasoningSection(matrixResult),
      ],
    }],
  });

  // Generate the DOCX file as a buffer
  const buffer = await Packer.toBuffer(doc);
  return buffer;
}

/**
 * Generate the matrix table
 */
function generateMatrixTable(matrixResult, courseOutcomes) {
  const poNumbers = [...(matrixResult.poNumbers || [])].sort((a, b) => {
    const numA = parseInt(a.replace('PO', ''));
    const numB = parseInt(b.replace('PO', ''));
    return numA - numB;
  });
  
  const psoNumbers = [...(matrixResult.psoNumbers || [])].sort((a, b) => {
    const numA = parseInt(a.replace('PSO', ''));
    const numB = parseInt(b.replace('PSO', ''));
    return numA - numB;
  });
  
  const allColumns = [...poNumbers, ...psoNumbers];
  
  // Calculate averages
  const calculatedAverages = matrixResult.averages || {};
  if (!matrixResult.averages || Object.keys(matrixResult.averages).length === 0) {
    for (const col of allColumns) {
      const values = [];
      for (const coId of Object.keys(matrixResult.matrix || {})) {
        const value = matrixResult.matrix[coId][col];
        const numValue = Number(value);
        if (!isNaN(numValue) && numValue >= 1 && numValue <= 3) {
          values.push(numValue);
        }
      }
      if (values.length > 0) {
        const sum = values.reduce((acc, val) => acc + val, 0);
        calculatedAverages[col] = Math.round((sum / values.length) * 100) / 100;
      } else {
        calculatedAverages[col] = null;
      }
    }
  }
  
  // Header row
  const headerCells = [
    new TableCell({
      children: [new Paragraph({ text: "CO / Outcome", alignment: AlignmentType.CENTER })],
      shading: { fill: "4472C4" },
    }),
  ];
  
  // Add PO headers
  for (const po of poNumbers) {
    headerCells.push(
      new TableCell({
        children: [new Paragraph({ text: po, alignment: AlignmentType.CENTER })],
        shading: { fill: "4472C4" },
      })
    );
  }
  
  // Add PSO headers
  for (const pso of psoNumbers) {
    headerCells.push(
      new TableCell({
        children: [new Paragraph({ text: pso, alignment: AlignmentType.CENTER })],
        shading: { fill: "5B9BD5" },
      })
    );
  }
  
  const headerRow = new TableRow({
    children: headerCells,
  });
  
  // Data rows
  const dataRows = [];
  for (const coId of Object.keys(matrixResult.matrix).sort()) {
    const rowCells = [
      new TableCell({
        children: [new Paragraph({ text: coId, alignment: AlignmentType.CENTER })],
        shading: { fill: "D9E1F2" },
      }),
    ];
    
    // Add PO values
    for (const po of poNumbers) {
      const value = matrixResult.matrix[coId][po];
      const cellValue = value !== null && value !== undefined ? String(value) : "-";
      const shading = getCellShading(value);
      
      rowCells.push(
        new TableCell({
          children: [new Paragraph({ 
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: cellValue, bold: true })]
          })],
          shading: shading,
        })
      );
    }
    
    // Add PSO values
    for (const pso of psoNumbers) {
      const value = matrixResult.matrix[coId][pso];
      const cellValue = value !== null && value !== undefined ? String(value) : "-";
      const shading = getCellShading(value);
      
      rowCells.push(
        new TableCell({
          children: [new Paragraph({ 
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: cellValue, bold: true })]
          })],
          shading: shading,
        })
      );
    }
    
    dataRows.push(new TableRow({ children: rowCells }));
  }
  
  // Average row
  const avgCells = [
    new TableCell({
      children: [new Paragraph({ text: "Average", alignment: AlignmentType.CENTER })],
      shading: { fill: "D9E1F2" },
    }),
  ];
  
  for (const col of allColumns) {
    const avg = calculatedAverages[col];
    const numAvg = avg !== null && avg !== undefined ? Number(avg) : NaN;
    const isValidAvg = !isNaN(numAvg) && numAvg >= 0;
    const cellValue = isValidAvg ? numAvg.toFixed(2) : "-";
    
    avgCells.push(
      new TableCell({
        children: [new Paragraph({ 
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: cellValue, bold: true })]
        })],
        shading: { fill: "E2EFDA" },
      })
    );
  }
  
  dataRows.push(new TableRow({ children: avgCells }));
  
  // Create table
  const table = new Table({
    rows: [headerRow, ...dataRows],
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
  });
  
  return [
    new Paragraph({
      text: "CO-PO-PSO Matrix",
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 200 },
    }),
    table,
  ];
}

/**
 * Get cell shading color based on value
 */
function getCellShading(value) {
  if (value === 3) {
    return { fill: "C6EFCE" }; // Light green
  } else if (value === 2) {
    return { fill: "FFEB9C" }; // Light yellow
  } else if (value === 1) {
    return { fill: "FFC7CE" }; // Light red
  } else {
    return { fill: "F2F2F2" }; // Light gray
  }
}

/**
 * Generate reasoning section
 */
function generateReasoningSection(matrixResult) {
  if (!matrixResult.reasoning) {
    return [];
  }
  
  const sections = [
    new Paragraph({
      text: "Reasoning & Justification",
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 300 },
    }),
  ];
  
  // Sort PO and PSO numbers
  const poNumbers = [...(matrixResult.poNumbers || [])].sort((a, b) => {
    const numA = parseInt(a.replace('PO', ''));
    const numB = parseInt(b.replace('PO', ''));
    return numA - numB;
  });
  
  const psoNumbers = [...(matrixResult.psoNumbers || [])].sort((a, b) => {
    const numA = parseInt(a.replace('PSO', ''));
    const numB = parseInt(b.replace('PSO', ''));
    return numA - numB;
  });
  
  // Group by CO
  const coIds = Object.keys(matrixResult.reasoning).sort();
  
  for (const coId of coIds) {
    const coReasoning = matrixResult.reasoning[coId];
    const matches = [];
    
    // Add PO mappings
    for (const poNumber of poNumbers) {
      if (coReasoning[poNumber]) {
        matches.push({
          outcome: poNumber,
          reasoning: coReasoning[poNumber],
          value: matrixResult.matrix[coId][poNumber],
          type: 'PO'
        });
      }
    }
    
    // Add PSO mappings
    for (const psoNumber of psoNumbers) {
      if (coReasoning[psoNumber]) {
        matches.push({
          outcome: psoNumber,
          reasoning: coReasoning[psoNumber],
          value: matrixResult.matrix[coId][psoNumber],
          type: 'PSO'
        });
      }
    }
    
    if (matches.length > 0) {
      sections.push(
        new Paragraph({
          text: `${coId} Mappings:`,
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200, after: 150 },
        })
      );
      
      for (const match of matches) {
        sections.push(
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({ text: `${coId} → ${match.outcome} (${match.type}) (Level ${match.value}):`, bold: true })
            ],
          }),
          new Paragraph({
            text: match.reasoning || "No reasoning provided.",
            spacing: { after: 200 },
          })
        );
      }
    }
  }
  
  if (sections.length === 1) {
    sections.push(
      new Paragraph({
        text: "No mappings found. No reasoning to display.",
        spacing: { after: 200 },
      })
    );
  }
  
  return sections;
}

