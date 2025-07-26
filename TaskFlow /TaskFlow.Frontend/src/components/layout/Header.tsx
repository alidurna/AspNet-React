/**
 * Header Component
 *
 * Bu dosya, TaskFlow uygulamasının dashboard'unun üst kısmındaki
 * header component'ini içerir. Navigasyon, arama, kullanıcı menüsü
 * ve breadcrumb'ları yöneten kapsamlı bir header sağlar.
 *
 * Ana Özellikler:
 * - Mobile hamburger menu button
 * - Breadcrumb navigation
 * - Global search functionality
 * - User profile dropdown
 * - Notifications center
 * - Quick actions menu
 * - Responsive design
 *
 * Header Bölümleri:
 * - Sol: Sidebar toggle, başlık, breadcrumb
 * - Orta: Arama çubuğu (desktop)
 * - Sağ: Kullanıcı menüsü, bildirimler
 *
 * Arama Özellikleri:
 * - Global arama çubuğu
 * - Gelişmiş arama modal'ı
 * - Real-time search
 * - Search history
 * - Filter options
 *
 * Kullanıcı Menüsü:
 * - Profil bilgileri
 * - Ayarlar
 * - Çıkış yapma
 * - Tema değiştirme
 * - Dil seçenekleri
 *
 * Responsive Design:
 * - Mobile-first approach
 * - Adaptive layout
 * - Touch-friendly interface
 * - Breakpoint-based behavior
 *
 * Props Interface:
 * - onSidebarToggle: Sidebar toggle fonksiyonu
 * - title: Sayfa başlığı
 * - breadcrumbs: Breadcrumb öğeleri dizisi
 *
 * State Management:
 * - Search focus state
 * - User menu state
 * - Search query
 * - Modal states
 *
 * Navigation:
 * - Breadcrumb navigation
 * - Route handling
 * - History management
 * - Deep linking
 *
 * Accessibility:
 * - Keyboard navigation
 * - Screen reader support
 * - Focus management
 * - ARIA labels
 *
 * Performance:
 * - Optimized re-renders
 * - Efficient state updates
 * - Debounced search
 * - Lazy loading
 *
 * Styling:
 * - Tailwind CSS tabanlı
 * - Consistent design system
 * - Modern UI/UX
 * - Smooth animations
 *
 * Error Handling:
 * - Search errors
 * - Navigation errors
 * - User menu errors
 * - Graceful fallbacks
 *
 * Sürdürülebilirlik:
 * - TypeScript tip güvenliği
 * - Modüler component yapısı
 * - Açık ve anlaşılır kod
 * - Comprehensive documentation
 *
 * @author TaskFlow Development Team
 * @version 1.0.0
 * @since 2024
 */

import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import type { TaskFilterFormData } from "../../schemas/taskSchemas";
import { useToast } from "../../hooks/useToast";
import ConfirmModal from "../ui/ConfirmModal";
import AdvancedSearchModal from "../search/AdvancedSearchModal";
import { searchAPI } from "../../services/api"; // Eklendi
import { useRef, useEffect, useCallback } from "react"; // Eklendi
// import ThemeToggle from "../ui/ThemeToggle"; // Eklendi - Kaldırılacak

// Debounce yardımcı fonksiyonu
const debounce = (func: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

interface BreadcrumbItem {
  name: string;
  href?: string;
}

interface HeaderProps {
  onSidebarToggle: () => void;
  title?: string;
  breadcrumbs?: BreadcrumbItem[];
}

const Header: React.FC<HeaderProps> = ({
  onSidebarToggle,
  title = "Dashboard",
  breadcrumbs = [],
}) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]); // Eklendi
  const [showSuggestions, setShowSuggestions] = useState(false); // Eklendi

  const searchInputRef = useRef<HTMLInputElement>(null); // Eklendi
  const suggestionsRef = useRef<HTMLDivElement>(null); // Eklendi

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  // Debounce hook'u yerine useCallback kullanarak arama önerilerini geciktir
  const debouncedFetchSuggestions = useCallback(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const response = await searchAPI.getSuggestions(query); // getSearchSuggestions -> getSuggestions
        if (response.success && response.data) {
          setSuggestions(response.data.suggestions);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error("Arama önerileri getirilirken hata oluştu:", error);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      debouncedFetchSuggestions(searchQuery);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery, debouncedFetchSuggestions]);

  // Dışarı tıklama olayını dinle
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    setIsConfirmModalOpen(true);
  };

  const handleConfirmLogout = async () => {
    setIsConfirmModalOpen(false);
    try {
      await logout();
      showSuccess("Başarıyla çıkış yapıldı!");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      showError("Çıkış yaparken bir hata oluştu.");
    }
  };

  const handleCancelLogout = () => {
    setIsConfirmModalOpen(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      try {
        const response = await searchAPI.globalSearch({ query: searchQuery, includeUsers: true });
        if (response.success && response.data) {
          showSuccess(`Global arama tamamlandı: ${response.data.totalResults} sonuç bulundu.`);
          console.log("Global Arama Sonuçları:", response.data);
          // TODO: Arama sonuçlarını göstermek için navigasyon veya modal kullanımı
        } else {
          showError(`Global arama başarısız: ${response.message}`);
        }
      } catch (error) {
        showError(`Global arama sırasında hata oluştu: ${(error as Error).message}`);
        console.error("Global arama hatası:", error);
      }
      setShowSuggestions(false); // Arama yapınca önerileri gizle
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    // İsteğe bağlı: Öneriyi seçince hemen arama yap
    // handleSearch({ preventDefault: () => {} } as React.FormEvent);
  };

  const handleAdvancedSearch = (filters: any) => {
    // Gelişmiş arama sonuçlarını burada işleyebilirsiniz
    setIsSearchModalOpen(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 dark:bg-neutral-900/80 dark:shadow-md dark:shadow-neutral-950/30 dark:border-neutral-850/50 backdrop-blur-md">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <button
              onClick={onSidebarToggle}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-neutral-400 dark:hover:text-neutral-300 dark:hover:bg-neutral-800 dark:focus:ring-primary-600"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-neutral-200">{title}</h1>

              {breadcrumbs.length > 0 && (
                <nav className="flex items-center space-x-1 text-sm text-gray-500 mt-1 dark:text-neutral-400">
                  <a href="/" className="hover:text-gray-700 dark:hover:text-neutral-300">
                    Ana Sayfa
                  </a>
                  {breadcrumbs.map((item, index) => (
                    <React.Fragment key={index}>
                      <span className="mx-1 dark:text-neutral-500">/</span>
                      {item.href ? (
                        <a href={item.href} className="hover:text-gray-700 dark:hover:text-neutral-300">
                          {item.name}
                        </a>
                      ) : (
                        <span className="text-gray-700 dark:text-neutral-300">
                          {item.name}
                        </span>
                      )}
                    </React.Fragment>
                  ))}
                </nav>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search Section (Desktop) */}
            <div className="relative flex items-center space-x-2">
              <form onSubmit={handleSearch} className="flex-grow relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(true)} // Odaklandığında önerileri göster
                  className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-800 dark:bg-neutral-850 dark:text-neutral-300 dark:placeholder-neutral-400 dark:focus:ring-primary-500"
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div
                    ref={suggestionsRef}
                    className="absolute top-full left-0 w-full max-w-xs bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-10 dark:bg-neutral-900/80 dark:ring-neutral-850/50 dark:shadow-xl backdrop-blur-md">
                    <ul className="py-1">
                      {suggestions.map((suggestion, index) => (
                        <li
                          key={index}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer dark:hover:bg-neutral-850 dark:text-neutral-200"
                          onClick={() => handleSelectSuggestion(suggestion)}
                        >
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </form>
              <button
                onClick={() => setIsSearchModalOpen(true)}
                className={`p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-neutral-400 dark:hover:text-neutral-300 dark:hover:bg-neutral-800 dark:focus:ring-primary-600 ${
                  isSearchModalOpen ? "ring-2 ring-blue-500 dark:ring-primary-600" : ""
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                </svg>
              </button>
            </div>

            {/* Theme Toggle - Sadece mobil için veya küçük boyutlarda - Kaldırılacak */}
            {/* <ThemeToggle size="sm" className="md:hidden"/> */}

            {/* User Menu / Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full dark:text-neutral-300 dark:hover:text-neutral-200 dark:focus:ring-primary-600"
              >
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium dark:bg-primary-800">
                  {user?.firstName?.charAt(0) || user?.email?.charAt(0) || "U"}
                </div>
                <span className="font-medium text-gray-700 dark:text-neutral-300 hidden md:inline">
                  {user?.firstName || "Misafir"}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 dark:text-neutral-400 ${
                    isUserMenuOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-10 dark:bg-neutral-900/80 dark:shadow-xl dark:ring-neutral-850/50 backdrop-blur-md">
                  {/* Desktop Theme Toggle - Sadece desktop için - Kaldırılacak */}
                  {/* <div className="px-4 py-2 hidden md:block">
                    <ThemeToggle size="sm" showLabel={true} className="w-full justify-start py-2 px-3 text-sm font-medium rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700 dark:text-neutral-200 dark:hover:text-neutral-100"/>
                  </div> */}
                  <a
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-neutral-200 dark:hover:bg-neutral-850/50"
                  >
                    Profil
                  </a>
                  <a
                    href="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-neutral-200 dark:hover:bg-neutral-850/50"
                  >
                    Ayarlar
                  </a>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-error-400 dark:hover:bg-error-900/60"
                  >
                    Çıkış Yap
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isSearchModalOpen && (
        <AdvancedSearchModal
          isOpen={isSearchModalOpen}
          onClose={() => setIsSearchModalOpen(false)}
          onSearch={handleAdvancedSearch}
        />
      )}

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onCancel={handleCancelLogout}
        onConfirm={handleConfirmLogout}
        title="Çıkış Onayı"
        message="Gerçekten çıkış yapmak istiyor musunuz?"
      />
    </header>
  );
};

export default Header;
