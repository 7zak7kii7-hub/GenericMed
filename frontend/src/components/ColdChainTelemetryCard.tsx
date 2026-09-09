import React, { useState, useEffect } from 'react';
import { api, ColdChainTelemetry } from '../services/api';

interface ColdChainTelemetryCardProps {
  orderId: string;
  showToastMessage: (msg: string) => void;
}

export const ColdChainTelemetryCard: React.FC<ColdChainTelemetryCardProps> = ({
  orderId,
  showToastMessage,
}) => {
  const [telemetry, setTelemetry] = useState<ColdChainTelemetry | null>(null);
  const [loading, setLoading] = useState(false);
  const [isTogglingBreach, setIsTogglingBreach] = useState(false);

  // Fetch telemetry on mount and setup polling/fluctuation
  useEffect(() => {
    let mounted = true;

    const fetchTelemetry = async () => {
      try {
        const res = await api.getOrderTelemetry(orderId);
        if (mounted && res.telemetry) {
          setTelemetry(res.telemetry);
        }
      } catch (err) {
        console.warn('Failed to load telemetry:', err);
      }
    };

    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 6000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [orderId]);

  const handleToggleBreach = async () => {
    if (!telemetry) return;
    setIsTogglingBreach(true);
    const newBreachState = !telemetry.breachSimulated;

    try {
      const res = await api.simulateTemperatureBreach(orderId, newBreachState, newBreachState ? 26.8 : 21.2);
      setTelemetry(res.telemetry);
      if (newBreachState) {
        showToastMessage('⚠️ Cold-Chain SLA Breach Alert: Carrier at 26.8°C (Max allowed 24°C)');
      } else {
        showToastMessage('✅ Cold-Chain Restored: Carrier normalized to 21.2°C (Optimal)');
      }
    } catch {
      showToastMessage('Failed to update telemetry simulation.');
    } finally {
      setIsTogglingBreach(false);
    }
  };

  const isBreached = telemetry ? !telemetry.isWithinSla : false;
  const currentTemp = telemetry ? telemetry.currentTemp : 21.2;

  // Calculate SVG sparkline points
  const history = telemetry?.temperatureHistory || [
    { timestamp: '14:24', temp: 20.8, isWithinSla: true },
    { timestamp: '14:28', temp: 21.0, isWithinSla: true },
    { timestamp: '14:32', temp: 21.4, isWithinSla: true },
    { timestamp: '14:36', temp: 21.1, isWithinSla: true },
    { timestamp: '14:40', temp: 21.2, isWithinSla: true },
  ];

  // Map temperatures to SVG coordinate space (200x50)
  const minT = 18.0;
  const maxT = 28.0;
  const svgWidth = 220;
  const svgHeight = 44;

  const points = history
    .map((item, idx) => {
      const x = Math.round((idx / Math.max(history.length - 1, 1)) * svgWidth);
      const clamped = Math.min(Math.max(item.temp, minT), maxT);
      const y = Math.round(svgHeight - ((clamped - minT) / (maxT - minT)) * (svgHeight - 8) - 4);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div
      className={`w-full rounded-xl p-space-base shadow-sm flex flex-col gap-space-md border transition-all duration-300 ${
        isBreached
          ? 'bg-red-50/90 border-red-300 ring-2 ring-red-400/20'
          : 'bg-surface-container-lowest border-border-subtle'
      }`}
    >
      {/* Header with Live Status & CDSCO SLA Tag */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-space-xs">
          <span
            className={`material-symbols-outlined text-[20px] ${
              isBreached ? 'text-status-danger-text animate-bounce' : 'text-primary'
            }`}
          >
            device_thermostat
          </span>
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm text-text-primary font-bold tracking-tight">
              IoT Cold-Chain Telemetry
            </span>
            <span className="font-label-sm text-[11px] text-text-muted">
              Sensor ID: {telemetry?.sensorId || 'BLE-TEMPSENSE-049'} • Insulated Carrier
            </span>
          </div>
        </div>

        <span
          className={`font-label-sm text-label-sm px-space-xs py-space-2xs rounded-full flex items-center gap-1.5 font-bold border ${
            isBreached
              ? 'bg-red-100 text-red-800 border-red-300 animate-pulse'
              : 'bg-status-success-bg text-status-success-text border-status-success-border'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isBreached ? 'bg-red-600' : 'bg-status-success-text animate-ping'
            }`}
          ></span>
          {isBreached ? 'SLA BREACH ALERT' : 'SLA COMPLIANT'}
        </span>
      </div>

      {/* Critical Breach Warning Banner (If Triggered) */}
      {isBreached && (
        <div className="p-space-sm bg-red-100/90 border border-red-300 rounded-lg flex items-start gap-space-xs text-red-900 animate-fadeIn">
          <span className="material-symbols-outlined text-red-600 text-[20px] shrink-0 mt-0.5">
            warning
          </span>
          <div className="flex flex-col text-xs leading-relaxed">
            <span className="font-bold">CRITICAL TEMPERATURE SPIKE ({currentTemp}°C)</span>
            <span>
              Exceeded maximum CDSCO Form 20B ambient threshold (24.0°C). Audio alarm triggered on
              courier carrier. Immediate cooling protocol activated.
            </span>
          </div>
        </div>
      )}

      {/* Main Metrics: Temperature Gauge & Carrier BLE Telemetry */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-space-sm">
        {/* Metric 1: Live Temperature Gauge */}
        <div
          className={`p-space-sm rounded-xl border flex flex-col justify-between col-span-2 sm:col-span-1 ${
            isBreached
              ? 'bg-red-100/50 border-red-200'
              : 'bg-surface-subtle/80 border-border-subtle'
          }`}
        >
          <div className="flex items-center justify-between text-text-muted font-label-sm text-[11px]">
            <span>CARRIER TEMP</span>
            <span className="font-bold text-text-secondary">SLA: 18°C–24°C</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span
              className={`font-display-sm text-3xl font-extrabold font-code-tabular tracking-tight ${
                isBreached ? 'text-red-700' : 'text-primary'
              }`}
            >
              {currentTemp.toFixed(1)}°
            </span>
            <span className="font-label-sm text-sm font-semibold text-text-muted">C</span>
          </div>
          <div className="flex items-center gap-1 mt-1 text-[11px] text-text-secondary font-medium">
            <span className="material-symbols-outlined text-[14px]">
              {isBreached ? 'error' : 'check_circle'}
            </span>
            <span>{isBreached ? 'Above Safe Zone' : 'Optimal Bioequivalence'}</span>
          </div>
        </div>

        {/* Metric 2: Live Sparkline History Curve */}
        <div className="p-space-sm bg-surface-subtle/80 rounded-xl border border-border-subtle flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-text-muted font-label-sm text-[11px]">
            <span>THERMAL PROFILE</span>
            <span className="text-[10px] text-text-muted">Last 20m</span>
          </div>
          <div className="h-11 w-full flex items-center justify-center my-1 overflow-hidden">
            <svg
              className="w-full h-full overflow-visible"
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              preserveAspectRatio="none"
            >
              {/* Safe band reference rect (18°C to 24°C) */}
              <line
                x1="0"
                y1={svgHeight - ((24 - minT) / (maxT - minT)) * (svgHeight - 8) - 4}
                x2={svgWidth}
                y2={svgHeight - ((24 - minT) / (maxT - minT)) * (svgHeight - 8) - 4}
                stroke="#cbd5e1"
                strokeDasharray="2,2"
                strokeWidth="1"
              />
              <polyline
                fill="none"
                stroke={isBreached ? '#dc2626' : '#005048'}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
              />
            </svg>
          </div>
          <div className="flex justify-between text-[10px] text-text-muted font-code-tabular">
            <span>{history[0]?.timestamp || '14:24'}</span>
            <span>{history[history.length - 1]?.timestamp || 'Now'}</span>
          </div>
        </div>

        {/* Metric 3: BLE Hardware & Tamper Seal */}
        <div className="p-space-sm bg-surface-subtle/80 rounded-xl border border-border-subtle flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-text-muted font-label-sm text-[11px]">
            <span>BLE BEACON</span>
            <span className="flex items-center gap-0.5 text-status-success-text font-bold text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-status-success-text"></span>
              94% BAT
            </span>
          </div>
          <div className="flex flex-col gap-1 my-1">
            <div className="flex items-center gap-1 text-text-primary text-xs font-semibold">
              <span className="material-symbols-outlined text-[16px] text-primary">lock</span>
              <span>Lid Seal: Secured</span>
            </div>
            <span className="text-[10px] text-text-muted truncate">
              Tamper-evident RFID active
            </span>
          </div>
          <div className="text-[10px] text-primary font-bold">Bluetooth 5.2 • 2.4 GHz</div>
        </div>
      </div>

      {/* Simulator Action Row */}
      <div className="flex items-center justify-between pt-space-xs border-t border-border-subtle/60 gap-space-sm flex-wrap">
        <div className="flex items-center gap-1.5 text-text-muted text-xs">
          <span className="material-symbols-outlined text-[16px]">science</span>
          <span>CDSCO Telemetry Log ID #TM-88219</span>
        </div>

        <button
          onClick={handleToggleBreach}
          disabled={isTogglingBreach}
          className={`px-space-sm py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all active:scale-95 shadow-xs ${
            isBreached
              ? 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700'
              : 'bg-red-50 text-red-700 border-red-300 hover:bg-red-100'
          }`}
          title="Toggle thermal breach to test CDSCO alarm workflow"
        >
          <span className="material-symbols-outlined text-[14px]">
            {isBreached ? 'refresh' : 'electrical_services'}
          </span>
          <span>{isBreached ? 'Normalize Temp (21.2°C)' : 'Simulate Temp Breach (26.8°C)'}</span>
        </button>
      </div>
    </div>
  );
};
