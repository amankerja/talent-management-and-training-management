import React, { useEffect, useRef, useState, useMemo } from 'react';
import Raphael from 'raphael';
if (typeof window !== 'undefined') {
  (window as any).Raphael = Raphael;
}
import 'treant-js/Treant.css';
import TreantModule from 'treant-js';
const TreantJS = (TreantModule as any)?.Treant || TreantModule || (typeof window !== 'undefined' ? (window as any).Treant : null);
if (typeof window !== 'undefined' && TreantJS) {
  (window as any).Treant = TreantJS;
}

import { useWorkforce } from '../../context/WorkforceContext';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Building2,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Users,
  ShieldAlert,
  ArrowRight,
  Maximize2
} from 'lucide-react';
import { Department, JobLevel, Employee } from '../../types';
import { DEPARTMENTS } from '../../data/mockData';

interface TreantOrgChartProps {
  scenarioKey?: 'base' | 'merger' | 'digital' | 'span_opt';
  onSelectEmployee?: (emp: Employee) => void;
}

interface TreeNodeData {
  id: string;
  employee: Employee;
  spanCount: number;
  children: TreeNodeData[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  collapsed?: boolean;
}

export const TreantOrgChart: React.FC<TreantOrgChartProps> = ({
  scenarioKey = 'base',
  onSelectEmployee
}) => {
  const { employees, setSelectedEmployee, setIsEmployeeModalOpen } = useWorkforce();
  const [zoomLevel, setZoomLevel] = useState<number>(0.9);
  const [selectedDept, setSelectedDept] = useState<Department | 'All'>('All');
  const [orientation, setOrientation] = useState<'NORTH' | 'WEST'>('NORTH');
  const [connectorType, setConnectorType] = useState<'step' | 'curve'>('step');
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});

  // 1. Build Hierarchical Tree Data Structure (100% Dynamic from Relational Database)
  const treeData = useMemo<TreeNodeData>(() => {
    if (!employees || employees.length === 0) {
      const fallbackEmp: Employee = {
        id: 'EMP-001',
        nip: 'AK-DIR-001',
        name: 'Ahmad Faqih Didin, S.T., M.T.',
        jobTitle: 'Direktur Operasional & Kepala Teknik Tambang',
        department: 'Operations',
        level: 'Director',
        grade: 'G10',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        tenureYears: 12,
        joinDate: '2014-03-01',
        birthYear: 1984,
        email: 'ahmad.faqih@amankerja.co.id',
        employmentType: 'PKWTT (Permanent)',
        education: 'S2',
        nineBoxGrid: 9,
        performanceRating: 'High',
        potentialRating: 'High',
        isKeyTalent: true,
        radar: { performance: 98, leadership: 95, technical: 92, adaptability: 94, cultureFit: 96 },
        careerPaths: [],
        trainings: {}
      };
      return {
        id: fallbackEmp.id,
        employee: fallbackEmp,
        spanCount: 0,
        children: []
      };
    }

    // Helper recursive function to build subtree based on managerId relationship
    const buildSubTree = (parentEmp: Employee): TreeNodeData => {
      // Find all direct subordinates whose managerId equals parentEmp.id or whose managerName matches parentEmp.name
      const directSubs = employees.filter(e => 
        e.id !== parentEmp.id && (
          e.managerId === parentEmp.id || 
          (e.managerName && e.managerName.toLowerCase().trim() === parentEmp.name.toLowerCase().trim())
        )
      );

      // Filter by department if a specific department is selected and not 'All'
      const filteredSubs = selectedDept === 'All' 
        ? directSubs 
        : directSubs.filter(s => s.department === selectedDept || employees.some(child => child.managerId === s.id && child.department === selectedDept));

      return {
        id: parentEmp.id,
        employee: parentEmp,
        spanCount: directSubs.length,
        children: filteredSubs.map(sub => buildSubTree(sub))
      };
    };

    // Find the top-level root employee (Director or employee with no managerId / manager not in employee list)
    const topDirector = employees.find(e => e.level === 'Director' && (!e.managerId || !employees.some(m => m.id === e.managerId)))
      || employees.find(e => !e.managerId || !employees.some(m => m.id === e.managerId))
      || employees[0];

    return buildSubTree(topDirector);
  }, [employees, selectedDept, scenarioKey]);

  // 2. Walker II Tree Positioning & Layout Coordinates Calculation
  const layout = useMemo(() => {
    const CARD_WIDTH = orientation === 'NORTH' ? 220 : 230;
    const CARD_HEIGHT = orientation === 'NORTH' ? 76 : 76;
    const SIBLING_GAP = orientation === 'NORTH' ? 24 : 20;
    const LEVEL_GAP = orientation === 'NORTH' ? 60 : 70;

    let nextLeafX = 0;
    let nextLeafY = 0;

    // Calculate node coordinates recursively
    const computePositions = (node: TreeNodeData, depth: number): { x: number; y: number; minX: number; maxX: number; minY: number; maxY: number } => {
      const isCollapsed = !!collapsedNodes[node.id];
      const effectiveChildren = isCollapsed ? [] : node.children;

      if (orientation === 'NORTH') {
        const y = depth * (CARD_HEIGHT + LEVEL_GAP);

        if (effectiveChildren.length === 0) {
          const x = nextLeafX;
          nextLeafX += CARD_WIDTH + SIBLING_GAP;
          node.x = x;
          node.y = y;
          node.width = CARD_WIDTH;
          node.height = CARD_HEIGHT;
          return { x, y, minX: x, maxX: x + CARD_WIDTH, minY: y, maxY: y + CARD_HEIGHT };
        } else {
          let minX = Infinity;
          let maxX = -Infinity;
          let minY = y;
          let maxY = y + CARD_HEIGHT;

          const childBounds = effectiveChildren.map(c => {
            const b = computePositions(c, depth + 1);
            if (b.minX < minX) minX = b.minX;
            if (b.maxX > maxX) maxX = b.maxX;
            if (b.maxY > maxY) maxY = b.maxY;
            return b;
          });

          // Center parent above children
          const firstChild = effectiveChildren[0];
          const lastChild = effectiveChildren[effectiveChildren.length - 1];
          const centerX = ((firstChild.x ?? 0) + (lastChild.x ?? 0)) / 2;

          node.x = centerX;
          node.y = y;
          node.width = CARD_WIDTH;
          node.height = CARD_HEIGHT;

          return { x: centerX, y, minX: Math.min(minX, centerX), maxX: Math.max(maxX, centerX + CARD_WIDTH), minY, maxY };
        }
      } else {
        // WEST (Horizontal)
        const x = depth * (CARD_WIDTH + LEVEL_GAP);

        if (effectiveChildren.length === 0) {
          const y = nextLeafY;
          nextLeafY += CARD_HEIGHT + SIBLING_GAP;
          node.x = x;
          node.y = y;
          node.width = CARD_WIDTH;
          node.height = CARD_HEIGHT;
          return { x, y, minX: x, maxX: x + CARD_WIDTH, minY: y, maxY: y + CARD_HEIGHT };
        } else {
          let minX = x;
          let maxX = x + CARD_WIDTH;
          let minY = Infinity;
          let maxY = -Infinity;

          const childBounds = effectiveChildren.map(c => {
            const b = computePositions(c, depth + 1);
            if (b.minY < minY) minY = b.minY;
            if (b.maxY > maxY) maxY = b.maxY;
            if (b.maxX > maxX) maxX = b.maxX;
            return b;
          });

          const firstChild = effectiveChildren[0];
          const lastChild = effectiveChildren[effectiveChildren.length - 1];
          const centerY = ((firstChild.y ?? 0) + (lastChild.y ?? 0)) / 2;

          node.x = x;
          node.y = centerY;
          node.width = CARD_WIDTH;
          node.height = CARD_HEIGHT;

          return { x, y: centerY, minX, maxX, minY: Math.min(minY, centerY), maxY: Math.max(maxY, centerY + CARD_HEIGHT) };
        }
      }
    };

    // Flatten tree to nodes and connector paths
    const bounds = computePositions(treeData, 0);

    const allNodes: TreeNodeData[] = [];
    const allConnectors: { id: string; path: string; fromX: number; fromY: number; toX: number; toY: number }[] = [];

    const traverse = (node: TreeNodeData) => {
      allNodes.push(node);
      const isCollapsed = !!collapsedNodes[node.id];
      if (isCollapsed) return;

      node.children.forEach((child, idx) => {
        const fromX = (node.x ?? 0) + (orientation === 'NORTH' ? (node.width ?? 0) / 2 : (node.width ?? 0));
        const fromY = (node.y ?? 0) + (orientation === 'NORTH' ? (node.height ?? 0) : (node.height ?? 0) / 2);

        const toX = (child.x ?? 0) + (orientation === 'NORTH' ? (child.width ?? 0) / 2 : 0);
        const toY = (child.y ?? 0) + (orientation === 'NORTH' ? 0 : (child.height ?? 0) / 2);

        let pathStr = '';
        if (connectorType === 'step') {
          if (orientation === 'NORTH') {
            const midY = fromY + (toY - fromY) / 2;
            pathStr = `M ${fromX} ${fromY} L ${fromX} ${midY} L ${toX} ${midY} L ${toX} ${toY}`;
          } else {
            const midX = fromX + (toX - fromX) / 2;
            pathStr = `M ${fromX} ${fromY} L ${midX} ${fromY} L ${midX} ${toY} L ${toX} ${toY}`;
          }
        } else {
          // Curve Bezier
          if (orientation === 'NORTH') {
            const cp1X = fromX;
            const cp1Y = fromY + (toY - fromY) * 0.5;
            const cp2X = toX;
            const cp2Y = toY - (toY - fromY) * 0.5;
            pathStr = `M ${fromX} ${fromY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${toX} ${toY}`;
          } else {
            const cp1X = fromX + (toX - fromX) * 0.5;
            const cp1Y = fromY;
            const cp2X = toX - (toX - fromX) * 0.5;
            const cp2Y = toY;
            pathStr = `M ${fromX} ${fromY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${toX} ${toY}`;
          }
        }

        allConnectors.push({
          id: `${node.id}->${child.id}`,
          path: pathStr,
          fromX,
          fromY,
          toX,
          toY
        });

        traverse(child);
      });
    };

    traverse(treeData);

    const totalWidth = Math.max(bounds.maxX + 60, 600);
    const totalHeight = Math.max(bounds.maxY + 60, 450);

    return {
      nodes: allNodes,
      connectors: allConnectors,
      totalWidth,
      totalHeight
    };
  }, [treeData, orientation, connectorType, collapsedNodes]);

  const handleNodeClick = (emp: Employee) => {
    setSelectedEmployee(emp);
    setIsEmployeeModalOpen(true);
    if (onSelectEmployee) onSelectEmployee(emp);
  };

  const toggleCollapse = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedNodes(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleZoomIn = () => setZoomLevel((z) => Math.min(Number((z + 0.15).toFixed(2)), 1.8));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(Number((z - 0.15).toFixed(2)), 0.35));
  const handleResetZoom = () => setZoomLevel(0.9);

  return (
    <div className="flex flex-col h-full bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden relative select-none">
      {/* Interactive Control Toolbar */}
      <div className="px-4 py-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0 z-20 shadow-2xs">
        {/* Left: Department Scope Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Fokus Unit:</span>
          </span>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value as Department | 'All')}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 font-medium focus:ring-2 focus:ring-blue-100 outline-none cursor-pointer"
          >
            <option value="All">Seluruh Korporat (6 Departemen)</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Center: Orientation & Line Type */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setOrientation('NORTH')}
              className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                orientation === 'NORTH' ? 'bg-white text-blue-700 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Vertikal (Top-Down)
            </button>
            <button
              onClick={() => setOrientation('WEST')}
              className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                orientation === 'WEST' ? 'bg-white text-blue-700 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Horizontal (Left-Right)
            </button>
          </div>

          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setConnectorType('step')}
              className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                connectorType === 'step' ? 'bg-white text-blue-700 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Garis Siku (Step)
            </button>
            <button
              onClick={() => setConnectorType('curve')}
              className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                connectorType === 'curve' ? 'bg-white text-blue-700 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kurva Halus (Curve)
            </button>
          </div>
        </div>

        {/* Right: Zoom Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleZoomOut}
            title="Perkecil Tampilan (Zoom Out)"
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono font-semibold text-slate-700 px-2 min-w-12 text-center tabular-nums">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            title="Perbesar Tampilan (Zoom In)"
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetZoom}
            title="Reset Zoom (90%)"
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer ml-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Treant Canvas Viewport */}
      <div className="flex-1 overflow-auto custom-scrollbar p-10 flex items-start justify-center bg-slate-100/60 min-h-140 relative">
        <div 
          style={{ 
            width: layout.totalWidth,
            height: layout.totalHeight,
            transform: `scale(${zoomLevel})`, 
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out'
          }}
          className="relative shrink-0"
        >
          {/* 1. Vector SVG Connectors */}
          <svg 
            width={layout.totalWidth} 
            height={layout.totalHeight} 
            className="absolute inset-0 pointer-events-none z-0 overflow-visible"
          >
            <defs>
              <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#94a3b8" />
                <stop offset="100%" stopColor="#64748b" />
              </linearGradient>
            </defs>
            {layout.connectors.map(c => (
              <g key={c.id}>
                {/* Outline shadow path */}
                <path
                  d={c.path}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Main connector line */}
                <path
                  d={c.path}
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all duration-300"
                />
                {/* Small join dot */}
                <circle cx={c.toX} cy={c.toY} r="2.5" fill="#64748b" />
              </g>
            ))}
          </svg>

          {/* 2. Interactive DOM Node Cards */}
          {layout.nodes.map(node => {
            const emp = node.employee;
            const isCeo = emp.level === 'Director' && (emp.jobTitle.includes('CEO') || emp.jobTitle.includes('Direktur Utama'));
            const isCollapsed = !!collapsedNodes[node.id];
            const hasChildren = node.children.length > 0;

            const levelBadgeColor = 
              emp.level === 'Director' ? 'bg-amber-100 text-amber-800 border-amber-300' :
              emp.level === 'Manager' ? 'bg-blue-100 text-blue-800 border-blue-200' :
              emp.level === 'Supervisor' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
              'bg-slate-100 text-slate-700 border-slate-200';

            return (
              <div
                key={node.id}
                onClick={() => handleNodeClick(emp)}
                style={{
                  position: 'absolute',
                  left: `${node.x}px`,
                  top: `${node.y}px`,
                  width: `${node.width}px`,
                  height: `${node.height}px`
                }}
                className={`group z-10 rounded-xl transition-all duration-150 cursor-pointer border ${
                  isCeo
                    ? 'bg-slate-900 text-white border-slate-700 shadow-md hover:border-amber-400'
                    : 'bg-white text-slate-900 border-slate-200/90 shadow-2xs hover:border-blue-500 hover:shadow-md'
                }`}
              >
                <div className="p-2.5 h-full flex flex-col justify-between">
                  {/* Top: Avatar + Name + Title */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img 
                      src={emp.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'} 
                      alt={emp.name} 
                      className={`w-9 h-9 rounded-full object-cover shrink-0 border ${
                        isCeo ? 'border-amber-400/80' : 'border-slate-200'
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-xs font-bold truncate block ${isCeo ? 'text-white' : 'text-slate-900'}`}>
                          {emp.name}
                        </span>
                        {emp.isKeyTalent && (
                          <span className="text-[9px] text-amber-400 shrink-0" title="Key Critical Talent">⭐</span>
                        )}
                      </div>
                      <span className={`text-[10.5px] truncate block ${isCeo ? 'text-slate-300 font-medium' : 'text-slate-500'}`}>
                        {emp.jobTitle}
                      </span>
                    </div>
                  </div>

                  {/* Bottom: Level + Dept + Span Badge */}
                  <div className={`mt-1.5 pt-1.5 border-t flex items-center justify-between text-[10px] ${
                    isCeo ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'
                  }`}>
                    <div className="flex items-center gap-1.5 truncate">
                      <span className={`px-1.5 py-0.2 rounded font-semibold text-[9.5px] border ${levelBadgeColor}`}>
                        {emp.level}
                      </span>
                      <span className="truncate text-[10px] text-slate-400 max-w-20">
                        {emp.department}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {node.spanCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 font-bold text-[9.5px] border border-blue-100">
                          Span {node.spanCount}
                        </span>
                      )}

                      {/* Collapse/Expand Toggle Switch */}
                      {hasChildren && (
                        <button
                          onClick={(e) => toggleCollapse(node.id, e)}
                          title={isCollapsed ? 'Buka cabang bawahan' : 'Tutup cabang bawahan'}
                          className={`w-4 h-4 rounded flex items-center justify-center transition cursor-pointer ${
                            isCeo ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-600'
                          }`}
                        >
                          {isCollapsed ? '+' : '−'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
