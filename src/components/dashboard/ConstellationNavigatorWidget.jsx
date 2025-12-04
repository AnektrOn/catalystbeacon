import React, { useState } from 'react';
import { Sparkles, ChevronRight } from 'lucide-react';

const ConstellationNavigatorWidget = ({
    currentSchool = 'Insight',
    currentConstellation = {
        name: 'Consciousness Studies',
        nodes: [
            { id: '1', name: 'The Observer', completed: true, isCurrent: false },
            { id: '2', name: 'Awareness', completed: true, isCurrent: false },
            { id: '3', name: 'Presence', completed: false, isCurrent: true },
            { id: '4', name: 'Being', completed: false, isCurrent: false },
            { id: '5', name: 'Non-Duality', completed: false, isCurrent: false }
        ]
    }
}) => {
    const [hoveredNode, setHoveredNode] = useState(null);

    const completedCount = currentConstellation.nodes?.filter(n => n.completed).length || 0;
    const totalCount = currentConstellation.nodes?.length || 0;
    const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    return (
        <div className="glass-panel-floating p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-start justify-between mb-6">
                <div>
                    <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                        Constellation
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                        {currentConstellation.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {currentSchool} School
                    </p>
                </div>
                <div className="p-3 rounded-xl bg-purple-400/10 text-purple-500">
                    <Sparkles size={20} />
                </div>
            </div>

            {/* Starmap Visualization */}
            <div className="relative h-32 mb-6 flex items-center justify-center">
                {currentConstellation.nodes && currentConstellation.nodes.length > 0 ? (
                <svg className="w-full h-full" viewBox="0 0 300 100">
                    {/* Connection Lines */}
                    {currentConstellation.nodes.map((node, index) => {
                        if (index < currentConstellation.nodes.length - 1) {
                            const x1 = 30 + (index * 60);
                            const x2 = 30 + ((index + 1) * 60);
                            return (
                                <line
                                    key={`line-${index}`}
                                    x1={x1}
                                    y1="50"
                                    x2={x2}
                                    y2="50"
                                    stroke={node.completed ? '#A78BFA' : '#E5E7EB'}
                                    strokeWidth="1"
                                    opacity="0.5"
                                />
                            );
                        }
                        return null;
                    })}

                    {/* Nodes */}
                    {currentConstellation.nodes.map((node, index) => {
                        const x = 30 + (index * 60);
                        const y = 50;

                        return (
                            <g
                                key={node.id}
                                onMouseEnter={() => setHoveredNode(node.id)}
                                onMouseLeave={() => setHoveredNode(null)}
                                className="cursor-pointer"
                            >
                                {/* Outer ring for current node */}
                                {node.isCurrent && (
                                    <circle
                                        cx={x}
                                        cy={y}
                                        r="10"
                                        fill="none"
                                        stroke="#A78BFA"
                                        strokeWidth="2"
                                        opacity="0.5"
                                    >
                                        <animate
                                            attributeName="r"
                                            from="10"
                                            to="14"
                                            dur="1.5s"
                                            repeatCount="indefinite"
                                        />
                                        <animate
                                            attributeName="opacity"
                                            from="0.5"
                                            to="0"
                                            dur="1.5s"
                                            repeatCount="indefinite"
                                        />
                                    </circle>
                                )}

                                {/* Node circle */}
                                <circle
                                    cx={x}
                                    cy={y}
                                    r="6"
                                    fill={node.completed ? '#A78BFA' : node.isCurrent ? '#A78BFA' : '#E5E7EB'}
                                    stroke={node.isCurrent ? '#A78BFA' : 'none'}
                                    strokeWidth="2"
                                    className="transition-all duration-300"
                                />

                                {/* Hover tooltip */}
                                {hoveredNode === node.id && (
                                    <text
                                        x={x}
                                        y={y - 15}
                                        textAnchor="middle"
                                        className="text-xs fill-gray-700 dark:fill-gray-300"
                                        style={{ fontSize: '10px' }}
                                    >
                                        {node.name}
                                    </text>
                                )}
                            </g>
                        );
                    })}
                </svg>
                ) : (
                    <div className="text-center text-gray-400 text-sm">
                        No courses available
                    </div>
                )}
            </div>

            {/* Progress */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        {completedCount} of {totalCount} nodes completed
                    </span>
                    <span className="text-xs font-medium text-purple-500">
                        {progressPercentage.toFixed(0)}%
                    </span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700/50 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
            </div>

            {/* Current Node */}
            {currentConstellation.nodes && currentConstellation.nodes.find(n => n.isCurrent) && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-500/20">
                    <div>
                        <div className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">
                            Current Node
                        </div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {currentConstellation.nodes.find(n => n.isCurrent).name}
                        </div>
                    </div>
                    <ChevronRight size={16} className="text-purple-500" />
                </div>
            )}
        </div>
    );
};

export default ConstellationNavigatorWidget;
