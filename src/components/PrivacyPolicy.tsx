interface Props {
  onClose: () => void;
}

const PrivacyPolicy: React.FC<Props> = ({ onClose }) => (
  <div style={{
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: 20
  }}>
    <div style={{
      background: 'white', borderRadius: 12,
      maxWidth: 600, width: '100%', maxHeight: '80vh',
      overflow: 'hidden', display: 'flex', flexDirection: 'column',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{
        padding: '20px 24px', borderBottom: '1px solid #e5e7eb',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#1f2937' }}>
          Datenschutzerklärung
        </h2>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', fontSize: 20,
          cursor: 'pointer', color: '#6b7280', lineHeight: 1
        }}>×</button>
      </div>

      <div style={{ padding: '20px 24px', overflowY: 'auto', fontSize: 13, color: '#374151', lineHeight: 1.6 }}>
        <p><strong>Stand:</strong> {new Date().toLocaleDateString('de-DE')}</p>

        <h3 style={{ fontSize: 14, fontWeight: 600, marginTop: 20 }}>1. Verantwortlicher</h3>
        <p>
          Verantwortlich für die Verarbeitung personenbezogener Daten auf dieser Plattform ist:<br />
          <strong>[Name / Organisation]</strong><br />
          [Adresse]<br />
          [E-Mail-Adresse]
        </p>

        <h3 style={{ fontSize: 14, fontWeight: 600, marginTop: 20 }}>2. Erhobene Daten</h3>
        <p>
          Bei der Registrierung erheben wir ausschließlich Ihre <strong>E-Mail-Adresse</strong>.
          Ihr Passwort wird verschlüsselt gespeichert (bcrypt) und ist für uns nicht einsehbar.
        </p>

        <h3 style={{ fontSize: 14, fontWeight: 600, marginTop: 20 }}>3. Zweck der Verarbeitung</h3>
        <p>
          Ihre Daten werden ausschließlich zur <strong>Authentifizierung</strong> und zur Bereitstellung
          des Zugangs zur ArchVision BIM-Plattform verwendet. Eine Weitergabe an Dritte findet nicht statt.
        </p>

        <h3 style={{ fontSize: 14, fontWeight: 600, marginTop: 20 }}>4. Rechtsgrundlage</h3>
        <p>
          Die Verarbeitung erfolgt auf Grundlage Ihrer <strong>Einwilligung</strong> gemäß
          Art. 6 Abs. 1 lit. a DSGVO, die Sie durch Anklicken der Einwilligungsbox erteilen.
        </p>

        <h3 style={{ fontSize: 14, fontWeight: 600, marginTop: 20 }}>5. Speicherdauer</h3>
        <p>
          Ihre Daten werden gespeichert, solange Ihr Konto aktiv ist. Nach der Löschung Ihres Kontos
          werden alle personenbezogenen Daten unverzüglich gelöscht.
        </p>

        <h3 style={{ fontSize: 14, fontWeight: 600, marginTop: 20 }}>6. Ihre Rechte</h3>
        <p>Sie haben das Recht auf:</p>
        <ul style={{ paddingLeft: 20 }}>
          <li><strong>Auskunft</strong> über die gespeicherten Daten (Art. 15 DSGVO)</li>
          <li><strong>Berichtigung</strong> unrichtiger Daten (Art. 16 DSGVO)</li>
          <li><strong>Löschung</strong> Ihrer Daten (Art. 17 DSGVO) — jederzeit über die App möglich</li>
          <li><strong>Widerruf</strong> Ihrer Einwilligung (Art. 7 Abs. 3 DSGVO)</li>
          <li><strong>Beschwerde</strong> bei der zuständigen Datenschutzaufsichtsbehörde</li>
        </ul>

        <h3 style={{ fontSize: 14, fontWeight: 600, marginTop: 20 }}>7. Kontakt</h3>
        <p>
          Bei Fragen zur Verarbeitung Ihrer Daten wenden Sie sich an:<br />
          [E-Mail-Adresse des Verantwortlichen]
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

export default PrivacyPolicy;
