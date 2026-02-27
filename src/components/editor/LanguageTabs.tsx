import type { Language, TranslatableField } from '../../types/presentation';

interface LanguageTabsProps {
  field: TranslatableField;
  onChange: (language: Language, value: string) => void;
  multiline?: boolean;
  placeholder?: string;
}

const TABS: { key: Language; label: string }[] = [
  { key: 'en', label: 'EN' },
  { key: 'zh-tw', label: 'zh-TW' },
  { key: 'zh-cn', label: 'zh-CN' },
];

const STATUS_COLORS: Record<string, string> = {
  reviewed: '#22C55E',
  'auto-translated': '#EAB308',
  outdated: '#EF4444',
  empty: '#9CA3AF',
};

import { useState } from 'react';

export default function LanguageTabs({ field, onChange, multiline, placeholder }: LanguageTabsProps) {
  const [activeTab, setActiveTab] = useState<Language>('en');

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-0.5 mb-1.5">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const status = tab.key !== 'en' ? field.translationStatus[tab.key] : null;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="relative px-3 py-1 text-xs font-medium rounded-t transition-colors"
              style={{
                background: isActive ? '#fff' : 'transparent',
                color: isActive ? '#1A1A1A' : '#666',
                border: isActive ? '1px solid #E5E5E5' : '1px solid transparent',
                borderBottom: isActive ? '1px solid #fff' : '1px solid transparent',
                marginBottom: isActive ? '-1px' : 0,
              }}
            >
              {tab.label}
              {status && (
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full ml-1.5"
                  style={{ background: STATUS_COLORS[status] }}
                  title={status}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Input */}
      {multiline ? (
        <textarea
          value={field[activeTab]}
          onChange={(e) => onChange(activeTab, e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full px-3 py-2 text-sm rounded border border-[#E5E5E5] bg-white resize-y focus:outline-none focus:border-[#FBB931] focus:ring-1 focus:ring-[#FBB931]"
          style={{ color: '#1A1A1A' }}
        />
      ) : (
        <input
          type="text"
          value={field[activeTab]}
          onChange={(e) => onChange(activeTab, e.target.value)}
          placeholder={placeholder}
          maxLength={200}
          className="w-full px-3 py-2 text-sm rounded border border-[#E5E5E5] bg-white focus:outline-none focus:border-[#FBB931] focus:ring-1 focus:ring-[#FBB931]"
          style={{ color: '#1A1A1A' }}
        />
      )}
    </div>
  );
}
