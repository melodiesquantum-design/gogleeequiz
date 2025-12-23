
import React, { useState, useRef } from 'react';
import { editImage } from '../services/geminiService';

export const ImageEditor: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = async () => {
    if (!image || !prompt) return;
    setIsProcessing(true);
    try {
      const mimeType = image.split(';')[0].split(':')[1];
      const base64Data = image.split(',')[1];
      const edited = await editImage(base64Data, prompt, mimeType);
      setResult(edited);
    } catch (err) {
      console.error(err);
      alert("Failed to edit image. Try a clearer prompt.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">AI Image Studio</h2>
        <p className="text-gray-500 mt-2">Powered by Gemini 2.5 Flash Image. Edit photos with just your words.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden relative group">
            {image ? (
              <img src={image} alt="Source" className="w-full h-full object-cover" />
            ) : (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="text-center px-4"
              >
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                </div>
                <span className="text-sm font-medium text-gray-600">Upload an image to start</span>
              </button>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*"
            />
          </div>
          {image && (
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2 text-sm text-indigo-600 font-medium hover:underline"
            >
              Change Image
            </button>
          )}
        </div>

        <div className="flex flex-col justify-center space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">What should I change?</label>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., 'Add a vintage polaroid filter and make the sky more blue'"
              className="w-full h-32 p-4 border-2 border-gray-100 rounded-xl focus:border-indigo-500 focus:ring-0 resize-none transition"
            />
          </div>

          <button 
            disabled={!image || !prompt || isProcessing}
            onClick={handleEdit}
            className={`w-full py-4 rounded-xl font-bold shadow-lg transition-all transform active:scale-95 ${
              isProcessing ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {isProcessing ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Processing Image...
              </div>
            ) : 'Transform Image'}
          </button>
        </div>
      </div>

      {result && (
        <div className="mt-12 space-y-4 animate-in fade-in duration-700">
          <h3 className="text-xl font-bold text-center">Result</h3>
          <div className="max-w-md mx-auto aspect-square rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
            <img src={result} alt="Edited result" className="w-full h-full object-cover" />
          </div>
          <div className="text-center">
             <a href={result} download="gemini-edit.png" className="inline-block bg-gray-100 px-6 py-2 rounded-full font-medium text-gray-700 hover:bg-gray-200">
               Download Result
             </a>
          </div>
        </div>
      )}
    </div>
  );
};
