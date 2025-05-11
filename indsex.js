// Global variables for data storage
let steelSpecs = [];
let sectionData = {};
let beamData = {};  // To store beam data from sheet 3 if needed
let dataLoaded = false;

// Initialize the application when the document is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("Initializing application");
    
    // Try to load the data from Excel file
    loadExcelData()
        .then(() => {
            console.log("Excel data loaded successfully");
            dataLoaded = true;
        })
        .catch(error => {
            console.warn("Failed to load Excel data:", error);
            console.log("Using hardcoded data instead");
            useHardcodedData();
            dataLoaded = true;
        });
});

// Function to load Excel data using fetch API
async function loadExcelData() {
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
    
    try {
        console.log("Attempting to load Excel data...");
        
        // Use fetch API to load the Excel file as a blob
        const response = await fetch('ASTMSPEC.xlsx', {
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache'
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch Excel file: ${response.status}`);
        }
        
        // Get the file as an ArrayBuffer
        const arrayBuffer = await response.arrayBuffer();
        const data = new Uint8Array(arrayBuffer);
        
        // Parse with SheetJS
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Load steel specifications from the first sheet
        const steelSheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawSteelSpecs = XLSX.utils.sheet_to_json(steelSheet);
        
        // Validate steel specs data
        steelSpecs = rawSteelSpecs.filter(spec => 
            spec.Steel_name && 
            typeof spec.Fy === 'number' && 
            typeof spec.Fu === 'number'
        );
        
        if (steelSpecs.length === 0) {
            console.error("No valid steel specifications found in the Excel file");
            console.log("Raw steel specs data:", rawSteelSpecs);
            useHardcodedData();
        } else {
            console.log(`Successfully loaded ${steelSpecs.length} steel specifications`);
            steelSpecs.slice(0, 5).forEach(spec => 
                console.log(`Steel: ${spec.Steel_name}, Fy: ${spec.Fy}, Fu: ${spec.Fu}`)
            );
        }
        
        // Load section data from the second sheet
        const sectionSheet = workbook.Sheets[workbook.SheetNames[1]];
        const sectionsArray = XLSX.utils.sheet_to_json(sectionSheet);
        
        // Convert array to object with section names as keys
        sectionData = {};
        sectionsArray.forEach(section => {
            if (section.AISC_Manual_Label) {
                const label = section.AISC_Manual_Label.trim().toUpperCase().replace(/\s/g, '');
                sectionData[label] = {
                    A: parseFloat(section.A) || 0,
                    tw: parseFloat(section.tw) || 0,
                    d: parseFloat(section.d) || 0,
                    bf: parseFloat(section.bf) || 0,
                    Zx: parseFloat(section.Zx) || 0,
                    Sx: parseFloat(section.Sx) || 0,
                    "bf/2tf": parseFloat(section["bf/2tf"]) || 0,
                    "h/tw": parseFloat(section["h/tw"]) || 0,
                    Kc: parseFloat(section.Kc) || 0,
                    AISC_Manual_Label: label
                };
            }
        });
        
        console.log(`Loaded ${Object.keys(sectionData).length} sections`);
        
        // Try to load beam data from third sheet if it exists
        if (workbook.SheetNames.length > 2) {
            const beamSheet = workbook.Sheets[workbook.SheetNames[2]];
            const beamsArray = XLSX.utils.sheet_to_json(beamSheet);
            
            beamData = {};
            beamsArray.forEach(beam => {
                if (beam.BeamID) {
                    beamData[beam.BeamID] = beam;
                }
            });
            
            console.log(`Loaded ${Object.keys(beamData).length} beam entries`);
        }
        
        // Remove loading indicator
        document.getElementById('loading-indicator').remove();
        
        return true;
    } catch (error) {
        console.error("Error loading Excel data:", error);
        
        // Update loading indicator
        document.getElementById('loading-indicator').innerHTML = 'Failed to load data. Using defaults.';
        document.getElementById('loading-indicator').style.backgroundColor = '#ffcccc';
        
        setTimeout(() => {
            document.getElementById('loading-indicator').remove();
        }, 3000);
        
        // Use hardcoded data as fallback
        useHardcodedData();
        
        return false;
    }
}

// Function to provide hardcoded data fallback
function useHardcodedData() {
    // Default steel specifications
    const hardcodedSteelSpecs = [
        { Steel_name: "A36", Fy: 36, Fu: 58 },
        { Steel_name: "A572Gr.42", Fy: 42, Fu: 60 },
        { Steel_name: "A572Gr.50", Fy: 50, Fu: 65 },
        { Steel_name: "A572Gr.55", Fy: 55, Fu: 70 },
        { Steel_name: "A572Gr.60", Fy: 60, Fu: 75 },
        { Steel_name: "A572Gr.65", Fy: 65, Fu: 80 },
        { Steel_name: "A588Gr.42", Fy: 42, Fu: 63 },
        { Steel_name: "A588Gr.46", Fy: 46, Fu: 67 },
        { Steel_name: "A588Gr.50", Fy: 50, Fu: 70 },
        { Steel_name: "A687", Fy: 50, Fu: 70 },
        { Steel_name: "A992", Fy: 50, Fu: 65 }
    ];
    
    // Common W shapes with their properties
    const hardcodedSectionData = {
        "W12X45": { 
            A: 13.2, tw: 0.335, d: 12.1, bf: 8.05, Zx: 88.6, Sx: 78.0, 
            "bf/2tf": 8.5, "h/tw": 29.9, Kc: 0.707, AISC_Manual_Label: "W12X45" 
        },
        "W10X33": { 
            A: 9.71, tw: 0.29, d: 9.73, bf: 5.77, Zx: 42.1, Sx: 36.6, 
            "bf/2tf": 9.15, "h/tw": 27.9, Kc: 0.707, AISC_Manual_Label: "W10X33" 
        },
        "W8X24": { 
            A: 7.08, tw: 0.25, d: 7.93, bf: 6.5, Zx: 23.2, Sx: 20.9, 
            "bf/2tf": 10.8, "h/tw": 26.0, Kc: 0.707, AISC_Manual_Label: "W8X24" 
        },
        "W14X53": {
            A: 15.6, tw: 0.37, d: 13.9, bf: 8.06, Zx: 115, Sx: 102, 
            "bf/2tf": 7.33, "h/tw": 32.3, Kc: 0.760, AISC_Manual_Label: "W14X53"
        },
        "W16X40": {
            A: 11.8, tw: 0.305, d: 16.0, bf: 7.0, Zx: 92.0, Sx: 81.0, 
            "bf/2tf": 9.2, "h/tw": 46.2, Kc: 0.738, AISC_Manual_Label: "W16X40"
        },
        "W18X35": {
            A: 10.3, tw: 0.30, d: 17.7, bf: 6.0, Zx: 83.3, Sx: 72.7, 
            "bf/2tf": 7.5, "h/tw": 53.0, Kc: 0.724, AISC_Manual_Label: "W18X35"
        },
        "W21X44": {
            A: 13.0, tw: 0.35, d: 20.7, bf: 6.5, Zx: 126, Sx: 110, 
            "bf/2tf": 6.8, "h/tw": 54.0, Kc: 0.714, AISC_Manual_Label: "W21X44"
        },
        "W24X55": {
            A: 16.2, tw: 0.395, d: 23.6, bf: 7.0, Zx: 177, Sx: 154, 
            "bf/2tf": 7.2, "h/tw": 54.6, Kc: 0.701, AISC_Manual_Label: "W24X55"
        }
    };
    
    // Set the data in both global and window scopes to ensure access
    window.steelSpecs = hardcodedSteelSpecs;
    window.sectionData = hardcodedSectionData;
    steelSpecs = hardcodedSteelSpecs;
    sectionData = hardcodedSectionData;
    
    console.log("Using hardcoded data with", Object.keys(hardcodedSectionData).length, "sections");
}

// Function to get section data with improved error handling
function getSectionData(sectionKey) {
    if (!sectionKey) {
        console.error("No section key provided");
        return null;
    }
    
    // Normalize the input key by removing spaces and ensuring uppercase
    const normalizedKey = sectionKey.toString().toUpperCase().replace(/\s/g, '');
    console.log("Looking for section:", normalizedKey);
    
    // Direct lookup
    if (sectionData[normalizedKey]) {
        console.log("Section found directly:", normalizedKey);
        return sectionData[normalizedKey];
    }
    
    // Try alternative formats
    const alternatives = [
        normalizedKey.replace('X', 'x'),          // Try with lowercase x
        normalizedKey.replace('x', 'X'),          // Try with uppercase X
        `W${normalizedKey.replace(/^W/i, '')}`,   // Ensure W prefix
        `WX${normalizedKey.replace(/^W(?:X)?/i, '')}` // Try WX format
    ];
    
    for (const altKey of alternatives) {
        if (sectionData[altKey]) {
            console.log("Section found with alternative format:", altKey);
            return sectionData[altKey];
        }
    }
    
    // Look for similar keys
    const similarKeys = Object.keys(sectionData).filter(key => 
        key.includes(normalizedKey.replace(/^W/, '')) || 
        normalizedKey.includes(key.replace(/^W/, ''))
    );
    
    if (similarKeys.length > 0) {
        console.log("Similar keys found:", similarKeys);
        console.log("Using first similar key:", similarKeys[0]);
        return sectionData[similarKeys[0]];
    }
    
    console.warn("Section not found:", normalizedKey);
    console.log("Available keys:", Object.keys(sectionData).slice(0, 10).join(", ") + "...");
    
    // Return default values if not found
    return {
        A: 13.2, 
        tw: 0.335, 
        d: 12.1, 
        bf: 8.05,
        Zx: 88.6,
        Sx: 78.0,
        "bf/2tf": 8.5,
        "h/tw": 29.9,
        Kc: 0.707,
        AISC_Manual_Label: "W12X45 (DEFAULT)"
    };
}

// Function to get steel specification data
function getSteelSpecData(steelName) {
    if (!steelName) {
        console.error("No steel specification name provided");
        return null;
    }
    
    // Normalize the input
    const normalizedName = steelName.toString().toUpperCase().replace(/\s/g, '');
    
    // Find the steel specification
    const spec = steelSpecs.find(s => 
        s.Steel_name.toUpperCase().replace(/\s/g, '') === normalizedName
    );
    
    if (spec) {
        return spec;
    }
    
    console.warn("Steel specification not found:", normalizedName);
    
    // Return default values if not found
    return {
        Steel_name: "A36 (DEFAULT)",
        Fy: 36,
        Fu: 58
    };
}

// Function to ensure SheetJS is loaded
function addExcelLibrary() {
    return new Promise((resolve, reject) => {
        // Check if SheetJS is already loaded
        if (window.XLSX) {
            console.log("SheetJS already loaded");
            resolve();
            return;
        }
        
        console.log("Loading SheetJS...");
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.0/xlsx.full.min.js';
        script.onload = () => {
            console.log("SheetJS loaded successfully");
            resolve();
        };
        script.onerror = () => {
            console.error("Failed to load SheetJS");
            reject(new Error("Failed to load SheetJS library"));
        };
        document.head.appendChild(script);
    });
}

// Initialize by ensuring the Excel library is loaded first
function initialize() {
    console.log("Initializing application...");
    
    // Initialize data structures
    dataLoaded = false;
    steelSpecs = [];
    sectionData = {};
    beamData = {};
    
    // Add SheetJS library
    addExcelLibrary()
        .then(() => {
            // Once SheetJS is loaded, try to load Excel data
            return loadExcelData();
        })
        .then((success) => {
            dataLoaded = true;
            console.log("Data loading complete, success:", success);
        })
        .catch(err => {
            dataLoaded = true; // Still mark as loaded since we use fallback data
            console.error("Setup error:", err);
            
            // Ensure we still have data to work with
            useHardcodedData();
        });
}

// Start initialization when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initialize);