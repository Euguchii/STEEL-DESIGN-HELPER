
/ Column Load Capacity Calculator - Improved Initialization
document.addEventListener("DOMContentLoaded", function() {
    // Initialize the application with error handling
    initializeColumnCalculator();
});

// Main initialization function
function initializeColumnCalculator() {
    try {
        console.log("Initializing Column Load Capacity Calculator...");
        
        // Get references to input elements with error checking
        const designButton = document.getElementById("DesignC");
        const astmSelect = getRequiredElement("ASTMinputC", "ASTM specification selector");
        const designMethodSelect = getRequiredElement("designMethod", "Design method selector");
        const deadLoadInput = getRequiredElement("DeadLoad", "Dead load input");
        const liveLoadInput = getRequiredElement("LiveLoad", "Live load input");
        const lengthInput = getRequiredElement("LenghtDC", "Column length input");
        
        // Get references to support options
        const topFixed = document.getElementById("topfixedC");
        const topPinned = document.getElementById("toppinnedC");
        const topFree = document.getElementById("topfreeC");
        const botFixed = document.getElementById("botfixedC");
        const botPinned = document.getElementById("botpinnedC");
        const botFree = document.getElementById("botfreeC");
        const noSupport = document.getElementById("NosupportC");
        const withSupport = document.getElementById("supportC");
        const supportAmountInput = document.getElementById("supprtamountC");
        
        // Get references to lateral support options
        const lateralSupportTypes = [
            {
                fixed: document.getElementById("fixed1C"),
                pinned: document.getElementById("pinned1C"),
                free: document.getElementById("Free1C"),
                location: document.getElementById("location1C")
            },
            {
                fixed: document.getElementById("fixed2C"),
                pinned: document.getElementById("pinned2C"),
                free: document.getElementById("Free2C"),
                location: document.getElementById("location2C")
            },
            {
                fixed: document.getElementById("fixed3C"),
                pinned: document.getElementById("pinned3C"),
                free: document.getElementById("Free3C"),
                location: document.getElementById("location3C")
            }
        ];
        
        // Set up event listeners
        setupEventListeners(designButton, noSupport, withSupport);
        
        console.log("Column Calculator initialized successfully");
    } catch (error) {
        console.error("Error initializing Column Calculator:", error);
        displayErrorMessage("Failed to initialize the column calculator. Please check console for details.");
    }
}

// Helper function to get required DOM elements
function getRequiredElement(id, description) {
    const element = document.getElementById(id);
    if (!element) {
        throw new Error(`Required ${description} (ID: ${id}) not found in document`);
    }
    return element;
}

// Function to set up event listeners
function setupEventListeners(designButton, noSupport, withSupport) {
    // Add event listener to design button
    if (designButton) {
        designButton.addEventListener("click", performDesign);
        console.log("Design button event listener attached");
    } else {
        console.warn("Design button not found, calculation functionality will be limited");
    }
    
    // Add event listeners to support radio buttons
    if (noSupport) {
        noSupport.addEventListener("change", handleSupportVisibilityC);
    }
    if (withSupport) {
        withSupport.addEventListener("change", handleSupportVisibilityC);
    }
    
    // Call support visibility handler to set initial state
    handleSupportVisibilityC();
}

// Display error message to user
function displayErrorMessage(message) {
    // Create error message element
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.style.color = "red";
    errorDiv.style.padding = "10px";
    errorDiv.style.marginBottom = "10px";
    errorDiv.style.backgroundColor = "#ffeeee";
    errorDiv.style.border = "1px solid red";
    errorDiv.style.borderRadius = "5px";
    errorDiv.textContent = message;
    
    // Find a good place to display it
    const resultDiv = document.querySelector(".Result123");
    if (resultDiv) {
        resultDiv.prepend(errorDiv);
    } else {
        // If result div not found, insert at beginning of body
        const body = document.querySelector("body");
        if (body && body.firstChild) {
            body.insertBefore(errorDiv, body.firstChild);
        }
    }
}

// Handle lateral support visibility - improved with error checks
function handleSupportVisibilityC() {
    try {
        const supportCDiv = document.getElementById("SupportC");
        const withSupport = document.getElementById("supportC");
        
        if (supportCDiv) {
            if (withSupport && withSupport.checked) {
                supportCDiv.style.display = "block";
            } else {
                supportCDiv.style.display = "none";
            }
        } else {
            console.warn("Support div container not found");
        }
    } catch (error) {
        console.error("Error handling support visibility:", error);
    }
}
    // Database of W-shapes (sample data - replace with actual database values)
    // Format: [Shape, Weight(lb/ft), Area(in²), d(in), tw(in), bf(in), tf(in), kdes(in), k1(in), gage(in), rx(in), ry(in), Zx(in³), Zy(in³), Sx(in³), Sy(in³), rts(in), ho(in), J(in⁴), Cw(in⁶), Wno(in²), Sw1(in⁴), Sw2(in⁴), Sw3(in⁴), Qf(in³), Qw(in³), LRFD_Capacity(kips), ASD_Capacity(kips)]
    const wShapeDatabase = {
        "W14": [
            ["W14X730", 730, 215, 22.4, 1.88, 17.9, 3.07, 4, 1.5, 7.5, 9.80, 5.81, 1830, 838, 1550, 546, 6.29, 16.2, 2590, 98800, 205, 7720, 545, 1.88, 273, 633, 5500, 3700],
            ["W14X605", 605, 178, 21.6, 1.56, 17.4, 2.59, 3.5, 1.5, 7.5, 9.43, 5.64, 1460, 675, 1240, 441, 6.10, 16.4, 1470, 73400, 169, 6220, 437, 1.56, 212, 483, 4600, 3100],
            ["W14X500", 500, 147, 20.7, 1.31, 16.9, 2.19, 3, 1.5, 7.5, 9.09, 5.49, 1170, 545, 991, 356, 5.94, 16.3, 887, 56000, 142, 4960, 351, 1.31, 169, 379, 3800, 2500],
            ["W14X398", 398, 117, 19.7, 1.06, 16.5, 1.77, 2.5, 1.5, 7.5, 8.75, 5.38, 901, 431, 763, 279, 5.82, 16.2, 456, 42000, 116, 3820, 269, 1.06, 134, 297, 3000, 2000],
            ["W14X283", 283, 83.3, 18.0, 0.938, 15.9, 1.56, 2.25, 1, 6, 8.22, 5.16, 613, 302, 515, 195, 5.55, 14.9, 184, 26200, 84.7, 2570, 196, 0.938, 92.5, 194, 2100, 1400],
            ["W14X211", 211, 62.0, 16.5, 0.75, 15.6, 1.31, 2, 1, 6, 7.83, 5.06, 445, 227, 373, 146, 5.43, 13.9, 91.7, 18000, 65.1, 1870, 146, 0.75, 69.1, 144, 1600, 1050]
        ],
        "W12": [
            ["W12X336", 336, 98.8, 16.8, 1.09, 13.4, 1.94, 2.5, 1, 5.5, 7.17, 4.22, 674, 291, 564, 187, 4.64, 12.9, 175, 14600, 75.8, 2250, 187, 1.09, 93.7, 245, 2500, 1700],
            ["W12X279", 279, 82.0, 16.1, 0.938, 13.1, 1.66, 2.25, 1, 5.5, 6.98, 4.14, 543, 237, 454, 152, 4.54, 12.8, 110, 11500, 65.2, 1810, 156, 0.938, 75.9, 197, 2100, 1400],
            ["W12X230", 230, 67.7, 15.4, 0.812, 12.8, 1.44, 2, 1, 5.5, 6.83, 4.08, 435, 193, 362, 124, 4.47, 12.5, 68.0, 8950, 55.4, 1450, 125, 0.812, 62.1, 159, 1700, 1150],
            ["W12X190", 190, 55.8, 14.7, 0.75, 12.5, 1.25, 1.75, 0.75, 5.5, 6.65, 4.01, 348, 157, 289, 101, 4.36, 12.2, 42.4, 6780, 47.3, 1160, 101, 0.75, 50.5, 128, 1400, 950],
            ["W12X152", 152, 44.7, 14.0, 0.625, 12.2, 1.06, 1.5, 0.75, 5.5, 6.49, 3.95, 275, 125, 229, 80.7, 4.28, 11.9, 24.5, 5260, 39.7, 914, 80.6, 0.625, 40.3, 102, 1150, 750],
            ["W12X120", 120, 35.3, 13.4, 0.55, 12.0, 0.9, 1.25, 0.75, 5.5, 6.41, 3.9, 214, 99.3, 177, 63.8, 4.21, 11.6, 15.1, 4000, 32.8, 710, 63.7, 0.55, 31.9, 80.4, 900, 600]
        ],
        "W10": [
            ["W10X112", 112, 33.0, 11.4, 0.755, 10.4, 1.25, 1.75, 0.75, 5.5, 4.98, 3.03, 170, -1, 146, 60.0, 3.43, 8.89, 11.5, 1660, -1, 583, 60.0, 0.755, 30.0, 66.5, 850, 550],
            ["W10X100", 100, 29.4, 11.1, 0.68, 10.3, 1.12, 1.5, 0.75, 5.5, 4.91, 3.01, 150, 77.7, 129, 53.1, 3.39, 8.86, 8.36, 1450, 28.9, 518, 53.0, 0.68, 26.5, 58.6, 750, 500],
            ["W10X88", 88, 25.9, 10.8, 0.605, 10.1, 0.99, 1.25, 0.75, 5.5, 4.85, 2.99, 131, 68.0, 112, 46.3, 3.36, 8.83, 5.95, 1260, 26.1, 449, 46.3, 0.605, 23.2, 51.0, 650, 450],
            ["W10X77", 77, 22.6, 10.6, 0.53, 10.1, 0.87, 1.25, 0.75, 5.5, 4.83, 2.98, 114, 59.6, 97.7, 40.5, 3.35, 8.86, 4.06, 1100, 23.2, 391, 40.5, 0.53, 20.3, 44.4, 600, 400],
            ["W10X68", 68, 20.0, 10.4, 0.47, 10.0, 0.77, 1, 0.75, 5.5, 4.82, 2.97, 101, 52.6, 85.9, 35.7, 3.33, 8.86, 2.87, 970, 20.7, 345, 35.7, 0.47, 17.9, 39.0, 500, 350],
            ["W10X60", 60, 17.6, 10.2, 0.42, 10.0, 0.68, 1, 0.75, 5.5, 4.82, 2.97, 88.7, 46.4, 75.7, 31.3, 3.32, 8.84, 2.00, 844, 18.5, 303, 31.3, 0.42, 15.7, 34.2, 450, 300]
        ],
        "W8": [
            ["W8X67", 67, 19.7, 9.0, 0.57, 8.28, 0.935, 1.25, 0.75, 4.5, 3.81, 2.14, 82.8, 39.6, 70.4, 26.7, 2.48, 7.13, 3.71, 386, 17.3, 282, 26.7, 0.57, 13.3, 30.6, 500, 350],
            ["W8X58", 58, 17.1, 8.75, 0.51, 8.22, 0.81, 1, 0.75, 4.5, 3.76, 2.12, 70.7, 33.8, 60.0, 22.8, 2.45, 7.13, 2.45, 325, 15.1, 240, 22.8, 0.51, 11.4, 26.0, 450, 300],
            ["W8X48", 48, 14.1, 8.5, 0.4, 8.11, 0.685, 1, 0.75, 4.5, 3.74, 2.11, 58.1, 27.9, 49.0, 18.7, 2.43, 7.13, 1.41, 269, 12.5, 196, 18.7, 0.4, 9.38, 21.4, 350, 250],
            ["W8X40", 40, 11.7, 8.25, 0.36, 8.07, 0.56, 0.75, 0.75, 4.5, 3.7, 2.08, 47.3, 22.5, 39.8, 15.2, 2.39, 7.13, 0.794, 213, 10.5, 159, 15.2, 0.36, 7.59, 17.4, 300, 200],
            ["W8X35", 35, 10.3, 8.12, 0.31, 8.02, 0.495, 0.75, 0.75, 4.5, 3.69, 2.08, 41.3, 19.7, 34.7, 13.3, 2.38, 7.13, 0.536, 185, 9.27, 139, 13.3, 0.31, 6.66, 15.2, 250, 170],
            ["W8X31", 31, 9.13, 8.0, 0.285, 8.0, 0.435, 0.75, 0.75, 4.5, 3.67, 2.08, 36.1, 17.3, 30.4, 11.6, 2.37, 7.13, 0.363, 160, 8.21, 122, 11.6, 0.285, 5.83, 13.2, 230, 150]
        ]
    };
    
    // ASTM Steel specification properties
    const astmSpecs = {
        "A36": { Fy: 36, Fu: 58, E: 29000 },
        "A572Gr.42": { Fy: 42, Fu: 60, E: 29000 },
        "A572Gr.50": { Fy: 50, Fu: 65, E: 29000 },
        "A572Gr.55": { Fy: 55, Fu: 70, E: 29000 },
        "A572Gr.60": { Fy: 60, Fu: 75, E: 29000 },
        "A572Gr.65": { Fy: 65, Fu: 80, E: 29000 },
        "A588Gr.42": { Fy: 42, Fu: 63, E: 29000 },
        "A588Gr.46": { Fy: 46, Fu: 67, E: 29000 },
        "A588Gr.50": { Fy: 50, Fu: 70, E: 29000 },
        "A687": { Fy: 50, Fu: 70, E: 29000 },
        "A992": { Fy: 50, Fu: 65, E: 29000 }
    };
    
    // Add event listener to design button
    if (designButton) {
        designButton.addEventListener("click", performDesign);
    }
    
    // Handle lateral support visibility
    function handleSupportVisibilityC() {
        const supportCDiv = document.getElementById("SupportC");
        if (supportCDiv) {
            if (withSupport && withSupport.checked) {
                supportCDiv.style.display = "block";
            } else {
                supportCDiv.style.display = "none";
            }
        }
    }
    
    // Add event listeners to radio buttons
    if (noSupport) {
        noSupport.addEventListener("change", handleSupportVisibilityC);
    }
    if (withSupport) {
        withSupport.addEventListener("change", handleSupportVisibilityC);
    }
    
    // Main design function
    function performDesign() {
        // Get input values
        const astmSpec = astmSelect.value;
        const designMethod = designMethodSelect.value;
        const deadLoad = parseFloat(deadLoadInput.value) || 0;
        const liveLoad = parseFloat(liveLoadInput.value) || 0;
        const columnLength = parseFloat(lengthInput.value) || 0;
        
        // Get end support conditions
        const topSupportType = topFixed && topFixed.checked ? "fixed" : 
                              topPinned && topPinned.checked ? "pinned" : "free";
        const botSupportType = botFixed && botFixed.checked ? "fixed" : 
                              botPinned && botPinned.checked ? "pinned" : "free";
        
        // Get lateral support information
        const hasLateralSupports = withSupport && withSupport.checked;
        const supportCount = hasLateralSupports ? parseInt(supportAmountInput.value) || 0 : 0;
        
        // Get lateral support locations and types
        const lateralSupports = [];
        if (hasLateralSupports) {
            for (let i = 0; i < supportCount && i < 3; i++) {
                const support = lateralSupportTypes[i];
                if (support.location) {
                    const location = parseFloat(support.location.value) || 0;
                    const type = support.fixed && support.fixed.checked ? "fixed" :
                                support.pinned && support.pinned.checked ? "pinned" : "free";
                    
                    if (location > 0 && location < columnLength) {
                        lateralSupports.push({
                            position: location,
                            type: type
                        });
                    }
                }
            }
        }
        
        // Sort lateral supports by position
        lateralSupports.sort((a, b) => a.position - b.position);
        
        // Calculate effective length factors
        const { Kx, Ky, segmentsY } = calculateEffectiveLengthFactors(
            columnLength, 
            topSupportType, 
            botSupportType, 
            lateralSupports
        );
        
        // Calculate effective lengths
        const Klx = Kx * columnLength * 12; // Convert to inches
        const Kly = Ky * columnLength * 12; // Convert to inches
        
        // Determine governing effective length
        const governingKl = Math.max(Klx, Kly);
        const isYGoverning = Kly >= Klx;
        
        // Calculate required capacity
        const totalLoad = calculateTotalLoad(deadLoad, liveLoad, designMethod);
        
        // Find suitable W-shapes
        const suitableShapes = findSuitableShapes(
            governingKl, 
            totalLoad, 
            designMethod, 
            wShapeDatabase,
            astmSpec
        );
        
        // Display results
        displayResults(
            suitableShapes, 
            Klx, 
            Kly, 
            isYGoverning, 
            totalLoad, 
            astmSpec, 
            designMethod, 
            segmentsY
        );
    }
    
    // Calculate effective length factors based on support conditions
    function calculateEffectiveLengthFactors(length, topSupport, botSupport, lateralSupports) {
        // Default K factors for different end conditions
        const endConditionFactors = {
            'fixed-fixed': 0.5,
            'fixed-pinned': 0.7,
            'fixed-free': 2.0,
            'pinned-pinned': 1.0,
            'pinned-fixed': 0.7,
            'pinned-free': 2.0,
            'free-fixed': 2.0,
            'free-pinned': 2.0,
            'free-free': 10.0 // Effectively unstable
        };
        
        // For X-axis: we only consider end supports
        const endConditionX = `${topSupport}-${botSupport}`;
        const Kx = endConditionFactors[endConditionX] || 1.0; // Default to 1.0 if condition not found
        
        // For Y-axis: consider both end supports and lateral bracing
        let Ky = Kx; // Start with the same factor as X-axis
        
        // If we have lateral supports, we need to consider their effect
        const segmentsY = [];
        
        if (lateralSupports.length > 0) {
            // Create segments based on supports
            let startPoint = 0;
            let previousType = topSupport;
            
            // Process each lateral support
            for (const support of lateralSupports) {
                const segmentLength = support.position - startPoint;
                const endCondition = `${previousType}-${support.type}`;
                const segmentK = endConditionFactors[endCondition] || 1.0;
                
                segmentsY.push({
                    startPoint: startPoint,
                    endPoint: support.position,
                    length: segmentLength,
                    K: segmentK
                });
                
                startPoint = support.position;
                previousType = support.type;
            }
            
            // Add final segment to bottom
            const finalSegmentLength = length - startPoint;
            const finalEndCondition = `${previousType}-${botSupport}`;
            const finalSegmentK = endConditionFactors[finalEndCondition] || 1.0;
            
            segmentsY.push({
                startPoint: startPoint,
                endPoint: length,
                length: finalSegmentLength,
                K: finalSegmentK
            });
            
            // Find the maximum effective length factor among segments
            let maxSegmentKL = 0;
            for (const segment of segmentsY) {
                const segmentKL = segment.K * segment.length;
                if (segmentKL > maxSegmentKL) {
                    maxSegmentKL = segmentKL;
                }
            }
            
            // Calculate the overall effective length factor for Y-axis
            Ky = maxSegmentKL / length;
        }
        
        return { Kx, Ky, segmentsY };
    }
    
    // Calculate total load based on design method
    function calculateTotalLoad(deadLoad, liveLoad, designMethod) {
        if (designMethod === "LRFD") {
            // LRFD load combinations
            return 1.2 * deadLoad + 1.6 * liveLoad;
        } else {
            // ASD load combinations
            return deadLoad + liveLoad;
        }
    }
    
    // Find suitable W-shapes based on effective length and required capacity
    function findSuitableShapes(governingKl, requiredCapacity, designMethod, database, astmSpec) {
        const results = {};
        const steelProps = astmSpecs[astmSpec] || astmSpecs["A36"]; // Default to A36 if not found
        
        // Check each shape series (W8, W10, W12, W14)
        for (const shapeType in database) {
            let bestShape = null;
            let minWeight = Infinity;
            
            for (const shape of database[shapeType]) {
                // Get shape properties
                const shapeName = shape[0];
                const weight = shape[1];
                const area = shape[2];
                const rx = shape[10];
                const ry = shape[11];
                
                // Calculate slenderness ratios
                const slendernessX = governingKl / rx;
                const slendernessY = governingKl / ry;
                const maxSlenderness = Math.max(slendernessX, slendernessY);
                
                // Check if slenderness ratio is within limits (typically < 200 for compression members)
                if (maxSlenderness >= 200) {
                    continue; // Skip this shape if slenderness is too high
                }
                
                // Calculate critical stress using AISC formulas
                const Fy = steelProps.Fy;
                const E = steelProps.E;
                let Fe, Fcr, capacityCalc;
                
                // Elastic buckling stress
                Fe = Math.pow(Math.PI, 2) * E / Math.pow(maxSlenderness, 2);
                
                if (designMethod === "LRFD") {
                    // LRFD method
                    if (maxSlenderness <= 4.71 * Math.sqrt(E / Fy)) {
                        // Inelastic buckling
                        Fcr = 0.658 * (Fy / Fe) * Fy;
                    } else {
                        // Elastic buckling
                        Fcr = 0.877 * Fe;
                    }
                    capacityCalc = 0.9 * Fcr * area;
                } else {
                    // ASD method
                    if (maxSlenderness <= 4.71 * Math.sqrt(E / Fy)) {
                        // Inelastic buckling
                        Fcr = 0.658 * (Fy / Fe) * Fy;
                    } else {
                        // Elastic buckling
                        Fcr = 0.877 * Fe;
                    }
                    capacityCalc = Fcr * area / 1.67;
                }
                
                // Get capacity from database as a fallback
                const capacityIndex = designMethod === "LRFD" ? 26 : 27; // Index 26 for LRFD, 27 for ASD
                const shapeCapacity = shape[capacityIndex] || capacityCalc;
                
                // Check if shape is suitable
                if (shapeCapacity >= requiredCapacity) {
                    // If this shape is lighter than our current best for this type, save it
                    if (weight < minWeight) {
                        bestShape = {
                            name: shapeName,
                            weight: weight,
                            area: area,
                            depth: shape[3],
                            tw: shape[4], // web thickness
                            bf: shape[5], // flange width
                            tf: shape[6], // flange thickness
                            rx: rx,
                            ry: ry,
                            slendernessX: slendernessX,
                            slendernessY: slendernessY,
                            Fe: Fe,
                            Fcr: Fcr,
                            calculatedCapacity: capacityCalc,
                            capacity: shapeCapacity
                        };
                        minWeight = weight;
                    }
                }
            }
            
            if (bestShape) {
                results[shapeType] = bestShape;
            }
        }
        
        return results;
    }
    
    // Function to check if a section is compact
    function checkCompactness(shape, steelProps) {
        const Fy = steelProps.Fy;
        const E = steelProps.E;
        
        // Flange compactness check
        const lambdaF = shape.bf / (2 * shape.tf);
        const lambdaPF = 0.38 * Math.sqrt(E / Fy);
        const lambdaRF = 1.0 * Math.sqrt(E / Fy);
        
        // Web compactness check
        const lambdaW = shape.depth / shape.tw;
        const lambdaPW = 3.76 * Math.sqrt(E / Fy);
        const lambdaRW = 5.70 * Math.sqrt(E / Fy);
        
        let flangeClass, webClass, sectionClass;
        
        // Classify flange
        if (lambdaF <= lambdaPF) {
            flangeClass = "Compact";
        } else if (lambdaF <= lambdaRF) {
            flangeClass = "Non-compact";
        } else {
            flangeClass = "Slender";
        }
        
        // Classify web
        if (lambdaW <= lambdaPW) {
            webClass = "Compact";
        } else if (lambdaW <= lambdaRW) {
            webClass = "Non-compact";
        } else {
            webClass = "Slender";
        }
        
        // Overall section class
        if (flangeClass === "Compact" && webClass === "Compact") {
            sectionClass = "Compact";
        } else if (flangeClass === "Slender" || webClass === "Slender") {
            sectionClass = "Slender";
        } else {
            sectionClass = "Non-compact";
        }
        
        return {
            flangeRatio: lambdaF,
            flangeLimitP: lambdaPF,
            flangeLimitR: lambdaRF,
            flangeClass: flangeClass,
            webRatio: lambdaW,
            webLimitP: lambdaPW,
            webLimitR: lambdaRW,
            webClass: webClass,
            sectionClass: sectionClass
        };
    }

// Display results in the table
function displayResults(shapes, Klx, Kly, isYGoverning, requiredCapacity, astmSpec, designMethod, segments) {
    // Update table cells
    for (const [shapeType, shape] of Object.entries(shapes)) {
        const indexMap = {
            "W14": 1,
            "W12": 2,
            "W10": 3,
            "W8": 4
        };
        
        const index = indexMap[shapeType];
        if (index) {
            document.getElementById(`${shapeType}`).textContent = shape.name;
            document.getElementById(`pupa${index}`).textContent = `${shape.capacity} kips`;
            document.getElementById(`Weight${index}`).textContent = `${shape.weight} lb/ft`;
            document.getElementById(`rxry${index}`).textContent = `${shape.rx.toFixed(2)}/${shape.ry.toFixed(2)}`;
            
            // Mark the best (lightest weight) shape with "Yes"
            document.getElementById(`Best${index}`).textContent = "";
        }
    }
    
    // Find lightest shape and mark it as "Best"
    let bestShapeType = null;
    let minWeight = Infinity;
    
    for (const [shapeType, shape] of Object.entries(shapes)) {
        if (shape.weight < minWeight) {
            minWeight = shape.weight;
            bestShapeType = shapeType;
        }
    }
    
    if (bestShapeType) {
        const indexMap = {
            "W14": 1,
            "W12": 2,
            "W10": 3,
            "W8": 4
        };
        const bestIndex = indexMap[bestShapeType];
        if (bestIndex) {
            document.getElementById(`Best${bestIndex}`).textContent = "Yes";
        }
    }
    
    // Get steel properties
    const steelProps = astmSpecs[astmSpec] || astmSpecs["A36"];
    
    // Display detailed results in Result123 div
    const resultDiv = document.querySelector(".Result123");
    if (resultDiv) {
        // Clear previous results
        resultDiv.innerHTML = "";
        
        // Create result content
        const resultContent = document.createElement("div");
        resultContent.className = "result-content";
        
        // Create heading
        const heading = document.createElement("h3");
        heading.textContent = "Column Design Results";
        resultContent.appendChild(heading);
        
        // Add design specs
        const designSpecs = document.createElement("div");
        designSpecs.className = "design-specs";
        designSpecs.innerHTML = `
            <p><strong>Design Method:</strong> ${designMethod}</p>
            <p><strong>Steel Specification:</strong> ${astmSpec} (Fy = ${steelProps.Fy} ksi, Fu = ${steelProps.Fu} ksi)</p>
            <p><strong>Required Capacity:</strong> ${requiredCapacity.toFixed(2)} kips</p>
        `;
        resultContent.appendChild(designSpecs);
        
        // Add effective length section
        const effectiveLengthDiv = document.createElement("div");
        effectiveLengthDiv.className = "effective-length";
        effectiveLengthDiv.innerHTML = `
            <h4>Effective Length Factors</h4>
            <p><strong>KLx:</strong> ${Klx.toFixed(2)} inches</p>
            <p><strong>KLy:</strong> ${Kly.toFixed(2)} inches</p>
            <p><strong>Governing Direction:</strong> ${isYGoverning ? "Y-axis (weak axis)" : "X-axis (strong axis)"}</p>
        `;
        resultContent.appendChild(effectiveLengthDiv);
        
        // Add lateral bracing segments info if available
        if (segments && segments.length > 0) {
            const segmentsDiv = document.createElement("div");
            segmentsDiv.className = "bracing-segments";
            segmentsDiv.innerHTML = `<h4>Lateral Bracing Segments</h4>`;
            
            const segmentsList = document.createElement("ul");
            for (let i = 0; i < segments.length; i++) {
                const segment = segments[i];
                const segmentItem = document.createElement("li");
                segmentItem.innerHTML = `
                    Segment ${i+1}: ${segment.startPoint.toFixed(2)} ft to ${segment.endPoint.toFixed(2)} ft 
                    | Length: ${segment.length.toFixed(2)} ft 
                    | K-factor: ${segment.K.toFixed(2)}
                    | KL: ${(segment.K * segment.length * 12).toFixed(2)} inches
                `;
                segmentsList.appendChild(segmentItem);
            }
            segmentsDiv.appendChild(segmentsList);
            resultContent.appendChild(segmentsDiv);
        }
        
        // Add best shape details
        if (bestShapeType) {
            const bestShape = shapes[bestShapeType];
            const compactnessResults = checkCompactness(bestShape, steelProps);
            
            const bestShapeDiv = document.createElement("div");
            bestShapeDiv.className = "best-shape";
            bestShapeDiv.innerHTML = `
                <h4>Best Shape: ${bestShape.name}</h4>
                <p><strong>Weight:</strong> ${bestShape.weight} lb/ft</p>
                <p><strong>Cross-sectional Area:</strong> ${bestShape.area} in²</p>
                <p><strong>Depth:</strong> ${bestShape.depth} in</p>
                <p><strong>Flange Width:</strong> ${bestShape.bf} in</p>
                <p><strong>Critical Slenderness Ratio (K/r):</strong> ${Math.max(bestShape.slendernessX, bestShape.slendernessY).toFixed(2)}</p>
                <p><strong>Euler Buckling Stress (Fe):</strong> ${bestShape.Fe.toFixed(2)} ksi</p>
                <p><strong>Critical Stress (Fcr):</strong> ${bestShape.Fcr.toFixed(2)} ksi</p>
                <p><strong>${designMethod} Capacity:</strong> ${bestShape.capacity} kips</p>
                <p><strong>Section Classification:</strong> ${compactnessResults.sectionClass}</p>
            `;
            resultContent.appendChild(bestShapeDiv);
            
            // Add safety factor information
            const safetyDiv = document.createElement("div");
            safetyDiv.className = "safety-factor";
            const safetyFactor = bestShape.capacity / requiredCapacity;
            safetyDiv.innerHTML = `
                <h4>Safety Analysis</h4>
                <p><strong>Capacity / Required:</strong> ${safetyFactor.toFixed(2)}</p>
                <p><strong>Utilization Ratio:</strong> ${(1/safetyFactor * 100).toFixed(2)}%</p>
            `;
            resultContent.appendChild(safetyDiv);
        } else {
            // No suitable shape found
            const noShapeDiv = document.createElement("div");
            noShapeDiv.className = "no-shape-warning";
            noShapeDiv.innerHTML = `
                <h4>⚠️ Warning ⚠️</h4>
                <p>No suitable W-shape found for the given loading and geometric conditions.</p>
                <p>Consider:</p>
                <ul>
                    <li>Reducing the column length</li>
                    <li>Adding intermediate lateral supports</li>
                    <li>Using a built-up section or different section type</li>
                    <li>Selecting higher strength steel</li>
                </ul>
            `;
            resultContent.appendChild(noShapeDiv);
        }
        
        // Add the result content to the result div
        resultDiv.appendChild(resultContent);
    }