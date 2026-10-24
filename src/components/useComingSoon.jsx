import { createContext, useCallback, useContext, useEffect, useState } from 'react';

// One app-wide "Coming soon" toast for anything outside the playable Tropical Island campaign.
const ComingSoonContext = createContext(() => {});

export function ComingSoonProvider({ children }) {
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    if (!msg) return undefined;
    const t = setTimeout(() => setMsg(null), 2600);
    return () => clearTimeout(t);
  }, [msg]);

  const show = useCallback((title) => setMsg({ title, key: Date.now() }), []);

  return (
    <ComingSoonContext.Provider value={show}>
      {children}
      <div className="toast-region" role="status" aria-live="polite">
        {msg && (
          <div key={msg.key} className="toast">
            <span className="toast__tag">Coming soon</span>
            <span>
              <strong>{msg.title}</strong> isn't open yet — only Tropical Island is playable right now.
            </span>
          </div>
        )}
      </div>
    </ComingSoonContext.Provider>
  );
}

// Returns show(title).
export function useComingSoon() {
  return useContext(ComingSoonContext);
}
