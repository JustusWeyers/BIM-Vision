import { useEffect, useRef, useState } from "react";
import { Element, Issue, AIRecommendation } from './types';
import {
  mockLLMExplain,
  getAIFixRecommendations,
  applyAISuggestionToElement,
  manualFixElement,
  runElementRuleCheck,
  LLMExplain,
  getAILLMRecommendations,
  calculateElementStatus
} from './utils/llmUtils';
import { createIssue, createAndSubmitToJira } from './utils/issueUtils';
import { isLoggedIn, logout, backendFetch } from './utils/auth';
import { IconCube } from "./Icons";
import ModelViewer from './components/ModelViewer';
import MockViewer from './components/MockViewer';
import Sidebar from './components/Sidebar';
import LoginPage from './components/LoginPage';

import KanbanBoard from "./components/kabanboard";
import { PropertiesProvider } from "./utils/PropertiesContext";
import { IdsRequest, runIDSCheck } from "./ValidationReport";
import * as OBC from "@thatopen/components";
import { AuthProvider } from "./BIMPortal/context";


const App: React.FC = () => {
  const [loggedIn, setLoggedIn] = useState<boolean>(isLoggedIn());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteAccount = async () => {
    const res = await backendFetch('/auth/account', { method: 'DELETE' });
    if (res.ok) {
      logout();
      setLoggedIn(false);
    } else {
      alert('Konto konnte nicht gelöscht werden.');
    }
    setShowDeleteConfirm(false);
  };
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [elements, setElements] = useState<Element[]>([]);
  const [llmText, setLlmText] = useState<string>("");
  const [running, setRunning] = useState<boolean>(false);
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation | null>(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState<boolean>(false);
  const [loadingAIIssue, setLoadingAIIssue] = useState<boolean>(false);
  const [useMockViewer, setUseMockViewer] = useState<boolean>(true);
  const [useMockExplain, setUseMockExplain] = useState<boolean>(false);
  const [components, setComponents] = useState<OBC.Components | null>(null);
  const api_key = '';
  const jiraConfig = {
    baseUrl: "",
    email: "",
    apiToken: "",
    projectKey: ""
  };
  const [resultsCheck, setResults] = useState<any>(null);

  const aiaRef = useRef<string | null>(null);

  const runRuleCheck = async () => {
    if (!components) return alert("Components not initialized");
    const idsXML = await IdsRequest("/aia/api/v1/public/aiaProject/{guid}/IDS", "0f025453-562a-489f-9e4c-58b675128f85");
    if (!idsXML) return alert("IDS XML could not be loaded");
    const {pass, fail, warn, results} = await runIDSCheck(components, idsXML);
    setResults(results);
  };

  const addIssue = (title: string, description: string) => {
    if (!selectedId) {
      alert("Please select an element first.");
      return;
    }
    const issue = createIssue(issues, selectedId, title, description);
    setIssues((prev) => [issue, ...prev]);
  };

  const handleExplain = async (element: Element) => {
    setLlmText("...working...");

    if (useMockExplain) {
      const resp = await mockLLMExplain(element);
      setLlmText(resp);
    } else {
      const resp = await LLMExplain(api_key, element);
      setLlmText(resp);
    }
  };

  const handleGetAIRecommendations = async (element: Element) => {
    if (!element || element.status === 'pass') return;

    setLoadingRecommendations(true);
    try {
      //const recommendations = await getAIFixRecommendations(el);
      const recommendations = await getAILLMRecommendations(api_key, element, llmText);
      setAiRecommendations(recommendations);
    } catch (error) {
      alert("Failed to get AI recommendations");
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const applyAISuggestion = (property: string, value: string | number) => {
    if (!selectedId) {
      setAiRecommendations(null);
      return null;
    }

    const currentElement = elements.find(e => e.id === selectedId);
    const currentStatus = currentElement?.status;

    const updatedElements = applyAISuggestionToElement(elements, selectedId, property, value);
    setElements(updatedElements);

    const updatedElement = updatedElements.find(e => e.id === selectedId);
    const newStatus = updatedElement?.status;

    const statusImproved = (currentStatus === 'fail' && newStatus === 'warn') ||
      (currentStatus === 'warn' && newStatus === 'pass') ||
      (newStatus === 'pass');

    setAiRecommendations(null);

  };

  const fixElement = (elementId: string) => {
    const el = elements.find((e) => e.id === elementId);
    if (!el) return;

    const { props: updatedProps, fixed } = manualFixElement(el);

    if (fixed) {
      const updatedElements = applyAISuggestionToElement(elements, elementId, '', '');
      const finalElements = elements.map((element) => {
        if (element.id === elementId) {
          const updatedElement = { ...element, props: updatedProps };
          return { ...updatedElement, status: runElementRuleCheck([updatedElement])[0].status };
        }
        return element;
      });

      setElements(finalElements);
      alert("Element properties updated successfully!");
    }
  };

  const setIFCElements = (elements: Element[]) => {
    setElements(elements);
  }

  const handleCreateAIIssue = async (element: Element) => {

    setLoadingAIIssue(true);
    try {
      const result = await createAndSubmitToJira(
        api_key,
        element,
        jiraConfig,
        "BIM Project",
        "Ayman Soultana",
        "0f025453-562a-489f-9e4c-58b675128f85",
        resultsCheck
      );
      if (result.success) {
        alert(`AI Issue created successfully! Jira Issue: ${result.jiraKey}`);
      } else {
        alert(`Failed to create AI issue: ${result.error}`);
      }
    } catch (error) {
      alert("Failed to create AI issue");
    } finally {
      setLoadingAIIssue(false);
    }
  };

  if (!loggedIn) {
    return <LoginPage onLogin={() => setLoggedIn(true)} />;
  }

  return (
    <>
    {showDeleteConfirm && (
      <div style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        fontFamily: 'Inter, system-ui, sans-serif'
      }}>
        <div style={{ background: 'white', borderRadius: 12, padding: 32, maxWidth: 360, width: '100%' }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#1f2937', marginBottom: 8 }}>Konto wirklich löschen?</div>
          <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 24 }}>
            Alle Ihre Daten werden unwiderruflich gelöscht. Dieser Vorgang kann nicht rückgängig gemacht werden.
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setShowDeleteConfirm(false)} style={{
              flex: 1, padding: '9px', background: '#f3f4f6', color: '#374151',
              border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: 'pointer'
            }}>Abbrechen</button>
            <button onClick={handleDeleteAccount} style={{
              flex: 1, padding: '9px', background: '#dc2626', color: 'white',
              border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: 'pointer'
            }}>Ja, löschen</button>
          </div>
        </div>
      </div>
    )}
    <AuthProvider>
      <PropertiesProvider>
        <div style={{
          fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
          minHeight: '100vh',
          background: '#f8fafc',
          padding: 20
        }}>
          {/* Header */}
          <div style={{ maxWidth: 1200, margin: '0 auto', marginBottom: 20 }}>
            <div style={{
              background: 'white',
              padding: '16px 20px',
              borderRadius: 8,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    background: '#3b82f6',
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <IconCube width={20} height={20} style={{ color: 'white' }} />
                  </div>
                  <div>
                    <h1 style={{
                      fontSize: 20,
                      fontWeight: 600,
                      color: '#1f2937',
                      margin: 0
                    }}>BIM Rule Check Visualizer</h1>
                    <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>BIM Rule Validation
                      Platform</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{
                    padding: '4px 8px',
                    background: '#dcfce7',
                    color: '#16a34a',
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 500
                  }}>Connected
                  </div>
                  <div style={{
                    padding: '4px 8px',
                    background: '#f3f4f6',
                    color: '#6b7280',
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 500
                  }}>v1.0.0
                  </div>
                  <button
                    onClick={() => { logout(); setLoggedIn(false); }}
                    style={{
                      padding: '4px 10px',
                      background: '#fee2e2',
                      color: '#dc2626',
                      border: 'none',
                      borderRadius: 4,
                      fontSize: 11,
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                  >Abmelden</button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    style={{
                      padding: '4px 10px',
                      background: '#f3f4f6',
                      color: '#6b7280',
                      border: 'none',
                      borderRadius: 4,
                      fontSize: 11,
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                  >Konto löschen</button>
                </div>
              </div>
            </div>
          </div>

          <div style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1fr 440px',
            gap: 20
          }}>
            <ModelViewer
              onRunRuleCheck={runRuleCheck}
              running={running}
              onExport={() => alert('Export functionality')}
              setComponents={setComponents}
              components={components}
              setElementsIFC={setIFCElements}
            />

            <Sidebar
              selectedId={selectedId}
              elements={elements}
              issues={issues}
              llmText={llmText}
              aiRecommendations={aiRecommendations}
              loadingRecommendations={loadingRecommendations}
              onExplain={handleExplain}
              onAddIssue={addIssue}
              onGetAIRecommendations={handleGetAIRecommendations}
              onApplyAISuggestion={applyAISuggestion}
              onFixElement={fixElement}
              onCreateAIIssue={handleCreateAIIssue}
              loadingAIIssue={loadingAIIssue}
              onAddElement={setIFCElements}
              aiaRef={aiaRef}
              resultsCheck = {resultsCheck}
            />
          </div>
        </div>
      </PropertiesProvider>
    </AuthProvider>
    </>
  );
};

export default App;
