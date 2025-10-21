
import { useEffect, useState, useRef, memo } from 'react';

// Type definitions for Chrome performance APIs
interface ChromePerformance extends Performance {
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}




const PerformanceDebugger = memo(({ nodes, edges }: { nodes: any[], edges: any[] }) => {
  const [visible, setVisible] = useState(false);
  const [metrics, setMetrics] = useState({
    fps: 0,
    memory: 'N/A',
    heapSize: 'N/A',
    heapLimit: 'N/A',
    nodeRenderTime: 0,
    frameTime: 0,
    domNodes: 0,
    layoutCount: 0,
    styleRecalcs: 0
  });

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const animationIdRef = useRef<number>(null);

  // Safe memory measurement with TypeScript
  const measureMemory = () => {
    const chromePerf = performance as ChromePerformance;
    
    if (chromePerf.memory) {
      const memory = chromePerf.memory;
      setMetrics(prev => ({
        ...prev,
        memory: `${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB`,
        heapSize: `${Math.round(memory.totalJSHeapSize / 1024 / 1024)}MB`,
        heapLimit: `${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)}MB`
      }));
    } else {
      // Fallback for browsers without memory API
      setMetrics(prev => ({
        ...prev,
        memory: 'Not available',
        heapSize: 'N/A',
        heapLimit: 'N/A'
      }));
    }
  };

  // Comprehensive performance monitoring
  useEffect(() => {
    if (!visible) return;

    // FPS Measurement
    const measureFPS = (currentTime: number) => {
      frameCountRef.current++;
      
      if (currentTime - lastTimeRef.current >= 1000) {
        const fps = Math.round((frameCountRef.current * 1000) / (currentTime - lastTimeRef.current));
        const frameTime = 1000 / fps;
        
        setMetrics(prev => ({ ...prev, fps, frameTime }));
        frameCountRef.current = 0;
        lastTimeRef.current = currentTime;
      }
      
      animationIdRef.current = requestAnimationFrame(measureFPS);
    };

    animationIdRef.current = requestAnimationFrame(measureFPS);

    // Memory monitoring
    const memoryInterval = setInterval(measureMemory, 2000);

    // DOM monitoring
    const measureDOM = () => {
      const domNodes = document.getElementsByTagName('*').length;
      setMetrics(prev => ({ ...prev, domNodes }));
    };

    const domInterval = setInterval(measureDOM, 3000);

    // Performance observer for layout/style calculations
    const observePerformance = () => {
      if ('PerformanceObserver' in window) {
        try {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            let layoutCount = 0;
            let styleRecalcs = 0;

            entries.forEach((entry) => {
              if (entry.name.includes('layout') || entry.entryType === 'layout') {
                layoutCount++;
              }
              if (entry.name.includes('style') || entry.name.includes('recalc')) {
                styleRecalcs++;
              }
            });

            setMetrics(prev => ({ 
              ...prev, 
              layoutCount: prev.layoutCount + layoutCount,
              styleRecalcs: prev.styleRecalcs + styleRecalcs
            }));
          });
          
          observer.observe({ entryTypes: ['measure', 'layout', 'paint', 'render'] });
        } catch (e) {
          console.log('PerformanceObserver not fully supported');
        }
      }
    };

    observePerformance();

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      clearInterval(memoryInterval);
      clearInterval(domInterval);
    };
  }, [visible]);

  // Measure render performance
  useEffect(() => {
    if (!visible) return;

    const startMark = `render-start-${Date.now()}`;
    const endMark = `render-end-${Date.now()}`;
    
    performance.mark(startMark);
    
    const timeoutId = setTimeout(() => {
      performance.mark(endMark);
      performance.measure('node-render', startMark, endMark);
      
      const measures = performance.getEntriesByName('node-render');
      if (measures.length > 0) {
        const renderTime = measures[measures.length - 1].duration;
        setMetrics(prev => ({ ...prev, nodeRenderTime: Math.round(renderTime) }));
      }
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      // Clean up performance marks
      performance.clearMarks(startMark);
      performance.clearMarks(endMark);
      performance.clearMeasures('node-render');
    };
  }, [nodes, edges, visible]);

  // Get browser capabilities
  const getBrowserCapabilities = () => {
    const chromePerf = performance as ChromePerformance;
    return {
      hasMemoryAPI: !!chromePerf.memory,
      hasPerformanceObserver: 'PerformanceObserver' in window,
      userAgent: navigator.userAgent
    };
  };

  if (!visible) return (
    <button 
      className="fixed bottom-5 left-5 z-50 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-2 rounded-lg text-xs border border-purple-400 shadow-lg"
      onClick={() => setVisible(true)}
    >
      🚀 Performance
    </button>
  );

  const performanceStatus = metrics.fps < 30 ? 'poor' : metrics.fps < 50 ? 'fair' : 'good';
  const memoryStatus = metrics.memory !== 'N/A' && metrics.memory !== 'Not available' && parseInt(metrics.memory) > 500 ? 'poor' : 'good';
  const capabilities = getBrowserCapabilities();

  return (
    <div className="fixed bottom-5 left-5 z-50 bg-gray-900 text-white p-4 rounded-lg border border-gray-600 min-w-[300px] shadow-2xl backdrop-blur-sm">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            performanceStatus === 'good' ? 'bg-green-500' : 
            performanceStatus === 'fair' ? 'bg-yellow-500' : 'bg-red-500'
          }`} />
          <span className="font-bold text-sm">Performance Metrics</span>
        </div>
        <button 
          onClick={() => setVisible(false)} 
          className="text-lg leading-none hover:text-gray-300 transition-colors"
        >
          ×
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        {/* FPS */}
        <div className="bg-gray-800 p-2 rounded">
          <div className="text-gray-400">FPS</div>
          <div className={`text-lg font-mono ${
            metrics.fps >= 50 ? 'text-green-400' : 
            metrics.fps >= 30 ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {metrics.fps}
          </div>
          <div className="text-gray-500 text-xs">Frame: {metrics.frameTime.toFixed(1)}ms</div>
        </div>

        {/* Memory */}
        <div className="bg-gray-800 p-2 rounded">
          <div className="text-gray-400">Memory</div>
          <div className={`text-sm font-mono ${
            memoryStatus === 'good' ? 'text-green-400' : 'text-red-400'
          }`}>
            {metrics.memory}
          </div>
          {metrics.heapSize !== 'N/A' && metrics.heapSize !== 'Not available' && (
            <div className="text-gray-500 text-xs">Heap: {metrics.heapSize}</div>
          )}
          {!capabilities.hasMemoryAPI && (
            <div className="text-gray-500 text-xs">Chrome only</div>
          )}
        </div>

        {/* Nodes & Edges */}
        <div className="bg-gray-800 p-2 rounded">
          <div className="text-gray-400">Elements</div>
          <div className="text-white font-mono">{nodes.length + edges.length}</div>
          <div className="text-gray-500 text-xs">
            {nodes.length}N / {edges.length}E
          </div>
        </div>

        {/* Render Time */}
        <div className="bg-gray-800 p-2 rounded">
          <div className="text-gray-400">Render</div>
          <div className={`text-sm font-mono ${
            metrics.nodeRenderTime < 50 ? 'text-green-400' :
            metrics.nodeRenderTime < 100 ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {metrics.nodeRenderTime}ms
          </div>
          <div className="text-gray-500 text-xs">DOM: {metrics.domNodes}</div>
        </div>
      </div>

      {/* Browser Info */}
      <div className="mt-2 text-xs text-gray-500">
        <div>Browser: {capabilities.hasMemoryAPI ? 'Chrome' : 'Other'}</div>
        <div>Metrics: {capabilities.hasMemoryAPI ? 'Full' : 'Basic'}</div>
      </div>

      {/* Performance Tips */}
      <div className="mt-3 pt-3 border-t border-gray-700">
        <div className="text-xs text-gray-400 mb-2">💡 Performance Tips:</div>
        {nodes.length > 100 && (
          <div className="text-yellow-400 text-xs">• Reduce node count ({nodes.length} nodes)</div>
        )}
        {metrics.fps < 30 && (
          <div className="text-red-400 text-xs">• Low FPS - consider virtualization</div>
        )}
        {metrics.nodeRenderTime > 100 && (
          <div className="text-yellow-400 text-xs">• Slow rendering - memoize components</div>
        )}
        {metrics.memory !== 'N/A' && metrics.memory !== 'Not available' && parseInt(metrics.memory) > 300 && (
          <div className="text-red-400 text-xs">• High memory usage</div>
        )}
      </div>

      {/* Debug Actions */}
      <div className="flex gap-2 mt-3">
        <button 
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1 rounded text-xs transition-colors"
          onClick={() => {
            console.log('🎯 Performance Metrics:', {
              metrics,
              capabilities,
              nodes: nodes.length,
              edges: edges.length,
              userAgent: navigator.userAgent
            });
          }}
        >
          📊 Log Metrics
        </button>
        <button 
          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-1 rounded text-xs transition-colors"
          onClick={() => {
            if (window.gc) {
              (window as any).gc();
              console.log('🗑️ Manual GC triggered');
            } else {
              console.log('🗑️ GC not available in this browser');
            }
          }}
        >
          🗑️ GC
        </button>
      </div>
    </div>
  );
});

export default PerformanceDebugger;