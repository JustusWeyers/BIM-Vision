import {FC} from 'react';
import { IconUpload, IconCheck } from '../Icons';

interface ModelViewerProps {
  onRunRuleCheck: () => void;
  running: boolean;
  onExport: () => void;
}

const ModelViewer: FC<ModelViewerProps> = ({ onRunRuleCheck, running, onExport }) => {
  return (
    <div style={{ background: 'white', padding: 16, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 16, color: '#1f2937' }}>3D Model Viewer</div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>Interactive BIM visualization</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onExport} style={{ borderRadius: 6, background: '#6b7280', color: 'white', padding: '8px 12px', display: 'flex', gap: 6, alignItems: 'center', fontWeight: 500, fontSize: 14, border: 'none', cursor: 'pointer' }}>
            Export
          </button>
          <button onClick={() => alert('In real app: select a .ifc file and load it with IFC.js')} style={{ borderRadius: 6, background: '#3b82f6', color: 'white', padding: '8px 12px', display: 'flex', gap: 6, alignItems: 'center', fontWeight: 500, fontSize: 14, border: 'none', cursor: 'pointer' }}>
            <IconUpload /> Load IFC
          </button>
          <button onClick={onRunRuleCheck} disabled={running} style={{ borderRadius: 6, background: running ? '#f59e0b' : '#10b981', color: 'white', padding: '8px 12px', display: 'flex', gap: 6, alignItems: 'center', fontWeight: 500, fontSize: 14, border: 'none', cursor: 'pointer' }}>
            <IconCheck /> {running ? 'Checking...' : 'Run Check'}
          </button>
        </div>
      </div>

      {/* Here the IFCViewer should come */}

      <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
        <div style={{ padding: '4px 8px', borderRadius: 4, background: '#dcfce7', color: '#16a34a', fontWeight: 500, fontSize: 11 }}> Pass</div>
        <div style={{ padding: '4px 8px', borderRadius: 4, background: '#fef3c7', color: '#d97706', fontWeight: 500, fontSize: 11 }}> Warn</div>
        <div style={{ padding: '4px 8px', borderRadius: 4, background: '#fee2e2', color: '#dc2626', fontWeight: 500, fontSize: 11 }}> Fail</div>
        <div style={{ marginLeft: 'auto', fontSize: 12, color: '#6b7280' }}>Click elements to inspect</div>
      </div>
    </div>
  );
};

export default ModelViewer;
