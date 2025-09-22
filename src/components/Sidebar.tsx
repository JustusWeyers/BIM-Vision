import {FC} from 'react';
import { IconMessage, IconAlert, IconBrain, IconTool, IconSend, IconDatabase } from '../Icons';

interface Element {
  id: string;
  type: string;
  props: {
    UValue?: number | null;
    fireClass?: string | null;
    material?: string;
  };
  status: 'pass' | 'warn' | 'fail' | 'unknown';
  color: number;
}

interface Issue {
  id: string;
  elementId: string;
  title: string;
  description: string;
  createdAt: string;
}

interface AIRecommendation {
  analysis: string;
  suggestions: Array<{
    property: string;
    label: string;
    options: Array<{
      value: string | number;
      reason: string;
    }>;
  }>;
}

interface SidebarProps {
  selectedId: string | null;
  selectedElement: Element | null;
  elements: Element[];
  issues: Issue[];
  aiRecommendations: AIRecommendation | null;
  loadingRecommendations: boolean;
  openaiApiKey: string;
  onExplain: () => void;
  onCreateIssue: () => void;
  onGetAIRecommendations: () => void;
  onFixElement: (elementId: string) => void;
  onApplySuggestion: (property: string, value: string | number) => void;
  onApiKeyChange: (key: string) => void;
}

const Sidebar: FC<SidebarProps> = ({
  selectedId,
  selectedElement,
  elements,
  issues,
  aiRecommendations,
  loadingRecommendations,
  openaiApiKey,
  onExplain,
  onCreateIssue,
  onGetAIRecommendations,
  onFixElement,
  onApplySuggestion,
  onApiKeyChange
}) => {
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
              <div style={{ fontSize: 12, color: '#374151' }}>
                ID: <span style={{ fontWeight: 500 }}>{selectedId}</span>
                {selectedElement && (
                  <>
                    <br />Type: <span style={{ fontWeight: 500 }}>{selectedElement.type}</span>
                    <br />Status: <span style={{
                      fontWeight: 500,
                      color: selectedElement.status === 'pass' ? '#16a34a' : selectedElement.status === 'warn' ? '#d97706' : '#dc2626'
                    }}>{selectedElement.status}</span>
                  </>
                )}
              </div>
              <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button onClick={onExplain} style={{ background: '#8b5cf6', color: 'white', borderRadius: 4, padding: '6px 10px', display: 'flex', gap: 4, alignItems: 'center', fontWeight: 500, fontSize: 12, border: 'none', cursor: 'pointer' }}>
                  <IconMessage width={12} height={12} /> Explain
                </button>
                <button onClick={onCreateIssue} style={{ background: '#f59e0b', color: 'white', borderRadius: 4, padding: '6px 10px', display: 'flex', gap: 4, alignItems: 'center', fontWeight: 500, fontSize: 12, border: 'none', cursor: 'pointer' }}>
                  <IconAlert width={12} height={12} /> Issue
                </button>
                {(() => {
                  const el = elements.find((e) => e.id === selectedId);
                  if (el && (el.status === 'warn' || el.status === 'fail')) {
                    return (
                      <>
                        <button onClick={onGetAIRecommendations} style={{ background: '#06b6d4', color: 'white', borderRadius: 4, padding: '6px 10px', display: 'flex', gap: 4, alignItems: 'center', fontWeight: 500, fontSize: 12, border: 'none', cursor: 'pointer' }}>
                          <IconBrain width={12} height={12} /> AI Fix
                        </button>
                        <button onClick={() => onFixElement(selectedId)} style={{ background: '#10b981', color: 'white', borderRadius: 4, padding: '6px 10px', display: 'flex', gap: 4, alignItems: 'center', fontWeight: 500, fontSize: 12, border: 'none', cursor: 'pointer' }}>
                          <IconTool width={12} height={12} /> Manual Fix
                        </button>
                      </>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
          )}
        </div>

        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f3f4f6' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#1f2937', marginBottom: 6 }}>Properties</div>
          {selectedId ? (() => {
            const el = elements.find((e) => e.id === selectedId);
            if (!el) return <div style={{ color: '#6B7280', marginTop: 8 }}>Not found</div>;
            return (
              <div style={{ marginTop: 8, color: '#111827', fontSize: 14 }}>
                <div>Type: <strong>{el.type}</strong></div>
                <div>U-Value: <strong>{String(el.props.UValue)}</strong></div>
                <div>Fire Class: <strong>{String(el.props.fireClass)}</strong></div>
                <div>Status: <strong style={{ color: el.status === 'pass' ? '#16A34A' : el.status === 'warn' ? '#B45309' : '#C2410C' }}>{el.status}</strong></div>
              </div>
            );
          })() : (
            <div style={{ color: '#6B7280', marginTop: 8 }}>Select an element to view properties</div>
          )}
        </div>
      </div>

      {/* Issues Panel */}
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

      {/* AI Recommendations */}
      {aiRecommendations && (
        <div style={{ background: 'white', padding: 16, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: '#1f2937', marginBottom: 8 }}>AI Recommendations</div>
          <div style={{ fontSize: 12, color: '#374151', marginBottom: 12 }}>{aiRecommendations.analysis}</div>
          {aiRecommendations.suggestions.map((suggestion, index) => (
            <div key={index} style={{ marginBottom: 12, padding: 12, background: '#f8fafc', borderRadius: 6, border: '1px solid #e5e7eb' }}>
              <div style={{ fontWeight: 500, fontSize: 12, color: '#1f2937', marginBottom: 6 }}>{suggestion.label}</div>
              {suggestion.options.map((option, optIndex) => (
                <button
                  key={optIndex}
                  onClick={() => onApplySuggestion(suggestion.property, option.value)}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '6px 8px', marginBottom: 4, background: 'white', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 11, cursor: 'pointer' }}
                >
                  <strong>{option.value}</strong> - {option.reason}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* BIM Portal Integration */}
      <div style={{ background: 'white', padding: 16, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: '#1f2937', marginBottom: 12 }}>BIM Portal Integration</div>
        
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>OpenAI API Key (Optional)</div>
          <input
            type="password"
            value={openaiApiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
            placeholder="sk-... (leave empty for mock responses)"
            style={{
              width: '100%',
              padding: '6px 8px',
              border: '1px solid #e5e7eb',
              borderRadius: 4,
              fontSize: 11,
              fontFamily: 'monospace'
            }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <button style={{ flex: 1, background: '#3b82f6', color: 'white', borderRadius: 4, padding: '8px 12px', display: 'flex', gap: 4, alignItems: 'center', justifyContent: 'center', fontWeight: 500, fontSize: 12, border: 'none', cursor: 'pointer' }}>
            <IconSend width={12} height={12} /> Send Report
          </button>
          <button style={{ flex: 1, background: '#10b981', color: 'white', borderRadius: 4, padding: '8px 12px', display: 'flex', gap: 4, alignItems: 'center', justifyContent: 'center', fontWeight: 500, fontSize: 12, border: 'none', cursor: 'pointer' }}>
            <IconDatabase width={12} height={12} /> Sync Data
          </button>
        </div>

        <div style={{ fontSize: 11, color: '#6b7280' }}>
          <div>Portal Status: <span style={{ color: '#16a34a', fontWeight: 500 }}>Connected</span></div>
          <div>Last Sync: <span style={{ fontWeight: 500 }}>2 minutes ago</span></div>
          <div>AI Mode: <span style={{ fontWeight: 500, color: openaiApiKey ? '#16a34a' : '#f59e0b' }}>{openaiApiKey ? 'OpenAI GPT-4' : 'Mock Responses'}</span></div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
