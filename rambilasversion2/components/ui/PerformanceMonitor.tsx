import React, { useEffect, useState } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage?: number;
  isSlowConnection: boolean;
}

export const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== 'development') return;

    const measurePerformance = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const loadTime = navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0;
      
      // Check connection speed
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      const isSlowConnection = connection ? connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g' : false;

      // Memory usage (if available)
      const memoryUsage = (performance as any).memory ? (performance as any).memory.usedJSHeapSize : undefined;

      setMetrics({
        loadTime,
        renderTime: performance.now(),
        memoryUsage,
        isSlowConnection
      });
    };

    // Measure after initial render
    const timer = setTimeout(measurePerformance, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Toggle visibility with keyboard shortcut
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsVisible(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (!metrics || !isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-black/80 text-white p-3 rounded-lg text-xs font-mono max-w-xs">
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold">Performance</span>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white"
        >
          ×
        </button>
      </div>
      <div className="space-y-1">
        <div>Load Time: {metrics.loadTime.toFixed(2)}ms</div>
        <div>Render Time: {metrics.renderTime.toFixed(2)}ms</div>
        {metrics.memoryUsage && (
          <div>Memory: {(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB</div>
        )}
        <div className={metrics.isSlowConnection ? 'text-yellow-400' : 'text-green-400'}>
          Connection: {metrics.isSlowConnection ? 'Slow' : 'Fast'}
        </div>
      </div>
      <div className="mt-2 text-gray-400 text-xs">
        Press Ctrl+Shift+P to toggle
      </div>
    </div>
  );
};

// Hook for performance monitoring
export const usePerformanceMonitor = () => {
  const [isSlowConnection, setIsSlowConnection] = useState(false);

  useEffect(() => {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      setIsSlowConnection(connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g');
    }
  }, []);

  return { isSlowConnection };
};
