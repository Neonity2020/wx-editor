import React from 'react';
import { Palette } from 'lucide-react';

export interface Theme {
  id: string;
  name: string;
  css: string;
  preview: string;
}

interface ThemeSelectorProps {
  themes: Theme[];
  currentTheme: string;
  onThemeChange: (themeId: string) => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  themes,
  currentTheme,
  onThemeChange,
}) => {
  return (
    <div className="flex items-center gap-2">
      <Palette size={16} className="text-gray-600" />
      <div className="theme-selector">
        <select
          value={currentTheme}
          onChange={(e) => onThemeChange(e.target.value)}
          className="text-sm"
        >
          {themes.map((theme) => (
            <option key={theme.id} value={theme.id}>
              {theme.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ThemeSelector; 