import React, { useState, useRef } from 'react';
import { BookOpen, Sparkles, ImagePlus, Info, Upload, X } from 'lucide-react';
import { generateComicScript, generatePanelImage, editPanelImage } from './services/geminiService';
import { ComicGrid } from './components/ComicGrid';
import { EditPanelModal } from './components/EditPanelModal';
import { ComicStory, ComicPanel } from './types';

const PRESET_PROMPTS = [
  "A 10-panel comic about Doraemon using a magic mouse gadget to save Nobita from homework.",
  "A 4-panel comic about a cat who becomes a lawyer.",
  "A cyberpunk detective story in a rainy neon city.",
  "A silent comic about a robot discovering a flower."
];

function App() {
  const [prompt, setPrompt] = useState('');
  const [pageCount, setPageCount] = useState(4);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [story, setStory] = useState<ComicStory | null>(null);
  const [panels, setPanels] = useState<ComicPanel[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal State
  const [editingPanel, setEditingPanel] = useState<ComicPanel | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferenceImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeReferenceImage = () => {
    setReferenceImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGenerateStory = async () => {
    if (!prompt.trim()) return;

    setIsGeneratingStory(true);
    setStory(null);
    setPanels([]);

    try {
      // 1. Generate the script text
      const generatedStory = await generateComicScript(prompt, pageCount);
      setStory(generatedStory);
      setPanels(generatedStory.panels);
      setIsGeneratingStory(false);

      // 2. Generate images for panels using the reference image if available
      generateImagesForPanels(generatedStory.panels, referenceImage || undefined);
    } catch (error) {
      console.error("Story generation failed", error);
      setIsGeneratingStory(false);
      alert("Failed to generate story. Please check the API key configuration or try again.");
    }
  };

  const generateImagesForPanels = async (initialPanels: ComicPanel[], refImage?: string) => {
    // Process panels one by one to ensure stability and good UX feedback
    for (const panel of initialPanels) {
        await generateSinglePanel(panel.id, panel.visualPrompt, refImage);
    }
  };

  const generateSinglePanel = async (id: number, visualPrompt: string, refImage?: string) => {
    // Update status to generating
    setPanels(current => current.map(p => p.id === id ? { ...p, status: 'generating' } : p));

    try {
      // Pass the reference image to the service
      const base64Image = await generatePanelImage(visualPrompt, refImage);
      setPanels(current => current.map(p => 
        p.id === id ? { ...p, status: 'completed', imageData: base64Image } : p
      ));
    } catch (error) {
      setPanels(current => current.map(p => 
        p.id === id ? { ...p, status: 'failed' } : p
      ));
    }
  };

  const handleEditPanelConfirm = async (panelId: number, editPrompt: string) => {
    const panel = panels.find(p => p.id === panelId);
    if (!panel || !panel.imageData) return;
    
    try {
      const newImage = await editPanelImage(panel.imageData, editPrompt);
      setPanels(current => current.map(p => 
        p.id === panelId ? { ...p, imageData: newImage } : p
      ));
    } catch (error) {
      alert("Failed to edit image. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              MangaGenius
            </h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <div className="hidden md:flex items-center gap-1">
              <Info className="w-4 h-4" />
              <span>Powered by Gemini 2.5 Flash</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full">
        {/* Hero / Input Section */}
        <section className="bg-white border-b border-slate-200 pb-8 pt-8 px-4">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-slate-900">Create your comic strip instantly</h2>
              <p className="text-slate-500">Describe your story, upload a reference character (optional), and let AI draw it.</p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  What's your story about?
                </label>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. A robot exploring a post-apocalyptic forest..."
                  className="w-full h-24 rounded-xl border-slate-300 border p-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none text-slate-900 placeholder:text-slate-400"
                />
              </div>

              {/* Controls Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Reference Image Upload */}
                <div className="relative">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Reference Image (Optional)
                  </label>
                  {!referenceImage ? (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 hover:border-indigo-400 transition h-[80px]"
                    >
                      <Upload className="w-5 h-5 text-slate-400 mb-1" />
                      <span className="text-xs text-slate-500">Upload Character/Style</span>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleImageUpload} 
                        accept="image/*" 
                        className="hidden" 
                      />
                    </div>
                  ) : (
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 h-[80px] group bg-slate-100 flex items-center justify-center">
                      <img 
                        src={referenceImage} 
                        alt="Reference" 
                        className="h-full w-full object-contain opacity-80" 
                      />
                      <button 
                        onClick={removeReferenceImage}
                        className="absolute top-1 right-1 bg-black/50 hover:bg-red-500 text-white rounded-full p-1 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Length Selector */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Length (Panels)
                  </label>
                  <select 
                    value={pageCount}
                    onChange={(e) => setPageCount(Number(e.target.value))}
                    className="w-full rounded-xl border-slate-300 border p-2.5 h-[80px] focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  >
                     <option value={4}>4 Panels (Short Strip)</option>
                     <option value={6}>6 Panels</option>
                     <option value={8}>8 Panels</option>
                     <option value={10}>10 Panels</option>
                     <option value={12}>12 Panels (Full Page)</option>
                     <option value={16}>16 Panels (Long Story)</option>
                   </select>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                 <button
                  onClick={handleGenerateStory}
                  disabled={isGeneratingStory || !prompt.trim()}
                  className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white px-8 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition shadow-md hover:shadow-lg transform active:scale-[0.98]"
                 >
                   {isGeneratingStory ? (
                     <>
                       <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                       Creating Story...
                     </>
                   ) : (
                     <>
                       <Sparkles className="w-5 h-5" />
                       Generate Comic
                     </>
                   )}
                 </button>
              </div>

              {/* Presets */}
              <div className="pt-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Try these examples</p>
                <div className="flex flex-wrap gap-2">
                  {PRESET_PROMPTS.map((p, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setPrompt(p)}
                      className="text-xs bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-600 px-3 py-1.5 rounded-full transition"
                    >
                      {p.length > 50 ? p.slice(0, 50) + '...' : p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Results Section */}
        <section className="py-8 bg-slate-50 min-h-[500px]">
          {story && (
            <div className="text-center mb-8 px-4">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">{story.title}</h2>
              <p className="text-slate-500 text-sm max-w-2xl mx-auto">
                Generated with Gemini 2.5 Flash
              </p>
            </div>
          )}

          {panels.length > 0 ? (
            <ComicGrid 
              panels={panels} 
              onEditClick={(panel) => setEditingPanel(panel)}
              onRegenerateClick={(panel) => generateSinglePanel(panel.id, panel.visualPrompt, referenceImage || undefined)}
            />
          ) : (
            !isGeneratingStory && (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <ImagePlus className="w-16 h-16 mb-4 opacity-20" />
                <p>Your comic masterpiece will appear here</p>
              </div>
            )
          )}
        </section>
      </main>

      {editingPanel && (
        <EditPanelModal 
          panel={editingPanel}
          isOpen={!!editingPanel}
          onClose={() => setEditingPanel(null)}
          onConfirmEdit={handleEditPanelConfirm}
        />
      )}
    </div>
  );
}

export default App;
