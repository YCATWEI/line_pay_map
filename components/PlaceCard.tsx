import React from 'react';
import { Place, Category } from '../types';
import { Star, MapPin, Coffee, Utensils, ArrowUpRight, Navigation } from 'lucide-react';

interface PlaceCardProps {
  place: Place;
}

export const PlaceCard: React.FC<PlaceCardProps> = ({ place }) => {
  const isFood = place.category === Category.FOOD;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 transition-all hover:shadow-md hover:border-green-200 group flex flex-col h-full">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center space-x-2 w-full">
          <span className={`p-2 rounded-lg flex-shrink-0 ${isFood ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
            {isFood ? <Utensils size={18} /> : <Coffee size={18} />}
          </span>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-800 leading-tight group-hover:text-green-600 transition-colors truncate">
              {place.name}
            </h3>
            <div className="flex items-center mt-1 space-x-2 flex-wrap gap-y-1">
               <div className="flex items-center text-amber-500 text-xs font-medium bg-amber-50 px-1.5 py-0.5 rounded">
                <Star size={12} className="fill-current mr-0.5" />
                {place.rating.toFixed(1)}
              </div>
              <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${place.isOpen ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                {place.isOpen ? '營業中' : '休息中'}
              </span>
              {place.distance && (
                <div className="flex items-center text-xs font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                    <Navigation size={10} className="mr-0.5" />
                    {place.distance}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-start text-slate-500 text-sm mt-2 mb-4 flex-1">
        <MapPin size={14} className="mt-0.5 mr-1.5 flex-shrink-0 text-slate-400" />
        <span className="line-clamp-2 text-xs">{place.address}</span>
      </div>

      <a 
        href={place.sourceUri} 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center justify-center w-full py-2 bg-slate-50 text-slate-600 text-sm font-medium rounded-lg hover:bg-green-600 hover:text-white transition-all border border-slate-200 hover:border-green-600"
      >
        <span>開啟地圖 / 導航</span>
        <ArrowUpRight size={14} className="ml-1" />
      </a>
    </div>
  );
};