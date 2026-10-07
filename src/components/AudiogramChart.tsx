import React, { useState } from 'react';
import { Ear, Frequency, STANDARD_FREQUENCIES, ThresholdMap } from '../types/audiometry';

interface AudiogramChartProps {
  rightThresholds: ThresholdMap;
  leftThresholds: ThresholdMap;
  onPointSelect?: (freq: Frequency, db: number, ear: Ear) => void;
  selectedEar?: Ear;
  editable?: boolean;
  showSpeechBananaDefault?: boolean;
  className?: string;
}

export const AudiogramChart: React.FC<AudiogramChartProps> = ({
  rightThresholds,
  leftThresholds,
  onPointSelect,
  selectedEar = 'right',
  editable = false,
  showSpeechBananaDefault = false,
  className = '',
}) => {
  const [showSpeechBanana, setShowSpeechBanana] = useState(showSpeechBananaDefault);
  const [activeEarFilter, setActiveEarFilter] = useState<'both' | 'right' | 'left'>('both');
  const [hoveredPoint, setHoveredPoint] = useState<{ freq: Frequency; db: number; ear: Ear } | null>(null);

  // Chart coordinate dimensions
  const svgWidth = 620;
  const svgHeight = 480;
  const padding = { top: 45, right: 65, bottom: 45, left: 65 };
  const graphWidth = svgWidth - padding.left - padding.right;
  const graphHeight = svgHeight - padding.top - padding.bottom;

  // Y-axis: -10 dB HL to 120 dB HL (inverted)
  const minDb = -10;
  const maxDb = 120;
  const dbSteps = [-10, 0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120];

  const getYCoord = (db: number) => {
    return padding.top + ((db - minDb) / (maxDb - minDb)) * graphHeight;
  };

  const getXCoord = (freq: Frequency) => {
    const index = STANDARD_FREQUENCIES.indexOf(freq);
    return padding.left + (index / (STANDARD_FREQUENCIES.length - 1)) * graphWidth;
  };

  // Convert clicked coordinates to nearest frequency & 5-dB step
  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!editable || !onPointSelect) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * svgWidth;
    const clickY = ((e.clientY - rect.top) / rect.height) * svgHeight;

    if (
      clickX < padding.left - 15 ||
      clickX > svgWidth - padding.right + 15 ||
      clickY < padding.top - 10 ||
      clickY > svgHeight - padding.bottom + 10
    ) {
      return;
    }

    // Find closest frequency
    let closestFreq: Frequency = STANDARD_FREQUENCIES[0];
    let minDiffX = Infinity;
    STANDARD_FREQUENCIES.forEach((f) => {
      const x = getXCoord(f);
      const diff = Math.abs(x - clickX);
      if (diff < minDiffX) {
        minDiffX = diff;
        closestFreq = f;
      }
    });

    // Find closest dB step in 5 dB increments
    const normalizedY = (clickY - padding.top) / graphHeight;
    const rawDb = minDb + normalizedY * (maxDb - minDb);
    const roundedDb = Math.round(rawDb / 5) * 5;
    const clampedDb = Math.max(-10, Math.min(120, roundedDb));

    const targetEar = activeEarFilter === 'both' ? selectedEar : activeEarFilter;
    onPointSelect(closestFreq, clampedDb, targetEar);
  };

  // Generate SVG path for an ear's thresholds
  const generatePath = (thresholds: ThresholdMap) => {
    const points: { x: number; y: number }[] = [];
    STANDARD_FREQUENCIES.forEach((freq) => {
      const db = thresholds[freq];
      if (db !== null && db !== undefined) {
        points.push({ x: getXCoord(freq), y: getYCoord(db) });
      }
    });

    if (points.length < 2) return '';
    return points.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, '');
  };

  const rightPath = generatePath(rightThresholds);
  const leftPath = generatePath(leftThresholds);

  return (
    <div className={`flex flex-col bg-white rounded-xl border border-slate-200 p-4 shadow-xs ${className}`}>
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-100 no-print">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700">نمایش گوش:</span>
          <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs font-medium">
            <button
              onClick={() => setActiveEarFilter('both')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                activeEarFilter === 'both' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              هر دو گوش
            </button>
            <button
              onClick={() => setActiveEarFilter('right')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                activeEarFilter === 'right' ? 'bg-red-50 text-red-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-red-700'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-600 inline-block"></span>
              گوش راست (قرمز - O)
            </button>
            <button
              onClick={() => setActiveEarFilter('left')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                activeEarFilter === 'left' ? 'bg-blue-50 text-blue-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-blue-700'
              }`}
            >
              <span className="w-2 h-2 bg-blue-600 inline-block"></span>
              گوش چپ (آبی - X)
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {editable && (
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200">
              ثبت با کلیک برای:{' '}
              <strong className={(activeEarFilter === 'both' ? selectedEar : activeEarFilter) === 'right' ? 'text-red-700 font-bold' : 'text-blue-700 font-bold'}>
                {(activeEarFilter === 'both' ? selectedEar : activeEarFilter) === 'right' ? 'گوش راست (O)' : 'گوش چپ (X)'}
              </strong>
            </span>
          )}
          <button
            onClick={() => setShowSpeechBanana(!showSpeechBanana)}
            className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${
              showSpeechBanana
                ? 'bg-amber-50 border-amber-300 text-amber-800 font-medium'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {showSpeechBanana ? '✓ محدوده گفتار (Speech Banana)' : '+ محدوده گفتار (Banana)'}
          </button>
        </div>
      </div>

      {/* SVG Audiogram Container */}
      <div className="relative w-full flex items-center justify-center overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className={`w-full max-w-[620px] select-none ${editable ? 'cursor-crosshair' : 'cursor-default'}`}
          onClick={handleSvgClick}
        >
          <defs>
            {/* Speech banana shape gradient */}
            <linearGradient id="speechBananaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#FBBF24" stopOpacity="0.25" />
            </linearGradient>
          </defs>

          {/* Shaded Severity Zones */}
          {/* Normal: -10 to 20 dB */}
          <rect
            x={padding.left}
            y={getYCoord(-10)}
            width={graphWidth}
            height={getYCoord(20) - getYCoord(-10)}
            fill="#F0FDF4"
            opacity="0.8"
          />
          {/* Mild: 20 to 40 dB */}
          <rect
            x={padding.left}
            y={getYCoord(20)}
            width={graphWidth}
            height={getYCoord(40) - getYCoord(20)}
            fill="#FEFCE8"
            opacity="0.6"
          />
          {/* Moderate: 40 to 55 dB */}
          <rect
            x={padding.left}
            y={getYCoord(40)}
            width={graphWidth}
            height={getYCoord(55) - getYCoord(40)}
            fill="#FFF7ED"
            opacity="0.6"
          />
          {/* Moderately Severe: 55 to 70 dB */}
          <rect
            x={padding.left}
            y={getYCoord(55)}
            width={graphWidth}
            height={getYCoord(70) - getYCoord(55)}
            fill="#FFF1F2"
            opacity="0.5"
          />
          {/* Severe: 70 to 90 dB */}
          <rect
            x={padding.left}
            y={getYCoord(70)}
            width={graphWidth}
            height={getYCoord(90) - getYCoord(70)}
            fill="#FEE2E2"
            opacity="0.5"
          />
          {/* Profound: 90 to 120 dB */}
          <rect
            x={padding.left}
            y={getYCoord(90)}
            width={graphWidth}
            height={getYCoord(120) - getYCoord(90)}
            fill="#EDE9FE"
            opacity="0.5"
          />

          {/* Speech Banana Overlay */}
          {showSpeechBanana && (
            <g>
              <path
                d={`M ${getXCoord(250)} ${getYCoord(25)}
                   C ${getXCoord(500)} ${getYCoord(18)}, ${getXCoord(1000)} ${getYCoord(22)}, ${getXCoord(2000)} ${getYCoord(28)}
                   C ${getXCoord(2000)} ${getYCoord(30)}, ${getXCoord(4000)} ${getYCoord(38)}, ${getXCoord(4000)} ${getYCoord(52)}
                   C ${getXCoord(2000)} ${getYCoord(55)}, ${getXCoord(1000)} ${getYCoord(52)}, ${getXCoord(500)} ${getYCoord(48)}
                   C ${getXCoord(250)} ${getYCoord(45)}, ${getXCoord(250)} ${getYCoord(40)}, ${getXCoord(250)} ${getYCoord(25)} Z`}
                fill="url(#speechBananaGrad)"
                stroke="#D97706"
                strokeWidth="1.5"
                strokeDasharray="4 2"
              />
              <text
                x={getXCoord(1000)}
                y={getYCoord(37)}
                fill="#92400E"
                fontSize="11"
                fontWeight="600"
                textAnchor="middle"
                className="font-sans"
              >
                محدوده آواها و درک گفتار (Speech Area)
              </text>
              <text x={getXCoord(500)} y={getYCoord(30)} fill="#B45309" fontSize="10" textAnchor="middle">m, d, b, u</text>
              <text x={getXCoord(2000)} y={getYCoord(34)} fill="#B45309" fontSize="10" textAnchor="middle">ch, sh, p, t</text>
              <text x={getXCoord(4000)} y={getYCoord(45)} fill="#B45309" fontSize="10" textAnchor="middle">s, f, th</text>
            </g>
          )}

          {/* Horizontal Gridlines (dB HL) */}
          {dbSteps.map((db) => {
            const y = getYCoord(db);
            const isZeroLine = db === 0;
            const isNormalBoundary = db === 20;

            return (
              <g key={`y-line-${db}`}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={svgWidth - padding.right}
                  y2={y}
                  stroke={isZeroLine ? '#475569' : isNormalBoundary ? '#94A3B8' : '#CBD5E1'}
                  strokeWidth={isZeroLine ? '1.5' : isNormalBoundary ? '1.2' : '0.75'}
                  strokeDasharray={db % 20 === 0 ? undefined : '2 2'}
                />
                {/* Left Y-axis label */}
                <text
                  x={padding.left - 10}
                  y={y + 3.5}
                  fill="#475569"
                  fontSize="11"
                  textAnchor="end"
                  className="font-mono tabular-nums font-medium"
                >
                  {db}
                </text>
                {/* Right Y-axis label */}
                <text
                  x={svgWidth - padding.right + 10}
                  y={y + 3.5}
                  fill="#64748B"
                  fontSize="10"
                  textAnchor="start"
                  className="font-mono tabular-nums"
                >
                  {db}
                </text>
              </g>
            );
          })}

          {/* Vertical Gridlines (Frequency in Hz) */}
          {STANDARD_FREQUENCIES.map((freq) => {
            const x = getXCoord(freq);
            return (
              <g key={`x-line-${freq}`}>
                <line
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={svgHeight - padding.bottom}
                  stroke="#94A3B8"
                  strokeWidth="1"
                />
                {/* Top X-axis Frequency label */}
                <text
                  x={x}
                  y={padding.top - 12}
                  fill="#1E293B"
                  fontSize="11"
                  fontWeight="600"
                  textAnchor="middle"
                  className="font-mono"
                >
                  {freq >= 1000 ? `${freq / 1000}k` : freq}
                </text>
                {/* Bottom X-axis label in Hz */}
                <text
                  x={x}
                  y={svgHeight - padding.bottom + 18}
                  fill="#475569"
                  fontSize="10"
                  textAnchor="middle"
                  className="font-mono"
                >
                  {freq}
                </text>
              </g>
            );
          })}

          {/* Severity labels on right edge */}
          <text x={svgWidth - padding.right + 28} y={getYCoord(5)} fill="#15803D" fontSize="9" fontWeight="500">طبیعی</text>
          <text x={svgWidth - padding.right + 28} y={getYCoord(30)} fill="#A16207" fontSize="9" fontWeight="500">خفیف</text>
          <text x={svgWidth - padding.right + 28} y={getYCoord(48)} fill="#C2410C" fontSize="9" fontWeight="500">متوسط</text>
          <text x={svgWidth - padding.right + 28} y={getYCoord(63)} fill="#BE123C" fontSize="8.5" fontWeight="500">متوسط-شدید</text>
          <text x={svgWidth - padding.right + 28} y={getYCoord(80)} fill="#B91C1C" fontSize="9" fontWeight="500">شدید</text>
          <text x={svgWidth - padding.right + 28} y={getYCoord(105)} fill="#6D28D9" fontSize="9" fontWeight="500">عمیق</text>

          {/* Graph Boundary Box */}
          <rect
            x={padding.left}
            y={padding.top}
            width={graphWidth}
            height={graphHeight}
            fill="none"
            stroke="#334155"
            strokeWidth="1.5"
          />

          {/* Axis Titles */}
          <text
            x={svgWidth / 2}
            y={18}
            fill="#0F172A"
            fontSize="12"
            fontWeight="700"
            textAnchor="middle"
            className="font-sans"
          >
            فرکانس به هرتز (Frequency in Hz)
          </text>
          <text
            x={16}
            y={svgHeight / 2}
            fill="#334155"
            fontSize="11"
            fontWeight="600"
            textAnchor="middle"
            transform={`rotate(-90, 16, ${svgHeight / 2})`}
            className="font-sans"
          >
            شدت صوت (Hearing Level in dB HL)
          </text>

          {/* 1. RIGHT EAR (RED, CIRCLE 'O') */}
          {(activeEarFilter === 'both' || activeEarFilter === 'right') && (
            <g id="right-ear-group">
              {rightPath && (
                <path
                  d={rightPath}
                  fill="none"
                  stroke="#DC2626"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
              {STANDARD_FREQUENCIES.map((freq) => {
                const db = rightThresholds[freq];
                if (db === null || db === undefined) return null;
                const cx = getXCoord(freq);
                const cy = getYCoord(db);
                return (
                  <g
                    key={`r-pt-${freq}`}
                    onMouseEnter={() => setHoveredPoint({ freq, db, ear: 'right' })}
                    onMouseLeave={() => setHoveredPoint(null)}
                    className="cursor-pointer"
                  >
                    <circle
                      cx={cx}
                      cy={cy}
                      r="6.5"
                      fill="#FFFFFF"
                      stroke="#DC2626"
                      strokeWidth="2.5"
                    />
                    <circle cx={cx} cy={cy} r="10" fill="transparent" />
                  </g>
                );
              })}
            </g>
          )}

          {/* 2. LEFT EAR (BLUE, CROSS 'X') */}
          {(activeEarFilter === 'both' || activeEarFilter === 'left') && (
            <g id="left-ear-group">
              {leftPath && (
                <path
                  d={leftPath}
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
              {STANDARD_FREQUENCIES.map((freq) => {
                const db = leftThresholds[freq];
                if (db === null || db === undefined) return null;
                const cx = getXCoord(freq);
                const cy = getYCoord(db);
                const size = 5.5;
                return (
                  <g
                    key={`l-pt-${freq}`}
                    onMouseEnter={() => setHoveredPoint({ freq, db, ear: 'left' })}
                    onMouseLeave={() => setHoveredPoint(null)}
                    className="cursor-pointer"
                  >
                    <line
                      x1={cx - size}
                      y1={cy - size}
                      x2={cx + size}
                      y2={cy + size}
                      stroke="#2563EB"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <line
                      x1={cx + size}
                      y1={cy - size}
                      x2={cx - size}
                      y2={cy + size}
                      stroke="#2563EB"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <circle cx={cx} cy={cy} r="10" fill="transparent" />
                  </g>
                );
              })}
            </g>
          )}

          {/* Tooltip on hover */}
          {hoveredPoint && (
            <g
              transform={`translate(${getXCoord(hoveredPoint.freq)}, ${getYCoord(hoveredPoint.db) - 20})`}
              pointerEvents="none"
            >
              <rect
                x="-42"
                y="-18"
                width="84"
                height="20"
                rx="4"
                fill="#0F172A"
                opacity="0.9"
              />
              <text
                x="0"
                y="-5"
                fill="#FFFFFF"
                fontSize="10"
                fontWeight="500"
                textAnchor="middle"
                className="font-mono"
              >
                {hoveredPoint.ear === 'right' ? 'گوش راست' : 'گوش چپ'}: {hoveredPoint.db} dB
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Legend & Guide */}
      <div className="flex flex-wrap items-center justify-between gap-4 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-full border-2 border-red-600 bg-white"></div>
            <span className="font-semibold text-red-700">گوش راست (Right Ear - O)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-blue-600 text-base leading-none">✕</span>
            <span className="font-semibold text-blue-700">گوش چپ (Left Ear - X)</span>
          </div>
        </div>

        {editable && (
          <div className="text-slate-500 text-[11px] no-print">
            💡 با کلیک مستقیم روی هر تقاطع نمودار می‌توانید آستانه شنوایی را ثبت یا اصلاح نمایید.
          </div>
        )}
      </div>
    </div>
  );
};
