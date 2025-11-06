import React, { useState } from 'react';
import { StoryboardGenerator } from './components/StoryboardGenerator';
import { ChatBot } from './components/ChatBot';
import { FilmIcon, MessageSquareIcon } from './components/icons';

type Tab = 'storyboard' | 'chat';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('storyboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'storyboard':
        return <StoryboardGenerator />;
      case 'chat':
        return <ChatBot />;
      default:
        return null;
    }
  };

  const TabButton: React.FC<{ tabName: Tab; label: string; icon: React.ReactNode }> = ({ tabName, label, icon }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-primary focus:ring-brand-accent ${
        activeTab === tabName
          ? 'bg-brand-secondary text-brand-accent border-b-2 border-brand-accent'
          : 'text-brand-subtext hover:bg-brand-secondary/50 hover:text-brand-text'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-brand-primary font-sans">
      <header className="bg-brand-secondary/30 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <h1 className="text-2xl font-bold text-brand-text tracking-tight">
                Storyboard <span className="text-brand-accent">Yapay Zeka</span> Stüdyosu
              </h1>
            </div>
             <div className="border-b border-brand-secondary">
                <nav className="flex -mb-px space-x-2" aria-label="Tabs">
                    <TabButton tabName="storyboard" label="Storyboard Oluşturucu" icon={<FilmIcon />} />
                    <TabButton tabName="chat" label="Yaratıcı Asistan" icon={<MessageSquareIcon />} />
                </nav>
            </div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;