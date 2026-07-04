import React, { useState, useRef, useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import { Sparkles, ArrowRight, User } from 'lucide-react';
import { musicManager } from '../utils/musicManager';

/** Validates a player name: 3-15 chars, at least one letter/number */
function validateName(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed.length < 3) return 'Name must be at least 3 characters.';
  if (trimmed.length > 15) return 'Name must be 15 characters or fewer.';
  if (!/[a-zA-Z0-9]/.test(trimmed)) return 'Name must contain at least one letter or number.';
  return null;
}

export const PlayerNameEntry: React.FC = () => {
  const { playerName, setPlayerName, phase } = useGameStore();
  const [input, setInput] = useState(playerName);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // If we already have a stored name, skip this screen
  if (playerName !== '' || phase !== 'MENU') return null;

  const handleSubmit = () => {
    const err = validateName(input);
    if (err) {
      setError(err);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    setError(null);
    setPlayerName(input.trim());
    
    // Start music directly on user interaction (resolves autoplay block)
    musicManager.init();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Hard-cap at 15 characters
    if (e.target.value.length <= 15) {
      setInput(e.target.value);
      if (error) setError(null);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, rgba(0,0,0,0.92) 0%, rgba(10,0,30,0.97) 100%)',
        backdropFilter: 'blur(24px)',
        pointerEvents: 'auto',  // Override inherited pointer-events: none from .ui-layer
      }}
    >
      {/* Animated background orbs */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              borderRadius: '50%',
              background: i % 2 === 0
                ? 'radial-gradient(circle, rgba(0,229,255,0.12) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(189,0,255,0.10) 0%, transparent 70%)',
              width: `${200 + i * 80}px`,
              height: `${200 + i * 80}px`,
              top: `${10 + i * 15}%`,
              left: `${5 + i * 18}%`,
              animation: `pulse ${3 + i}s ease-in-out infinite alternate`,
            }}
          />
        ))}
      </div>

      <div
        className="glass-panel"
        style={{
          maxWidth: '460px',
          width: '92%',
          padding: '48px 40px',
          boxSizing: 'border-box',
          textAlign: 'center',
          border: '1.5px solid rgba(0,229,255,0.3)',
          boxShadow: '0 0 40px rgba(0,229,255,0.15), 0 0 80px rgba(189,0,255,0.08)',
          position: 'relative',
          zIndex: 1,
          animation: shake ? 'shake 0.4s ease-in-out' : 'none',
        }}
      >
        {/* Icon badge */}
        <div
          style={{
            display: 'inline-flex',
            background: 'linear-gradient(135deg, rgba(0,229,255,0.15), rgba(189,0,255,0.15))',
            padding: '16px',
            borderRadius: '50%',
            marginBottom: '20px',
            border: '1px solid rgba(0,229,255,0.25)',
          }}
        >
          <Sparkles size={32} color="var(--secondary)" />
        </div>

        {/* Title */}
        <h1
          className="gradient-title"
          style={{ fontSize: '2rem', margin: '0 0 4px 0', lineHeight: 1.1 }}
        >
          CHAOS RUNNERS
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem', margin: '0 0 32px 0', letterSpacing: '0.08em' }}>
          THE ULTIMATE PARTY RACE
        </p>

        {/* Divider */}
        <div
          style={{
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(0,229,255,0.3), transparent)',
            marginBottom: '28px',
          }}
        />

        <h2
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: 'rgba(255,255,255,0.75)',
            margin: '0 0 16px 0',
            letterSpacing: '0.05em',
          }}
        >
          ENTER YOUR RACER NAME
        </h2>

        {/* Input */}
        <div style={{ position: 'relative', marginBottom: '8px' }}>
          <div
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'rgba(0,229,255,0.6)',
              pointerEvents: 'none',
            }}
          >
            <User size={16} />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="e.g. TurboRacer42"
            maxLength={15}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '14px 14px 14px 42px',
              fontSize: '1.1rem',
              fontWeight: 700,
              fontFamily: 'inherit',
              background: 'rgba(255,255,255,0.05)',
              border: `1.5px solid ${error ? 'var(--primary)' : 'rgba(0,229,255,0.3)'}`,
              borderRadius: '12px',
              color: 'white',
              outline: 'none',
              transition: 'border-color 0.2s',
              letterSpacing: '0.04em',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--secondary)';
              e.target.style.boxShadow = '0 0 12px rgba(0,229,255,0.2)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = error ? 'var(--primary)' : 'rgba(0,229,255,0.3)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Character count */}
        <div
          style={{
            textAlign: 'right',
            fontSize: '0.75rem',
            color: input.length >= 13 ? 'var(--yellow)' : 'rgba(255,255,255,0.3)',
            marginBottom: error ? '6px' : '24px',
            fontWeight: 600,
          }}
        >
          {input.trim().length} / 15
        </div>

        {/* Error message */}
        {error && (
          <div
            style={{
              color: 'var(--primary)',
              fontSize: '0.82rem',
              fontWeight: 600,
              marginBottom: '16px',
              padding: '8px 12px',
              background: 'rgba(255,0,87,0.08)',
              borderRadius: '8px',
              border: '1px solid rgba(255,0,87,0.2)',
            }}
          >
            ⚠ {error}
          </div>
        )}

        {/* CTA Button */}
        <button
          className="btn-primary"
          onClick={handleSubmit}
          style={{
            width: '100%',
            justifyContent: 'center',
            padding: '14px',
            fontSize: '1rem',
            letterSpacing: '0.08em',
            gap: '10px',
          }}
        >
          Start Racing
          <ArrowRight size={18} />
        </button>

        <p
          style={{
            marginTop: '16px',
            fontSize: '0.72rem',
            color: 'rgba(255,255,255,0.25)',
          }}
        >
          3–15 characters · Letters and numbers · Your name is saved locally
        </p>
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
};
