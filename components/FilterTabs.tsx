import React from 'react';
import { Category } from '../types';
import { Coffee, Utensils, LayoutGrid } from 'lucide-react';

interface FilterTabsProps {
  activeCategory: Category;
  onCategoryChange: (category: Category) => void;
  showOpenOnly: boolean;
  onToggleOpenOnly: () => void;
}

export const FilterTabs: React.FC<FilterTabsProps> = ({
  activeCategory,
  onCategoryChange,
  showOpenOnly,
  onToggleOpenOnly
}) => {
  const tabs = [
    { id: Category.ALL, label: '全部', icon: LayoutGrid },
    { id: Category.FOOD, label: '吃飯', icon: Utensils },
    { id: Category.DRINK, label: '飲料', icon: Coffee },
  ];

  return (
    <div className="bg-white shadow-sm border-b border-slate-100 sticky top-[60px] z-40">
      <div className="max-w-2xl mx-auto px-4 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onCategoryChange(tab.id)}
                  className={`flex-1 flex items-center justify-center space-x-1.5 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-white text-green-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Toggle Switch */}
          <div className="flex items-center justify-end space-x-2">
            <span className="text-sm text-slate-600 font-medium">僅顯示營業中</span>
            <button
              onClick={onToggleOpenOnly}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                showOpenOnly ? 'bg-green-500' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showOpenOnly ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
