import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { FilterTabs } from './components/FilterTabs';
import { PlaceCard } from './components/PlaceCard';
import { fetchNearbyPlaces } from './services/geminiService';
import { Place, Category, GeoLocation } from './types';
import { Loader2, AlertCircle, MapPinOff, Search } from 'lucide-react';

export default function App() {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search & Filter States
  const [radiusInput, setRadiusInput] = useState<string>("3");
  const [category, setCategory] = useState<Category>(Category.ALL);
  const [showOpenOnly, setShowOpenOnly] = useState<boolean>(false);

  const performSearch = useCallback(async (loc: GeoLocation, rad: number) => {
    setLoading(true);
    setError(null);
    try {
      const results = await fetchNearbyPlaces(loc, rad);
      setPlaces(results);
    } catch (err) {
      setError("無法取得店家資料，請稍後再試。");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // 1. Get User Location
    if (!navigator.geolocation) {
      setError("您的瀏覽器不支援地理位置功能");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const userLoc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setLocation(userLoc);

        // 2. Initial Fetch with default 3km
        performSearch(userLoc, 3);
      },
      (err) => {
        setError("無法取得您的位置。請允許存取位置資訊以搜尋附近店家。");
        setLoading(false);
        console.error(err);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [performSearch]);

  const handleManualSearch = () => {
    if (!location) return;
    const r = parseFloat(radiusInput);
    if (isNaN(r) || r <= 0 || r > 50) {
      alert("請輸入有效的公里數 (0.1 - 50)");
      return;
    }
    performSearch(location, r);
  };

  // Filter Logic
  const filteredPlaces = useMemo(() => {
    return places.filter(place => {
      // Category Filter
      if (category !== Category.ALL && place.category !== category) return false;
      
      // Open Status Filter
      if (showOpenOnly && !place.isOpen) return false;

      return true;
    });
  }, [places, category, showOpenOnly]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      
      <main className="flex-1 w-full max-w-2xl mx-auto flex flex-col">
        {/* Search Controls */}
        <div className="bg-white p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 flex items-center bg-slate-100 rounded-lg px-3 py-2 border border-transparent focus-within:border-green-500 transition-colors">
              <label htmlFor="radius" className="text-sm text-slate-500 whitespace-nowrap mr-2">
                搜尋半徑 (km):
              </label>
              <input
                id="radius"
                type="number"
                min="0.5"
                max="50"
                step="0.5"
                value={radiusInput}
                onChange={(e) => setRadiusInput(e.target.value)}
                className="bg-transparent border-none outline-none w-full text-slate-800 font-medium"
                placeholder="輸入公里數"
              />
            </div>
            <button
              onClick={handleManualSearch}
              disabled={loading || !location}
              className="flex items-center justify-center space-x-2 bg-slate-800 text-white px-5 py-2 rounded-lg font-medium hover:bg-slate-700 active:bg-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
              <span>重新搜尋</span>
            </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4">
            <div className="relative">
              <div className="absolute inset-0 bg-green-200 rounded-full animate-ping opacity-25"></div>
              <div className="bg-white p-4 rounded-full shadow-lg relative z-10">
                <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
              </div>
            </div>
            <p className="text-slate-500 font-medium animate-pulse">正在搜尋 {radiusInput}km 內支援 LINE Pay 的好去處...</p>
            <p className="text-xs text-slate-400">正在詢問 Gemini 關於附近的餐廳與飲料店</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="bg-red-50 p-4 rounded-full mb-4">
              <MapPinOff className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">發生錯誤</h3>
            <p className="text-slate-600 max-w-xs">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-6 px-6 py-2 bg-slate-800 text-white rounded-full text-sm font-medium hover:bg-slate-700 transition-colors"
            >
              重新整理
            </button>
          </div>
        )}

        {/* Content State */}
        {!loading && !error && (
          <>
            <FilterTabs 
              activeCategory={category} 
              onCategoryChange={setCategory}
              showOpenOnly={showOpenOnly}
              onToggleOpenOnly={() => setShowOpenOnly(!showOpenOnly)}
            />

            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>找到 {filteredPlaces.length} 個結果</span>
                <span>資料來源: Google Maps</span>
              </div>

              {filteredPlaces.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-200">
                  <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">沒有符合條件的店家</p>
                  <p className="text-xs text-slate-400 mt-1">試著調整篩選條件或擴大搜尋範圍看看？</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {filteredPlaces.map((place) => (
                    <PlaceCard key={place.id} place={place} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
      
      <footer className="bg-white border-t border-slate-100 py-6 text-center text-xs text-slate-400">
        <p>Powered by Google Gemini 2.5 & Google Maps</p>
        <p className="mt-1">此應用程式僅供參考，實際支付方式請以店家公告為主</p>
      </footer>
    </div>
  );
}