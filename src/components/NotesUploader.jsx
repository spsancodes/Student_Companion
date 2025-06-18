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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">📤 Upload Notes</h2>

        {status && (
          <div className="mb-4 text-sm text-center font-medium text-gray-700">
            {status}
          </div>
        )}

        <input
          type="text"
          placeholder="Enter tag (e.g., math, physics)"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="file"
          multiple
          onChange={(e) => setFiles(Array.from(e.target.files))}
          className="w-full px-3 py-2 mb-4 border border-gray-300 rounded-lg bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
        />

        <button
          onClick={handleUpload}
          disabled={loading}
          className={`w-full py-2 rounded-lg text-white font-semibold transition duration-200 ${
            loading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
    </div>
  );
};

export default NotesUploader;
