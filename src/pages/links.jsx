// src/pages/Links.jsx
import React from 'react';

export default function Links() {
  return (
    <div className="p-4 h-screen">
      <iframe
        src="/links/index.html"
        title="Link Saver"
        className="w-full h-full rounded-xl shadow-md border-2 border-blue-400"
      />
    </div>
  );
}
