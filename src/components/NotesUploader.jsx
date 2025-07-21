import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';

const NotesUploader = () => {
  const [tag, setTag] = useState('');
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error
      } = await supabase.auth.getUser();

      if (error || !user) {
        console.error("User fetch error:", error);
        setStatus("⚠️ Failed to fetch user session.");
        return;
      }

      setUserId(user.id);
    };

    fetchUser();
  }, []);

  const handleUpload = async () => {
    if (!tag || files.length === 0) {
      setStatus('⚠️ Please provide a tag and select files.');
      return;
    }

    if (!userId) {
      setStatus('⚠️ User not authenticated.');
      return;
    }

    setStatus('Uploading...');
    setLoading(true);
    let uploadedCount = 0;

    for (const file of files) {
      const fileNameLower = file.name.toLowerCase();
      if (!fileNameLower.includes(tag.toLowerCase())) continue;

      const cleanedFileName = file.name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9._-]/g, '_');

      const filePath = `${tag}/${cleanedFileName}`;

      const { error: uploadError } = await supabase.storage
        .from('notes')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Upload Error:', uploadError);
        setStatus('❌ Error uploading file.');
        setLoading(false);
        return;
      }

      const { data: publicUrlData, error: urlError } = supabase
        .storage
        .from('notes')
        .getPublicUrl(filePath);

      if (urlError || !publicUrlData?.publicUrl) {
        console.error("URL Error:", urlError);
        setStatus('❌ Error getting public URL.');
        setLoading(false);
        return;
      }

      const { error: insertError } = await supabase.from('notes').insert({
        id: uuidv4(),
        user_id: userId,
        tag,
        title: cleanedFileName,
        file_url: publicUrlData.publicUrl,
        uploaded_at: new Date().toISOString()
      });

      if (insertError) {
        console.error('Insert Error:', insertError);
        setStatus('❌ Error saving file metadata.');
        setLoading(false);
        return;
      }

      uploadedCount++;
    }

    setStatus(`✅ ${uploadedCount} notes uploaded successfully.`);
    setFiles([]);
    setTag('');
    setLoading(false);

    setTimeout(() => {
      const shouldRedirect = window.confirm("Upload successful. Do you want to view your notes now?");
      if (shouldRedirect) {
        navigate('/notes/view');
      }
    }, 500);
  };
  return (
  <div className="min-h-screen bg-gradient-to-br from-purple-50 via-lilac-50 to-indigo-100 flex items-center justify-center px-4 py-8">
    <div className="relative">
      {/* Decorative background elements */}
      <div className="absolute -top-4 -left-4 w-24 h-24 bg-purple-200 rounded-full opacity-20 blur-xl"></div>
      <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-indigo-200 rounded-full opacity-20 blur-xl"></div>

      {/* Main card */}
      <div className="relative bg-white/80 backdrop-blur-sm shadow-2xl rounded-2xl p-8 w-full max-w-md border border-purple-100">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Upload Study Notes
          </h2>
          <p className="text-purple-600/70 text-sm mt-2">
            Transform your documents into interactive learning materials
          </p>
        </div>

        {/* Status message */}
        {status && (
          <div
            className={`mb-6 p-4 rounded-xl text-sm font-medium text-center transition-all duration-300 ${
              status.includes("successfully")
                ? "bg-gradient-to-r from-green-50 to-emerald-50 text-emerald-700 border border-emerald-200"
                : status.includes("Please")
                  ? "bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border border-amber-200"
                  : "bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 border border-purple-200"
            }`}
          >
            {status}
          </div>
        )}

        {/* Tag input */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-purple-700 mb-2">Subject Tag</label>
          <div className="relative">
            <input
              type="text"
              placeholder="e.g., mathematics, physics, biology"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="w-full px-4 py-3 bg-purple-50/50 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 text-purple-800 placeholder-purple-400"
            />
            <div className="absolute right-3 top-3">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* File input */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-purple-700 mb-2">Select Files</label>
          <div className="relative">
            <input
              type="file"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files))}
              className="w-full px-4 py-3 bg-purple-50/50 border-2 border-dashed border-purple-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200 text-purple-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-purple-500 file:to-indigo-600 file:text-white hover:file:from-purple-600 hover:file:to-indigo-700 file:transition-all file:duration-200"
            />
          </div>
          {files.length > 0 && (
            <div className="mt-3 text-sm text-purple-600">
              <span className="font-medium">{files.length}</span> file{files.length !== 1 ? "s" : ""} selected
            </div>
          )}
        </div>

        {/* Upload button */}
        <button
          onClick={handleUpload}
          disabled={loading}
          className={`w-full py-3 rounded-xl text-white font-semibold transition-all duration-300 transform ${
            loading
              ? "bg-gradient-to-r from-purple-300 to-indigo-300 cursor-not-allowed scale-95"
              : "bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 hover:scale-105 hover:shadow-lg active:scale-95"
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              Upload & Process
            </div>
          )}
        </button>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-purple-500/70">Supported formats: PDF, TXT, DOC, DOCX, JSON</p>
        </div>
      </div>
    </div>
  </div>
);
}

//   return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
//       <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">
//         <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">📤 Upload Notes</h2>

//         {status && (
//           <div className="mb-4 text-sm text-center font-medium text-gray-700">
//             {status}
//           </div>
//         )}

//         <input
//           type="text"
//           placeholder="Enter tag (e.g., math, physics)"
//           value={tag}
//           onChange={(e) => setTag(e.target.value)}
//           className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//         />

//         <input
//           type="file"
//           multiple
//           onChange={(e) => setFiles(Array.from(e.target.files))}
//           className="w-full px-3 py-2 mb-4 border border-gray-300 rounded-lg bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
//         />

//         <button
//           onClick={handleUpload}
//           disabled={loading}
//           className={`w-full py-2 rounded-lg text-white font-semibold transition duration-200 ${
//             loading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
//           }`}
//         >
//           {loading ? 'Uploading...' : 'Upload'}
//         </button>
//       </div>
//     </div>
//   );
// };

export default NotesUploader;
