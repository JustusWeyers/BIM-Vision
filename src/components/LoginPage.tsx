import { useState } from "react";
import { login, register } from "../utils/auth";
import { IconCube } from "../Icons";
import PrivacyPolicy from "./PrivacyPolicy";

interface Props {
  onLogin: () => void;
}

const LoginPage: React.FC<Props> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'register' && !consent) {
      setError('Bitte stimmen Sie der Datenschutzerklärung zu.');
      return;
    }

    setLoading(true);
    const result = mode === 'login'
      ? await login(username, password)
      : await register(username, password);
    setLoading(false);

    if (result.success) {
      onLogin();
    } else {
      setError(result.error || 'Fehler');
    }
  };

  return (
    <>
      {showPrivacy && <PrivacyPolicy onClose={() => setShowPrivacy(false)} />}

      <div style={{
        minHeight: '100vh', background: '#f8fafc',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial'
      }}>
        <div style={{
          background: 'white', borderRadius: 12,
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb', padding: 40, width: 360
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
            <div style={{
              width: 36, height: 36, background: '#3b82f6', borderRadius: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <IconCube width={20} height={20} style={{ color: 'white' }} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 18, color: '#1f2937' }}>BIM Vision</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>BIM Rule Validation Platform</div>
            </div>
          </div>

          <div style={{ fontSize: 20, fontWeight: 600, color: '#1f2937', marginBottom: 4 }}>
            {mode === 'login' ? 'Anmelden' : 'Registrieren'}
          </div>
          <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 24 }}>
            {mode === 'login' ? 'Melde dich mit deinem Konto an.' : 'Erstelle ein neues Konto.'}
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 4 }}>
                Benutzername
              </label>
              <input
                type="text" value={username}
                onChange={e => setUsername(e.target.value)} required
                style={{
                  width: '100%', padding: '8px 10px', borderRadius: 6,
                  border: '1px solid #d1d5db', fontSize: 14, color: '#1f2937',
                  outline: 'none', boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: mode === 'register' ? 14 : 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 4 }}>
                Passwort
              </label>
              <input
                type="password" value={password}
                onChange={e => setPassword(e.target.value)} required
                style={{
                  width: '100%', padding: '8px 10px', borderRadius: 6,
                  border: '1px solid #d1d5db', fontSize: 14, color: '#1f2937',
                  outline: 'none', boxSizing: 'border-box'
                }}
              />
            </div>

            {mode === 'register' && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 20 }}>
                <input
                  type="checkbox" id="consent"
                  checked={consent} onChange={e => setConsent(e.target.checked)}
                  style={{ marginTop: 2, cursor: 'pointer', flexShrink: 0 }}
                />
                <label htmlFor="consent" style={{ fontSize: 12, color: '#374151', cursor: 'pointer' }}>
                  Ich habe die{' '}
                  <span
                    onClick={() => setShowPrivacy(true)}
                    style={{ color: '#3b82f6', textDecoration: 'underline', cursor: 'pointer' }}
                  >
                    Datenschutzerklärung
                  </span>{' '}
                  gelesen und stimme der Verarbeitung meines Benutzernamens zur Authentifizierung zu.
                </label>
              </div>
            )}

            {error && (
              <div style={{
                background: '#fef2f2', border: '1px solid #fecaca',
                borderRadius: 6, padding: '8px 12px',
                fontSize: 13, color: '#dc2626', marginBottom: 16
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (mode === 'register' && !consent)}
              style={{
                width: '100%', padding: '10px',
                background: (loading || (mode === 'register' && !consent)) ? '#93c5fd' : '#3b82f6',
                color: 'white', border: 'none', borderRadius: 6,
                fontSize: 14, fontWeight: 500,
                cursor: (loading || (mode === 'register' && !consent)) ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Bitte warten...' : (mode === 'login' ? 'Anmelden' : 'Registrieren')}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#6b7280' }}>
            {mode === 'login' ? 'Noch kein Konto?' : 'Bereits registriert?'}{' '}
            <span
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setConsent(false); }}
              style={{ color: '#3b82f6', cursor: 'pointer', fontWeight: 500 }}
            >
              {mode === 'login' ? 'Registrieren' : 'Anmelden'}
            </span>
          </div>

        </div>
      </div>
    </>
  );
};

export default LoginPage;
