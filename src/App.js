import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/*
ArchVision - BIM Rule Validation & Visualization Platform
- BIM compliance checking with AI-powered insights
- Interactive 3D model viewer with real-time rule validation
- Issue tracking and compliance reporting
- AI-powered explanations for building code violations
- Clean, responsive UI designed for architects and engineers

Features:
- Load and visualize IFC building models
- Real-time building code compliance checking
- AI-powered violation explanations
- Issue tracking and project management
- Export compliance reports
*/

const IconCube = ({ width = 18, height = 18 }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4.04a2 2 0 0 0-2 0l-7 4.04A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4.04a2 2 0 0 0 2 0l7-4.04A2 2 0 0 0 21 16z" />
    <path d="M12 22v-10" />
  </svg>
);
const IconUpload = ({ width = 14, height = 14 }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 5 17 10" />
    <line x1="12" y1="5" x2="12" y2="19" />
  </svg>
);
const IconCheck = ({ width = 14, height = 14 }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);
const IconAlert = ({ width = 14, height = 14 }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const IconMessage = ({ width = 14, height = 14 }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
const IconSend = ({ width = 14, height = 14 }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 2L11 13" />
    <path d="M22 2L15 22L11 13L2 9L22 2z" />
  </svg>
);
const IconDatabase = ({ width = 14, height = 14 }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
);
const IconTool = ({ width = 14, height = 14 }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);
const IconBrain = ({ width = 14, height = 14 }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
    <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
    <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
    <path d="M17.599 6.5a3 3 0 0 0 .399-1.375" />
    <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5" />
    <path d="M3.477 10.896a4 4 0 0 1 .585-.396" />
    <path d="M19.938 10.5a4 4 0 0 1 .585.396" />
    <path d="M6 18a4 4 0 0 1-1.967-.516" />
    <path d="M19.967 17.484A4 4 0 0 1 18 18" />
  </svg>
);

export default function App() {
  const mountRef = useRef(null);
  const meshesRef = useRef({}); // id -> mesh
  const rendererRef = useRef(null);
  const animRef = useRef(null);

  const [selectedId, setSelectedId] = useState(null);
  const [issues, setIssues] = useState([]);
  const [elements, setElements] = useState([]); // mock elements with properties
  const [llmText, setLlmText] = useState("");
  const [running, setRunning] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth || 800;
    const height = 520;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(8, 8, 8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setClearColor(0xf0f0f0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(15, 15, 15);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    scene.add(dirLight);
    
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20),
      new THREE.MeshStandardMaterial({ color: 0xe0e0e0 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1;
    ground.receiveShadow = true;
    scene.add(ground);

    // MOCK ELEMENTS
    const mock = [
      { id: "W1", type: "Wall", props: { UValue: null, fireClass: "F30" }, color: 0xff9999 },
      { id: "W2", type: "Wall", props: { UValue: 0.25, fireClass: null }, color: 0xff9999 },
      { id: "D1", type: "Door", props: { fireClass: null }, color: 0xffcc99 },
      { id: "C1", type: "Column", props: { material: "Concrete" }, color: 0x99ff99 },
    ];

    setElements(mock.map((m) => ({ ...m, status: "unknown" })));

    const group = new THREE.Group();
    mock.forEach((m, i) => {
      const geom = new THREE.BoxGeometry(1.5, 2.5, 0.5);
      const mat = new THREE.MeshStandardMaterial({ 
        color: m.color,
        roughness: 0.7,
        metalness: 0.1
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set((i - 1.5) * 2.5, 0.25, 0);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = { id: m.id, originalColor: m.color };
      group.add(mesh);
      meshesRef.current[m.id] = mesh;
    });
    scene.add(group);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    function onClick(event) {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(group.children);
      if (intersects.length > 0) {
        const picked = intersects[0].object;
        const id = picked.userData.id;
        setSelectedId((prev) => (prev === id ? null : id));
      }
    }

    renderer.domElement.addEventListener("click", onClick);
    mountRef.current.appendChild(renderer.domElement);

    const animate = () => {
      animRef.current = requestAnimationFrame(animate);
      group.rotation.y += 0.003;
      renderer.render(scene, camera);
    };
    animate();

    function handleResize() {
      const w = mountRef.current ? mountRef.current.clientWidth : width;
      renderer.setSize(w, height);
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
    }
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.domElement.removeEventListener("click", onClick);
      if (animRef.current) cancelAnimationFrame(animRef.current);
      try {
        mountRef.current && mountRef.current.removeChild(renderer.domElement);
      } catch (e) { /* ignore */ }
      renderer.dispose && renderer.dispose();
      rendererRef.current = null;
      meshesRef.current = {};
    };
  }, []);

  const statusColorHex = {
    pass: 0x66bb6a,
    warn: 0xffd54f,
    fail: 0xff7043,
    unknown: 0xcccccc,
  };

  function applyColorsToMeshes(updatedElements) {
    updatedElements.forEach((el) => {
      const mesh = meshesRef.current[el.id];
      if (!mesh) return;
      const hex = statusColorHex[el.status] || mesh.userData.originalColor;
      if (mesh.material && mesh.material.color) mesh.material.color.setHex(hex);
      if (selectedId === el.id) mesh.scale.set(1.08, 1.08, 1.08);
      else mesh.scale.set(1, 1, 1);
    });
  }

  function runRuleCheck() {
    if (!elements || elements.length === 0) return;
    setRunning(true);
    setTimeout(() => {
      const updated = elements.map((el) => {
        let status = "pass";
        if (el.type === "Wall") {
          if (!el.props.UValue && !el.props.fireClass) status = "fail";
          else if (!el.props.UValue || !el.props.fireClass) status = "warn";
        }
        if (el.type === "Door") {
          if (!el.props.fireClass) status = "warn";
        }
        return { ...el, status };
      });
      setElements(updated);
      applyColorsToMeshes(updated);
      setRunning(false);
    }, 400);
  }

  function addIssue(title, description) {
    if (!selectedId) {
      alert("Please select an element first.");
      return;
    }
    const issue = {
      id: `ISSUE-${issues.length + 1}`,
      elementId: selectedId,
      title,
      description,
      createdAt: new Date().toISOString(),
    };
    setIssues((prev) => [issue, ...prev]);
  }

  async function mockLLMExplain(element) {
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

  async function getAIFixRecommendations(element) {
    if (!element) return null;
    setLoadingRecommendations(true);
    
    // Simulate AI analysis delay
    await new Promise((r) => setTimeout(r, 800));
    
    let recommendations = {
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

    setLoadingRecommendations(false);
    return recommendations;
  }

  async function handleAIRecommendations() {
    if (!selectedId) return;
    const el = elements.find((e) => e.id === selectedId);
    if (!el || el.status === 'pass') return;
    
    const recommendations = await getAIFixRecommendations(el);
    setAiRecommendations(recommendations);
  }

  function applyAISuggestion(property, value) {
    if (!selectedId) return;
    
    const updatedElements = elements.map((element) => {
      if (element.id === selectedId) {
        const updatedProps = { ...element.props, [property]: value };
        
        // Recalculate status
        let newStatus = "pass";
        if (element.type === "Wall") {
          if (!updatedProps.UValue && !updatedProps.fireClass) newStatus = "fail";
          else if (!updatedProps.UValue || !updatedProps.fireClass) newStatus = "warn";
        } else if (element.type === "Door") {
          if (!updatedProps.fireClass) newStatus = "warn";
        }
        
        return { ...element, props: updatedProps, status: newStatus };
      }
      return element;
    });
    
    setElements(updatedElements);
    applyColorsToMeshes(updatedElements);
    
    // Update recommendations to reflect the change
    if (updatedElements.find(e => e.id === selectedId).status === 'pass') {
      setAiRecommendations(null);
    } else {
      handleAIRecommendations(); // Refresh recommendations
    }
  }

  async function handleExplain() {
    if (!selectedId) return alert("Please select an element to explain.");
    const el = elements.find((e) => e.id === selectedId);
    setLlmText("...working...");
    const resp = await mockLLMExplain(el);
    setLlmText(resp);
  }

  function fixElement(elementId) {
    const el = elements.find((e) => e.id === elementId);
    if (!el) return;

    let updatedProps = { ...el.props };
    let fixed = false;

    if (el.type === "Wall") {
      if (!el.props.UValue) {
        const uValue = prompt("Enter U-Value for wall (e.g., 0.25):");
        if (uValue && !isNaN(parseFloat(uValue))) {
          updatedProps.UValue = parseFloat(uValue);
          fixed = true;
        }
      }
      if (!el.props.fireClass) {
        const fireClass = prompt("Enter Fire Class (e.g., F30, F60, F90):");
        if (fireClass) {
          updatedProps.fireClass = fireClass;
          fixed = true;
        }
      }
    } else if (el.type === "Door") {
      if (!el.props.fireClass) {
        const fireClass = prompt("Enter Fire Class for door (e.g., F30, F60):");
        if (fireClass) {
          updatedProps.fireClass = fireClass;
          fixed = true;
        }
      }
    }

    if (fixed) {
      const updatedElements = elements.map((element) => {
        if (element.id === elementId) {
          // Recalculate status based on new properties
          let newStatus = "pass";
          if (element.type === "Wall") {
            if (!updatedProps.UValue && !updatedProps.fireClass) newStatus = "fail";
            else if (!updatedProps.UValue || !updatedProps.fireClass) newStatus = "warn";
          } else if (element.type === "Door") {
            if (!updatedProps.fireClass) newStatus = "warn";
          }
          
          return { ...element, props: updatedProps, status: newStatus };
        }
        return element;
      });
      
      setElements(updatedElements);
      applyColorsToMeshes(updatedElements);
      alert("Element properties updated successfully!");
    }
  }

  useEffect(() => {
    if (elements && elements.length > 0) applyColorsToMeshes(elements);
  }, [elements, selectedId]);

  return (
    <div style={{ fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial', minHeight: '100vh', background: '#f8fafc', padding: 20 }}>
      {/* Header */}
      <div style={{ maxWidth: 1200, margin: '0 auto', marginBottom: 20 }}>
        <div style={{ background: 'white', padding: '16px 20px', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, background: '#3b82f6', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconCube width={20} height={20} style={{ color: 'white' }} />
              </div>
              <div>
                <h1 style={{ fontSize: 20, fontWeight: 600, color: '#1f2937', margin: 0 }}>ArchVision</h1>
                <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>BIM Rule Validation Platform</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ padding: '4px 8px', background: '#dcfce7', color: '#16a34a', borderRadius: 4, fontSize: 11, fontWeight: 500 }}>Connected</div>
              <div style={{ padding: '4px 8px', background: '#f3f4f6', color: '#6b7280', borderRadius: 4, fontSize: 11, fontWeight: 500 }}>v1.0.0</div>
            </div>
          </div>
        </div>
      </div>
      
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 }}>
        <div style={{ background: 'white', padding: 16, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 16, color: '#1f2937' }}>3D Model Viewer</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>Interactive BIM visualization</div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => alert('In real app: select a .ifc file and load it with IFC.js')} style={{ borderRadius: 6, background: '#3b82f6', color: 'white', padding: '8px 12px', display: 'flex', gap: 6, alignItems: 'center', fontWeight: 500, fontSize: 14 }}>
                <IconUpload /> Load IFC
              </button>
              <button onClick={runRuleCheck} disabled={running} style={{ borderRadius: 6, background: running ? '#f59e0b' : '#10b981', color: 'white', padding: '8px 12px', display: 'flex', gap: 6, alignItems: 'center', fontWeight: 500, fontSize: 14 }}>
                <IconCheck /> {running ? 'Checking...' : 'Run Check'}
              </button>
            </div>
          </div>

          <div ref={mountRef} style={{ width: '100%', height: 520, borderRadius: 6, overflow: 'hidden', border: '1px solid #e5e7eb' }} />

          <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ padding: '4px 8px', borderRadius: 4, background: '#dcfce7', color: '#16a34a', fontWeight: 500, fontSize: 11 }}>✓ Pass</div>
            <div style={{ padding: '4px 8px', borderRadius: 4, background: '#fef3c7', color: '#d97706', fontWeight: 500, fontSize: 11 }}>⚠ Warn</div>
            <div style={{ padding: '4px 8px', borderRadius: 4, background: '#fee2e2', color: '#dc2626', fontWeight: 500, fontSize: 11 }}>✗ Fail</div>
            <div style={{ marginLeft: 'auto', fontSize: 12, color: '#6b7280' }}>Click elements to inspect</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'white', padding: 16, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: '#1f2937' }}>Element Inspector</div>
              {!selectedId ? (
                <div style={{ color: '#6b7280', fontSize: 12, marginTop: 4 }}>No element selected</div>
              ) : (
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 12, color: '#374151' }}>ID: <span style={{ fontWeight: 500 }}>{selectedId}</span></div>
                  <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button onClick={handleExplain} style={{ background: '#8b5cf6', color: 'white', borderRadius: 4, padding: '6px 10px', display: 'flex', gap: 4, alignItems: 'center', fontWeight: 500, fontSize: 12 }}>
                      <IconMessage width={12} height={12} /> Explain
                    </button>
                    <button onClick={() => {
                      const title = prompt('Issue title:');
                      const desc = prompt('Issue description:');
                      if (title) addIssue(title, desc || '');
                    }} style={{ background: '#f59e0b', color: 'white', borderRadius: 4, padding: '6px 10px', display: 'flex', gap: 4, alignItems: 'center', fontWeight: 500, fontSize: 12 }}>
                      <IconAlert width={12} height={12} /> Issue
                    </button>
                    {(() => {
                      const el = elements.find((e) => e.id === selectedId);
                      if (el && (el.status === 'warn' || el.status === 'fail')) {
                        return (
                          <>
                            <button onClick={handleAIRecommendations} style={{ background: '#06b6d4', color: 'white', borderRadius: 4, padding: '6px 10px', display: 'flex', gap: 4, alignItems: 'center', fontWeight: 500, fontSize: 12 }}>
                              <IconBrain width={12} height={12} /> AI Fix
                            </button>
                            <button onClick={() => fixElement(selectedId)} style={{ background: '#10b981', color: 'white', borderRadius: 4, padding: '6px 10px', display: 'flex', gap: 4, alignItems: 'center', fontWeight: 500, fontSize: 12 }}>
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

          {llmText && (
            <div style={{ background: 'white', padding: 16, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: '#1f2937', marginBottom: 8 }}>AI Analysis</div>
              <div style={{ color: '#374151', fontSize: 13, lineHeight: 1.5, padding: '8px 12px', background: '#f8fafc', borderRadius: 4, border: '1px solid #e5e7eb' }}>{llmText}</div>
            </div>
          )}

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
                            onClick={() => applyAISuggestion(suggestion.property, option.value)}
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
                              e.target.style.background = '#f0f9ff';
                              e.target.style.borderColor = '#06b6d4';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = '#f8fafc';
                              e.target.style.borderColor = '#e5e7eb';
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

          <div style={{ background: 'white', padding: 16, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#1f2937', marginBottom: 12 }}>BIM Portal Integration</div>
            
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Export Options</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <button 
                  onClick={() => alert('Exporting compliance report to BIM Portal...')}
                  style={{ 
                    background: '#3b82f6', 
                    color: 'white', 
                    borderRadius: 4, 
                    padding: '8px 12px', 
                    display: 'flex', 
                    gap: 6, 
                    alignItems: 'center', 
                    fontWeight: 500, 
                    fontSize: 12,
                    width: '100%',
                    justifyContent: 'center'
                  }}
                >
                  <IconSend width={12} height={12} /> Send Report to Portal
                </button>
                <button 
                  onClick={() => alert('Syncing model data with BIM Portal...')}
                  style={{ 
                    background: '#10b981', 
                    color: 'white', 
                    borderRadius: 4, 
                    padding: '8px 12px', 
                    display: 'flex', 
                    gap: 6, 
                    alignItems: 'center', 
                    fontWeight: 500, 
                    fontSize: 12,
                    width: '100%',
                    justifyContent: 'center'
                  }}
                >
                  <IconDatabase width={12} height={12} /> Sync Model Data
                </button>
              </div>
            </div>

            <div style={{ paddingTop: 12, borderTop: '1px solid #f3f4f6' }}>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Portal Status</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }}></div>
                <span style={{ fontSize: 11, color: '#374151' }}>Connected to Portal</span>
              </div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>
                Last sync: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
