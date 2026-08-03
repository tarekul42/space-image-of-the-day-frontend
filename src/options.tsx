import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import browser from './browser';
import { getSettings, updateSettings } from './services/settings.service';
import { SearchEngine, SEARCH_ENGINES, SEARCH_ENGINE_LABELS } from './utils/settings';

const LANGUAGES: { value: string; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'it', label: 'Italiano' },
  { value: 'pt', label: 'Português' },
  { value: 'ja', label: '日本語' },
  { value: 'zh-CN', label: '简体中文' },
  { value: 'ru', label: 'Русский' },
  { value: 'bn', label: 'বাংলা' },
  { value: 'hi', label: 'हिन्दी' },
];

const OptionsPage: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [allowLowRes, setAllowLowRes] = useState(false);
  const [language, setLanguage] = useState('en');
  const [searchEngine, setSearchEngine] = useState<SearchEngine>('google');
  const [cacheSize, setCacheSize] = useState<string>('0 KB');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getSettings().then((settings) => {
      setApiKey(settings.nasaApiKey || '');
      setReducedMotion(settings.reducedMotion);
      setHighContrast(settings.highContrast);
      setAllowLowRes(settings.allowLowRes);
      setLanguage(settings.language);
      setSearchEngine(settings.searchEngine);
    });

    calculateCacheSize();
  }, []);

  const calculateCacheSize = () => {
    browser.storage.local.getBytesInUse(null).then((bytes: number) => {
      setCacheSize(`${(bytes / 1024).toFixed(2)} KB`);
    });
  };

  const handleSave = () => {
    updateSettings({
      nasaApiKey: apiKey,
      reducedMotion,
      highContrast,
      allowLowRes,
      language,
      searchEngine,
    }).then(() => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  };

  const clearCache = () => {
    if (confirm('Clear all locally cached astronomical images and metadata?')) {
      browser.runtime.sendMessage({ type: 'RESET_CACHE' }).then(() => {
        calculateCacheSize();
      });
    }
  };

  return (
    <div className={`app options-container ${highContrast ? 'high-contrast' : ''}`}>
      <div className="options-glass">
        <header className="options-header">
          <h1>Cosmic Settings</h1>
          <p>Personalize your window to the universe.</p>
        </header>

        <section className="options-section">
          <h2>📡 Connection</h2>
          <div className="option-item">
            <label htmlFor="apiKey">NASA API Key</label>
            <input
              id="apiKey"
              type="password"
              placeholder="DEMO_KEY"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="hint">
              Using your own key avoids strict rate limits.
              <a href="https://api.nasa.gov/" target="_blank">
                Get one here ↗
              </a>
            </p>
          </div>
        </section>

        <section className="options-section">
          <h2>🎨 Appearance</h2>
          <div className="option-item">
            <label htmlFor="language">Language</label>
            <select id="language" value={language} onChange={(e) => setLanguage(e.target.value)}>
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
            <p className="hint">Cosmic descriptions are translated server-side.</p>
          </div>
          <div className="option-item toggle-item">
            <label>
              <input
                type="checkbox"
                checked={allowLowRes}
                onChange={(e) => setAllowLowRes(e.target.checked)}
              />
              Allow Low-Resolution Images
            </label>
            <p className="hint">
              Shows smaller 1990s-era files when no high-res (≥1000px) image is available.
            </p>
          </div>
          <div className="option-item toggle-item">
            <label>
              <input
                type="checkbox"
                checked={reducedMotion}
                onChange={(e) => setReducedMotion(e.target.checked)}
              />
              Reduced Motion
            </label>
          </div>
          <div className="option-item toggle-item">
            <label>
              <input
                type="checkbox"
                checked={highContrast}
                onChange={(e) => setHighContrast(e.target.checked)}
              />
              High Contrast Text
            </label>
          </div>
        </section>

        <section className="options-section">
          <h2>🔎 Search</h2>
          <div className="option-item">
            <label htmlFor="searchEngine">Default Search Engine</label>
            <select
              id="searchEngine"
              value={searchEngine}
              onChange={(e) => setSearchEngine(e.target.value as SearchEngine)}
            >
              {SEARCH_ENGINES.map((engine) => (
                <option key={engine} value={engine}>
                  {SEARCH_ENGINE_LABELS[engine]}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="options-section">
          <h2>💾 Data & Privacy</h2>
          <div className="option-item">
            <div className="cache-info">
              <span>
                Local Cache: <strong>{cacheSize}</strong>
              </span>
              <button className="text-button" onClick={clearCache}>
                Clear Cache
              </button>
            </div>
          </div>
        </section>

        <footer className="options-footer">
          <button className="save-button" onClick={handleSave}>
            {saved ? 'Settings Saved! ✨' : 'Save Preferences'}
          </button>
          <div className="about-links">
            <a href="https://github.com/tarekul42/space-image-of-the-day" target="_blank">
              GitHub
            </a>{' '}
            •<span> v1.4.2</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

const root = document.getElementById('root');
if (root) {
  ReactDOM.createRoot(root).render(<OptionsPage />);
}
