import './App.css'
import { useState, useEffect } from 'react'

const chimeAudio = new Audio('/bell.mp3');
chimeAudio.preload = 'auto';

function App() {
  const [mode, setMode] = useState<'timer' | 'stopwatch'>('timer');

  // Timer State
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  // Stopwatch State
  const [stopwatchTime, setStopwatchTime] = useState(0); // in milliseconds
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);

  // Toast State
  const [toast, setToast] = useState<string | null>(null);

  function correctTime(time: number, max: number) {
    if (isNaN(time) || time < 0) return 0;
    if (time > max) return max;
    return time;
  }

  const format = (num: number) => num.toString().padStart(2, '0');

  const playChime = () => {
    chimeAudio.currentTime = 0;
    chimeAudio.volume = 1.0; // Revert volume back to standard 100%
    chimeAudio.loop = false;  // Play exactly once
    chimeAudio.play().catch((err) => console.log('Audio playback failed:', err));
  };

  const stopChime = () => {
    chimeAudio.pause();
    chimeAudio.currentTime = 0;
  };

  // Timer Effect
  useEffect(() => {
    if (mode === 'timer' && isRunning) {
      if (hours === 0 && minutes === 0 && seconds === 0) {
        setIsRunning(false);
        playChime();
        return;
      }

      const id = setInterval(() => {
        if (seconds > 0) {
          setSeconds(prev => prev - 1);
        } else if (minutes > 0) {
          setMinutes(prev => prev - 1);
          setSeconds(59);
        } else if (hours > 0) {
          setHours(prev => prev - 1);
          setMinutes(59);
          setSeconds(59);
        }
      }, 1000);

      return () => clearInterval(id);
    }
  }, [isRunning, hours, minutes, seconds, mode]);

  // Stopwatch Effect
  useEffect(() => {
    if (mode === 'stopwatch' && isStopwatchRunning) {
      const id = setInterval(() => {
        setStopwatchTime(prev => prev + 10);
      }, 10);
      return () => clearInterval(id);
    }
  }, [isStopwatchRunning, mode]);

  // Toast Timer Effect
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleStartTimer = () => {
    stopChime();
    if (hours > 0 || minutes > 0 || seconds > 0) {
      setIsRunning(true);
    } else {
      setToast("Time cannot flow from an empty vessel.");
    }
  };

  // Format Stopwatch Time: HH:MM:SS.CC
  const swHours = Math.floor(stopwatchTime / 3600000);
  const swMinutes = Math.floor((stopwatchTime % 3600000) / 60000);
  const swSeconds = Math.floor((stopwatchTime % 60000) / 1000);
  const swCentiseconds = Math.floor((stopwatchTime % 1000) / 10);

  const containerIsRunning = mode === 'timer' ? isRunning : isStopwatchRunning;

  return (
    <div className={`zen-container ${containerIsRunning ? 'running' : 'paused'}`}>
      
      {/* Zen Logo */}
      <div className="zen-logo">
        <span className="zen-logo-circle"></span>
        <span className="zen-logo-text">ZEN</span>
      </div>
      
      {/* Zen Tabs Switcher */}
      <div className="zen-tabs">
        <button 
          className={`zen-tab ${mode === 'timer' ? 'active' : ''}`}
          onClick={() => {
            stopChime();
            setMode('timer');
          }}
        >
          Timer
        </button>
        <button 
          className={`zen-tab ${mode === 'stopwatch' ? 'active' : ''}`}
          onClick={() => {
            stopChime();
            setMode('stopwatch');
          }}
        >
          Stopwatch
        </button>
      </div>

      <h1 className="zen-title">
        {mode === 'timer' 
          ? (!isRunning && hours === 0 && minutes === 0 && seconds === 0 
              ? 'Set a duration to begin' 
              : 'Zen Timer')
          : 'Let the flow of time begin'}
      </h1>
      
      {mode === 'timer' ? (
        /* Timer Layout */
        <div className="timer-display">
          <div className="timer-unit-wrapper">
            {isRunning ? (
              <span>{format(hours)}</span>
            ) : (
              <input 
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                className="timer-input"
                value={format(hours)}
                onChange={(e) => setHours(correctTime(parseInt(e.target.value), 99))}
                onFocus={(e) => e.target.select()}
                min="0"
                max="99"
              />
            )}
          </div>
          
          <span className={`timer-colon ${isRunning ? 'running' : 'paused'}`}>:</span>
          
          <div className="timer-unit-wrapper">
            {isRunning ? (
              <span>{format(minutes)}</span>
            ) : (
              <input 
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                className="timer-input"
                value={format(minutes)}
                onChange={(e) => setMinutes(correctTime(parseInt(e.target.value), 59))}
                onFocus={(e) => e.target.select()}
                min="0"
                max="59"
              />
            )}
          </div>

          <span className={`timer-colon ${isRunning ? 'running' : 'paused'}`}>:</span>

          <div className="timer-unit-wrapper">
            {isRunning ? (
              <span>{format(seconds)}</span>
            ) : (
              <input 
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                className="timer-input"
                value={format(seconds)}
                onChange={(e) => setSeconds(correctTime(parseInt(e.target.value), 59))}
                onFocus={(e) => e.target.select()}
                min="0"
                max="59"
              />
            )}
          </div>
        </div>
      ) : (
        /* Stopwatch Layout: HH:MM:SS.cc */
        <div className="timer-display">
          <div className="timer-unit-wrapper">
            <span>{format(swHours)}</span>
          </div>
          
          <span className={`timer-colon ${isStopwatchRunning ? 'running' : 'paused'}`}>:</span>
          
          <div className="timer-unit-wrapper">
            <span>{format(swMinutes)}</span>
          </div>

          <span className={`timer-colon ${isStopwatchRunning ? 'running' : 'paused'}`}>:</span>

          <div className="timer-unit-wrapper stopwatch-seconds-wrapper">
            <span>{format(swSeconds)}</span>
            <span className="stopwatch-ms">{format(swCentiseconds)}</span>
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className="controls">
        {mode === 'timer' ? (
          <>
            {!isRunning ? (
              <button className="zen-button primary" onClick={handleStartTimer}>
                Start
              </button>
            ) : (
              <button className="zen-button primary" onClick={() => setIsRunning(false)}>
                Pause
              </button>
            )}
            <button 
              className="zen-button"
              onClick={() => {
                stopChime();
                setIsRunning(false);
                setHours(0);
                setMinutes(0);
                setSeconds(0);
              }}
            >
              Reset
            </button>
          </>
        ) : (
          <>
            <button className="zen-button primary" onClick={() => setIsStopwatchRunning(true)}>
              Start
            </button>
            <button className="zen-button" onClick={() => setIsStopwatchRunning(false)}>
              Stop
            </button>
            <button 
              className="zen-button"
              onClick={() => {
                setIsStopwatchRunning(false);
                setStopwatchTime(0);
              }}
            >
              Reset
            </button>
          </>
        )}
      </div>

      {/* Toast Warning */}
      {toast && (
        <div className="zen-toast">
          {toast}
        </div>
      )}
    </div>
  )
}

export default App
