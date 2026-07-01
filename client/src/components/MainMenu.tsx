import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { Sparkles, Trophy, Play, Settings, User } from 'lucide-react';

const COLORS = [
  { name: 'Pink Dream', value: '#ff007f' },
  { name: 'Electric Cyan', value: '#00e5ff' },
  { name: 'Neon Purple', value: '#bd00ff' },
  { name: 'Gold Crown', value: '#ffd60a' },
  { name: 'Lime Rush', value: '#39ff14' },
  { name: 'Orange Burst', value: '#ff6700' },
];

const ACCESSORIES = [
  { id: 'none', name: 'No Accessory' },
  { id: 'crown', name: 'Golden Crown 👑' },
  { id: 'party', name: 'Party Cone 🎉' },
  { id: 'glasses', name: 'Rad Glasses 🕶️' },
];

export const MainMenu: React.FC = () => {
  const { phase, startGame, customization, updateCustomization, wins, failures } = useGameStore();

  if (phase !== 'MENU') return null;

  return (
    <div className="ui-interactive glass-panel pulse-animation" style={{
      maxWidth: '850px',
      width: '90%',
      margin: 'auto',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '32px',
      padding: '40px',
      boxSizing: 'border-box',
      pointerEvents: 'auto',
    }}>
      {/* Left Column: Title & Play */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Sparkles size={20} color="var(--secondary)" />
            <span style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--secondary)' }}>
              Milestone 1 Core Prototype
            </span>
          </div>
          <h1 className="gradient-title" style={{ fontSize: '3rem', margin: '0 0 16px 0', lineHeight: 1.1 }}>
            CHAO<br />RUNNERS
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '1rem', margin: '0 0 24px 0' }}>
            An original physics-driven 3D platformer. Control your bean, dodge rotating obstacles, bounce to high heights, and pass the finish line!
          </p>
        </div>

        {/* Stats & Play Button */}
        <div>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            <div style={{
              flex: 1,
              background: 'rgba(255,255,255,0.03)',
              padding: '12px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.05)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 600 }}>Wins</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--yellow)' }}>{wins}</div>
            </div>
            <div style={{
              flex: 1,
              background: 'rgba(255,255,255,0.03)',
              padding: '12px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.05)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 600 }}>Tries</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'rgba(255,255,255,0.8)' }}>{wins + failures}</div>
            </div>
          </div>

          <button className="btn-primary" onClick={startGame} style={{ width: '100%', justifyContent: 'center' }}>
            <Play size={20} fill="white" />
            Start Run
          </button>
        </div>
      </div>

      {/* Right Column: Customization */}
      <div style={{ borderLeft: '1px solid var(--glass-border)', paddingLeft: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} color="var(--primary)" />
            Customize Bean
          </h3>

          <div style={{ marginBottom: '16px' }}>
            <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
              Skin Color
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => updateCustomization({ color: c.value })}
                  style={{
                    backgroundColor: c.value,
                    height: '38px',
                    borderRadius: '8px',
                    border: customization.color === c.value ? '3px solid white' : '1px solid rgba(0,0,0,0.3)',
                    cursor: 'pointer',
                    boxShadow: customization.color === c.value ? '0 0 10px rgba(255,255,255,0.5)' : 'none',
                    transition: 'transform 0.1s ease',
                  }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
              Accessory
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {ACCESSORIES.map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => updateCustomization({ accessory: acc.id })}
                  className="btn-secondary"
                  style={{
                    textAlign: 'left',
                    padding: '10px 16px',
                    fontSize: '0.9rem',
                    border: customization.accessory === acc.id ? '1px solid var(--secondary)' : '1px solid var(--glass-border)',
                    background: customization.accessory === acc.id ? 'rgba(0, 229, 255, 0.08)' : 'var(--glass-bg)',
                  }}
                >
                  {acc.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{
          fontSize: '0.8rem',
          color: 'rgba(255,255,255,0.4)',
          background: 'rgba(0,0,0,0.2)',
          padding: '10px',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.03)',
        }}>
          💡 <strong>Tip:</strong> Drag left-click to look around once inside the game. Click the screen to lock mouse cursor for smooth camera look.
        </div>
      </div>
    </div>
  );
};
