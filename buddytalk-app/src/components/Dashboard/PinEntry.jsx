import { useState } from 'react';
import './Dashboard.css';

const DEFAULT_PIN = '0000';

export default function PinEntry({ onSuccess, onCancel }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleNumberClick = (num) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      setError('');

      // Auto-check when 4 digits entered
      if (newPin.length === 4) {
        setTimeout(() => {
          checkPin(newPin);
        }, 100);
      }
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
    setError('');
  };

  const checkPin = (pinToCheck) => {
    if (pinToCheck === DEFAULT_PIN) {
      onSuccess();
    } else {
      setError('Incorrect PIN, try again');
      setPin('');
    }
  };

  return (
    <div className="pin-entry-overlay">
      <div className="pin-entry-card">
        <button className="close-button" onClick={onCancel}>
          ✕
        </button>

        <h2>Parent Dashboard</h2>
        <p className="subtitle">Enter PIN to access</p>

        <div className="pin-display">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`pin-dot ${i < pin.length ? 'filled' : ''}`}>
              {i < pin.length ? '●' : '○'}
            </div>
          ))}
        </div>

        {error && <div className="pin-error">{error}</div>}

        <div className="pin-keypad">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              className="pin-key"
              onClick={() => handleNumberClick(num.toString())}
            >
              {num}
            </button>
          ))}
          <button className="pin-key" disabled></button>
          <button className="pin-key" onClick={() => handleNumberClick('0')}>
            0
          </button>
          <button className="pin-key backspace-key" onClick={handleBackspace}>
            ⌫
          </button>
        </div>

        <p className="pin-hint">Default PIN: 0000</p>
      </div>
    </div>
  );
}
