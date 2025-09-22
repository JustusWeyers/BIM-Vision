import { makeBIMPortalRequest } from '../BIMPortal/api';
import { Element, AIRecommendation, Issue } from '../types';

export async function mockLLMExplain(element: Element): Promise<string> {
  if (!element) return "Element not found.";
  await new Promise((r) => setTimeout(r, 300));
  return `Kurz erklärt: ${element.id} ist ein ${element.type}. ${
    element.status === "pass"
      ? "Alle Pflichtangaben sind vorhanden."
      : element.status === "warn"
      ? "Einige Angaben fehlen. Bitte ergänzen Sie fehlende Eigenschaften wie Brandschutzklasse oder U-Wert."
      : "Wesentliche Angaben fehlen. Das kann Genehmigungen verhindern und zu Verzögerungen führen."
  }`;
}

export async function LLMExplain(api_key: string, element: Element): Promise<string> {
  if (!api_key) {
    console.warn('No OpenAI API key provided, falling back to mock explanation');
    return mockLLMExplain(element);
  }

  try {
    const idsData = await makeBIMPortalRequest("/aia/api/v1/public/aiaProject/{guid}/IDS", "get", element.guid);
    
    console.log('IDS Data received:', idsData); 
    
    let context = '';
    
    if (idsData) {
      if (typeof idsData === 'string') {
        context = parseIDSForElement(idsData, element.type);
        console.log('Parsed IDS requirements:', context);
      } else if (typeof idsData === 'object') {
        context = `IDS Requirements (Structured):\n${JSON.stringify(idsData, null, 2)}`;
      }
    } else {
      context = 'No IDS data available for this element from BIM Portal.';
    }

    const prompt = `Du bist ein BIM-Experte für deutsche Bauvorschriften. Analysiere dieses BIM-Element:

                    Element Information:
                    - ID: ${element.id}
                    - Typ: ${element.type}
                    - Eigenschaften: ${JSON.stringify(element.props, null, 2)}
                    - Status: ${element.status}

                    ${context}

                    Bitte erkläre:
                    1. Um was für einen Gegenstand haltet es sich?
                    2. Was bedeutet der aktuelle Status des Elements?
                    3. Welche Anforderungen ergeben sich aus den IDS-Daten?
                    4. Welche Eigenschaften fehlen oder sind falsch?

                    Antworte auf Deutsch und beziehe dich auf deutsche Baustandards. Gib eine detaillierte Analyse. Limitier deine Antwort auf maximal 50 Wörter!`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${api_key}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Du bist ein deutscher BIM-Experte mit Spezialisierung auf Bauvorschriften und IDS-Analyse. Gib detaillierte technische Erklärungen auf Deutsch.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Keine Antwort generiert';

  } catch (error) {
    console.error('LLM explanation failed:', error);
  }
}

function parseIDSForElement(idsXml: string, elementType: string): string {
  if (!idsXml || typeof idsXml !== 'string') return '';
  
  const requirements: string[] = [];
  
  const specMatches = idsXml.match(/<specification[^>]*name="[^"]*"[^>]*>([\s\S]*?)<\/specification>/g);
  
  if (specMatches) {
    for (const spec of specMatches) {
      const isRelevant = checkSpecificationRelevance(spec, elementType);
      if (!isRelevant) continue;
      
      const propertyMatches = spec.match(/<property[^>]*propertySet="([^"]*)"[^>]*baseName="([^"]*)"[^>]*dataType="([^"]*)"[^>]*>([\s\S]*?)<\/property>/g);
      
      if (propertyMatches) {
        for (const prop of propertyMatches) {
          const propertyInfo = extractPropertyInfo(prop);
          if (propertyInfo) {
            requirements.push(propertyInfo);
          }
        }
      }
      
      const materialMatches = spec.match(/<material[^>]*>([\s\S]*?)<\/material>/g);
      if (materialMatches) {
        for (const material of materialMatches) {
          const materialInfo = extractMaterialInfo(material);
          if (materialInfo) {
            requirements.push(materialInfo);
          }
        }
      }
    }
  }
  
  return requirements.length > 0 
    ? `Relevante IDS Anforderungen:\n${requirements.join('\n')}`
    : `Keine spezifischen IDS Anforderungen für ${elementType} gefunden.`;
}

function checkSpecificationRelevance(specification: string, elementType: string): boolean {
  const elementMappings = {
    'Wall': ['IfcWall', 'Wall'],
    'Door': ['IfcDoor', 'Door'],
    'Column': ['IfcColumn', 'Column'],
    'Window': ['IfcWindow', 'Window']
  };
  
  const relevantTerms = elementMappings[elementType as keyof typeof elementMappings] || [];
  
  return relevantTerms.some(term => 
    specification.toLowerCase().includes(term.toLowerCase())
  );
}

function extractPropertyInfo(propertyXml: string): string | null {
  try {
    const propertySetMatch = propertyXml.match(/propertySet="([^"]*)"/);
    const baseNameMatch = propertyXml.match(/baseName="([^"]*)"/);
    const dataTypeMatch = propertyXml.match(/dataType="([^"]*)"/);
    
    if (!propertySetMatch || !baseNameMatch) return null;
    
    const propertySet = propertySetMatch[1];
    const baseName = baseNameMatch[1];
    const dataType = dataTypeMatch?.[1] || '';
    
    let requirement = `• ${baseName}`;
    
    const maxInclusiveMatch = propertyXml.match(/<xs:maxInclusive\s+value="([^"]*)"\/>/);
    const minInclusiveMatch = propertyXml.match(/<xs:minInclusive\s+value="([^"]*)"\/>/);
    
    if (maxInclusiveMatch) {
      requirement += ` ≤ ${maxInclusiveMatch[1]}`;
      if (baseName.toLowerCase().includes('thermal') || baseName.toLowerCase().includes('uvalue')) {
        requirement += ' W/m²K';
      }
    }
    
    if (minInclusiveMatch) {
      requirement += ` ≥ ${minInclusiveMatch[1]}`;
    }
    
    const enumMatches = propertyXml.match(/<xs:enumeration\s+value="([^"]*)"/g);
    if (enumMatches && enumMatches.length > 0) {
      const values = enumMatches.map(match => match.match(/value="([^"]*)"/)?.[1]).filter(Boolean);
      requirement += ` (${values.join('/')})`;
    }
    
    return requirement;
  } catch (error) {
    console.warn('Error parsing property info:', error);
    return null;
  }
}

function extractMaterialInfo(materialXml: string): string | null {
  try {
    const valueMatches = materialXml.match(/<value\s+simpleValue="([^"]*)"/g);
    if (valueMatches && valueMatches.length > 0) {
      const materials = valueMatches.map(match => match.match(/simpleValue="([^"]*)"/)?.[1]).filter(Boolean);
      return `• Material: ${materials.join(' oder ')}`;
    }
    return null;
  } catch (error) {
    console.warn('Error parsing material info:', error);
    return null;
  }
}

export async function getAIFixRecommendations(element: Element): Promise<AIRecommendation | null> {
  if (!element) return null;
  
  await new Promise((r) => setTimeout(r, 800));
  
  let recommendations: AIRecommendation = {
    analysis: "",
    suggestions: []
  };

  if (element.type === "Wall") {
    const missingUValue = !element.props.UValue;
    const missingFireClass = !element.props.fireClass;
    
    if (missingUValue && missingFireClass) {
      recommendations.analysis = `Wall ${element.id} is missing both thermal insulation (U-Value) and fire protection properties. Based on typical residential construction standards, I recommend:`;
      recommendations.suggestions = [
        {
          property: "UValue",
          label: "U-Value (W/m²K)",
          options: [
            { value: 0.18, reason: "Passive house standard - excellent insulation" },
            { value: 0.25, reason: "Modern building code compliance" },
            { value: 0.35, reason: "Standard insulation requirement" }
          ]
        },
        {
          property: "fireClass",
          label: "Fire Resistance Class",
          options: [
            { value: "F90", reason: "High-rise or critical structural element" },
            { value: "F60", reason: "Standard residential/commercial" },
            { value: "F30", reason: "Non-load bearing partition" }
          ]
        }
      ];
    } else if (missingUValue) {
      recommendations.analysis = `Wall ${element.id} needs thermal insulation specification. Based on the existing fire class ${element.props.fireClass}, this appears to be a structural element.`;
      recommendations.suggestions = [
        {
          property: "UValue",
          label: "U-Value (W/m²K)",
          options: [
            { value: 0.18, reason: "Energy-efficient standard" },
            { value: 0.25, reason: "Building code minimum" },
            { value: 0.30, reason: "Basic compliance" }
          ]
        }
      ];
    } else if (missingFireClass) {
      recommendations.analysis = `Wall ${element.id} has good thermal properties (U-Value: ${element.props.UValue}) but needs fire resistance classification.`;
      recommendations.suggestions = [
        {
          property: "fireClass",
          label: "Fire Resistance Class",
          options: [
            { value: "F60", reason: "Recommended for this U-Value range" },
            { value: "F30", reason: "Minimum for partition walls" },
            { value: "F90", reason: "If load-bearing or escape route" }
          ]
        }
      ];
    }
  } else if (element.type === "Door") {
    recommendations.analysis = `Door ${element.id} requires fire resistance rating for building code compliance. Based on typical door applications:`;
    recommendations.suggestions = [
      {
        property: "fireClass",
        label: "Fire Resistance Class",
        options: [
          { value: "F30", reason: "Standard interior door" },
          { value: "F60", reason: "Fire compartment separation" },
          { value: "F90", reason: "Emergency exit or high-risk area" }
        ]
      }
    ];
  }

  return recommendations;
}

export function calculateElementStatus(element: Element): Element['status'] {
  let status: Element['status'] = "pass";
  
  if (element.type === "Wall") {
    if (!element.props.UValue && !element.props.fireClass) status = "fail";
    else if (!element.props.UValue || !element.props.fireClass) status = "warn";
  } else if (element.type === "Door") {
    if (!element.props.fireClass) status = "warn";
  }
  
  return status;
}

export function applyAISuggestionToElement(
  elements: Element[], 
  selectedId: string, 
  property: string, 
  value: string | number
): Element[] {
  return elements.map((element) => {
    if (element.id === selectedId) {
      const updatedProps = { ...element.props, [property]: value };
      const newStatus = calculateElementStatus({ ...element, props: updatedProps });
      return { ...element, props: updatedProps, status: newStatus };
    }
    return element;
  });
}

export function manualFixElement(element: Element): { props: any; fixed: boolean } {
  let updatedProps = { ...element.props };
  let fixed = false;

  if (element.type === "Wall") {
    if (!element.props.UValue) {
      const uValue = prompt("Enter U-Value for wall (e.g., 0.25):");
      if (uValue && !isNaN(parseFloat(uValue))) {
        updatedProps.UValue = parseFloat(uValue);
        fixed = true;
      }
    }
    if (!element.props.fireClass) {
      const fireClass = prompt("Enter Fire Class (e.g., F30, F60, F90):");
      if (fireClass) {
        updatedProps.fireClass = fireClass;
        fixed = true;
      }
    }
  } else if (element.type === "Door") {
    if (!element.props.fireClass) {
      const fireClass = prompt("Enter Fire Class for door (e.g., F30, F60):");
      if (fireClass) {
        updatedProps.fireClass = fireClass;
        fixed = true;
      }
    }
  }

  return { props: updatedProps, fixed };
}

export function runElementRuleCheck(elements: Element[]): Element[] {
  return elements.map((el) => {
    const status = calculateElementStatus(el);
    return { ...el, status };
  });
}
