import React, { useState } from 'react';
import { useApiKeys } from '../context/ApiKeyContext';

export const ApiKeyInput: React.FC = () => {
    const { setKeys } = useApiKeys();
    const [geminiKeyInput, setGeminiKeyInput] = useState('');
    const [openWeatherKeyInput, setOpenWeatherKeyInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (geminiKeyInput && openWeatherKeyInput) {
            setIsSubmitting(true);
            // Delay setting keys to allow animation to play
            setTimeout(() => {
                setKeys(geminiKeyInput, openWeatherKeyInput);
            }, 1000);
        }
    };

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-yellow-400 transition-transform duration-1000 ease-in-out ${isSubmitting ? '-translate-y-full' : 'translate-y-0'}`}>
            <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_#000] max-w-md w-full mx-4">
                <h2 className="text-3xl font-bold mb-6 text-center uppercase tracking-tighter">
                    Access Required
                </h2>
                <p className="mb-6 text-gray-700 text-center">
                    Enter your API keys to unlock the full Brutalcast experience.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="geminiKey" className="block font-bold mb-1 uppercase text-sm">Gemini API Key</label>
                        <input
                            id="geminiKey"
                            type="password"
                            value={geminiKeyInput}
                            onChange={(e) => setGeminiKeyInput(e.target.value)}
                            className="w-full border-2 border-black p-3 focus:outline-none focus:ring-2 focus:ring-black focus:shadow-[4px_4px_0px_#000] transition-all"
                            placeholder="AIzaSy..."
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="openWeatherKey" className="block font-bold mb-1 uppercase text-sm">OpenWeather API Key</label>
                        <input
                            id="openWeatherKey"
                            type="password"
                            value={openWeatherKeyInput}
                            onChange={(e) => setOpenWeatherKeyInput(e.target.value)}
                            className="w-full border-2 border-black p-3 focus:outline-none focus:ring-2 focus:ring-black focus:shadow-[4px_4px_0px_#000] transition-all"
                            placeholder="3b8d..."
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-black text-white font-bold py-4 mt-6 hover:bg-gray-800 transition-colors uppercase tracking-widest border-2 border-transparent hover:border-black hover:bg-white hover:text-black shadow-[4px_4px_0px_#000] active:translate-y-1 active:shadow-none"
                    >
                        Enter Brutalcast
                    </button>
                </form>

                <div className="mt-6 text-xs text-center text-gray-500">
                    Keys are stored locally in your browser.
                </div>
            </div>
        </div>
    );
};
