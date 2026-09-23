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
import { Users, Edit2, Trash2, CheckCircle, Clock, Ban, UserCheck, MoveHorizontal } from 'lucide-react';

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
  let statusBg = 'bg-emerald-50/90 border-emerald-400 text-emerald-900 shadow-emerald-500/10';
  let statusIcon = <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />;
  if (table.status === 'reserved') {
    statusBg = 'bg-amber-50/90 border-amber-400 text-amber-900 shadow-amber-500/10';
    statusIcon = <Clock className="w-3.5 h-3.5 text-amber-600" />;
  } else if (table.status === 'occupied') {
    statusBg = 'bg-rose-50/90 border-rose-400 text-rose-900 shadow-rose-500/10';
    statusIcon = <UserCheck className="w-3.5 h-3.5 text-rose-600" />;
  } else if (table.status === 'maintenance') {
    statusBg = 'bg-slate-100 border-slate-300 text-slate-700 shadow-slate-500/10';
    statusIcon = <Ban className="w-3.5 h-3.5 text-slate-500" />;
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
      className={`border-2 shadow-md backdrop-blur-md flex flex-col items-center justify-between p-3 cursor-grab active:cursor-grabbing transition hover:scale-105 select-none ${shapeClasses} ${statusBg} ${
        isDragging ? 'opacity-90 scale-110 shadow-xl border-amber-500 ring-4 ring-amber-400/20' : ''
      }`}
      {...listeners}
      {...attributes}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between w-full text-xs">
        <span className="flex items-center gap-1 font-bold capitalize text-[10px]">
          {statusIcon}
          {table.status}
        </span>
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onEdit(table)}
            className="p-1 hover:bg-slate-200/70 rounded-md transition"
            title="Edit Table"
          >
            <Edit2 className="w-3 h-3 text-slate-600 hover:text-amber-700" />
          </button>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onDelete(table._id)}
            className="p-1 hover:bg-rose-100 rounded-md transition"
            title="Delete Table"
          >
            <Trash2 className="w-3 h-3 text-rose-600" />
          </button>
        </div>
      </div>

      {/* Center Table Info */}
      <div className="text-center">
        <h4 className="font-serif font-extrabold text-xl text-slate-900 tracking-tight">
          {table.tableNumber}
        </h4>
        <div className="flex items-center justify-center gap-1 text-[11px] text-slate-600 font-medium mt-0.5">
          <Users className="w-3 h-3 text-amber-700" />
          <span>{table.capacity} Seats</span>
        </div>
      </div>

      {/* Bottom Type Label */}
      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
        {table.type || 'Standard'}
      </div>
    </div>
  );
}

interface FloorPlanCanvasProps {
  tables: TableItem[];
  currentZone: string;
  onPositionChange: (id: string, x: number, y: number) => void;
  onEditTable: (table: TableItem) => void;
  onDeleteTable: (id: string) => void;
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
    <div className="space-y-2">
      {/* Mobile Swipe Notice */}
      <div className="lg:hidden flex items-center justify-center gap-1.5 text-[11px] text-amber-800 bg-amber-50 py-1.5 px-3 rounded-xl border border-amber-200 font-medium">
        <MoveHorizontal className="w-3.5 h-3.5 animate-pulse text-amber-600" />
        <span>Swipe horizontally to view full floor canvas</span>
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="overflow-x-auto rounded-3xl border border-slate-200 shadow-xs bg-slate-50/50">
          <div className="relative min-w-[900px] w-full h-[650px] bg-white rounded-3xl">
            {/* Floor Blueprint Grid Background */}
            <div
              className="absolute inset-0 opacity-40 pointer-events-none rounded-3xl"
              style={{
                backgroundImage: `radial-gradient(#cbd5e1 1.5px, transparent 1.5px), radial-gradient(#94a3b8 1px, transparent 1px)`,
                backgroundSize: '40px 40px',
                backgroundPosition: '0 0, 20px 20px',
              }}
            />

            {/* Zone Badge Overlay */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-white/90 backdrop-blur-md border border-slate-200 px-3.5 py-1.5 rounded-xl shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                {currentZone} Floor Plan Canvas
              </span>
              <span className="text-xs text-slate-500 font-medium">({zoneTables.length} Tables)</span>
            </div>

            {/* Legend */}
            <div className="absolute top-4 right-4 z-20 hidden sm:flex items-center gap-3 bg-white/90 backdrop-blur-md border border-slate-200 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 shadow-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Available
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Reserved
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Occupied
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Maintenance
              </span>
            </div>

            {/* Render Tables */}
            {zoneTables.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                <p className="text-sm font-semibold text-slate-700">No tables assigned to {currentZone} yet.</p>
                <p className="text-xs text-slate-500 mt-1">Click &quot;Add Table to Floor&quot; above to place a new table here.</p>
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
        </div>
      </DndContext>
    </div>
  );
}
