import React, { useState } from 'react';
import { Clock, X } from 'lucide-react';

interface AddEntryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedTime: Date) => void;
  currentDay: Date;
}

const AddEntryDialog: React.FC<AddEntryDialogProps> = ({ isOpen, onClose, onConfirm, currentDay }) => {
  const [useCurrentTime, setUseCurrentTime] = useState(true);
  const [customHour, setCustomHour] = useState('12');
  const [customMinute, setCustomMinute] = useState('00');

  if (!isOpen) return null;

  const handleConfirm = () => {
    let selectedTime: Date;
    
    if (useCurrentTime) {
      // Use current time
      selectedTime = new Date();
    } else {
      // Use custom time on the selected day
      const year = currentDay.getFullYear();
      const month = currentDay.getMonth();
      const day = currentDay.getDate();
      selectedTime = new Date(year, month, day, parseInt(customHour), parseInt(customMinute), 0, 0);
    }
    
    onConfirm(selectedTime);
    onClose();
  };

  const now = new Date();
  const currentHour = now.getHours().toString().padStart(2, '0');
  const currentMinute = now.getMinutes().toString().padStart(2, '0');

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 10000 }}
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl p-6"
        style={{ width: '90%', maxWidth: '400px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-green)' }}>
              <Clock size={20} style={{ color: 'white' }} />
            </div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Add Survey Entry
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100"
          >
            <X size={20} style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>

        {/* Day Display */}
        <div className="mb-6 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Selected Day</p>
          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            {currentDay.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Time Selection */}
        <div className="space-y-4 mb-6">
          {/* Current Time Option */}
          <button
            onClick={() => setUseCurrentTime(true)}
            className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
              useCurrentTime ? 'border-green-500' : 'border-gray-200'
            }`}
            style={{ 
              backgroundColor: useCurrentTime ? 'rgba(16, 185, 129, 0.05)' : 'white',
              borderColor: useCurrentTime ? 'var(--color-green)' : 'var(--border-light)'
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Current Time</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                useCurrentTime ? 'border-green-500' : 'border-gray-300'
              }`}>
                {useCurrentTime && (
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--color-green)' }} />
                )}
              </div>
            </div>
          </button>

          {/* Custom Time Option */}
          <button
            onClick={() => setUseCurrentTime(false)}
            className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
              !useCurrentTime ? 'border-green-500' : 'border-gray-200'
            }`}
            style={{ 
              backgroundColor: !useCurrentTime ? 'rgba(16, 185, 129, 0.05)' : 'white',
              borderColor: !useCurrentTime ? 'var(--color-green)' : 'var(--border-light)'
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Custom Time</p>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                !useCurrentTime ? 'border-green-500' : 'border-gray-300'
              }`}>
                {!useCurrentTime && (
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--color-green)' }} />
                )}
              </div>
            </div>
            
            {!useCurrentTime && (
              <div className="flex gap-3 items-center" onClick={(e) => e.stopPropagation()}>
                <div className="flex-1">
                  <label className="text-xs mb-1 block" style={{ color: 'var(--text-secondary)' }}>Hour</label>
                  <select
                    value={customHour}
                    onChange={(e) => setCustomHour(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                    style={{ borderColor: 'var(--border-light)' }}
                  >
                    {Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0')).map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
                <div className="mt-5 font-bold" style={{ color: 'var(--text-primary)' }}>:</div>
                <div className="flex-1">
                  <label className="text-xs mb-1 block" style={{ color: 'var(--text-secondary)' }}>Minute</label>
                  <select
                    value={customMinute}
                    onChange={(e) => setCustomMinute(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                    style={{ borderColor: 'var(--border-light)' }}
                  >
                    {Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')).map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-lg font-semibold"
            style={{ 
              backgroundColor: 'white',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-light)'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-3 rounded-lg font-semibold"
            style={{ 
              backgroundColor: 'var(--color-green)',
              color: 'white'
            }}
          >
            Add Entry
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddEntryDialog;
