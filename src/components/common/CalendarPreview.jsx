import React, { useState, useEffect } from 'react';
import { Calendar, Clock, X, Plus, Minus } from 'lucide-react';

const CalendarPreview = ({ rrule, startDate, exceptions = [], onExceptionChange }) => {
  const [occurrences, setOccurrences] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [showAddException, setShowAddException] = useState(false);
  const [newExceptionDate, setNewExceptionDate] = useState('');

  useEffect(() => {
    if (rrule && startDate) {
      generateOccurrences();
    }
  }, [rrule, startDate, selectedMonth]);

  const generateOccurrences = () => {
    const start = new Date(startDate);
    const monthStart = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
    const monthEnd = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);
    
    const parsed = parseRRule(rrule);
    const generated = [];
    
    let currentDate = new Date(start);
    let count = 0;
    
    while (currentDate <= monthEnd && count < 50) {
      if (currentDate >= monthStart && isValidOccurrence(currentDate, parsed)) {
        generated.push(new Date(currentDate));
      }
      
      currentDate = getNextOccurrence(currentDate, parsed);
      count++;
    }
    
    setOccurrences(generated);
  };

  const parseRRule = (rrule) => {
    const parts = rrule.split(';');
    const parsed = {};
    
    parts.forEach(part => {
      const [key, value] = part.split('=');
      parsed[key] = value;
    });
    
    return parsed;
  };

  const isValidOccurrence = (date, parsed) => {
    const dateStr = date.toISOString().split('T')[0];
    
    // Check if this date is in exceptions
    if (exceptions.includes(dateStr)) {
      return false;
    }
    
    // Check frequency constraints
    if (parsed.BYDAY) {
      const days = parsed.BYDAY.split(',');
      const dayNames = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
      const dayOfWeek = dayNames[date.getDay()];
      if (!days.includes(dayOfWeek)) {
        return false;
      }
    }
    
    if (parsed.BYMONTHDAY) {
      const dayOfMonth = date.getDate();
      if (dayOfMonth !== parseInt(parsed.BYMONTHDAY)) {
        return false;
      }
    }
    
    return true;
  };

  const getNextOccurrence = (date, parsed) => {
    const next = new Date(date);
    
    switch (parsed.FREQ) {
      case 'DAILY':
        next.setDate(next.getDate() + (parseInt(parsed.INTERVAL) || 1));
        break;
      case 'WEEKLY':
        next.setDate(next.getDate() + (parseInt(parsed.INTERVAL) || 1) * 7);
        break;
      case 'MONTHLY':
        next.setMonth(next.getMonth() + (parseInt(parsed.INTERVAL) || 1));
        break;
      case 'YEARLY':
        next.setFullYear(next.getFullYear() + (parseInt(parsed.INTERVAL) || 1));
        break;
    }
    
    return next;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const addException = () => {
    if (newExceptionDate && !exceptions.includes(newExceptionDate)) {
      onExceptionChange([...exceptions, newExceptionDate]);
      setNewExceptionDate('');
      setShowAddException(false);
    }
  };

  const removeException = (date) => {
    onExceptionChange(exceptions.filter(ex => ex !== date));
  };

  const getMonthName = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const previousMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1));
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Upcoming Occurrences
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={previousMonth}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="font-medium">{getMonthName(selectedMonth)}</span>
          <button
            onClick={nextMonth}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="mb-6">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1).getDay() }, (_, i) => (
            <div key={`empty-${i}`} className="h-10"></div>
          ))}
          
          {Array.from({ length: new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0).getDate() }, (_, i) => {
            const date = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), i + 1);
            const dateStr = date.toISOString().split('T')[0];
            const isOccurrence = occurrences.some(occ => 
              occ.toDateString() === date.toDateString()
            );
            const isException = exceptions.includes(dateStr);
            
            return (
              <div
                key={i}
                className={`h-10 border border-gray-200 rounded flex items-center justify-center text-sm ${
                  isOccurrence && !isException
                    ? 'bg-blue-100 border-blue-300 text-blue-800 font-medium'
                    : isException
                    ? 'bg-red-100 border-red-300 text-red-800 line-through'
                    : 'hover:bg-gray-50'
                }`}
              >
                {i + 1}
              </div>
            );
          })}
        </div>
      </div>

      {/* Occurrences List */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Next 6 Occurrences</h4>
        <div className="space-y-2">
          {occurrences.slice(0, 6).map((occurrence, index) => {
            const dateStr = occurrence.toISOString().split('T')[0];
            const isException = exceptions.includes(dateStr);
            
            return (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  isException
                    ? 'bg-red-50 border-red-200'
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className={`font-medium ${
                      isException ? 'text-red-800 line-through' : 'text-blue-800'
                    }`}>
                      {formatDate(occurrence)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatTime(occurrence)}
                    </div>
                  </div>
                </div>
                {isException && (
                  <button
                    onClick={() => removeException(dateStr)}
                    className="text-red-600 hover:text-red-800"
                    title="Remove exception"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Exception */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900">Exceptions</h4>
          <button
            onClick={() => setShowAddException(!showAddException)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {showAddException ? 'Cancel' : 'Add Exception'}
          </button>
        </div>
        
        {showAddException && (
          <div className="flex items-center space-x-2 mb-3">
            <input
              type="date"
              value={newExceptionDate}
              onChange={(e) => setNewExceptionDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addException}
              disabled={!newExceptionDate}
              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>
        )}
        
        {exceptions.length > 0 && (
          <div className="space-y-2">
            {exceptions.map((date, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-red-50 border border-red-200 rounded">
                <span className="text-sm text-red-800">
                  {new Date(date).toLocaleDateString()}
                </span>
                <button
                  onClick={() => removeException(date)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarPreview; 