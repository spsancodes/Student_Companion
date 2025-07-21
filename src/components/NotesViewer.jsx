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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-lilac-50 to-indigo-100 py-10 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Study Materials Library
          </h2>
          <p className="text-purple-600/70">Select a subject to view your notes</p>
        </div>

        {/* Tags Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {Object.keys(notesByTag).map(tag => (
            <div
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className="group relative bg-white/80 backdrop-blur-sm shadow-lg border border-purple-100 hover:shadow-2xl transition-all duration-300 rounded-2xl flex items-center justify-center h-40 text-center cursor-pointer hover:scale-105 transform"
            >
              {/* Decorative gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Content */}
              <div className="relative z-10 p-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full flex items-center justify-center mb-3 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <span className="text-lg font-semibold text-purple-700 capitalize group-hover:text-purple-800 transition-colors duration-300">
                  {tag}
                </span>
                <div className="text-xs text-purple-500 mt-1">
                  {notesByTag[tag].length} file{notesByTag[tag].length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderNotesView = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-lilac-50 to-indigo-100 py-10 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent capitalize">
              {selectedTag} Notes
            </h2>
          </div>
          <p className="text-purple-600/70 ml-13">
            {notesByTag[selectedTag].length} file{notesByTag[selectedTag].length !== 1 ? 's' : ''} available
          </p>
        </div>

        {/* Notes List */}
        <div className="space-y-4">
          {notesByTag[selectedTag].map(note => (
            <div
              key={note.id}
              className="bg-white/80 backdrop-blur-sm border border-purple-100 shadow-lg hover:shadow-xl rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between transition-all duration-300 hover:scale-[1.02] transform"
            >
              {/* File Info */}
              <div className="flex items-center flex-1">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-purple-800 font-semibold text-lg truncate">{note.title}</p>
                  <p className="text-purple-600/70 text-sm">Study material</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 sm:mt-0 sm:flex sm:space-x-3 flex space-x-3">
                <a
                  href={note.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center hover:scale-105 transform"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Open
                </a>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(note.file_url);
                    alert('📋 Copied link to clipboard!');
                  }}
                  className="bg-gradient-to-r from-purple-400 to-indigo-500 hover:from-purple-500 hover:to-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center hover:scale-105 transform"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Link
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Back Button */}
        <div className="mt-10 text-center">
          <button
            className="inline-flex items-center px-6 py-3 bg-white/80 backdrop-blur-sm border border-purple-200 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-xl font-semibold transition-all duration-200 hover:scale-105 transform"
            onClick={() => setSelectedTag(null)}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Subjects
          </button>
        </div>
      </div>
    </div>
  );

  return selectedTag ? renderNotesView() : renderTagView();
};

export default NotesViewer;