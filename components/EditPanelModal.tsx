import React, { useState } from 'react';
import { ComicPanel } from '../types';
import { Loader2, X, Wand2 } from 'lucide-react';

interface EditPanelModalProps {
  panel: ComicPanel;
  isOpen: boolean;
  onClose: () => void;
  onConfirmEdit: (panelId: number, prompt: string) => Promise<void>;
}

export const EditPanelModal: React.FC<EditPanelModalProps> = ({ panel, isOpen, onClose, onConfirmEdit }) => {
  const [prompt, setPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  if (!isOpen) return null;

  const handleEdit = async () => {
    if (!prompt.trim()) return;
    setIsEditing(true);
    await onConfirmEdit(panel.id, prompt);
    setIsEditing(false);
    setPrompt('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-lg text-slate-800">Edit Panel {panel.id}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
          <div className="relative w-full max-w-md aspect-square bg-slate-100 rounded-lg overflow-hidden shadow-inner border border-slate-200 mb-6">
            {panel.imageData ? (
              <img 
                src={`data:image/png;base64,${panel.imageData}`} 
                alt="Panel preview" 
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">No Image</div>
            )}
          </div>

          <div className="w-full">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              How would you like to change this image?
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Make it night time, Add a retro filter, Remove the background..."
                className="flex-1 border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
              />
              <button
                onClick={handleEdit}
                disabled={isEditing || !prompt.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition"
              >
                {isEditing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                Generate
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Powered by Gemini 2.5 Flash Image ("Nano Banana")
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
