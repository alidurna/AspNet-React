import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaPlay, FaPause, FaCheck, FaRedo, FaForward } from 'react-icons/fa';
import './ProgressSlider.css';

interface ProgressSliderProps {
  currentProgress: number;
  onProgressChange: (progress: number) => void;
  isCompleted: boolean;
  compact?: boolean;
}

const ProgressSlider: React.FC<ProgressSliderProps> = ({
  currentProgress,
  onProgressChange,
  isCompleted,
  compact = false
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseInt(e.target.value);
    onProgressChange(newProgress);
  };

  // Dynamic quick actions - only show actions that move forward
  const getQuickActions = () => {
    const actions = [];
    
    // Always show next logical steps
    if (currentProgress < 25) {
      actions.push({ label: 'Başla', progress: 25, icon: FaPlay });
    }
    if (currentProgress < 50) {
      actions.push({ label: 'Yarı', progress: 50, icon: FaForward });
    }
    if (currentProgress < 75) {
      actions.push({ label: 'Çoğu', progress: 75, icon: FaForward });
    }
    if (currentProgress < 90) {
      actions.push({ label: 'Neredeyse', progress: 90, icon: FaForward });
    }
    if (currentProgress < 100) {
      actions.push({ label: 'Tamamla', progress: 100, icon: FaCheck });
    }
    
    // If completed, allow reset
    if (currentProgress === 100) {
      actions.push({ label: 'Yeniden Başla', progress: 0, icon: FaRedo });
    }
    
    // Show maximum 3 actions
    return actions.slice(0, 3);
  };

  const quickActions = getQuickActions();

  return (
    <div className={`space-y-${compact ? '2' : '3'}`}>
      {/* Progress Bar */}
      <div className="relative">
        <div className="progress-track">
          <div 
            className="progress-fill"
            style={{ width: `${currentProgress}%` }}
          />
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={currentProgress}
          onChange={handleSliderChange}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          className={`w-full ${compact ? 'h-1' : 'h-2'} bg-transparent appearance-none cursor-pointer slider absolute top-0 left-0`}
        />
      </div>

      {/* Progress Percentage */}
      <div className="flex items-center justify-between">
        <span className={`${compact ? 'text-xs' : 'text-sm'} font-medium text-gray-700 dark:text-gray-300`}>
          {compact ? `${currentProgress}%` : `İlerleme: ${currentProgress}%`}
        </span>
        {!compact && (
          <span className="text-xs text-gray-500">
            {currentProgress === 0 && 'Başlanmadı'}
            {currentProgress > 0 && currentProgress < 100 && 'Devam Ediyor'}
            {currentProgress === 100 && 'Tamamlandı'}
          </span>
        )}
      </div>

      {/* Quick Action Buttons */}
      {!compact && (
        <div className="flex gap-1">
          {quickActions.map((action) => (
            <motion.button
              key={action.progress}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onProgressChange(action.progress)}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                currentProgress === action.progress
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-900'
              }`}
            >
              <action.icon className="w-3 h-3" />
              {action.label}
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProgressSlider; 