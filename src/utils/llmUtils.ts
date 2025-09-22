import { Element, AIRecommendation } from '../types';

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

export async function getAIFixRecommendations(element: Element): Promise<AIRecommendation | null> {
  if (!element) return null;
  
  // Simulate AI analysis delay
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
