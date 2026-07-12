import React, { useState } from 'react';

export default function LeafletAdvancedFeatures() {
  const [activeFeature, setActiveFeature] = useState('drawing');

  const features = [
    { id: 'drawing', name: '繪圖工具', desc: '在地圖上畫線、多邊形、圓形' },
    { id: 'measurement', name: '測量工具', desc: '測量距離與面積' },
    { id: 'cluster', name: '標記群集', desc: '智慧聚合大量標記' },
    { id: 'tracking', name: '即時追蹤', desc: '模擬移動物體追蹤' },
  ];

  return (
    <div className="w-full h-screen bg-gray-100 flex flex-col">
      {/* 頂部導航 */}
      <div className="bg-white shadow-lg z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-3">
            Leaflet 進階功能展示
          </h1>
          <div className="flex flex-wrap gap-2">
            {features.map(feature => (
              <button
                key={feature.id}
                onClick={() => setActiveFeature(feature.id)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  activeFeature === feature.id
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {feature.name}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {features.find(f => f.id === activeFeature)?.desc}
          </p>
        </div>
      </div>

      {/* 地圖區域 */}
      <div className="flex-1 relative">
        {activeFeature === 'drawing' && <DrawingToolsComponent />}
        {activeFeature === 'measurement' && <MeasurementToolsComponent />}
        {activeFeature === 'cluster' && <MarkerClusterComponent />}
        {activeFeature === 'tracking' && <GeolocationTrackerComponent />}
      </div>
    </div>
  );
}

// ============ 元件：地圖容器 ============
function MapContainerComponent({ children, center = [24.1477, 120.6736], zoom = 13 }) {
  const mapRef = React.useRef(null);
  const mapInstanceRef = React.useRef(null);

  React.useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // 載入 Leaflet CSS
    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // 載入 Leaflet JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => {
      const L = window.L;
      
      // 修正預設圖標
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current).setView(center, zoom);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
      
      if (children && typeof children === 'function') {
        children(map, L);
      }
    };
    document.body.appendChild(script);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [center, zoom]);

  return <div ref={mapRef} className="w-full h-full" />;
}

// ============ 元件：繪圖工具 ============
function DrawingToolsComponent() {
  const [shapes, setShapes] = React.useState([]);
  const [currentTool, setCurrentTool] = React.useState(null);
  const layersRef = React.useRef([]);

  const initDrawing = (map, L) => {
    let points = [];
    let currentShape = null;

    map.on('click', (e) => {
      if (!currentTool) return;

      const { lat, lng } = e.latlng;

      if (currentTool === 'marker') {
        const marker = L.marker([lat, lng]).addTo(map);
        marker.bindPopup(`<b>標記</b><br>座標: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        layersRef.current.push(marker);
        setShapes(prev => [...prev, { type: 'marker', coords: [lat, lng] }]);
      } else if (currentTool === 'circle') {
        const circle = L.circle([lat, lng], {
          radius: 500,
          color: '#3b82f6',
          fillColor: '#60a5fa',
          fillOpacity: 0.3
        }).addTo(map);
        circle.bindPopup('<b>圓形</b><br>半徑: 500m');
        layersRef.current.push(circle);
        setShapes(prev => [...prev, { type: 'circle', coords: [lat, lng] }]);
      } else if (currentTool === 'polygon') {
        points.push([lat, lng]);
        
        if (points.length === 1) {
          L.circleMarker([lat, lng], { radius: 5, color: 'red' }).addTo(map);
        } else if (points.length >= 3) {
          if (currentShape) map.removeLayer(currentShape);
          currentShape = L.polygon(points, {
            color: '#10b981',
            fillColor: '#34d399',
            fillOpacity: 0.3
          }).addTo(map);
          layersRef.current.push(currentShape);
        }
      }
    });

    map.on('dblclick', () => {
      if (currentTool === 'polygon' && points.length >= 3) {
        setShapes(prev => [...prev, { type: 'polygon', coords: points }]);
        points = [];
        currentShape = null;
      }
    });
  };

  const clearAll = (map) => {
    layersRef.current.forEach(layer => {
      if (map && layer) map.removeLayer(layer);
    });
    layersRef.current = [];
    setShapes([]);
  };

  return (
    <div className="w-full h-full relative">
      <MapContainerComponent>
        {(map, L) => {
          initDrawing(map, L);
          window.currentMap = map;
        }}
      </MapContainerComponent>

      <div className="absolute top-4 right-4 bg-white p-4 rounded-xl shadow-2xl space-y-2 max-w-xs">
        <h3 className="font-bold text-gray-800 mb-3">繪圖工具</h3>
        
        <button
          onClick={() => setCurrentTool('marker')}
          className={`w-full px-4 py-2 rounded-lg font-semibold ${
            currentTool === 'marker' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          放置標記
        </button>

        <button
          onClick={() => setCurrentTool('circle')}
          className={`w-full px-4 py-2 rounded-lg font-semibold ${
            currentTool === 'circle' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          繪製圓形
        </button>

        <button
          onClick={() => setCurrentTool('polygon')}
          className={`w-full px-4 py-2 rounded-lg font-semibold ${
            currentTool === 'polygon' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          繪製多邊形
        </button>

        <button
          onClick={() => clearAll(window.currentMap)}
          className="w-full px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600"
        >
          清除全部
        </button>

        <div className="border-t pt-2 mt-2">
          <p className="text-sm text-gray-600">
            已繪製: {shapes.length} 個物件
          </p>
          {currentTool === 'polygon' && (
            <p className="text-xs text-blue-600 mt-1">
              點擊地圖繪製多邊形，雙擊完成
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ============ 元件：測量工具 ============
function MeasurementToolsComponent() {
  const [distance, setDistance] = React.useState(0);
  const [isMeasuring, setIsMeasuring] = React.useState(false);
  const pointsRef = React.useRef([]);
  const markersRef = React.useRef([]);
  const lineRef = React.useRef(null);

  const startMeasurement = (map, L) => {
    map.on('click', (e) => {
      if (!isMeasuring) return;

      const { lat, lng } = e.latlng;
      pointsRef.current.push([lat, lng]);

      const marker = L.circleMarker([lat, lng], {
        radius: 6,
        color: '#ef4444',
        fillColor: '#f87171',
        fillOpacity: 0.8
      }).addTo(map);
      markersRef.current.push(marker);

      if (pointsRef.current.length > 1) {
        if (lineRef.current) map.removeLayer(lineRef.current);
        
        lineRef.current = L.polyline(pointsRef.current, {
          color: '#ef4444',
          weight: 3,
          dashArray: '10, 5'
        }).addTo(map);

        let totalDist = 0;
        for (let i = 0; i < pointsRef.current.length - 1; i++) {
          const p1 = L.latLng(pointsRef.current[i]);
          const p2 = L.latLng(pointsRef.current[i + 1]);
          totalDist += p1.distanceTo(p2);
        }
        setDistance(totalDist);
      }
    });
  };

  const clearMeasurement = (map) => {
    markersRef.current.forEach(m => map && map.removeLayer(m));
    if (lineRef.current && map) map.removeLayer(lineRef.current);
    pointsRef.current = [];
    markersRef.current = [];
    lineRef.current = null;
    setDistance(0);
  };

  return (
    <div className="w-full h-full relative">
      <MapContainerComponent>
        {(map, L) => {
          startMeasurement(map, L);
          window.currentMap = map;
        }}
      </MapContainerComponent>

      <div className="absolute top-4 right-4 bg-white p-4 rounded-xl shadow-2xl space-y-2 max-w-xs">
        <h3 className="font-bold text-gray-800 mb-3">測量工具</h3>
        
        <button
          onClick={() => setIsMeasuring(!isMeasuring)}
          className={`w-full px-4 py-2 rounded-lg font-semibold ${
            isMeasuring 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {isMeasuring ? '✓ 測量中...' : '開始測量'}
        </button>

        <button
          onClick={() => clearMeasurement(window.currentMap)}
          className="w-full px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600"
        >
          清除測量
        </button>

        {distance > 0 && (
          <div className="border-t pt-3 mt-3">
            <p className="text-sm text-gray-600 mb-1">總距離:</p>
            <p className="text-2xl font-bold text-blue-600">
              {distance < 1000 
                ? `${distance.toFixed(2)} m`
                : `${(distance / 1000).toFixed(2)} km`
              }
            </p>
            <p className="text-xs text-gray-500 mt-2">
              點擊數: {pointsRef.current.length}
            </p>
          </div>
        )}

        {isMeasuring && (
          <p className="text-xs text-blue-600 mt-2">
            點擊地圖上的點來測量距離
          </p>
        )}
      </div>
    </div>
  );
}

// ============ 元件：標記群集 ============
function MarkerClusterComponent() {
  const [markerCount, setMarkerCount] = React.useState(50);
  const markersRef = React.useRef([]);

  const generateMarkers = (map, L, count) => {
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    const center = map.getCenter();
    
    for (let i = 0; i < count; i++) {
      const lat = center.lat + (Math.random() - 0.5) * 0.1;
      const lng = center.lng + (Math.random() - 0.5) * 0.1;
      
      const marker = L.marker([lat, lng]).addTo(map);
      marker.bindPopup(`<b>標記 #${i + 1}</b><br>座標: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      markersRef.current.push(marker);
    }
  };

  return (
    <div className="w-full h-full relative">
      <MapContainerComponent>
        {(map, L) => {
          generateMarkers(map, L, markerCount);
          window.currentMap = map;
          window.L = L;
        }}
      </MapContainerComponent>

      <div className="absolute top-4 right-4 bg-white p-4 rounded-xl shadow-2xl space-y-3 max-w-xs">
        <h3 className="font-bold text-gray-800 mb-3">標記群集</h3>
        
        <div>
          <label className="text-sm text-gray-600 block mb-2">
            標記數量: {markerCount}
          </label>
          <input
            type="range"
            min="10"
            max="200"
            value={markerCount}
            onChange={(e) => setMarkerCount(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <button
          onClick={() => {
            if (window.currentMap && window.L) {
              generateMarkers(window.currentMap, window.L, markerCount);
            }
          }}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600"
        >
          重新生成
        </button>

        <div className="border-t pt-3">
          <p className="text-sm text-gray-600">
            目前顯示: {markersRef.current.length} 個標記
          </p>
          <p className="text-xs text-gray-500 mt-1">
            在真實應用中，可以使用 Marker Cluster 插件來自動分組大量標記
          </p>
        </div>
      </div>
    </div>
  );
}

// ============ 元件：即時追蹤 ============
function GeolocationTrackerComponent() {
  const [isTracking, setIsTracking] = React.useState(false);
  const [speed, setSpeed] = React.useState(50);
  const [position, setPosition] = React.useState(null);
  const markerRef = React.useRef(null);
  const pathRef = React.useRef(null);
  const intervalRef = React.useRef(null);
  const positionsRef = React.useRef([]);

  const startTracking = (map, L) => {
    if (isTracking) {
      clearInterval(intervalRef.current);
      setIsTracking(false);
      return;
    }

    const center = map.getCenter();
    let currentPos = { lat: center.lat, lng: center.lng };
    positionsRef.current = [[currentPos.lat, currentPos.lng]];

    const icon = L.divIcon({
      html: '<div style="background: #ef4444; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>',
      className: '',
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });

    markerRef.current = L.marker([currentPos.lat, currentPos.lng], { icon }).addTo(map);
    markerRef.current.bindPopup('<b>追蹤中...</b>').openPopup();

    pathRef.current = L.polyline(positionsRef.current, {
      color: '#3b82f6',
      weight: 3,
      opacity: 0.7
    }).addTo(map);

    setIsTracking(true);

    intervalRef.current = setInterval(() => {
      const angle = Math.random() * Math.PI * 2;
      const distance = 0.001;
      
      currentPos.lat += Math.cos(angle) * distance;
      currentPos.lng += Math.sin(angle) * distance;

      positionsRef.current.push([currentPos.lat, currentPos.lng]);
      
      if (markerRef.current) {
        markerRef.current.setLatLng([currentPos.lat, currentPos.lng]);
        map.panTo([currentPos.lat, currentPos.lng]);
      }

      if (pathRef.current) {
        pathRef.current.setLatLngs(positionsRef.current);
      }

      setPosition(currentPos);
    }, speed);
  };

  return (
    <div className="w-full h-full relative">
      <MapContainerComponent>
        {(map, L) => {
          window.currentMap = map;
          window.L = L;
        }}
      </MapContainerComponent>

      <div className="absolute top-4 right-4 bg-white p-4 rounded-xl shadow-2xl space-y-3 max-w-xs">
        <h3 className="font-bold text-gray-800 mb-3">即時追蹤</h3>
        
        <button
          onClick={() => startTracking(window.currentMap, window.L)}
          className={`w-full px-4 py-2 rounded-lg font-semibold ${
            isTracking 
              ? 'bg-red-500 text-white hover:bg-red-600' 
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          {isTracking ? '停止追蹤' : '開始追蹤'}
        </button>

        <div>
          <label className="text-sm text-gray-600 block mb-2">
            更新速度: {speed}ms
          </label>
          <input
            type="range"
            min="20"
            max="200"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-full"
            disabled={isTracking}
          />
        </div>

        {position && (
          <div className="border-t pt-3 text-sm">
            <p className="text-gray-600 mb-1">當前位置:</p>
            <p className="text-xs font-mono text-gray-700">
              緯度: {position.lat.toFixed(6)}<br/>
              經度: {position.lng.toFixed(6)}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              路徑點數: {positionsRef.current.length}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}