import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_SETTINGS } from '../config/defaultSettings';

const STORAGE_KEY = 'shinobi_settings';

const mergeDeep = (defaults, overrides) => {
  const result = { ...defaults };
  Object.keys(overrides || {}).forEach(key => {
    const d = defaults[key];
    const o = overrides[key];
    if (o && typeof o === 'object' && !Array.isArray(o) && d && typeof d === 'object') {
      result[key] = mergeDeep(d, o);
    } else if (o !== undefined) {
      result[key] = o;
    }
  });
  return result;
};

export const useSettings = (initialOverrides = {}) => {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const base = saved
        ? mergeDeep(DEFAULT_SETTINGS, JSON.parse(saved))
        : DEFAULT_SETTINGS;
      return mergeDeep(base, initialOverrides);
    } catch (error) {
      console.error('Failed to load settings:', error);
      return mergeDeep(DEFAULT_SETTINGS, initialOverrides);
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }, [settings]);

  const updateSetting = useCallback((category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  }, []);

  const updateSettings = useCallback((newSettings) => {
    setSettings(prev => mergeDeep(prev, newSettings));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  const resetCategory = useCallback((category) => {
    setSettings(prev => ({
      ...prev,
      [category]: DEFAULT_SETTINGS[category]
    }));
  }, []);

  return {
    settings,
    updateSetting,
    updateSettings,
    resetSettings,
    resetCategory
  };
};