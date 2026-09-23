'use client';

import React, { useState } from 'react';
import {
  DndContext,
  useDraggable,
  DragEndEvent,
  useSensors,
  useSensor,
  PointerSensor,
} from '@dnd-kit/core';
import { Users, Edit2, Trash2, CheckCircle, Clock, Ban, UserCheck } from 'lucide-react';

export interface TableItem {
  _id: string;
  tableNumber: string;
  capacity: number;
  type?: string;
  zone: string;
  positionX: number;
  positionY: number;
  shape: 'round' | 'square' | 'rect';
  status: 'available' | 'reserved' | 'occupied' | 'maintenance';
}

interface DraggableTableProps {
  table: TableItem;
  onEdit: (table: TableItem) => void;
  onDelete: (id: string) => void;
}

function DraggableTable({ table, onEdit, onDelete }: DraggableTableProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: table._id,
  });

  const currentX = (table.positionX || 50) + (transform ? transform.x : 0);
  const currentY = (table.positionY || 50) + (transform ? transform.y : 0);

  // Styling based on shape
  let shapeClasses = 'rounded-2xl w-32 h-32';
  if (table.shape === 'round') {
    shapeClasses = 'rounded-full w-32 h-32';
  } else if (table.shape === 'rect') {
    shapeClasses = 'rounded-2xl w-44 h-28';
  }

  // Status colors
  let statusBg = 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300';
  let statusIcon = <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />;
  if (table.status === 'reserved') {
    statusBg = 'bg-amber-950/80 border-amber-500/50 text-amber-300';
    statusIcon = <Clock className="w-3.5 h-3.5 text-amber-400" />;
  } else if (table.status === 'occupied') {
    statusBg = 'bg-rose-950/80 border-rose-500/50 text-rose-300';
    statusIcon = <UserCheck className="w-3.5 h-3.5 text-rose-400" />;
  } else if (table.status === 'maintenance') {
    statusBg = 'bg-slate-900/80 border-slate-600 text-slate-400';
    statusIcon = <Ban className="w-3.5 h-3.5 text-slate-400" />;
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        position: 'absolute',
        left: `${currentX}px`,
        top: `${currentY}px`,
        touchAction: 'none',
        zIndex: isDragging ? 50 : 10,
      }}
      className={`border-2 shadow-2xl backdrop-blur-md flex flex-col items-center justify-between p-3 cursor-grab active:cursor-grabbing transition-shadow hover:scale-105 select-none ${shapeClasses} ${statusBg} ${
        isDragging ? 'opacity-80 scale-110 shadow-amber-500/20' : ''
      }`}
      {...listeners}
      {...attributes}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between w-full text-xs">
        <span className="flex items-center gap-1 font-semibold capitalize text-[10px] opacity-90">
          {statusIcon}
          {table.status}
        </span>
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onEdit(table)}
            className="p-1 hover:bg-white/10 rounded-md transition"
            title="Edit Table"
          >
            <Edit2 className="w-3 h-3 text-slate-300 hover:text-amber-400" />
          </button>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onDelete(table._id)}
            className="p-1 hover:bg-rose-500/20 rounded-md transition"
            title="Delete Table"
          >
            <Trash2 className="w-3 h-3 text-rose-400" />
          </button>
        </div>
      </div>

      {/* Center Table Number */}
      <div className="text-center my-auto">
        <div className="font-bold text-lg text-white tracking-wider">
          {table.tableNumber}
        </div>
        <div className="text-[10px] text-slate-300 font-medium">{table.type || 'Standard'}</div>
      </div>

      {/* Capacity Badge */}
      <div className="flex items-center gap-1 text-[11px] bg-black/40 px-2 py-0.5 rounded-full border border-white/10 text-slate-200">
        <Users className="w-3 h-3 text-amber-400" />
        <span>{table.capacity} Seats</span>
      </div>
    </div>
  );
}

interface FloorPlanCanvasProps {
  tables: TableItem[];
  currentZone: string;
  onPositionChange: (tableId: string, x: number, y: number) => void;
  onEditTable: (table: TableItem) => void;
  onDeleteTable: (tableId: string) => void;
}

export default function FloorPlanCanvas({
  tables,
  currentZone,
  onPositionChange,
  onEditTable,
  onDeleteTable,
}: FloorPlanCanvasProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  );

  const zoneTables = tables.filter((t) => t.zone === currentZone);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    const tableId = active.id as string;
    const table = tables.find((t) => t._id === tableId);
    if (!table) return;

    const newX = Math.max(20, Math.min(850, (table.positionX || 50) + delta.x));
    const newY = Math.max(20, Math.min(550, (table.positionY || 50) + delta.y));

    onPositionChange(tableId, Math.round(newX), Math.round(newY));
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="relative w-full h-[650px] bg-[#0c1322] border-2 border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl">
        {/* Floor Blueprint Grid Background */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#f59e0b 1px, transparent 1px), radial-gradient(#38bdf8 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            backgroundPosition: '0 0, 20px 20px',
          }}
        />

        {/* Zone Badge Overlay */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-slate-900/90 border border-slate-700 px-3 py-1.5 rounded-xl shadow-lg">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            {currentZone} Floor Plan Canvas
          </span>
          <span className="text-xs text-slate-400">({zoneTables.length} Tables)</span>
        </div>

        {/* Legend */}
        <div className="absolute top-4 right-4 z-20 hidden sm:flex items-center gap-3 bg-slate-900/90 border border-slate-700 px-3 py-1.5 rounded-xl text-xs text-slate-300">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Available
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Reserved
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Occupied
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500" /> Maintenance
          </span>
        </div>

        {/* Render Tables */}
        {zoneTables.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
            <p className="text-sm font-medium">No tables assigned to {currentZone} yet.</p>
            <p className="text-xs text-slate-600 mt-1">Click &quot;Add Table&quot; above to place a new table here.</p>
          </div>
        ) : (
          zoneTables.map((table) => (
            <DraggableTable
              key={table._id}
              table={table}
              onEdit={onEditTable}
              onDelete={onDeleteTable}
            />
          ))
        )}
      </div>
    </DndContext>
  );
}
