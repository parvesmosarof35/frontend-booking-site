'use client';

import React, { useState, useEffect } from 'react';
import JoditComponent from '@/components/admin/JoditComponent';
import { FileText, Save, Sparkles, RefreshCw } from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

export default function AdminContentPage() {
  const [selectedType, setSelectedType] = useState<'about-us' | 'privacy-policy' | 'terms'>('about-us');
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchPage = async (type: string) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/content-pages/${type}`);
      setContent(data?.content || '');
    } catch {
      toast.error('Failed to load page content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage(selectedType);
  }, [selectedType]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/content-pages/${selectedType}`, { content });
      toast.success('Page content published successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save page content');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-amber-600" />
            <span>CMS Rich Content Editor</span>
          </h1>
          <p className="text-xs text-slate-500">
            Edit public site content pages (About Us, Privacy Policy, Terms & Conditions) with Jodit WYSIWYG editor.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl transition shadow-xs disabled:opacity-50 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Publishing...' : 'Publish Content'}</span>
        </button>
      </div>

      {/* Page Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded-2xl w-fit shadow-xs">
        {[
          { key: 'about-us', label: 'About Us' },
          { key: 'privacy-policy', label: 'Privacy Policy' },
          { key: 'terms', label: 'Terms & Conditions' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedType(tab.key as any)}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition ${
              selectedType === tab.key
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Editor Container */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
        {loading ? (
          <div className="h-96 flex items-center justify-center text-slate-400 text-sm">
            Loading editor and content...
          </div>
        ) : (
          <div className="text-slate-900 bg-white rounded-2xl overflow-hidden border border-slate-200">
            <JoditComponent content={content} setContent={setContent} />
          </div>
        )}
      </div>
    </div>
  );
}
