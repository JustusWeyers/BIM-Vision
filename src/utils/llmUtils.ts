import { makeBIMPortalRequest } from '../BIMPortal/api';
import { Element, AIRecommendation, Issue } from '../types';
import { backendFetch } from './auth';

async function callLLM(messages: { role: string; content: string }[], maxTokens = 500, temperature = 0.3): Promise<string | null> {
  try {
    const res = await backendFetch('/api/llm/chat', {
      method: 'POST',
      body: JSON.stringify({ messages, max_tokens: maxTokens, temperature })
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? null;
  } catch {
    return null;
  }
}

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

export async function LLMExplain(api_key: string, element: Element, resultsCheck: any = ""): Promise<string> {
  try {
    const idsData = await makeBIMPortalRequest("/aia/api/v1/public/aiaProject/{guid}/IDS", "get", element.guid);

    let context = '';
    if (idsData) {
      context = typeof idsData === 'string'
        ? parseIDSForElement(idsData, element.type)
        : `IDS Requirements (Structured):\n${JSON.stringify(idsData, null, 2)}`;
    } else {
      context = 'No IDS data available for this element from BIM Portal.';
    }

    let validationContext = '';
    if (resultsCheck && (resultsCheck.failed || resultsCheck.passed)) {
      const failedSpecs = (resultsCheck.failed ?? []).filter((s: any) => s.guids.includes(element.id) || s.guids.includes(element.guid));
      const passedSpecs = (resultsCheck.passed ?? []).filter((s: any) => s.guids.includes(element.id) || s.guids.includes(element.guid));
      if (failedSpecs.length > 0 || passedSpecs.length > 0) {
        validationContext = '\n\nIDS Validation Results:\n';
        if (failedSpecs.length > 0) validationContext += `FAILED:\n${failedSpecs.map((s: any) => `- ${s.name}`).join('\n')}\n`;
        if (passedSpecs.length > 0) validationContext += `PASSED:\n${passedSpecs.map((s: any) => `- ${s.name}`).join('\n')}\n`;
        validationContext += `Summary: ${failedSpecs.length} failed, ${passedSpecs.length} passed.\n`;
      }
    }

    const prompt = `Du bist ein BIM-Experte für deutsche Bauvorschriften. Analysiere dieses BIM-Element:
Element: ${element.id} (${element.type}), Status: ${element.status}
Eigenschaften: ${JSON.stringify(element.props, null, 2)}
${context}${validationContext}
Erkläre: 1. Was ist das Element? 2. Was bedeutet der Status? 3. Welche IDS-Anforderungen gibt es? 4. Was fehlt?
Antworte auf Deutsch. Max. 50 Wörter.`;

    const result = await callLLM([
      { role: 'system', content: 'Du bist ein deutscher BIM-Experte mit Spezialisierung auf Bauvorschriften und IDS-Analyse.' },
      { role: 'user', content: prompt }
    ]);

    return result ?? await mockLLMExplain(element);
  } catch (error) {
    console.error('LLM explanation failed:', error);
    return mockLLMExplain(element);
  }
}

export function parseIDSForElement(idsXml: string, elementType: string): string {
  if (!idsXml || typeof idsXml !== 'string') return '';
  elementType = "Wall"
  const requirements: string[] = [];
  
  const specMatches = idsXml.match(/<specification[^>]*>([\s\S]*?)<\/specification>/g);
  
  if (specMatches) {
    for (const spec of specMatches) {
      const isRelevant = checkSpecificationRelevance(spec, elementType);
      if (!isRelevant) continue;
      
      const nameMatch = spec.match(/name="([^"]*)"/);
      const specName = nameMatch ? nameMatch[1] : 'Unknown';
      
      const propertyMatches = spec.match(/<property[^>]*>([\s\S]*?)<\/property>/g);
      
      if (propertyMatches) {
        const specRequirements: string[] = [];
        
        for (const prop of propertyMatches) {
          const propertyInfo = extractPropertyInfo(prop);
          if (propertyInfo) {
            specRequirements.push(`  • ${propertyInfo}`);
          }
        }
        
        if (specRequirements.length > 0) {
          requirements.push(`${specName}:`);
          requirements.push(...specRequirements);
        }
      }
    }
  }
  
  return requirements.length > 0 
    ? `Relevante IDS Anforderungen:\n${requirements.join('\n')}`
    : `Keine spezifischen IDS Anforderungen für ${elementType} gefunden.`;
}

function checkSpecificationRelevance(specification: string, elementType: string): boolean {
  const entityMatch = specification.match(/<name>\s*<simpleValue>([^<]*)<\/simpleValue>\s*<\/name>/);
  
  if (!entityMatch) return false;
  
  const ifcEntity = entityMatch[1].toLowerCase();
  
  const elementMappings = {
    'Wall': ['ifcwall', 'ifcslab'],
    'Door': ['ifcdoor'],
    'Column': ['ifccolumn'],
    'Window': ['ifcwindow'],
    'Roof': ['ifcroof'],
    'Slab': ['ifcslab']
  };
  
  const relevantEntities = elementMappings[elementType as keyof typeof elementMappings] || [];
  
  return relevantEntities.some(entity => 
    ifcEntity.includes(entity.toLowerCase())
  );
}

function extractPropertyInfo(propertyXml: string): string | null {
  try {
    const propertySetMatch = propertyXml.match(/<propertySet>\s*<simpleValue>([^<]*)<\/simpleValue>\s*<\/propertySet>/);
    
    const baseNameMatch = propertyXml.match(/<baseName>\s*<simpleValue>([^<]*)<\/simpleValue>\s*<\/baseName>/);
    
    const cardinalityMatch = propertyXml.match(/cardinality="([^"]*)"/);
    
    if (!baseNameMatch) return null;
    
    const baseName = baseNameMatch[1];
    const cardinality = cardinalityMatch ? cardinalityMatch[1] : '';
    const isRequired = cardinality === 'required';
    
    let requirement = baseName;
    if (isRequired) {
      requirement += ' (erforderlich)';
    }
    
    return requirement;
  } catch (error) {
    console.warn('Error parsing property info:', error);
    return null;
  }
}

export async function getAILLMRecommendations(api_key: string, element: Element, analysis: string, resultsCheck: any = ""): Promise<AIRecommendation | null> {
  if (!element) return null;

  let contextInfo = analysis;
  if (!analysis || analysis.trim().length < 20) {
    contextInfo = await LLMExplain(api_key, element, resultsCheck);
  }

  let validationContext = '';
  if (resultsCheck && (resultsCheck.failed || resultsCheck.passed)) {
    const failedSpecs = (resultsCheck.failed ?? []).filter((s: any) => s.guids.includes(element.id) || s.guids.includes(element.guid));
    const passedSpecs = (resultsCheck.passed ?? []).filter((s: any) => s.guids.includes(element.id) || s.guids.includes(element.guid));
    if (failedSpecs.length > 0 || passedSpecs.length > 0) {
      validationContext = '\n\nIDS Validation Results:\n';
      if (failedSpecs.length > 0) validationContext += `FAILED:\n${failedSpecs.map((s: any) => `- ${s.name}`).join('\n')}\n`;
      if (passedSpecs.length > 0) validationContext += `PASSED:\n${passedSpecs.map((s: any) => `- ${s.name}`).join('\n')}\n`;
    }
  }

  const prompt = `Als BIM-Experte generiere 2-4 Lösungsvorschläge für dieses Element als JSON. NUR JSON, KEIN ANDERER TEXT:
Element: ${element.id} (${element.type}), Status: ${element.status}
Eigenschaften: ${JSON.stringify(element.props)}
Kontext: ${contextInfo}${validationContext}
{"suggestions":[{"property":"eigenschaftsname","label":"Deutsche Beschreibung","options":[{"value":"wert1","reason":"Begründung"}]}]}`;

  const MAX_RETRIES = 5;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const content = await callLLM([
      { role: 'system', content: 'Du bist ein deutscher BIM-Experte. Antworte nur mit gültigem JSON ohne zusätzlichen Text.' },
      { role: 'user', content: prompt }
    ], 300, 0.2);

    if (!content) continue;

    try {
      const parsed = JSON.parse(content);
      return { analysis: contextInfo, suggestions: parsed.suggestions || [] };
    } catch {
      console.warn(`JSON parse fehlgeschlagen, Versuch ${attempt}`);
    }
  }

  return null;
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
