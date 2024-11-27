import React, { useState, useMemo } from 'react';
import { PenSquare, Menu, X } from 'lucide-react';
import { SearchBar } from './components/SearchBar';
import { CategoryList } from './components/CategoryList';
import { PromptCard } from './components/PromptCard';
import { CreatePromptModal } from './components/CreatePromptModal';
import { ExportButton } from './components/ExportButton';
import type { Prompt, Category } from './types';
import { samplePrompts, sampleCategories } from './data/sampleData';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [prompts, setPrompts] = useState<Prompt[]>(samplePrompts);
  const [categories, setCategories] = useState<Category[]>(sampleCategories);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const filteredPrompts = useMemo(() => {
    return prompts.filter((prompt) => {
      const matchesSearch = prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prompt.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prompt.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory ? prompt.category === selectedCategory : true;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory, prompts]);

  const handleCreatePrompt = (newPrompt: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>) => {
    const prompt: Prompt = {
      ...newPrompt,
      id: (prompts.length + 1).toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setPrompts([...prompts, prompt]);
    setIsCreateModalOpen(false);
  };

  const handleUpdatePrompt = (updatedPrompt: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingPrompt) return;
    
    const updated: Prompt = {
      ...updatedPrompt,
      id: editingPrompt.id,
      createdAt: editingPrompt.createdAt,
      updatedAt: new Date(),
    };

    setPrompts(prompts.map(p => p.id === editingPrompt.id ? updated : p));
    setEditingPrompt(null);
  };

  const handleDeletePrompt = (id: string) => {
    if (window.confirm('このプロンプトを削除してもよろしいですか？')) {
      setPrompts(prompts.filter(p => p.id !== id));
    }
  };

  const handleCreateCategory = (name: string, color: string) => {
    const newCategory: Category = {
      id: (categories.length + 1).toString(),
      name,
      color,
    };
    setCategories([...categories, newCategory]);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <button
                onClick={toggleSidebar}
                className="mr-4 p-2 rounded-lg hover:bg-gray-100 lg:hidden"
              >
                {isSidebarOpen ? (
                  <X className="h-6 w-6 text-gray-600" />
                ) : (
                  <Menu className="h-6 w-6 text-gray-600" />
                )}
              </button>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Prompt Manager</h1>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <ExportButton prompts={filteredPrompts} />
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <PenSquare className="h-5 w-5 sm:mr-2" />
                <span className="hidden sm:inline">新規作成</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Sidebar for mobile */}
          <div
            className={`
              fixed inset-0 z-10 transform lg:hidden
              ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
              transition-transform duration-300 ease-in-out
            `}
          >
            <div className="absolute inset-0 bg-gray-500 bg-opacity-75" onClick={toggleSidebar} />
            <div className="relative bg-white w-64 h-full overflow-y-auto">
              <div className="p-4">
                <CategoryList
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onCategorySelect={(category) => {
                    setSelectedCategory(category);
                    setIsSidebarOpen(false);
                  }}
                  onCreateCategory={handleCreateCategory}
                />
              </div>
            </div>
          </div>

          {/* Sidebar for desktop */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24">
              <CategoryList
                categories={categories}
                selectedCategory={selectedCategory}
                onCategorySelect={setSelectedCategory}
                onCreateCategory={handleCreateCategory}
              />
            </div>
          </div>
          
          <div className="lg:col-span-9">
            <div className="mb-6">
              <SearchBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {filteredPrompts.map((prompt) => (
                <PromptCard 
                  key={prompt.id} 
                  prompt={prompt}
                  onEdit={() => setEditingPrompt(prompt)}
                  onDelete={() => handleDeletePrompt(prompt.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <CreatePromptModal
        isOpen={isCreateModalOpen || editingPrompt !== null}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingPrompt(null);
        }}
        onSubmit={editingPrompt ? handleUpdatePrompt : handleCreatePrompt}
        categories={categories}
        initialPrompt={editingPrompt}
      />
    </div>
  );
}

export default App;