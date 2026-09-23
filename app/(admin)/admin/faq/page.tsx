'use client';

import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { HelpCircle, Plus, Edit2, Trash2, GripVertical, X } from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

function SortableFaqItem({
  faq,
  onEdit,
  onDelete,
}: {
  faq: any;
  onEdit: (faq: any) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: faq._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-4 bg-white border border-slate-200/80 rounded-2xl flex items-start gap-3 transition shadow-xs ${
        isDragging ? 'opacity-90 scale-102 border-amber-500 shadow-lg' : 'hover:border-slate-300 hover:shadow-md'
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="p-1.5 text-slate-400 hover:text-amber-600 cursor-grab active:cursor-grabbing shrink-0"
        title="Drag to Reorder"
      >
        <GripVertical className="w-5 h-5" />
      </button>

      <div className="flex-1 space-y-1">
        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <span>{faq.question}</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono font-medium">
            Order #{faq.order}
          </span>
        </h4>
        <p className="text-xs text-slate-500 leading-relaxed">{faq.answer}</p>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => onEdit(faq)}
          className="p-1.5 bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-800 rounded-lg border border-slate-200/80 transition"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDelete(faq._id)}
          className="p-1.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-lg border border-slate-200/80 transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function AdminFaqPage() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<any>(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/faq');
      setFaqs(data || []);
    } catch {
      toast.error('Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = faqs.findIndex((item) => item._id === active.id);
    const newIndex = faqs.findIndex((item) => item._id === over.id);

    const reordered = arrayMove(faqs, oldIndex, newIndex).map((item, idx) => ({
      ...item,
      order: idx + 1,
    }));

    setFaqs(reordered);

    try {
      await api.patch('/faq/reorder', {
        items: reordered.map((item) => ({ id: item._id, order: item.order })),
      });
      toast.success('FAQ order updated');
    } catch {
      toast.error('Failed to save order');
    }
  };

  const handleOpenAdd = () => {
    setEditingFaq(null);
    setQuestion('');
    setAnswer('');
    setModalOpen(true);
  };

  const handleOpenEdit = (f: any) => {
    setEditingFaq(f);
    setQuestion(f.question);
    setAnswer(f.answer);
    setModalOpen(true);
  };

  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFaq) {
        await api.patch(`/faq/${editingFaq._id}`, { question, answer });
        toast.success('FAQ updated');
      } else {
        await api.post('/faq', { question, answer });
        toast.success('New FAQ added');
      }
      setModalOpen(false);
      fetchFaqs();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save FAQ');
    }
  };

  const handleDelete = async (id: string) => {
    const res = await Swal.fire({
      title: 'Delete this FAQ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, delete',
      background: '#ffffff',
      color: '#0f172a',
    });

    if (res.isConfirmed) {
      try {
        await api.delete(`/faq/${id}`);
        toast.success('FAQ deleted');
        fetchFaqs();
      } catch {
        toast.error('Failed to delete FAQ');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-amber-600" />
            <span>FAQ Management & Drag-Drop Reordering</span>
          </h1>
          <p className="text-xs text-slate-500">
            Drag items using the grip handle to reposition questions on the public FAQ page in real-time.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl transition shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add FAQ</span>
        </button>
      </div>

      {/* Dnd Sortable List */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 text-sm">Loading FAQs...</div>
      ) : faqs.length === 0 ? (
        <div className="py-16 text-center text-slate-500 bg-white border border-slate-200 rounded-3xl shadow-xs">
          No FAQs created yet.
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={faqs.map((f) => f._id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {faqs.map((faq) => (
                <SortableFaqItem
                  key={faq._id}
                  faq={faq}
                  onEdit={handleOpenEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingFaq ? 'Edit FAQ Item' : 'Create FAQ Item'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFaq} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Question *</label>
                <input
                  type="text"
                  required
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g. Do you have private dining spaces?"
                  className="w-full bg-slate-50/50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Answer *</label>
                <textarea
                  rows={4}
                  required
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Explain details for customers..."
                  className="w-full bg-slate-50/50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-xs transition"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
