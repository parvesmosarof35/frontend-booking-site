'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { Sparkles, Award, Heart } from 'lucide-react';

export default function AboutUsPage() {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/content-pages/about-us')
      .then((res) => {
        setContent(res.data?.content || '');
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Our Story & Culinary Philosophy</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          About The Royal Grand Bistro
        </h1>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl backdrop-blur-xl">
        {loading ? (
          <div className="py-20 text-center text-slate-500">Loading page content...</div>
        ) : (
          <div
            className="prose prose-invert prose-amber max-w-none text-slate-300 leading-relaxed text-sm sm:text-base space-y-4"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}
      </div>
    </div>
  );
}
