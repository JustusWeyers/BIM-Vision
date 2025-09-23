import React, {MutableRefObject, useEffect} from 'react';
import { Element, Issue, AIRecommendation } from '../types';
import { IconAlert, IconBrain, IconCheck, IconDatabase, IconMessage, IconSend, IconTool } from '../Icons';
import { buiGridContainerRef } from './IFCViewer';
import { useProperties } from '../utils/PropertiesContext';
import * as BUI from "@thatopen/ui";
import * as BUIC from "@thatopen/ui-obc";
import { fileInputRef } from './IFCViewer';
import BIMPortalSelect from "./BIMPortalSelect";
interface SidebarProps {
  selectedId: string | null;
  elements: Element[];
  issues: Issue[];
  llmText: string;
  aiRecommendations: AIRecommendation | null;
  loadingRecommendations: boolean;
  loadingAIIssue: boolean;
  onExplain: () => void;
  onAddIssue: (title: string, description: string) => void;
  onGetAIRecommendations: () => void;
  onApplyAISuggestion: (property: string, value: string | number) => void;
  onFixElement: (elementId: string) => void;
  onCreateAIIssue: () => void;
  selectedBIMPortalAIAguidRef: MutableRefObject<string | null>;
}

const Sidebar: React.FC<SidebarProps> = ({
  selectedId,
  elements,
  issues,
  llmText,
  aiRecommendations,
  loadingRecommendations,
  loadingAIIssue,
  onExplain,
  onAddIssue,
  onGetAIRecommendations,
  onApplyAISuggestion,
  onFixElement,
  onCreateAIIssue,
  selectedBIMPortalAIAguidRef,
}) => {
  const selectedElement = selectedId ? elements.find((e) => e.id === selectedId) : null;

  const { properties, components, viewport: viewportRef, update } = useProperties();

  useEffect(() =>
    update.current = () => {
      console.log("update ref", !!properties.current, !!components.current, !!viewportRef.current);
      const propertiesPanel = BUI.Component.create(() => {
        console.log("Creating properties panel...");
        if (!properties.current) return BUI.html`<div>Click a model to view properties</div>`;
        const [loadFragBtn] = BUIC.buttons.loadFrag({ components: components.current });

        const onTextInput = (e: Event) => {
          const input = e.target as BUI.TextInput;
          properties.current.queryString = input.value !== "" ? input.value : null;
        };

        const expandTable = (e: Event) => {
          const button = e.target as BUI.Button;
          properties.current.expanded = !properties.current.expanded;
          button.label = properties.current.expanded ? "Collapse" : "Expand";
        };

        const copyAsTSV = async () => {
          await navigator.clipboard.writeText(properties.current.tsv);
        };

        return BUI.html`
      <bim-panel label="Properties">
        <bim-panel-section label="Element Data">
          <div style="display: flex; gap: 0.5rem;">
            <bim-button @click=${expandTable} label=${properties.current.expanded ? "Collapse" : "Expand"}></bim-button> 
          </div> 
          <bim-text-input @input=${onTextInput} placeholder="Search Property" debounce="250"></bim-text-input>
          ${properties.current}
        </bim-panel-section>
      </bim-panel>
    `;
      });

      const app = document.createElement("bim-grid") as BUI.Grid<["main"]>;
      app.layouts = {
        main: {
          template: `
      "propertiesPanel viewport"
      /25rem 1fr
      `,
          elements: { propertiesPanel, viewport: viewportRef.current },
        },
      };

      const propertiesContainer = document.getElementById("properties-container")

      propertiesContainer.innerHTML = "";

      app.layout = "main";
      propertiesContainer.append(app);
    })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Element Inspector */}
      <div style={{ background: 'white', padding: 16, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: '#1f2937' }}>Element Inspector</div>
          {!selectedId ? (
            <div style={{ color: '#6b7280', fontSize: 12, marginTop: 4 }}>No element selected</div>
          ) : (
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 12, color: '#374151' }}>ID: <span style={{ fontWeight: 500 }}>{selectedId}</span></div>
              <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button onClick={onExplain} style={{ background: '#8b5cf6', color: 'white', borderRadius: 4, padding: '6px 10px', display: 'flex', gap: 4, alignItems: 'center', fontWeight: 500, fontSize: 12, border: 'none', cursor: 'pointer' }}>
                  <IconMessage width={12} height={12} /> Explain
                </button>
                <button onClick={() => {
                  const title = prompt('Issue title:');
                  const desc = prompt('Issue description:');
                  if (title) onAddIssue(title, desc || '');
                }} style={{ background: '#f59e0b', color: 'white', borderRadius: 4, padding: '6px 10px', display: 'flex', gap: 4, alignItems: 'center', fontWeight: 500, fontSize: 12, border: 'none', cursor: 'pointer' }}>
                  <IconAlert width={12} height={12} /> Issue
                </button>
                <button onClick={onCreateAIIssue} disabled={loadingAIIssue} style={{
                  background: loadingAIIssue ? '#94a3b8' : '#06b6d4',
                  color: 'white',
                  borderRadius: 4,
                  padding: '6px 10px',
                  display: 'flex',
                  gap: 4,
                  alignItems: 'center',
                  fontWeight: 500,
                  fontSize: 12,
                  border: 'none',
                  cursor: loadingAIIssue ? 'not-allowed' : 'pointer'
                }}>
                  <IconBrain width={12} height={12} /> {loadingAIIssue ? 'Creating...' : 'AI Issue'}
                </button>
                {selectedElement && (selectedElement.status === 'warn' || selectedElement.status === 'fail') && (
                  <>
                    <button onClick={onGetAIRecommendations} style={{ background: '#06b6d4', color: 'white', borderRadius: 4, padding: '6px 10px', display: 'flex', gap: 4, alignItems: 'center', fontWeight: 500, fontSize: 12, border: 'none', cursor: 'pointer' }}>
                      <IconBrain width={12} height={12} /> AI Fix
                    </button>
                    <button onClick={() => onFixElement(selectedId)} style={{ background: '#10b981', color: 'white', borderRadius: 4, padding: '6px 10px', display: 'flex', gap: 4, alignItems: 'center', fontWeight: 500, fontSize: 12, border: 'none', cursor: 'pointer' }}>
                      <IconTool width={12} height={12} /> Manual Fix
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <div id="properties-container" style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f3f4f6', maxHeight: "50vh", overflow: "auto" }}>
          {/* Element Properties */}

        </div>
      </div>

      {/* AI Analysis */}
      {llmText && (
        <div style={{ background: 'white', padding: 16, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: '#1f2937', marginBottom: 8 }}>AI Analysis</div>
          <div style={{ color: '#374151', fontSize: 13, lineHeight: 1.5, padding: '8px 12px', background: '#f8fafc', borderRadius: 4, border: '1px solid #e5e7eb' }}>{llmText}</div>
        </div>
      )}

      {/* AI Recommendations */}
      {aiRecommendations && (
        <div style={{ background: 'white', padding: 16, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <IconBrain width={16} height={16} style={{ color: '#06b6d4' }} />
            <div style={{ fontWeight: 600, fontSize: 14, color: '#1f2937' }}>AI Fix Recommendations</div>
          </div>

          {loadingRecommendations ? (
            <div style={{ color: '#6b7280', fontSize: 13, padding: '12px 0' }}>Analyzing element context...</div>
          ) : (
            <>
              <div style={{ color: '#374151', fontSize: 13, lineHeight: 1.5, marginBottom: 16, padding: '8px 12px', background: '#f0f9ff', borderRadius: 4, border: '1px solid #e0f2fe' }}>
                {aiRecommendations.analysis}
              </div>

              {aiRecommendations.suggestions.map((suggestion, idx) => (
                <div key={idx} style={{ marginBottom: 16 }}>
                  <div style={{ fontWeight: 500, fontSize: 12, color: '#1f2937', marginBottom: 8 }}>{suggestion.label}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {suggestion.options.map((option, optIdx) => (
                      <button
                        key={optIdx}
                        onClick={() => onApplyAISuggestion(suggestion.property, option.value)}
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #e5e7eb',
                          borderRadius: 6,
                          padding: '8px 12px',
                          textAlign: 'left',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          fontSize: 12
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#f0f9ff';
                          e.currentTarget.style.borderColor = '#06b6d4';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#f8fafc';
                          e.currentTarget.style.borderColor = '#e5e7eb';
                        }}
                      >
                        <div style={{ fontWeight: 500, color: '#1f2937', marginBottom: 2 }}>
                          {option.value} {suggestion.property === 'UValue' ? 'W/m²K' : ''}
                        </div>
                        <div style={{ color: '#6b7280', fontSize: 11 }}>{option.reason}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Issues */}
      <div style={{ background: 'white', padding: 16, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: '#1f2937', marginBottom: 12 }}>Issues ({issues.length})</div>
        {issues.length === 0 ? (
          <div style={{ color: '#6B7280', fontSize: 13 }}>No issues created yet</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {issues.map((issue) => (
              <div key={issue.id} style={{ padding: 12, border: '1px solid #fef3c7', borderRadius: 6, background: '#fffbeb' }}>
                <div style={{ fontWeight: 500, fontSize: 13, color: '#1f2937' }}>{issue.title}</div>
                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>
                  #{issue.elementId} • {new Date(issue.createdAt).toLocaleDateString()}
                </div>
                {issue.description && (
                  <div style={{ fontSize: 12, color: '#374151', marginTop: 6 }}>{issue.description}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

        <BIMPortalSelect {...{selectedBIMPortalAIAguidRef}} />

    </div>
  );
};

export default Sidebar;
