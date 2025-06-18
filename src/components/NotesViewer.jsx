import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const NotesViewer = () => {
  const [notesByTag, setNotesByTag] = useState({});
  const [selectedTag, setSelectedTag] = useState(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    const { data: notes, error } = await supabase
      .from('notes')
      .select('*'); // RLS will automatically filter by user_id

    if (error) {
      console.error('Error fetching notes:', error.message);
      return;
    }

    const grouped = {};
    notes.forEach(note => {
      const tag = note.tag.toLowerCase();
      if (!grouped[tag]) grouped[tag] = [];
      grouped[tag].push(note);
    });

    setNotesByTag(grouped);
  };

  const renderTagView = () => (
    <div className="max-w-6xl mx-auto py-10 px-6">
      <h2 className="text-3xl font-bold mb-10 text-center text-gray-800">📁 Select a Subject Tag</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {Object.keys(notesByTag).map(tag => (
          <div
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className="bg-white shadow-md border hover:shadow-xl transition-all duration-200 rounded-xl flex items-center justify-center h-40 text-center text-xl font-semibold text-gray-700 cursor-pointer hover:bg-blue-50 capitalize"
          >
            {tag}
          </div>
        ))}
      </div>
    </div>
  );

  const renderNotesView = () => (
    <div className="max-w-5xl mx-auto py-10 px-6">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">📁 Notes under: {selectedTag}</h2>
      <div className="space-y-4">
        {notesByTag[selectedTag].map(note => (
          <div
            key={note.id}
            className="bg-gray-50 border shadow-sm rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between"
          >
            <p className="text-gray-800 font-medium truncate w-full sm:w-1/2">📄 {note.title}</p>
            <div className="mt-2 sm:mt-0 sm:flex sm:space-x-3">
              <a
                href={note.file_url}
                target="_blank"
                rel="noreferrer"
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
              >
                🔗 Open
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(note.file_url);
                  alert('📋 Copied link to clipboard!');
                }}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-1 rounded text-sm"
              >
                📎 Copy Link
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        className="mt-8 text-sm text-blue-600 hover:underline"
        onClick={() => setSelectedTag(null)}
      >
        🔙 Back to Tags
      </button>
    </div>
  );

  return selectedTag ? renderNotesView() : renderTagView();
};

export default NotesViewer;
