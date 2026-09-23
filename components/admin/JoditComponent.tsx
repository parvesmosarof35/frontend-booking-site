'use client';

import React, { memo, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';

const JoditEditor = dynamic(() => import('jodit-react'), { ssr: false });

interface JoditComponentProps {
  content: string;
  setContent: (content: string) => void;
}

const JoditComponent = ({ content, setContent }: JoditComponentProps) => {
  const editor = useRef(null);

  const config = useMemo(
    () => ({
      readonly: false,
      toolbarSticky: false,
      minHeight: 600,
      placeholder: 'Start writing your content here...',
    }),
    []
  );

  return (
    <div className="text-slate-900 rounded-2xl overflow-hidden shadow-inner bg-white">
      <JoditEditor
        ref={editor}
        value={content || ''}
        onBlur={(newContent: string) => setContent(newContent)}
        config={config}
      />
    </div>
  );
};

export default memo(JoditComponent);
