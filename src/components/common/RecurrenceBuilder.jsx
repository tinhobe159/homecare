import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Repeat, X, Check } from 'lucide-react';

const RecurrenceBuilder = ({ onRecurrenceChange, initialValue = null }) => {
  const [step, setStep] = useState(1);
  const [recurrence, setRecurrence] = useState({
    frequency: 'WEEKLY',
    interval: 1,
    byDay: [],
    byMonthDay: null,
    bySetPos: null,
    count: null,
    until: null,
    endCondition: 'count'
  });

  const [summary, setSummary] = useState('');

  const frequencies = [
    { value: 'DAILY', label: 'Daily' },
    { value: 'WEEKLY', label: 'Weekly' },
    { value: 'MONTHLY', label: 'Monthly' },
    { value: 'YEARLY', label: 'Yearly' }
  ];

  const weekdays = [
    { value: 'MO', label: 'Monday' },
    { value: 'TU', label: 'Tuesday' },
    { value: 'WE', label: 'Wednesday' },
    { value: 'TH', label: 'Thursday' },
    { value: 'FR', label: 'Friday' },
    { value: 'SA', label: 'Saturday' },
    { value: 'SU', label: 'Sunday' }
  ];

  const ordinalPositions = [
    { value: 1, label: 'First' },
    { value: 2, label: 'Second' },
    { value: 3, label: 'Third' },
    { value: 4, label: 'Fourth' },
    { value: -1, label: 'Last' }
  ];

  useEffect(() => {
    if (initialValue) {
      parseRRule(initialValue);
    }
  }, [initialValue]);

  useEffect(() => {
    generateSummary();
    generateRRule();
  }, [recurrence]);

  const parseRRule = (rrule) => {
    const parts = rrule.split(';');
    const parsed = {};
    
    parts.forEach(part => {
      const [key, value] = part.split('=');
      parsed[key] = value;
    });

    setRecurrence({
      frequency: parsed.FREQ || 'WEEKLY',
      interval: parseInt(parsed.INTERVAL) || 1,
      byDay: parsed.BYDAY ? parsed.BYDAY.split(',') : [],
      byMonthDay: parsed.BYMONTHDAY ? parseInt(parsed.BYMONTHDAY) : null,
      bySetPos: parsed.BYSETPOS ? parseInt(parsed.BYSETPOS) : null,
      count: parsed.COUNT ? parseInt(parsed.COUNT) : null,
      until: parsed.UNTIL ? parsed.UNTIL : null,
      endCondition: parsed.COUNT ? 'count' : parsed.UNTIL ? 'until' : 'count'
    });
  };

  const generateRRule = () => {
    let rrule = `FREQ=${recurrence.frequency}`;
    
    if (recurrence.interval > 1) {
      rrule += `;INTERVAL=${recurrence.interval}`;
    }
    
    if (recurrence.byDay.length > 0) {
      rrule += `;BYDAY=${recurrence.byDay.join(',')}`;
    }
    
    if (recurrence.byMonthDay) {
      rrule += `;BYMONTHDAY=${recurrence.byMonthDay}`;
    }
    
    if (recurrence.bySetPos) {
      rrule += `;BYSETPOS=${recurrence.bySetPos}`;
    }
    
    if (recurrence.endCondition === 'count' && recurrence.count) {
      rrule += `;COUNT=${recurrence.count}`;
    } else if (recurrence.endCondition === 'until' && recurrence.until) {
      rrule += `;UNTIL=${recurrence.until}`;
    }
    
    onRecurrenceChange(rrule);
  };

  const generateSummary = () => {
    let summary = 'Repeats ';
    
    if (recurrence.interval > 1) {
      summary += `every ${recurrence.interval} `;
    } else {
      summary += 'every ';
    }
    
    summary += recurrence.frequency.toLowerCase();
    
    if (recurrence.byDay.length > 0) {
      const dayLabels = recurrence.byDay.map(day => 
        weekdays.find(w => w.value === day)?.label
      ).filter(Boolean);
      summary += ` on ${dayLabels.join(', ')}`;
    }
    
    if (recurrence.byMonthDay) {
      summary += ` on the ${recurrence.byMonthDay}${getOrdinalSuffix(recurrence.byMonthDay)}`;
    }
    
    if (recurrence.bySetPos) {
      const ordinal = ordinalPositions.find(o => o.value === recurrence.bySetPos)?.label;
      summary += ` on the ${ordinal} ${recurrence.byDay[0] || 'day'}`;
    }
    
    if (recurrence.endCondition === 'count' && recurrence.count) {
      summary += ` for ${recurrence.count} occurrence${recurrence.count > 1 ? 's' : ''}`;
    } else if (recurrence.endCondition === 'until' && recurrence.until) {
      summary += ` until ${new Date(recurrence.until).toLocaleDateString()}`;
    }
    
    setSummary(summary);
  };

  const getOrdinalSuffix = (num) => {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
  };

  const handleFrequencyChange = (frequency) => {
    setRecurrence(prev => ({
      ...prev,
      frequency,
      byDay: frequency === 'WEEKLY' ? prev.byDay : [],
      byMonthDay: frequency === 'MONTHLY' ? prev.byMonthDay : null,
      bySetPos: null
    }));
  };

  const handleDayToggle = (day) => {
    setRecurrence(prev => ({
      ...prev,
      byDay: prev.byDay.includes(day)
        ? prev.byDay.filter(d => d !== day)
        : [...prev.byDay, day]
    }));
  };

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-6">
        {[1, 2, 3].map((stepNum) => (
          <div key={stepNum} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              stepNum < step ? 'bg-green-500 text-white' :
              stepNum === step ? 'bg-blue-500 text-white' :
              'bg-gray-200 text-gray-600'
            }`}>
              {stepNum < step ? <Check className="w-4 h-4" /> : stepNum}
            </div>
            {stepNum < 3 && (
              <div className={`w-16 h-1 mx-2 ${
                stepNum < step ? 'bg-green-500' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Frequency Selection */}
      {step === 1 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Repeat className="w-5 h-5 mr-2" />
            How often should this repeat?
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {frequencies.map((freq) => (
              <button
                key={freq.value}
                onClick={() => handleFrequencyChange(freq.value)}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  recurrence.frequency === freq.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium">{freq.label}</div>
                <div className="text-sm text-gray-600">
                  {freq.value === 'DAILY' && 'Every day'}
                  {freq.value === 'WEEKLY' && 'On selected days of the week'}
                  {freq.value === 'MONTHLY' && 'On selected date or day of month'}
                  {freq.value === 'YEARLY' && 'On the same date each year'}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Interval and Specifics */}
      {step === 2 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Set the details</h3>
          
          {/* Interval */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Repeat every
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="1"
                max="99"
                value={recurrence.interval}
                onChange={(e) => setRecurrence(prev => ({
                  ...prev,
                  interval: parseInt(e.target.value) || 1
                }))}
                className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-600">
                {recurrence.frequency === 'DAILY' && 'day(s)'}
                {recurrence.frequency === 'WEEKLY' && 'week(s)'}
                {recurrence.frequency === 'MONTHLY' && 'month(s)'}
                {recurrence.frequency === 'YEARLY' && 'year(s)'}
              </span>
            </div>
          </div>

          {/* Weekly: Day Selection */}
          {recurrence.frequency === 'WEEKLY' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                On which days?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {weekdays.map((day) => (
                  <label key={day.value} className="flex items-center space-x-2 p-2 border border-gray-200 rounded-md hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={recurrence.byDay.includes(day.value)}
                      onChange={() => handleDayToggle(day.value)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">{day.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Monthly: Date or Day Selection */}
          {recurrence.frequency === 'MONTHLY' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                On which day of the month?
              </label>
              <div className="space-y-3">
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="monthlyType"
                      checked={recurrence.byMonthDay !== null}
                      onChange={() => setRecurrence(prev => ({
                        ...prev,
                        byMonthDay: 15,
                        bySetPos: null
                      }))}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>On day</span>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={recurrence.byMonthDay || ''}
                      onChange={(e) => setRecurrence(prev => ({
                        ...prev,
                        byMonthDay: parseInt(e.target.value),
                        bySetPos: null
                      }))}
                      className="w-16 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </label>
                </div>
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="monthlyType"
                      checked={recurrence.bySetPos !== null}
                      onChange={() => setRecurrence(prev => ({
                        ...prev,
                        byMonthDay: null,
                        bySetPos: 1
                      }))}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>On the</span>
                    <select
                      value={recurrence.bySetPos || ''}
                      onChange={(e) => setRecurrence(prev => ({
                        ...prev,
                        bySetPos: parseInt(e.target.value)
                      }))}
                      className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {ordinalPositions.map(pos => (
                        <option key={pos.value} value={pos.value}>
                          {pos.label}
                        </option>
                      ))}
                    </select>
                    <select
                      value={recurrence.byDay[0] || ''}
                      onChange={(e) => setRecurrence(prev => ({
                        ...prev,
                        byDay: e.target.value ? [e.target.value] : []
                      }))}
                      className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">day</option>
                      {weekdays.map(day => (
                        <option key={day.value} value={day.value}>
                          {day.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 3: End Condition */}
      {step === 3 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">When should this end?</h3>
          
          <div className="space-y-4">
            <label className="flex items-center space-x-3">
              <input
                type="radio"
                name="endCondition"
                checked={recurrence.endCondition === 'count'}
                onChange={() => setRecurrence(prev => ({
                  ...prev,
                  endCondition: 'count',
                  until: null
                }))}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span>After</span>
              <input
                type="number"
                min="1"
                max="999"
                value={recurrence.count || ''}
                onChange={(e) => setRecurrence(prev => ({
                  ...prev,
                  count: parseInt(e.target.value) || null
                }))}
                className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span>occurrences</span>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="radio"
                name="endCondition"
                checked={recurrence.endCondition === 'until'}
                onChange={() => setRecurrence(prev => ({
                  ...prev,
                  endCondition: 'until',
                  count: null
                }))}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span>Until</span>
              <input
                type="date"
                value={recurrence.until || ''}
                onChange={(e) => setRecurrence(prev => ({
                  ...prev,
                  until: e.target.value
                }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="radio"
                name="endCondition"
                checked={recurrence.endCondition === 'never'}
                onChange={() => setRecurrence(prev => ({
                  ...prev,
                  endCondition: 'never',
                  count: null,
                  until: null
                }))}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span>Never (ongoing)</span>
            </label>
          </div>
        </div>
      )}

      {/* Summary */}
      {summary && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Summary</h4>
          <p className="text-blue-800">{summary}</p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={prevStep}
          disabled={step === 1}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={nextStep}
          disabled={step === 3}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default RecurrenceBuilder; 