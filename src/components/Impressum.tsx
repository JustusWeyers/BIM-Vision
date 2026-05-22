interface Props {
  onClose: () => void;
}

const Impressum: React.FC<Props> = ({ onClose }) => (
  <div style={{
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: 20
  }}>
    <div style={{
      background: 'white', borderRadius: 12,
      maxWidth: 500, width: '100%', maxHeight: '80vh',
      overflow: 'hidden', display: 'flex', flexDirection: 'column',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{
        padding: '20px 24px', borderBottom: '1px solid #e5e7eb',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#1f2937' }}>Impressum</h2>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', fontSize: 20,
          cursor: 'pointer', color: '#6b7280', lineHeight: 1
        }}>×</button>
      </div>

      <div style={{ padding: '20px 24px', overflowY: 'auto', fontSize: 13, color: '#374151', lineHeight: 1.7 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Angaben gemäß § 5 TMG</h3>
        <p>
          [Vor- und Nachname / Organisation]<br />
          [Straße und Hausnummer]<br />
          [PLZ und Ort]<br />
          Deutschland
        </p>

        <h3 style={{ fontSize: 14, fontWeight: 600, marginTop: 20, marginBottom: 8 }}>Kontakt</h3>
        <p>
          E-Mail: [ihre@email.de]
        </p>

        <h3 style={{ fontSize: 14, fontWeight: 600, marginTop: 20, marginBottom: 8 }}>Verantwortlich für den Inhalt</h3>
        <p>
          [Vor- und Nachname]<br />
          [Anschrift wie oben]
        </p>

        <h3 style={{ fontSize: 14, fontWeight: 600, marginTop: 20, marginBottom: 8 }}>Haftungsausschluss</h3>
        <p>
          Die Inhalte dieser Seite wurden mit größter Sorgfalt erstellt. Für die Richtigkeit,
          Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.
        </p>
      </div>

      <div style={{ padding: '16px 24px', borderTop: '1px solid #e5e7eb' }}>
        <button onClick={onClose} style={{
          width: '100%', padding: '10px',
          background: '#3b82f6', color: 'white',
          border: 'none', borderRadius: 6,
          fontSize: 14, fontWeight: 500, cursor: 'pointer'
        }}>Schließen</button>
      </div>
    </div>
  </div>
);

export default Impressum;
