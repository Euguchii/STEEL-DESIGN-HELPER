let dataLoaded = false;

function loadExcelData() {
    console.log("Loading Excel data...");
    dataLoaded = false;
    
    // Show loading indicator
    const loadingIndicator = document.createElement('div');
    loadingIndicator.id = 'loading-indicator';
    loadingIndicator.innerHTML = 'Loading steel section data...';
    loadingIndicator.style.position = 'fixed';
    loadingIndicator.style.top = '10px';
    loadingIndicator.style.right = '10px';
    loadingIndicator.style.padding = '5px 10px';
    loadingIndicator.style.backgroundColor = '#ffe0e0';
    loadingIndicator.style.border = '1px solid #ffcccc';
    loadingIndicator.style.borderRadius = '3px';
    loadingIndicator.style.zIndex = '1000';
    document.body.appendChild(loadingIndicator);
    
    fetch('ASTMSPEC.xlsx')
        .then(res => res.arrayBuffer())
        .then(data => {
            const workbook = XLSX.read(data, { type: 'array' });
            const shapeSheet = workbook.Sheets[workbook.SheetNames[1]];
            const shapeRows = XLSX.utils.sheet_to_json(shapeSheet);

            console.log("Excel data loaded, processing", shapeRows.length, "rows");
            
            shapeRows.forEach(row => {
                if (row["AISC_Manual_Label"]) {
                    const label = row["AISC_Manual_Label"].trim().toUpperCase().replace(/\s/g, '');
                    steelData[label] = {
                        A: parseFloat(row.A),
                        tw: parseFloat(row.tw),
                        d: parseFloat(row.d),
                        bf: parseFloat(row.bf)
                    };
                }
            });
            
            console.log("Steel data loaded:", Object.keys(steelData).length, "sections");
            dataLoaded = true;
            
            // Remove loading indicator
            document.getElementById('loading-indicator').remove();
        })
        .catch(error => {
            console.error("Error loading Excel data:", error);
            // Fallback to some default data
            steelData["W12X45"] = { A: 13.2, tw: 0.335, d: 12.1, bf: 8.05 };
            
            // Update loading indicator
            document.getElementById('loading-indicator').innerHTML = 'Failed to load data. Using defaults.';
            document.getElementById('loading-indicator').style.backgroundColor = '#ffcccc';
            
            setTimeout(() => {
                document.getElementById('loading-indicator').remove();
            }, 3000);
            
            dataLoaded = true;
        });
}


        // Add this function to debug the steel data loading
function debugSteelData(sectionKey) {
    console.log("Looking for section: " + sectionKey);
    console.log("Available steel data keys:", Object.keys(steelData));
    console.log("Found section data:", steelData[sectionKey]);
    
    // Check if we have any keys that are similar
    const similarKeys = Object.keys(steelData).filter(key => 
        key.includes(sectionKey.replace('W', '',)) || 
        sectionKey.includes(key.replace('W', ''))
    );
    
    if (similarKeys.length > 0) {
        console.log("Similar keys found:", similarKeys);
    }
    
    return steelData[sectionKey];
}

// Modify the section retrieval in calculateZigzagNetArea and other functions
function getSectionData() {
    const shape = document.getElementById('shapeA').value.toUpperCase();
    const dim = document.getElementById('dimA').value.toUpperCase().replace(/\s/g, '');
    const sectionKey = shape + dim;
    
    console.log("Attempting to get section data for:", sectionKey);
    
    const section = steelData[sectionKey];
    
    // If not found, try with different formatting
    if (!section) {
        console.log("Section not found, trying alternative formats...");
        // Try alternative formats
        const altKey1 = shape + dim.replace('X', 'x');
        const altKey2 = shape + 'X' + dim.replace('X', '');
        
        if (steelData[altKey1]) {
            console.log("Found with format:", altKey1);
            return steelData[altKey1];
        } else if (steelData[altKey2]) {
            console.log("Found with format:", altKey2);
            return steelData[altKey2];
        }
        
        // Log all available keys for debugging
        console.log("Available keys:", Object.keys(steelData).join(", "));
        console.log("Using default values");
        
        // Return default values if not found
        return { 
            A: 13.2, 
            tw: 0.335, 
            d: 12.1, 
            bf: 8.05 
        };
    }
    
    console.log("Section found:", section);
    return section;
}

        // Add this function to create the interactive drawing area
function createInteractiveDrawingArea() {
    const flange = document.getElementById('dynamicFlange');
    flange.innerHTML = '';
    
    // Create a grid layout that users can click to toggle holes
    const nholeC = parseInt(document.getElementById('nholeC').value);
    const nholeR = parseInt(document.getElementById('nholeR').value);
    const s = parseFloat(document.getElementById('spacingS').value);
    const g = parseFloat(document.getElementById('spacingG').value);
    const pxPerIn = 20, leftStart = 60, topStart = 40;
    
    // Create instructions
    const instructions = document.createElement('div');
    instructions.innerHTML = '<strong>Click to add/remove holes</strong>';
    instructions.style.position = 'absolute';
    instructions.style.top = '5px';
    instructions.style.left = '5px';
    instructions.style.color = 'blue';
    flange.appendChild(instructions);
    
    // Create the grid
    for (let row = 0; row < nholeC; row++) {
        for (let col = 0; col < nholeR; col++) {
            const x = leftStart + col * s * pxPerIn;
            const y = topStart + row * g * pxPerIn;
            
            // Create grid cell background
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.style.width = '20px';
            cell.style.height = '20px';
            cell.style.border = '1px dashed #ccc';
            cell.style.position = 'absolute';
            cell.style.left = `${x - 5}px`;
            cell.style.top = `${y - 5}px`;
            cell.dataset.row = row + 1;
            cell.dataset.col = col + 1;
            flange.appendChild(cell);
            
            // Create hole (initially with full opacity)
            const hole = document.createElement('div');
            hole.className = 'hole';
            hole.style.width = '10px';
            hole.style.height = '10px';
            hole.style.borderRadius = '50%';
            hole.style.backgroundColor = 'black';
            hole.style.position = 'absolute';
            hole.style.left = `${x}px`;
            hole.style.top = `${y}px`;
            hole.dataset.row = row + 1;
            hole.dataset.col = col + 1;
            hole.dataset.active = '1'; // Default is active
            flange.appendChild(hole);
            
            // Make holes clickable
            hole.addEventListener('click', function() {
                if (this.dataset.active === '1') {
                    this.style.opacity = '0.2';
                    this.dataset.active = '0';
                    removedHoles.add(`${this.dataset.row}-${this.dataset.col}`);
                } else {
                    this.style.opacity = '1';
                    this.dataset.active = '1';
                    removedHoles.delete(`${this.dataset.row}-${this.dataset.col}`);
                }
            });
            
            // Add spacing labels
            if (row < nholeC - 1 && col === 0) {
                const label = document.createElement('div');
                label.style.position = 'absolute';
                label.style.left = `${x - 30}px`;
                label.style.top = `${y + g * pxPerIn / 2 - 8}px`;
                label.style.color = 'red';
                label.innerHTML = `${g}"`;
                flange.appendChild(label);
            }
            
            if (col < nholeR - 1 && row === 0) {
                const hLabel = document.createElement('div');
                hLabel.style.position = 'absolute';
                hLabel.style.left = `${x + s * pxPerIn / 2 - 8}px`;
                hLabel.style.top = `${y - 20}px`;
                hLabel.style.color = 'red';
                hLabel.innerHTML = `${s}"`;
                flange.appendChild(hLabel);
            }
        }
    }
    
    // Add clear and fill buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.style.position = 'absolute';
    buttonContainer.style.bottom = '10px';
    buttonContainer.style.right = '10px';
    
    const clearBtn = document.createElement('button');
    clearBtn.innerText = 'Clear All Holes';
    clearBtn.onclick = function() {
        document.querySelectorAll('.hole').forEach(hole => {
            hole.style.opacity = '0.2';
            hole.dataset.active = '0';
            removedHoles.add(`${hole.dataset.row}-${hole.dataset.col}`);
        });
    };
    
    const fillBtn = document.createElement('button');
    fillBtn.innerText = 'Fill All Holes';
    fillBtn.onclick = function() {
        document.querySelectorAll('.hole').forEach(hole => {
            hole.style.opacity = '1';
            hole.dataset.active = '1';
            removedHoles.delete(`${hole.dataset.row}-${hole.dataset.col}`);
        });
    };
    
    buttonContainer.appendChild(clearBtn);
    buttonContainer.appendChild(document.createTextNode(' '));
    buttonContainer.appendChild(fillBtn);
    flange.appendChild(buttonContainer);
}

// Replace updateHoleLayout with the interactive drawing version
function updateHoleLayout() {
    createInteractiveDrawingArea();
}

        // Global variables
        let removedHoles = new Set();
        let steelData = {};

        // ASTM material properties
        const astmData = {
            "A36": { Fy: 36, Fu: 58 }, 
            "A572GR42": { Fy: 42, Fu: 60 }, 
            "A572GR50": { Fy: 50, Fu: 65 },
            "A572GR55": { Fy: 55, Fu: 70 }, 
            "A572GR60": { Fy: 60, Fu: 75 }, 
            "A572GR65": { Fy: 65, Fu: 80 },
            "A588GR42": { Fy: 42, Fu: 63 }, 
            "A588GR46": { Fy: 46, Fu: 67 }, 
            "A588GR50": { Fy: 50, Fu: 70 },
            "A687": { Fy: 45, Fu: 75 }, 
            "A992": { Fy: 50, Fu: 65 }
        };


const styleElement = document.createElement('style');
styleElement.textContent = `
    .hole {
        cursor: pointer;
        transition: opacity 0.2s;
    }
    .hole:hover {
        box-shadow: 0 0 5px blue;
    }
    .grid-cell:hover {
        background-color: rgba(200, 200, 255, 0.3);
    }
    #dynamicFlange button {
        margin: 0 5px;
        padding: 5px 10px;
        background-color: #f0f0f0;
        border: 1px solid #999;
        border-radius: 3px;
        cursor: pointer;
    }
    #dynamicFlange button:hover {
        background-color: #e0e0e0;
    }
`;
document.head.appendChild(styleElement);

        // Toggle display based on design option
        function toggleShearDiv() {
    const selection = document.querySelector('input[name="designOption"]:checked').value;
    document.getElementById('shearDiv').style.display = (selection !== 'none') ? 'block' : 'none';
    document.getElementById('blockShearInputs').style.display = selection === 'block' ? 'block' : 'none';
    document.getElementById('column-inputs').style.display = selection === 'stagger' ? 'block' : 'none';
    document.getElementById('failurePathResult').style.display = selection === 'stagger' ? 'block' : 'none';
    document.getElementById('staggerReductionResult').style.display = selection === 'stagger' ? 'block' : 'none';
    
    // Initialize drawing area if stagger option is selected
    if (selection === 'stagger') {
        createInteractiveDrawingArea();
    }
}


function getHolePattern() {
    const nholeC = parseInt(document.getElementById('nholeC').value);
    const nholeR = parseInt(document.getElementById('nholeR').value);
    const pattern = [];
    
    for (let row = 0; row < nholeC; row++) {
        pattern[row] = [];
        for (let col = 0; col < nholeR; col++) {
            const holeElement = document.querySelector(`.hole[data-row="${row+1}"][data-col="${col+1}"]`);
            if (holeElement && holeElement.dataset.active === '1') {
                pattern[row][col] = 1; // Active hole
            } else {
                pattern[row][col] = 0; // Inactive hole
            }
        }
    }
      return pattern;
}

        
        // Get form input values
        function getInputValues() {
            return {
                ASTM: document.getElementById('ASpecA').value.toUpperCase().replace(/\./g, ''),
                dhole: parseFloat(document.getElementById('dholeA').value),
                nholeC: parseInt(document.getElementById('nholeC').value),
                nholeR: parseInt(document.getElementById('nholeR').value),
                spacingS: parseFloat(document.getElementById('spacingS').value),
                spacingG: parseFloat(document.getElementById('spacingG').value),
                caseId: document.getElementById('ulagCase').value,
                length: parseFloat(document.getElementById('lengthA').value),
                shape: document.getElementById('shapeA').value.toUpperCase(),
                dim: document.getElementById('dimA').value.toUpperCase().replace(/\s/g, ''),
                designOption: document.querySelector('input[name="designOption"]:checked').value
            };
        }

        // Calculate shear lag factor U
        function calculateU(caseId, xbar, length, bf, d) {
            switch (parseInt(caseId)) {
                case 1: return 1.0;
                case 2: 
                    const case2Value = 1 - (xbar / length);
                    return case2Value;
                case 7: 
                    const case2ForComp = 1 - (xbar / length);
                    return Math.max(bf / d >= 2 / 3 ? 0.9 : 0.8, case2ForComp);
                case 8: return 0.8;
                default: return 1.0;
            }
        }

        function updateColumnControls() {
    const columnInputs = document.getElementById('column-inputs');
    columnInputs.innerHTML = `
        <h3>Interactive Hole Pattern</h3>
        <div class="control-section">
            <div class="control-group">
                <label for="spacingS">Horizontal spacing (s):</label>
                <input type="number" id="spacingS" value="2" step="0.1" class="stagger-input"> in
                
                <label for="spacingG">Vertical spacing (g):</label>
                <input type="number" id="spacingG" value="1.5" step="0.1" class="gauge-input"> in
                
                <button onclick="updateGrid()">Update Grid</button>
            </div>
            
            <div class="control-group" style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed #ccc;">
                <h4>Path Calculation Options</h4>
                
                <div style="margin: 5px 0;">
                    <input type="radio" id="pathAuto" name="pathMethod" value="auto" checked>
                    <label for="pathAuto">Find critical path automatically</label>
                </div>
                
                <div style="margin: 5px 0;">
                    <input type="radio" id="pathManual" name="pathMethod" value="manual">
                    <label for="pathManual">Specify custom path</label>
                </div>
                
                <div id="customPathContainer" style="margin-top: 10px; display: none;">
                    <label for="customPathInput">Custom Path (format: 1-1,1-2,2-3,...):</label><br>
                    <input type="text" id="customPathInput" placeholder="row-col,row-col,..." style="width: 90%; margin-top: 5px;">
                    <div style="margin-top: 5px; font-size: 0.85em; color: #666;">
                        Example: 1-1,1-2,2-3 means path from hole (1,1) → (1,2) → (2,3)
                    </div>
                    <button id="visualizePath" style="margin-top: 8px;">Visualize Path</button>
                </div>
            </div>
        </div>
        
        <div id="dynamicFlange" style="position:relative; width:400px; height:300px; border:2px solid black; background:#f0f0f0; margin-top:20px;"></div>
    `;
    
    // Add event listeners for the spacing inputs
    document.getElementById('spacingS').addEventListener('change', updateGrid);
    document.getElementById('spacingG').addEventListener('change', updateGrid);
    
    // Add event listeners for path selection
    document.getElementById('pathAuto').addEventListener('change', function() {
        document.getElementById('customPathContainer').style.display = 'none';
    });
    
    document.getElementById('pathManual').addEventListener('change', function() {
        document.getElementById('customPathContainer').style.display = 'block';
    });
    
    // Add event listener for path visualization
    document.getElementById('visualizePath').addEventListener('click', visualizeCustomPath);
}
    function updateGrid() {
    // Save current pattern
    const pattern = getHolePattern();
    
    // Recreate the drawing area
    createInteractiveDrawingArea();
    
    // Restore pattern
    const nholeC = parseInt(document.getElementById('nholeC').value);
    const nholeR = parseInt(document.getElementById('nholeR').value);
    
    for (let row = 0; row < Math.min(nholeC, pattern.length); row++) {
        for (let col = 0; col < Math.min(nholeR, pattern[row].length); col++) {
            if (pattern[row][col] === 0) {
                const holeElement = document.querySelector(`.hole[data-row="${row+1}"][data-col="${col+1}"]`);
                if (holeElement) {
                    holeElement.style.opacity = '0.2';
                    holeElement.dataset.active = '0';
                    removedHoles.add(`${row+1}-${col+1}`);
                }
            }
        }
    }
}

function visualizeOptimalPath() {
    // First reset all path highlights
    document.querySelectorAll('.path-highlight').forEach(el => {
        el.remove();
    });
    
    const holePattern = getHolePattern();
    const path = findOptimalStagPath(holePattern);
    
    if (path.length < 2) {
        alert("Not enough active holes to create a path");
        return;
    }
    
    // Create visualization
    const flange = document.getElementById('dynamicFlange');
    
    // Create SVG container for path lines
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.classList.add('path-overlay', 'path-highlight');
    svg.style.position = 'absolute';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.pointerEvents = 'none';
    flange.appendChild(svg);
    
    // Draw lines and markers for the path
    for (let i = 0; i < path.length; i++) {
        const [row, col] = path[i];
        
        // Get the hole element
        const hole = document.querySelector(`.hole[data-row="${row+1}"][data-col="${col+1}"]`);
        if (!hole) continue;
        
        // Get coordinates
        const holeRect = hole.getBoundingClientRect();
        const flangeRect = flange.getBoundingClientRect();
        const x = holeRect.left + holeRect.width/2 - flangeRect.left;
        const y = holeRect.top + holeRect.height/2 - flangeRect.top;
        
        // Add number marker to hole
        const marker = document.createElement('div');
        marker.classList.add('path-marker', 'path-highlight');
        marker.style.position = 'absolute';
        marker.style.left = (x - 8) + 'px';
        marker.style.top = (y - 8) + 'px';
        marker.style.width = '16px';
        marker.style.height = '16px';
        marker.style.borderRadius = '50%';
        marker.style.backgroundColor = 'rgba(255,0,0,0.2)';
        marker.style.border = '2px solid red';
        marker.style.color = 'red';
        marker.style.display = 'flex';
        marker.style.alignItems = 'center';
        marker.style.justifyContent = 'center';
        marker.style.fontWeight = 'bold';
        marker.style.fontSize = '10px';
        marker.style.zIndex = '10';
        marker.textContent = i + 1;
        flange.appendChild(marker);
        
        // Draw line to next point
        if (i < path.length - 1) {
            const [nextRow, nextCol] = path[i+1];
            const nextHole = document.querySelector(`.hole[data-row="${nextRow+1}"][data-col="${nextCol+1}"]`);
            
            if (nextHole) {
                const nextRect = nextHole.getBoundingClientRect();
                const x2 = nextRect.left + nextRect.width/2 - flangeRect.left;
                const y2 = nextRect.top + nextRect.height/2 - flangeRect.top;
                
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', x);
                line.setAttribute('y1', y);
                line.setAttribute('x2', x2);
                line.setAttribute('y2', y2);
                line.setAttribute('stroke', 'red');
                line.setAttribute('stroke-width', '2');
                svg.appendChild(line);
            }
        }
    }
    
    // Set the path to the custom path input
    const customPathInput = document.getElementById('customPathInput');
    if (customPathInput) {
        const pathStr = path.map(p => `${p[0]+1}-${p[1]+1}`).join(',');
        customPathInput.value = pathStr;
    }
}


function findOptimalStagPath(holePattern) {
    const rows = holePattern.length;
    const cols = holePattern[0].length;
    const path = [];
    
    // Start searching from the top row
    for (let row = 0; row < rows; row++) {
        // First try to find a hole in column 1 for this row
        if (holePattern[row][0] === 1) {
            path.push([row, 0]);
            continue; // Move to next row
        }
        
        // If no hole in column 1, find one in any other column
        let holeFound = false;
        for (let col = 1; col < cols; col++) {
            if (holePattern[row][col] === 1) {
                path.push([row, col]);
                holeFound = true;
                break; // Only take one hole per row
            }
        }
        
        // Skip rows with no holes
        if (!holeFound) {
            continue;
        }
    }
    
    return path;
}
    





  
function calculateZigzagNetArea(Ag, holePattern, holeDia, s, g) {
    const d_hole = holeDia + 1/8; // Add 1/8" for standard hole
    const nholeC = holePattern.length; // rows
    const nholeR = holePattern[0].length; // columns
    
    // Get section properties for hole area calculation
    const sectionKey = document.getElementById('shapeA').value + document.getElementById('dimA').value.toUpperCase().replace(/\s/g, '');
    const section = steelData[sectionKey] || { tw: 0.335 }; // Use default if not found
    const tw = section.tw; // Web thickness for hole area
    
    // Calculate standard net area using the critical column approach
    const standardResult = calculateStandardNetArea(
        Ag,
        holePattern,
        holeDia,
        tw
    );
    const standardNetArea = standardResult.netArea;
    
    // Check if manual path selection is active
    const useManualPath = document.getElementById('pathManual') && 
                         document.getElementById('pathManual').checked;
    
    if (useManualPath) {
        // Use custom path from input
        const pathInput = document.getElementById('customPathInput').value.trim();
        if (!pathInput) {
            alert("Please enter a valid path or switch to automatic calculation");
            return {
                standardNetArea: standardNetArea,
                netArea: standardNetArea,
                criticalPath: "No valid path specified",
                staggerReduction: 0
            };
        }
        
        try {
            // Parse the path string into array of [row, col] coordinates
            const customPath = pathInput.split(',').map(coord => {
                const [row, col] = coord.trim().split('-').map(Number);
                if (isNaN(row) || isNaN(col) || row < 1 || col < 1 || 
                    row > nholeC || col > nholeR || holePattern[row-1][col-1] !== 1) {
                    throw new Error(`Invalid or inactive hole at position (${row},${col})`);
                }
                return [row-1, col-1]; // Convert to 0-based indexing
            });
            
            if (customPath.length < 2) {
                throw new Error("Path must contain at least 2 points");
            }
            
            // Calculate net area for this custom path
            let holeLoss = customPath.length * d_hole * tw;
            let totalStaggerReduction = 0;
            
            // Calculate stagger reduction for each diagonal segment
            for (let i = 1; i < customPath.length; i++) {
                const [prevRow, prevCol] = customPath[i-1];
                const [currRow, currCol] = customPath[i];
                
                // If moving diagonally (both row and column change)
                if (prevRow !== currRow && prevCol !== currCol) {
                    const dx = Math.abs(currCol - prevCol) * s; // Horizontal spacing
                    const dy = Math.abs(currRow - prevRow) * g; // Vertical spacing
                    const staggerReduction = Math.pow(dx, 2) / (4 * dy);
                    totalStaggerReduction += staggerReduction;
                }
            }
            
            // Calculate net area for this path
            const netArea = Ag - holeLoss + (totalStaggerReduction * tw);
            
            // Path summary for display
            let pathSummary = `Custom Path: `;
            customPath.forEach((p, idx) => {
                pathSummary += `(${p[0]+1},${p[1]+1})`;
                if (idx < customPath.length - 1) pathSummary += " → ";
            });
            
            return {
                standardNetArea: standardNetArea,
                netArea: netArea,
                criticalPath: pathSummary,
                staggerReduction: totalStaggerReduction * tw
            };
            
        } catch (error) {
            alert("Error in custom path: " + error.message);
            return {
                standardNetArea: standardNetArea,
                netArea: standardNetArea,
                criticalPath: "Error in path: " + error.message,
                staggerReduction: 0
            };
        }
    } else {
        // Use new optimized path algorithm - one hole per row prioritizing column 1
        const path = findOptimalStagPath(holePattern);
        
        if (path.length < 2) {
            return {
                standardNetArea: standardNetArea,
                netArea: standardNetArea,
                criticalPath: "Insufficient holes for stagger calculation",
                staggerReduction: 0
            };
        }
        
        // Calculate net area
        let holeLoss = path.length * d_hole * tw;
        let totalStaggerReduction = 0;
        
        // Calculate stagger reduction for each diagonal segment
        for (let i = 1; i < path.length; i++) {
            const [prevRow, prevCol] = path[i-1];
            const [currRow, currCol] = path[i];
            
            // If moving diagonally (both row and column change)
            if (prevRow !== currRow && prevCol !== currCol) {
                const dx = Math.abs(currCol - prevCol) * s; // Horizontal spacing
                const dy = Math.abs(currRow - prevRow) * g; // Vertical spacing
                const staggerReduction = Math.pow(dx, 2) / (4 * dy);
                totalStaggerReduction += staggerReduction;
            }
        }
        
        // Calculate net area for this path
        const netArea = Ag - holeLoss + (totalStaggerReduction * tw);
        
        // Path summary for display
        let pathSummary = `One-per-row Path: `;
        path.forEach((p, idx) => {
            pathSummary += `(${p[0]+1},${p[1]+1})`;
            if (idx < path.length - 1) pathSummary += " → ";
        });
        
        return {
            standardNetArea: standardNetArea,
            netArea: netArea,
            criticalPath: pathSummary,
            staggerReduction: totalStaggerReduction * tw
        };
    }
}


function updateColumnControls() {
    const columnInputs = document.getElementById('column-inputs');
    columnInputs.innerHTML = `
        <h3>Interactive Hole Pattern</h3>
        <div class="control-section">
            <div class="control-group">
                <label for="spacingS">Horizontal spacing (s):</label>
                <input type="number" id="spacingS" value="2" step="0.1" class="stagger-input"> in
                
                <label for="spacingG">Vertical spacing (g):</label>
                <input type="number" id="spacingG" value="1.5" step="0.1" class="gauge-input"> in
                
                <button onclick="updateGrid()">Update Grid</button>
            </div>
            
            <div class="control-group" style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed #ccc;">
                <h4>Path Calculation Options</h4>
                
                <div style="margin: 5px 0;">
                    <input type="radio" id="pathAuto" name="pathMethod" value="auto" checked>
                    <label for="pathAuto">One hole per row (prioritize column 1)</label>
                </div>
                
                <div style="margin: 5px 0;">
                    <input type="radio" id="pathLegacy" name="pathMethod" value="legacy">
                    <label for="pathLegacy">Find critical zigzag path (legacy)</label>
                </div>
                
                <div style="margin: 5px 0;">
                    <input type="radio" id="pathManual" name="pathMethod" value="manual">
                    <label for="pathManual">Specify custom path</label>
                </div>
                
                <div style="margin-top: 10px;">
                    <button onclick="visualizeOptimalPath()">Preview Current Path</button>
                </div>
                
                <div id="customPathContainer" style="margin-top: 10px; display: none;">
                    <label for="customPathInput">Custom Path (format: 1-1,1-2,2-3,...):</label><br>
                    <input type="text" id="customPathInput" placeholder="row-col,row-col,..." style="width: 90%; margin-top: 5px;">
                    <div style="margin-top: 5px; font-size: 0.85em; color: #666;">
                        Example: 1-1,1-2,2-3 means path from hole (1,1) → (1,2) → (2,3)
                    </div>
                    <button id="visualizePath" style="margin-top: 8px;">Visualize Path</button>
                </div>
            </div>
        </div>
        
        <div id="dynamicFlange" style="position:relative; width:400px; height:300px; border:2px solid black; background:#f0f0f0; margin-top:20px;"></div>
    `;
    
    // Add event listeners
    document.getElementById('spacingS').addEventListener('change', updateGrid);
    document.getElementById('spacingG').addEventListener('change', updateGrid);
    
    // Add event listeners for path selection
    document.getElementById('pathAuto').addEventListener('change', function() {
        document.getElementById('customPathContainer').style.display = 'none';
    });
    
    document.getElementById('pathLegacy').addEventListener('change', function() {
        document.getElementById('customPathContainer').style.display = 'none';
    });
    
    document.getElementById('pathManual').addEventListener('change', function() {
        document.getElementById('customPathContainer').style.display = 'block';
    });
    
    // Add event listener for path visualization
    document.getElementById('visualizePath').addEventListener('click', visualizeCustomPath);
    
    // Initialize the drawing area
    createInteractiveDrawingArea();
}


function findAllPathsRowBased(holePattern, startRow, startCol, maxCols, maxRows) {
    // Base case: if we've reached the last row
    if (startRow === maxRows - 1) {
        // Return current position as a single-element path if there's a hole here
        return holePattern[startRow][startCol] === 1 ? [[[startRow, startCol]]] : [];
    }
    
    let paths = [];
    
    // If there's a hole at the current position
    if (holePattern[startRow][startCol] === 1) {
        // Try moving to each hole in the next row
        for (let nextCol = 0; nextCol < maxCols; nextCol++) {
            const subPaths = findAllPathsRowBased(holePattern, startRow + 1, nextCol, maxCols, maxRows);
            
            // Attach current position to each subpath
            subPaths.forEach(subPath => {
                paths.push([[startRow, startCol], ...subPath]);
            });
        }
        
        // If no valid subpaths were found, return current position as endpoint
        if (paths.length === 0) {
            paths.push([[startRow, startCol]]);
        }
    }
    
    return paths;
}




// First, let's modify the calculateStandardNetArea function to find critical rows instead of columns
function calculateStandardNetArea(Ag, holeDia, totalHoles, tw) {
    const d_hole = holeDia + 1/8; // Add 1/8" for standard hole
    
    // Calculate net area by subtracting hole area from gross area
    const holeLoss = totalHoles * d_hole * tw;
    const netArea = Ag - holeLoss;
    
    return {
        netArea: netArea,
        holesCount: totalHoles
    };
}

   function performCalculations() {
    if (!dataLoaded) {
        alert("Steel section data is still loading. Please wait a moment and try again.");
        return;
    }
    const inputValues = getInputValues();
    
    // Validate inputs
    if (isNaN(inputValues.dhole) || inputValues.dhole <= 0) {
        alert("Please enter a valid hole diameter");
        return;
    }
    
    if (isNaN(inputValues.length) || inputValues.length <= 0) {
        alert("Please enter a valid length");
        return;
    }
    
    // Get material properties
    const material = astmData[inputValues.ASTM] || { Fy: 36, Fu: 58 };
    
    // Get section properties from steel data
    const sectionKey = inputValues.shape + inputValues.dim;
    const section = steelData[sectionKey] || { A: 0, d: 0, bf: 0, tw: 0 };
    
    if (!section.A) {
        // Default value if section not found
        section.A = 13.2;
        section.d = 12.1;
        section.bf = 8.05;
        section.tw = 0.335;
        console.warn("Section not found, using default values");
    }
    
    // Gross area
    const Ag = section.A;
    document.getElementById('AG').textContent = Ag.toFixed(3) + " in²";
    
    // Variables for net area and effective net area
    let An, Ae, criticalPathText = "", staggerReductionValue = 0;
    let standardNetArea = 0;
    
    // Calculate xbar for U (simplified - center of gravity to connection)
    const xbar = section.bf / 2;
        
    // Calculate U - shear lag factor
    const U = calculateU(
        inputValues.caseId,
        xbar, 
        inputValues.length,
        section.bf,
        section.d
    );
    
    if (inputValues.designOption === 'stagger') {
        const holePattern = getHolePattern();
        
        // Check which path method is selected
        let useManualPath = false;
        let useLegacyPath = false;
        
        if (document.getElementById('pathManual') && document.getElementById('pathManual').checked) {
            useManualPath = true;
        } else if (document.getElementById('pathLegacy') && document.getElementById('pathLegacy').checked) {
            useLegacyPath = true;
        }
        
        let result;
        
        if (useLegacyPath) {
            // Use the original zigzag function
            result = calculateLegacyZigzagNetArea(
                Ag, 
                holePattern, 
                inputValues.dhole, 
                inputValues.spacingS, 
                inputValues.spacingG
            );
        } else {
            // Use our new improved calculation
            result = calculateZigzagNetArea(
                Ag, 
                holePattern, 
                inputValues.dhole, 
                inputValues.spacingS, 
                inputValues.spacingG
            );
        }
        
        // Visualize the path after calculation
        if (!useManualPath) {
            visualizeOptimalPath();
        }
        
        standardNetArea = result.standardNetArea;
        An = result.netArea;  // This is the net area without the shear lag factor
        Ae = An * U;         // Apply shear lag factor to get effective net area
        criticalPathText = result.criticalPath;
        staggerReductionValue = result.staggerReduction;
        
        document.getElementById('criticalPath').textContent = criticalPathText;
        document.getElementById('staggerReduction').textContent = staggerReductionValue.toFixed(3) + " in²";
        
        // Update results to show both values - NET AREA first
        document.getElementById('AE').textContent = 
            `${An.toFixed(3)} in² (With stagger effect)`;
            
    } else if (inputValues.designOption === 'block') {
        // Block shear calculation
        const Agv = parseFloat(document.getElementById('Agv').value) || 0;
        const Anv = parseFloat(document.getElementById('Anv').value) || 0;
        const Ant = parseFloat(document.getElementById('Ant').value) || 0;
        
        if (Agv <= 0 || Anv <= 0 || Ant <= 0) {
            alert("Please enter valid values for block shear areas");
            return;
        }
        
        // AISC Equation J4-5
        const blockShear1 = 0.60 * material.Fu * Anv + material.Fy * Agv;
        // AISC Equation J4-5 (alternative)
        const blockShear2 = 0.60 * material.Fy * Agv + material.Fu * Ant;
        
        // For block shear, An is the minimum of the two calculations
        An = Math.min(blockShear1, blockShear2);
        Ae = An;  // For block shear, we don't apply the U factor
        
        document.getElementById('AE').textContent = An.toFixed(3) + " in² (Block shear)";
        
    } 
    
    else {
    // Simple calculation with holes - just count total holes in a column
    const tw = section.tw;
    const nholeC = parseInt(document.getElementById('nholeC').value);
    
    // Use function to calculate standard net area
    const standardAreaResult = calculateStandardNetArea(
        Ag,
        inputValues.dhole,
        nholeC, // Just pass the number of holes in a column
        tw
    );
    
    An = standardAreaResult.netArea;  // This is the net area (An)
    Ae = An * U;  // The effective net area (Ae) applies the shear lag factor
    
    // Show detailed information about NET AREA
    document.getElementById('AE').textContent = 
        `${An.toFixed(3)} in² (${standardAreaResult.holesCount} holes in column)`;
}
    
    // Calculate yielding strength (uses gross area)
    const Py = material.Fy * Ag;
    
    // Calculate fracture strength (uses effective net area)
    const Pf = material.Fu * Ae;  // Use Ae (effective net area)
    
    // Determine which limit state controls
    const isYieldingControls = Py <= Pf;
    
    // Display yielding strength with highlight if it controls
    document.getElementById('YC').innerHTML = isYieldingControls 
        ? `<span style="color:green; font-weight:bold">${Py.toFixed(1)} kips (CONTROLS)</span>` 
        : `${Py.toFixed(1)} kips`;
    
    // Display fracture strength with highlight if it controls
    document.getElementById('FS').innerHTML = !isYieldingControls 
        ? `<span style="color:green; font-weight:bold">${Pf.toFixed(1)} kips (CONTROLS)</span>` 
        : `${Pf.toFixed(1)} kips`;
    
    // Nominal strength is minimum of yield and fracture
    const Pn = Math.min(Py, Pf);
    
    // LRFD design strength
    const phiPn = 0.9 * Py; // φ = 0.9 for tension yielding
    const phiPnFracture = 0.75 * Pf; // φ = 0.75 for fracture
    const phiPnFinal = Math.min(phiPn, phiPnFracture);
    
    // Add text to indicate which governs LRFD
    const lrfdGoverns = phiPn <= phiPnFracture ? "yielding" : "fracture";
    document.getElementById('LRFD').textContent = `${phiPnFinal.toFixed(1)} kips (${lrfdGoverns})`;
    
    // ASD allowable strength
    // Use appropriate safety factor based on which failure mode controls
    const safetyFactor = isYieldingControls ? 1.67 : 2.0;
    const PnASD = Pn / safetyFactor;
    document.getElementById('ASD').textContent = `${PnASD.toFixed(1)} kips (${isYieldingControls ? "yielding" : "fracture"})`;
}

        // Event listeners
        document.querySelector('.Calculate').addEventListener('click', performCalculations);

document.querySelectorAll('input[name="designOption"]').forEach(el => {
    el.addEventListener('change', function() {
        toggleShearDiv();
        if (this.value === 'stagger') {
            updateColumnControls();
            createInteractiveDrawingArea();
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    loadExcelData();
    toggleShearDiv();
});