import React, { useState, useEffect } from 'react';
import './index.css';

function App() {
  const [courseName, setCourseName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [courseOutcomes, setCourseOutcomes] = useState([
    { id: 'CO1', description: '', kLevel: '3' }
  ]);
  const [poData, setPOData] = useState(null);
  const [matrixResult, setMatrixResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [syllabusFile, setSyllabusFile] = useState(null);
  const [syllabusData, setSyllabusData] = useState(null);
  const [uploadingSyllabus, setUploadingSyllabus] = useState(false);

  // Get API URL from environment or use relative path
  const API_URL = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    // Fetch PO data on component mount
    fetch(`${API_URL}/api/po-data`)
      .then(res => res.json())
      .then(data => setPOData(data))
      .catch(err => {
        console.error('Error fetching PO data:', err);
        setError('Failed to load Program Outcomes data');
      });
  }, []);

  const addCourseOutcome = () => {
    const nextCO = `CO${courseOutcomes.length + 1}`;
    setCourseOutcomes([
      ...courseOutcomes,
      { id: nextCO, description: '', kLevel: '3' }
    ]);
  };

  const removeCourseOutcome = (index) => {
    if (courseOutcomes.length > 1) {
      const updated = courseOutcomes.filter((_, i) => i !== index);
      // Renumber COs
      const renumbered = updated.map((co, i) => ({
        ...co,
        id: `CO${i + 1}`
      }));
      setCourseOutcomes(renumbered);
    }
  };

  const updateCourseOutcome = (index, field, value) => {
    const updated = [...courseOutcomes];
    updated[index] = { ...updated[index], [field]: value };
    setCourseOutcomes(updated);
  };

  const handleSyllabusUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Please upload PDF, DOCX, DOC, or TXT file.');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size too large. Maximum size is 10MB.');
      return;
    }

    setUploadingSyllabus(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('syllabus', file);

      const response = await fetch(`${API_URL}/api/upload-syllabus`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload syllabus');
      }

      const result = await response.json();
      setSyllabusFile(file);
      setSyllabusData(result.syllabusData);
      setSuccess('Syllabus uploaded and parsed successfully!');
    } catch (err) {
      setError(err.message || 'Failed to upload syllabus');
      setSyllabusFile(null);
      setSyllabusData(null);
    } finally {
      setUploadingSyllabus(false);
    }
  };

  const removeSyllabus = () => {
    setSyllabusFile(null);
    setSyllabusData(null);
    setSuccess('Syllabus removed');
  };

  const handleDownloadDOCX = async () => {
    if (!matrixResult) {
      setError('Please generate the matrix first');
      return;
    }

    if (!courseCode.trim()) {
      setError('Course code is required for download');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('Starting DOCX download...');
      console.log('Matrix result:', matrixResult);
      
      const response = await fetch(`${API_URL}/api/download-docx`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matrixResult: matrixResult,
          courseName: courseName.trim(),
          courseCode: courseCode.trim(),
          courseOutcomes: courseOutcomes.map(co => ({
            id: co.id,
            description: co.description.trim(),
            kLevel: co.kLevel
          }))
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        let errorMessage = 'Failed to generate document';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          const text = await response.text();
          errorMessage = text || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Get the blob and create download link
      console.log('Converting response to blob...');
      const blob = await response.blob();
      console.log('Blob created, size:', blob.size, 'type:', blob.type);
      
      if (blob.size === 0) {
        throw new Error('Received empty file from server');
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${courseCode.trim()}_CO_PO_PSO_Matrix.docx`;
      a.style.display = 'none';
      document.body.appendChild(a);
      console.log('Triggering download...');
      a.click();
      
      // Clean up after a short delay
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        console.log('Download cleanup completed');
      }, 100);
      
      setSuccess('Document downloaded successfully!');
    } catch (err) {
      console.error('Download error:', err);
      setError(err.message || 'An error occurred while downloading the document');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMatrix = async () => {
    // Validation
    if (!courseName.trim()) {
      setError('Please enter a course name');
      return;
    }
    if (!courseCode.trim()) {
      setError('Please enter a course code');
      return;
    }
    
    const invalidCOs = courseOutcomes.filter(
      co => !co.description.trim()
    );
    if (invalidCOs.length > 0) {
      setError('Please provide descriptions for all Course Outcomes');
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/generate-matrix`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseName: courseName.trim(),
          courseCode: courseCode.trim(),
          courseOutcomes: courseOutcomes.map(co => ({
            id: co.id,
            description: co.description.trim(),
            kLevel: co.kLevel
          })),
          syllabusData: syllabusData // Include syllabus data if available
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate matrix');
      }

      const result = await response.json();
      // Debug: log averages to verify they're being received
      console.log('Full result:', result);
      console.log('Received averages:', result.averages);
      console.log('Averages type:', typeof result.averages);
      console.log('Averages keys:', result.averages ? Object.keys(result.averages) : 'null');
      
      // Ensure averages object exists
      if (!result.averages) {
        console.warn('WARNING: averages not found in result!');
      }
      
      setMatrixResult(result);
      setSuccess('CO-PO Matrix generated successfully!');
    } catch (err) {
      setError(err.message || 'An error occurred while generating the matrix');
      setMatrixResult(null);
    } finally {
      setLoading(false);
    }
  };

  const getCellClass = (value) => {
    if (value === null || value === undefined) return 'blank';
    return `level-${value}`;
  };

  const getCellDisplay = (value) => {
    if (value === null || value === undefined) return '-';
    return value;
  };

  const renderReasoning = () => {
    if (!matrixResult || !matrixResult.reasoning) return null;

    const reasoningItems = [];
    // Sort PO numbers numerically
    const poNumbers = [...(matrixResult.poNumbers || [])].sort((a, b) => {
      const numA = parseInt(a.replace('PO', ''));
      const numB = parseInt(b.replace('PO', ''));
      return numA - numB;
    });
    
    // Sort PSO numbers numerically
    const psoNumbers = [...(matrixResult.psoNumbers || [])].sort((a, b) => {
      const numA = parseInt(a.replace('PSO', ''));
      const numB = parseInt(b.replace('PSO', ''));
      return numA - numB;
    });

    // Group by CO
    for (const coId of Object.keys(matrixResult.reasoning)) {
      const coReasoning = matrixResult.reasoning[coId];
      const coMatches = [];

      // Add PO mappings
      for (const poNumber of poNumbers) {
        if (coReasoning[poNumber]) {
          coMatches.push({
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
          coMatches.push({
            outcome: psoNumber,
            reasoning: coReasoning[psoNumber],
            value: matrixResult.matrix[coId][psoNumber],
            type: 'PSO'
          });
        }
      }

      if (coMatches.length > 0) {
        reasoningItems.push({
          co: coId,
          matches: coMatches
        });
      }
    }

    if (reasoningItems.length === 0) {
      return <div className="no-reasoning">No mappings found. No reasoning to display.</div>;
    }

    return (
      <div>
        {reasoningItems.map((item, idx) => (
          <div key={idx} className="reasoning-item">
            <h3>{item.co} Mappings:</h3>
            {item.matches.map((match, matchIdx) => {
              // Extract qualitative and quantitative info from reasoning
              const qualitativeMatch = match.reasoning?.match(/Qualitative: ([^Q]+?)(?=\.|Quantitative:|$)/);
              const quantitativeMatch = match.reasoning?.match(/Quantitative \(Primary\): ([^Q]+?)(?=\.|Qualitative:|$)/);
              
              // Extract PI lists and ratio from quantitative justification
              const ratioMatch = match.reasoning?.match(/aligns with (\d+) out of (\d+) PIs.*?Ratio: (\d+)\/(\d+) = ([\d.]+)%/);
              const matchedPIsMatch = match.reasoning?.match(/Matched PIs: \[([^\]]+)\]/);
              const totalPIsMatch = match.reasoning?.match(/Total PIs for [^:]+: \[([^\]]+)\]/);
              const coverageMatch = match.reasoning?.match(/([\d.]+)% coverage/);
              
              // Extract matched PIs from qualitative
              const qualitativePIsMatch = match.reasoning?.match(/Qualitative: CO aligns with the following Performance Indicators \(PIs\) of [^:]+: ([^.]+)/);
              
              const hasQualitativeInfo = qualitativeMatch !== null || qualitativePIsMatch !== null;
              const hasQuantitativeInfo = quantitativeMatch !== null || ratioMatch !== null;
              
              // Extract alignment statement (everything before "Qualitative:" or "Quantitative:")
              const alignmentStatement = match.reasoning?.split(/Qualitative:|Quantitative/)[0]?.trim() || match.reasoning;
              
              // Get matched PIs list
              const matchedPIsList = matchedPIsMatch ? matchedPIsMatch[1].split(', ').map(p => p.trim()) : 
                                    (qualitativePIsMatch ? qualitativePIsMatch[1].split(', ').map(p => p.trim()) : []);
              
              // Get total PIs list
              const totalPIsList = totalPIsMatch ? totalPIsMatch[1].split(', ').map(p => p.trim()) : [];
              
              // Get ratio info
              const matchedCount = ratioMatch ? parseInt(ratioMatch[1]) : (matchedPIsList.length > 0 ? matchedPIsList.length : 0);
              const totalCount = ratioMatch ? parseInt(ratioMatch[2]) : (totalPIsList.length > 0 ? totalPIsList.length : 0);
              const coveragePercent = coverageMatch ? parseFloat(coverageMatch[1]) : (totalCount > 0 ? (matchedCount / totalCount * 100).toFixed(1) : '0');
              
              return (
                <div key={matchIdx} style={{ marginBottom: '18px', marginLeft: '15px', padding: '15px', background: '#252525', borderRadius: '8px', borderLeft: '3px solid #667eea' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                    <strong style={{ color: '#667eea', fontSize: '1.05em' }}>{item.co} → {match.outcome} ({match.type}) (Level {match.value})</strong>
                    {hasQuantitativeInfo && matchedCount > 0 && totalCount > 0 && (
                      <span style={{ 
                        padding: '6px 12px', 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                        borderRadius: '6px', 
                        fontSize: '0.9em', 
                        fontWeight: '600',
                        color: '#ffffff'
                      }}>
                        Ratio: {matchedCount}/{totalCount} PIs ({coveragePercent}%)
                      </span>
                    )}
                  </div>
                  
                  {/* Alignment Statement */}
                  <p style={{ marginTop: '10px', marginBottom: '15px', color: '#e0e0e0', lineHeight: '1.7', fontSize: '1.05em' }}>
                    {alignmentStatement}
                  </p>
                  
                  {/* Quantitative Justification - PRIMARY (shown first) - Shows ratio clearly */}
                  {hasQuantitativeInfo && (
                    <div style={{ marginTop: '12px', padding: '12px', background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)', borderRadius: '6px', borderLeft: '4px solid #764ba2', border: '2px solid rgba(118, 75, 162, 0.3)' }}>
                      <strong style={{ color: '#764ba2', fontSize: '0.95em', display: 'block', marginBottom: '8px' }}>📈 Quantitative Justification (PRIMARY - PI Coverage Ratio):</strong>
                      
                      {matchedCount > 0 && totalCount > 0 ? (
                        <div>
                          <div style={{ marginBottom: '12px', padding: '10px', background: 'rgba(118, 75, 162, 0.15)', borderRadius: '6px', border: '1px solid rgba(118, 75, 162, 0.3)' }}>
                            <p style={{ margin: '0 0 8px 0', color: '#ffffff', fontSize: '1em', fontWeight: '600' }}>
                              PI Coverage Ratio: <span style={{ color: '#764ba2', fontSize: '1.1em' }}>{matchedCount} / {totalCount}</span> = <span style={{ color: '#764ba2', fontSize: '1.1em' }}>{coveragePercent}%</span>
                            </p>
                            <p style={{ margin: 0, color: '#d0d0d0', fontSize: '0.9em' }}>
                              Mapping Strength: <strong style={{ color: '#764ba2' }}>Level {match.value}</strong> ({parseFloat(coveragePercent) > 60 ? 'High' : parseFloat(coveragePercent) >= 40 ? 'Medium' : 'Low'})
                            </p>
                          </div>
                          
                          {matchedPIsList.length > 0 && (
                            <div style={{ marginBottom: '10px' }}>
                              <p style={{ margin: '0 0 6px 0', color: '#d0d0d0', fontSize: '0.9em', fontWeight: '500' }}>
                                Matched PIs ({matchedPIsList.length}):
                              </p>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {matchedPIsList.map((pi, idx) => (
                                  <span key={idx} style={{
                                    padding: '4px 10px',
                                    background: 'rgba(118, 75, 162, 0.25)',
                                    borderRadius: '4px',
                                    fontSize: '0.85em',
                                    color: '#ffffff',
                                    fontWeight: '500',
                                    border: '1px solid rgba(118, 75, 162, 0.5)'
                                  }}>
                                    {pi}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {totalPIsList.length > 0 && (
                            <div>
                              <p style={{ margin: '0 0 6px 0', color: '#d0d0d0', fontSize: '0.9em', fontWeight: '500' }}>
                                Total PIs for {match.outcome} ({totalPIsList.length}):
                              </p>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {totalPIsList.map((pi, idx) => {
                                  const isMatched = matchedPIsList.includes(pi);
                                  return (
                                    <span key={idx} style={{
                                      padding: '4px 10px',
                                      background: isMatched ? 'rgba(118, 75, 162, 0.25)' : 'rgba(100, 100, 100, 0.15)',
                                      borderRadius: '4px',
                                      fontSize: '0.85em',
                                      color: isMatched ? '#ffffff' : '#888',
                                      fontWeight: isMatched ? '500' : '400',
                                      border: `1px solid ${isMatched ? 'rgba(118, 75, 162, 0.5)' : 'rgba(100, 100, 100, 0.3)'}`,
                                      textDecoration: isMatched ? 'none' : 'none',
                                      opacity: isMatched ? 1 : 0.7
                                    }}>
                                      {pi} {isMatched && '✓'}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          
                          {quantitativeMatch && (
                            <p style={{ marginTop: '10px', margin: 0, color: '#b0b0b0', lineHeight: '1.6', fontSize: '0.9em', fontStyle: 'italic' }}>
                              {quantitativeMatch[1].split('Matched PIs:')[0].trim()}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p style={{ margin: 0, color: '#d0d0d0', lineHeight: '1.6', fontSize: '0.95em' }}>
                          {quantitativeMatch ? quantitativeMatch[1].trim() : 'PI coverage calculation in progress...'}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {/* Qualitative Justification - Shows list of PIs that CO aligns with */}
                  {hasQualitativeInfo && (
                    <div style={{ marginTop: '12px', padding: '12px', background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)', borderRadius: '6px', borderLeft: '3px solid #667eea' }}>
                      <strong style={{ color: '#667eea', fontSize: '0.95em', display: 'block', marginBottom: '8px' }}>📊 Qualitative Justification (List of PIs):</strong>
                      {matchedPIsList.length > 0 ? (
                        <div>
                          <p style={{ margin: '0 0 8px 0', color: '#d0d0d0', lineHeight: '1.6', fontSize: '0.95em' }}>
                            <strong style={{ color: '#667eea' }}>CO aligns with the following PIs of {match.outcome}:</strong>
                          </p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                            {matchedPIsList.map((pi, idx) => (
                              <span key={idx} style={{
                                padding: '4px 10px',
                                background: 'rgba(102, 126, 234, 0.2)',
                                borderRadius: '4px',
                                fontSize: '0.85em',
                                color: '#667eea',
                                fontWeight: '500',
                                border: '1px solid rgba(102, 126, 234, 0.4)'
                              }}>
                              {pi}
                            </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p style={{ margin: 0, color: '#d0d0d0', lineHeight: '1.6', fontSize: '0.95em' }}>
                          {qualitativeMatch ? qualitativeMatch[1].trim() : 'CO alignment with PIs identified.'}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container">
      <div className="header">
        <h1>CO-PO Matrix Generator</h1>
        <p>Course Outcome - Program Outcome Mapping for CSE Program</p>
      </div>

      {error && (
        <div className="error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {success && (
        <div className="success">
          <strong>Success:</strong> {success}
        </div>
      )}

      <div className="form-section">
        <h2>Course Information</h2>
        <div className="form-group">
          <label htmlFor="courseName">Course Name *</label>
          <input
            type="text"
            id="courseName"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            placeholder="e.g., Data Structures and Algorithms"
          />
        </div>

        <div className="form-group">
          <label htmlFor="courseCode">Course Code *</label>
          <input
            type="text"
            id="courseCode"
            value={courseCode}
            onChange={(e) => setCourseCode(e.target.value)}
            placeholder="e.g., CS301"
          />
        </div>

        <div className="form-group">
          <label htmlFor="syllabus">Course Syllabus (Optional - for enhanced justifications)</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <input
              type="file"
              id="syllabus"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleSyllabusUpload}
              disabled={uploadingSyllabus}
              style={{ 
                flex: 1, 
                minWidth: '250px', 
                padding: '12px 16px', 
                border: '2px solid rgba(255, 255, 255, 0.1)', 
                borderRadius: '8px',
                background: '#252525',
                color: '#e0e0e0',
                cursor: 'pointer'
              }}
            />
            {syllabusFile && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '0.95em', color: '#6bff8f', fontWeight: '500' }}>
                  ✓ {syllabusFile.name}
                </span>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={removeSyllabus}
                  style={{ padding: '8px 16px', fontSize: '0.9em' }}
                >
                  Remove
                </button>
              </div>
            )}
          </div>
          {uploadingSyllabus && (
            <p style={{ marginTop: '8px', color: '#667eea', fontSize: '0.95em', fontWeight: '500' }}>
              Uploading and parsing syllabus...
            </p>
          )}
          <p style={{ marginTop: '8px', fontSize: '0.9em', color: '#888', fontStyle: 'italic' }}>
            Upload PDF, DOCX, DOC, or TXT file to generate more precise justifications based on course content.
          </p>
        </div>
      </div>

      <div className="form-section">
        <h2>Course Outcomes (COs)</h2>
        <div className="co-input-section">
          {courseOutcomes.map((co, index) => (
            <div key={index} className="co-item">
              <div className="co-item-header">
                <input
                  type="text"
                  value={co.id}
                  readOnly
                />
                <select
                  value={co.kLevel}
                  onChange={(e) => updateCourseOutcome(index, 'kLevel', e.target.value)}
                >
                  <option value="1">K1 - Remember</option>
                  <option value="2">K2 - Understand</option>
                  <option value="3">K3 - Apply</option>
                  <option value="4">K4 - Analyze</option>
                  <option value="5">K5 - Evaluate</option>
                  <option value="6">K6 - Create</option>
                </select>
                {courseOutcomes.length > 1 && (
                  <button
                    className="btn btn-danger"
                    onClick={() => removeCourseOutcome(index)}
                  >
                    Remove
                  </button>
                )}
              </div>
              <textarea
                value={co.description}
                onChange={(e) => updateCourseOutcome(index, 'description', e.target.value)}
                placeholder={`Enter description for ${co.id}...`}
                rows="5"
              />
            </div>
          ))}
          <button className="btn btn-add" onClick={addCourseOutcome}>
            + Add Course Outcome
          </button>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <button
          className="btn btn-primary"
          onClick={handleGenerateMatrix}
          disabled={loading}
        >
          {loading ? 'Generating Matrix...' : 'Generate CO-PO Matrix'}
        </button>
      </div>

      {loading && <div className="loading">Processing your request...</div>}

      {matrixResult && (() => {
        // Sort PO numbers numerically to ensure correct order
        const sortedPONumbers = [...(matrixResult.poNumbers || [])].sort((a, b) => {
          const numA = parseInt(a.replace('PO', ''));
          const numB = parseInt(b.replace('PO', ''));
          return numA - numB;
        });
        
        // Sort PSO numbers numerically
        const sortedPSONumbers = [...(matrixResult.psoNumbers || [])].sort((a, b) => {
          const numA = parseInt(a.replace('PSO', ''));
          const numB = parseInt(b.replace('PSO', ''));
          return numA - numB;
        });
        
        // Combine all columns: POs first, then PSOs
        const allColumns = [...sortedPONumbers, ...sortedPSONumbers];
        
        // Calculate averages on frontend if not provided (fallback)
        let calculatedAverages = matrixResult.averages || {};
        if (!matrixResult.averages || Object.keys(matrixResult.averages).length === 0) {
          console.log('Averages not found in response, calculating on frontend...');
          calculatedAverages = {};
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
          console.log('Frontend calculated averages:', calculatedAverages);
        }
        
        return (
          <>
            <div className="matrix-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                <h2 style={{ margin: 0 }}>CO-PO-PSO Matrix</h2>
                <button
                  className="btn btn-primary"
                  onClick={handleDownloadDOCX}
                  disabled={loading}
                  style={{ padding: '12px 24px', fontSize: '1em' }}
                >
                  📥 Download as DOCX
                </button>
              </div>
              <p style={{ marginBottom: '25px', color: '#b0b0b0', fontSize: '1.1em' }}>
                <strong style={{ color: '#ffffff' }}>Course:</strong> {courseName} ({courseCode})
              </p>
              <div style={{ overflowX: 'auto' }}>
                <table className="matrix-table">
                  <thead>
                    <tr>
                      <th>CO / PO-PSO</th>
                      {sortedPONumbers.map(po => (
                        <th key={po}>{po}</th>
                      ))}
                      {sortedPSONumbers.map(pso => (
                        <th key={pso} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderLeft: '3px solid #ffffff', fontWeight: '700' }}>
                          {pso}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(matrixResult.matrix).map(coId => (
                      <tr key={coId}>
                        <td style={{ fontWeight: 'bold', background: '#1f1f1f', color: '#667eea', fontSize: '1.1em' }}>
                          {coId}
                        </td>
                        {sortedPONumbers.map(po => (
                          <td key={po}>
                            <div className={`matrix-cell ${getCellClass(matrixResult.matrix[coId][po])}`}>
                              {getCellDisplay(matrixResult.matrix[coId][po])}
                            </div>
                          </td>
                        ))}
                        {sortedPSONumbers.map(pso => (
                          <td key={pso} style={{ borderLeft: '3px solid rgba(102, 126, 234, 0.5)' }}>
                            <div className={`matrix-cell ${getCellClass(matrixResult.matrix[coId][pso])}`}>
                              {getCellDisplay(matrixResult.matrix[coId][pso])}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                    {/* Average Row */}
                    <tr style={{ fontWeight: 'bold', background: '#1f1f1f', borderTop: '3px solid #667eea' }}>
                      <td style={{ fontWeight: 'bold', background: '#1f1f1f', color: '#ffffff', fontSize: '1.1em' }}>
                        Average
                      </td>
                      {sortedPONumbers.map(po => {
                        // Get average from calculated averages (either from backend or frontend fallback)
                        const avg = calculatedAverages[po];
                        
                        // Convert to number and validate
                        const numAvg = avg !== null && avg !== undefined ? Number(avg) : NaN;
                        const isValidAvg = !isNaN(numAvg) && numAvg >= 0;
                        
                        return (
                          <td key={po}>
                            <div className={`matrix-cell ${isValidAvg ? 'level-2' : 'blank'}`}>
                              {isValidAvg ? numAvg.toFixed(2) : '-'}
                            </div>
                          </td>
                        );
                      })}
                      {sortedPSONumbers.map(pso => {
                        // Get average from calculated averages
                        const avg = calculatedAverages[pso];
                        const numAvg = avg !== null && avg !== undefined ? Number(avg) : NaN;
                        const isValidAvg = !isNaN(numAvg) && numAvg >= 0;
                        
                        return (
                          <td key={pso} style={{ borderLeft: '3px solid rgba(102, 126, 234, 0.5)' }}>
                            <div className={`matrix-cell ${isValidAvg ? 'level-2' : 'blank'}`}>
                              {isValidAvg ? numAvg.toFixed(2) : '-'}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            <div style={{ marginTop: '30px', fontSize: '1em', color: '#b0b0b0', background: '#1f1f1f', padding: '20px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <p style={{ marginBottom: '15px', color: '#ffffff', fontWeight: '600', fontSize: '1.1em' }}><strong>PI Coverage Legend:</strong></p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                <p style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="matrix-cell level-3" style={{ display: 'inline-block', padding: '8px 12px', marginRight: '0' }}>3</span>
                  <span>High: &gt; 60% PI coverage</span>
                </p>
                <p style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="matrix-cell level-2" style={{ display: 'inline-block', padding: '8px 12px', marginRight: '0' }}>2</span>
                  <span>Medium: 40% – 60% PI coverage</span>
                </p>
                <p style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="matrix-cell level-1" style={{ display: 'inline-block', padding: '8px 12px', marginRight: '0' }}>1</span>
                  <span>Low: &lt; 40% PI coverage</span>
                </p>
                <p style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="matrix-cell blank" style={{ display: 'inline-block', padding: '8px 12px', marginRight: '0' }}>-</span>
                  <span>No correlation</span>
                </p>
              </div>
              <div style={{ marginTop: '15px', padding: '15px', background: '#252525', borderRadius: '8px', borderLeft: '3px solid #667eea' }}>
                <p style={{ marginBottom: '10px', color: '#667eea', fontWeight: '600', fontSize: '1.05em' }}><strong>Mapping Methodology (AICTE Examination Reform Policy):</strong></p>
                <p style={{ marginBottom: '8px', lineHeight: '1.6' }}>
                  <strong style={{ color: '#764ba2' }}>Quantitative Approach (Primary - PI Coverage Based):</strong> Mapping strength is determined by Performance Indicator (PI) coverage percentage using the following formula:
                </p>
                <div style={{ marginBottom: '12px', padding: '12px', background: 'rgba(118, 75, 162, 0.15)', borderRadius: '6px', border: '1px solid rgba(118, 75, 162, 0.3)' }}>
                  <p style={{ margin: '0 0 8px 0', color: '#ffffff', fontSize: '1.1em', fontWeight: '600', textAlign: 'center' }}>
                    Mapping Strength = <span style={{ color: '#764ba2' }}>(Number of PIs of a PO addressed by the CO / Total number of PIs for that PO) × 100</span>
                  </p>
                  <p style={{ margin: '8px 0 0 0', color: '#d0d0d0', fontSize: '0.9em', textAlign: 'center', fontStyle: 'italic' }}>
                    Coverage Percentage = (Matched PIs / Total PIs) × 100%
                  </p>
                </div>
                <p style={{ marginBottom: '8px', lineHeight: '1.6' }}>
                  The CO addresses specific PIs associated with each PO/PSO, and the coverage percentage determines the mapping level:
                  <ul style={{ marginTop: '8px', marginLeft: '20px', color: '#d0d0d0' }}>
                    <li><strong>Level 3 (High):</strong> Coverage &gt;60% (e.g., 3/5 PIs = 60% → Level 2, 4/5 PIs = 80% → Level 3)</li>
                    <li><strong>Level 2 (Medium):</strong> Coverage 40-60% (e.g., 2/5 PIs = 40% → Level 2, 3/5 PIs = 60% → Level 2)</li>
                    <li><strong>Level 1 (Low):</strong> Coverage &lt;40% (e.g., 1/5 PIs = 20% → Level 1)</li>
                  </ul>
                </p>
                <p style={{ marginBottom: '8px', lineHeight: '1.6' }}>
                  <strong>Qualitative Validation (Secondary - K-Level Based):</strong> K-level compatibility ensures cognitive alignment between CO and PO/PSO requirements, used as a validation check.
                </p>
                <p style={{ marginTop: '10px', fontSize: '0.95em', fontStyle: 'italic', color: '#888' }}>
                  This approach follows the new NBA pattern and AICTE Examination Reform Policy, using Performance Indicators for transparent, data-driven mapping justification. The matrix values reflect quantitative PI coverage calculated using the formula above, not K-level comparisons.
                </p>
              </div>
            </div>
            </div>

            <div className="reasoning-section">
              <h2>Reasoning & Justification</h2>
              {renderReasoning()}
            </div>
          </>
        );
      })()}
    </div>
  );
}

export default App;

