import React, { useEffect } from 'react';

const UndoToast = ({ show, onUndo, onTimeout, taskTitle }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onTimeout();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [show, onTimeout]);

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 w-full max-w-xs bg-white border border-gray-300 shadow-lg rounded-lg p-4 z-50">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          ✅ <strong>{taskTitle}</strong> marked as done
        </div>
        <button
          onClick={onUndo}
          className="ml-4 px-3 py-1 text-sm border border-gray-700 rounded hover:bg-gray-700 hover:text-white transition-colors"
        >
          Undo
        </button>
      </div>
    </div>
  );
};

export default UndoToast;
