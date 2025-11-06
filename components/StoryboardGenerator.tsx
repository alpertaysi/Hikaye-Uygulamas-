import React, { useState, useCallback, ChangeEvent } from 'react';
import { Scene } from '../types';
import { parseScriptToScenes, generateImageForScene } from '../services/geminiService';
import { UploadIcon, ZapIcon } from './icons';
import { Spinner } from './Spinner';
import { Button } from './Button';

const SceneCard: React.FC<{ scene: Scene }> = ({ scene }) => (
    <div className="bg-brand-secondary rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-brand-accent/20 hover:scale-[1.02]">
        <div className="aspect-video bg-brand-secondary/50 flex items-center justify-center relative">
            {scene.isGenerating && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
                    <Spinner />
                    <p className="text-sm text-brand-subtext mt-2">Oluşturuluyor...</p>
                </div>
            )}
            {scene.error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-brand-error/10 p-4">
                    <p className="text-sm text-brand-error text-center font-semibold">{scene.error}</p>
                </div>
            )}
            {scene.imageUrl && (
                <img src={scene.imageUrl} alt={`Sahne ${scene.scene}`} className="w-full h-full object-cover" />
            )}
            {!scene.imageUrl && !scene.isGenerating && !scene.error && (
                <div className="text-brand-subtext text-center p-4">
                    <p className="text-sm">Görsel burada görünecek</p>
                </div>
            )}
        </div>
        <div className="p-4">
            <h3 className="font-bold text-brand-accent">Sahne {scene.scene}</h3>
            <p className="text-sm text-brand-subtext mt-1">{scene.description}</p>
        </div>
    </div>
);

export const StoryboardGenerator: React.FC = () => {
    const [scriptContent, setScriptContent] = useState<string>('');
    const [fileName, setFileName] = useState<string>('');
    const [scenes, setScenes] = useState<Scene[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setFileName(file.name);
            const reader = new FileReader();
            reader.onload = (e) => {
                setScriptContent(e.target?.result as string);
            };
            reader.readAsText(file);
        }
    };

    const handleGenerate = useCallback(async () => {
        if (!scriptContent) {
            setError('Lütfen önce bir senaryo dosyası yükleyin.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setScenes([]);

        try {
            const parsedScenes = await parseScriptToScenes(scriptContent);
            setScenes(parsedScenes);

            // Generate images sequentially
            for (let i = 0; i < parsedScenes.length; i++) {
                const currentScene = parsedScenes[i];
                setScenes(prev => prev.map(s => s.scene === currentScene.scene ? { ...s, isGenerating: true } : s));
                try {
                    const imageUrl = await generateImageForScene(currentScene.description);
                    setScenes(prev => prev.map(s => s.scene === currentScene.scene ? { ...s, imageUrl, isGenerating: false } : s));
                } catch (imgError) {
                    console.error(`Sahne ${currentScene.scene} için görsel oluşturulamadı:`, imgError);
                    setScenes(prev => prev.map(s => s.scene === currentScene.scene ? { ...s, error: 'Görsel oluşturma başarısız.', isGenerating: false } : s));
                }
            }
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsLoading(false);
        }
    }, [scriptContent]);

    return (
        <div className="space-y-8">
            <div className="bg-brand-secondary p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4 text-brand-text">1. Senaryonuzu Yükleyin</h2>
                <div className="flex items-center space-x-4">
                    <label htmlFor="file-upload" className="cursor-pointer">
                        <div className="flex items-center gap-2 bg-brand-accent text-brand-primary font-bold py-2 px-4 rounded-md hover:bg-opacity-80 transition-colors">
                            <UploadIcon />
                            <span>Dosya Seç</span>
                        </div>
                        <input id="file-upload" type="file" className="hidden" accept=".txt,.md" onChange={handleFileChange} />
                    </label>
                    {fileName && <span className="text-brand-subtext">{fileName}</span>}
                </div>
                 {scriptContent && 
                    <div className="mt-4 p-4 bg-brand-primary/50 rounded-md max-h-40 overflow-y-auto">
                        <p className="text-sm text-brand-subtext whitespace-pre-wrap">{scriptContent}</p>
                    </div>
                 }
            </div>

            <div className="flex justify-center">
                 <Button onClick={handleGenerate} disabled={isLoading || !scriptContent}>
                    {isLoading ? <Spinner /> : <ZapIcon />}
                    <span>{isLoading ? 'Oluşturuluyor...' : 'Storyboard Oluştur'}</span>
                 </Button>
            </div>
            
            {error && (
                <div className="bg-brand-error/20 border border-brand-error text-brand-error px-4 py-3 rounded-md text-center">
                    {error}
                </div>
            )}
            
            {scenes.length > 0 && (
                <div>
                    <h2 className="text-2xl font-bold mb-6 text-center text-brand-text">Oluşturulan Storyboard</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {scenes.map((scene) => (
                            <SceneCard key={scene.scene} scene={scene} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};