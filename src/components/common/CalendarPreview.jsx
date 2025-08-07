import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rrule, startDate, selectedMonth]);

  // Refactored: generate unique keys for calendar days and exceptions
  const getDayKey = (date) => date.toISOString().split('T')[0];
  const getExceptionKey = (date) => `exception-${date}`;

  // Refactored: extract nested ternary for classNames
  const getDayClass = (isOccurrence, isException) => {
    if (isOccurrence && !isException) return 'bg-blue-100 border-blue-300 text-blue-800 font-medium';
    if (isException) return 'bg-red-100 border-red-300 text-red-800 line-through';
    return 'hover:bg-gray-50';
  };

  const generateOccurrences = () => {
    const start = new Date(startDate);
    const monthStart = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
    const monthEnd = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);
    
    const parsed = parseRRule(rrule);
    const generated = [];
    let count = 0;
    let until = parsed.UNTIL ? new Date(parsed.UNTIL) : null;
    const maxCount = parsed.COUNT ? parseInt(parsed.COUNT) : 50;

    if (parsed.FREQ === 'WEEKLY' && parsed.BYDAY) {
      let interval = parseInt(parsed.INTERVAL) || 1;
      let weekStart = new Date(start);
      while (weekStart <= monthEnd && count < maxCount && (!until || weekStart <= until)) {
        const days = parsed.BYDAY.split(',');
        let weekBase = new Date(weekStart);
        weekBase.setDate(weekBase.getDate() - weekBase.getDay());
        for (let i = 0; i < 7; i++) {
          let day = new Date(weekBase);
          day.setDate(weekBase.getDate() + i);
          const dayNames = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
          const dayOfWeek = dayNames[day.getDay()];
          if (days.includes(dayOfWeek) && day >= monthStart && day <= monthEnd && day >= start) {
            const dateStr = day.toISOString().split('T')[0];
            if ((!until || day <= until) && !exceptions.includes(dateStr)) {
              generated.push(new Date(day));
              count++;
              if (count >= maxCount) break;
            }
          }
        }
        weekStart.setDate(weekStart.getDate() + interval * 7);
      }
    } else if (parsed.FREQ === 'MONTHLY' && parsed.BYSETPOS && parsed.BYDAY) {
      let interval = parseInt(parsed.INTERVAL) || 1;
      let currentMonth = new Date(start.getFullYear(), start.getMonth(), 1);
      while (currentMonth <= monthEnd && count < maxCount && (!until || currentMonth <= until)) {
        const bySetPos = parseInt(parsed.BYSETPOS);
        const byDay = parsed.BYDAY;
        const dayNames = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
        let matchingDays = [];
        for (let d = 1; d <= new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate(); d++) {
          let date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d);
          const dayOfWeek = dayNames[date.getDay()];
          if (byDay.split(',').includes(dayOfWeek)) {
            matchingDays.push(date);
          }
        }
        let selectedDay = null;
        if (bySetPos > 0 && matchingDays.length >= bySetPos) {
          selectedDay = matchingDays[bySetPos - 1];
        } else if (bySetPos < 0 && matchingDays.length >= Math.abs(bySetPos)) {
          selectedDay = matchingDays[matchingDays.length + bySetPos];
        }
        if (selectedDay && selectedDay >= start && selectedDay >= monthStart && selectedDay <= monthEnd) {
          const dateStr = selectedDay.toISOString().split('T')[0];
          if ((!until || selectedDay <= until) && !exceptions.includes(dateStr)) {
            generated.push(new Date(selectedDay));
            count++;
          }
        }
        currentMonth.setMonth(currentMonth.getMonth() + interval);
      }
    } else {
      let currentDate = new Date(start);
      while (currentDate <= monthEnd && count < maxCount && (!until || currentDate <= until)) {
        if (currentDate >= monthStart && isValidOccurrence(currentDate, parsed)) {
          generated.push(new Date(currentDate));
          count++;
          if (count >= maxCount) break;
        }
        currentDate = getNextOccurrence(currentDate, parsed);
      }
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
    if (exceptions.includes(dateStr)) return false;
    if (parsed.BYDAY) {
      const days = parsed.BYDAY.split(',');
      const dayNames = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
      const dayOfWeek = dayNames[date.getDay()];
      if (!days.includes(dayOfWeek)) return false;
    }
    if (parsed.BYMONTHDAY) {
      const dayOfMonth = date.getDate();
      if (dayOfMonth !== parseInt(parsed.BYMONTHDAY)) return false;
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
      default:
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
            type="button"
            onClick={previousMonth}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="font-medium">{getMonthName(selectedMonth)}</span>
          <button
            type="button"
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
            const isOccurrence = occurrences.some(occ => occ.toDateString() === date.toDateString());
            const isException = exceptions.includes(dateStr);
            return (
              <div
                key={getDayKey(date)}
                className={`h-10 border border-gray-200 rounded flex items-center justify-center text-sm ${getDayClass(isOccurrence, isException)}`}
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
          {occurrences.slice(0, 6).map((occurrence) => {
            const dateStr = occurrence.toISOString().split('T')[0];
            const isException = exceptions.includes(dateStr);
            return (
              <div
                key={getDayKey(occurrence)}
                className={`flex items-center justify-between p-3 rounded-lg border ${isException ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}
              >
                <div className="flex items-center space-x-3">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className={`font-medium ${isException ? 'text-red-800 line-through' : 'text-blue-800'}`}>
                      {formatDate(occurrence)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatTime(occurrence)}
                    </div>
                  </div>
                </div>
                {isException && (
                  <button
                    type="button"
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
            type="button"
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
              type="button"
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
            {exceptions.map((date) => (
              <div key={getExceptionKey(date)} className="flex items-center justify-between p-2 bg-red-50 border border-red-200 rounded">
                <span className="text-sm text-red-800">
                  {new Date(date).toLocaleDateString()}
                </span>
                <button
                  type="button"
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

CalendarPreview.propTypes = {
  rrule: PropTypes.string.isRequired,
  startDate: PropTypes.string.isRequired,
  exceptions: PropTypes.arrayOf(PropTypes.string),
  onExceptionChange: PropTypes.func.isRequired,
};

export default CalendarPreview; 