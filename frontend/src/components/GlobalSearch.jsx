import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, FileText, BookOpen, Users, Award, Clock, TrendingUp, Filter, Command } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState([]);
  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const debounceTimerRef = useRef(null);

  // Keyboard shortcut to open search (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setIsOpen(true);
      }
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when search opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Debounced search function
  const performSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      // This would be replaced with actual API call
      // const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      // const data = await response.json();
      
      // Start with empty search results
      setResults([]);
      setSelectedIndex(0);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Handle search input changes with debounce
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  // Handle keyboard navigation
  const handleKeyDown = (event) => {
    if (!isOpen) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % results.length);
        break;
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
        break;
      case 'Enter':
        event.preventDefault();
        if (results[selectedIndex]) {
          handleResultClick(results[selectedIndex]);
        }
        break;
    }
  };

  // Handle result click
  const handleResultClick = (result) => {
    // Save to recent searches
    const recent = [
      { query: searchTerm, result: result.title },
      ...recentSearches.filter(s => s.query !== searchTerm)
    ].slice(0, 5);
    
    setRecentSearches(recent);
    localStorage.setItem('recentSearches', JSON.stringify(recent));
    
    // Navigate to result
    navigate(result.url);
    setIsOpen(false);
    setSearchTerm('');
    setResults([]);
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'course': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'lesson': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'user': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
      case 'certificate': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'report': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  return (
    <>
      {/* Search Trigger Button */}
      <Button
        variant="outline"
        className="relative w-full md:w-64 justify-start text-left font-normal"
        onClick={() => setIsOpen(true)}
      >
        <Search className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
        <span className="text-gray-500 dark:text-gray-400">Search...</span>
        <kbd className="pointer-events-none absolute right-2 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted dark:bg-gray-700 px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex text-gray-600 dark:text-gray-300">
          <Command className="h-3 w-3" />K
        </kbd>
      </Button>

      {/* Search Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 dark:bg-black/70 backdrop-blur-sm">
          <div className="fixed left-[50%] top-[20%] z-50 w-full max-w-2xl translate-x-[-50%] p-4">
            <div
              ref={searchContainerRef}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700"
            >
              {/* Search Input */}
              <div className="flex items-center border-b border-gray-200 dark:border-gray-700 p-4">
                <Search className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3" />
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search courses, lessons, users..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 border-0 focus:ring-0 p-0 text-base bg-transparent text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  autoComplete="off"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="ml-2"
                >
                  <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </Button>
              </div>

              {/* Search Results or Recent Searches */}
              <ScrollArea className="max-h-96">
                {loading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
                  </div>
                ) : searchTerm ? (
                  results.length > 0 ? (
                    <div className="py-2">
                      {results.map((result, index) => (
                        <button
                          key={result.id}
                          className={cn(
                            "w-full px-4 py-3 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors text-left",
                            index === selectedIndex && "bg-gray-50 dark:bg-gray-750"
                          )}
                          onClick={() => handleResultClick(result)}
                          onMouseEnter={() => setSelectedIndex(index)}
                        >
                          <div className="mt-0.5">
                            <result.icon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {result.title}
                              </p>
                              <Badge className={cn("text-xs", getTypeColor(result.type))}>
                                {result.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                              {result.description}
                            </p>
                            {result.meta && (
                              <p className="text-xs text-gray-400 mt-1">
                                {result.meta}
                              </p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 text-gray-500 dark:text-gray-400">
                      <Search className="h-12 w-12 mb-2 opacity-20 text-gray-400 dark:text-gray-500" />
                      <p>No results found for "{searchTerm}"</p>
                      <p className="text-sm mt-1">Try different keywords</p>
                    </div>
                  )
                ) : recentSearches.length > 0 ? (
                  <div className="p-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Recent searches</p>
                    <div className="space-y-2">
                      {recentSearches.map((search, index) => (
                        <button
                          key={index}
                          className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-750 rounded-md transition-colors"
                          onClick={() => {
                            setSearchTerm(search.query);
                            handleSearchChange(search.query);
                          }}
                        >
                          <Clock className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {search.query}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                            → {search.result}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Start typing to search across the platform
                    </p>
                    <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                      <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">↑↓</kbd>
                      <span>to navigate</span>
                      <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">↵</kbd>
                      <span>to select</span>
                      <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">esc</kbd>
                      <span>to close</span>
                    </div>
                  </div>
                )}
              </ScrollArea>

              {/* Footer with filters */}
              {searchTerm && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">Filter by:</span>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                      Courses
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                      Lessons
                    </Button>
                    {user?.role !== 'participant' && (
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                        Users
                      </Button>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {results.length} result{results.length !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}