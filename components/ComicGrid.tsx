import React from 'react';
import { ComicPanel } from '../types';
import { Loader2, RefreshCw, Edit } from 'lucide-react';

interface ComicGridProps {
  panels: ComicPanel[];
  onEditClick: (panel: ComicPanel) => void;
  onRegenerateClick: (panel: ComicPanel) => void;
}

export const ComicGrid: React.FC<ComicGridProps> = ({ panels, onEditClick, onRegenerateClick }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 w-full max-w-7xl mx-auto p-4">
      {panels.map((panel) => (
        <div 
          key={panel.id} 
          className="relative bg-white rounded-xl shadow-md border-2 border-slate-800 overflow-hidden flex flex-col hover:shadow-xl transition-shadow duration-300 group"
        >
          {/* Header with Panel Number */}
          <div className="bg-slate-100 border-b border-slate-200 px-3 py-1 flex justify-between items-center">
            <span className="font-bold text-slate-500 text-xs uppercase tracking-wider">Panel {panel.id}</span>
            <div className="flex gap-1">
               {panel.status === 'completed' && (
                 <>
                  <button 
                    onClick={() => onRegenerateClick(panel)}
                    title="Regenerate from scratch"
                    className="p-1.5 hover:bg-white rounded text-slate-500 hover:text-indigo-600 transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => onEditClick(panel)}
                    title="Edit with AI"
                    className="p-1.5 hover:bg-white rounded text-slate-500 hover:text-purple-600 transition"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                 </>
               )}
            </div>
          </div>

          {/* Image Area */}
          <div className="aspect-square w-full bg-slate-50 relative flex items-center justify-center overflow-hidden">
            {panel.status === 'completed' && panel.imageData ? (
              <img 
                src={`data:image/png;base64,${panel.imageData}`} 
                alt={`Panel ${panel.id}`} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center">
                {panel.status === 'generating' || panel.status === 'pending' ? (
                  <>
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
                    <p className="text-sm text-slate-500 font-medium">
                      {panel.status === 'generating' ? 'Drawing...' : 'Queued'}
                    </p>
                  </>
                ) : (
                  <div className="text-red-500 text-sm">Failed to generate</div>
                )}
              </div>
            )}
            
            {/* Caption Overlay - Classic Comic Style */}
            {panel.status === 'completed' && panel.caption && (
               <div className="absolute top-2 left-2 right-2 bg-yellow-100 border border-slate-800 p-2 shadow-sm transform -rotate-1 opacity-90">
                 <p className="font-comic text-xs md:text-sm text-slate-900 leading-tight uppercase">
                   {panel.caption}
                 </p>
               </div>
            )}
          </div>

          {/* Dialogue Area */}
          <div className="p-4 bg-white flex-1 flex items-center justify-center border-t border-slate-100">
             {panel.dialogue ? (
               <div className="bg-white border-2 border-slate-800 rounded-[2rem] rounded-tl-none p-3 shadow-[2px_2px_0px_0px_rgba(30,41,59,1)] relative max-w-full">
                 <p className="font-comic text-sm md:text-base text-center leading-snug text-slate-800">
                   {panel.dialogue}
                 </p>
               </div>
             ) : (
               <p className="text-xs text-slate-400 italic">No dialogue</p>
             )}
          </div>
          
          {/* Debug/Prompt Info (Optional, visible on hover only) */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white text-[10px] p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            {panel.visualPrompt.slice(0, 100)}...
          </div>
        </div>
      ))}
    </div>
  );
};
