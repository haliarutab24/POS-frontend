import React, { useState } from 'react';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2021, 11, 2)); // December 2, 2021
  const [selectedDate, setSelectedDate] = useState(new Date(2021, 11, 2));
  const [viewMode, setViewMode] = useState('month'); // 'day', 'week', or 'month'

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const isSameDay = (date1, date2) => {
    return date1.getDate() === date2.getDate() && 
           date1.getMonth() === date2.getMonth() && 
           date1.getFullYear() === date2.getFullYear();
  };

  const handleDateClick = (day) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(newDate);
  };

  const handlePrev = () => {
    if (viewMode === 'day') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 1));
    } else if (viewMode === 'week') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 7));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    }
  };

  const handleNext = () => {
    if (viewMode === 'day') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1));
    } else if (viewMode === 'week') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 7));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    }
  };

  const renderMiniCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const miniDays = [];
    let dayCount = 1;

    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 7; j++) {
        if ((i === 0 && j < firstDay) || dayCount > daysInMonth) {
          miniDays.push(<div key={`empty-${i}-${j}`} className="h-8"></div>);
        } else {
          const isSelected = isSameDay(selectedDate, new Date(currentDate.getFullYear(), currentDate.getMonth(), dayCount));
          miniDays.push(
            <div
              key={`day-${dayCount}`}
              className={`h-8 flex items-center justify-center cursor-pointer ${
                isSelected ? 'bg-blue-500 text-white rounded-full w-8' : ''
              }`}
              onClick={() => handleDateClick(dayCount)}
            >
              {dayCount++}
            </div>
          );
        }
      }
    }
    return miniDays;
  };

  const renderMainCalendar = () => {
    if (viewMode === 'day') {
      return (
        <div className="h-96 overflow-y-auto p-4">
          <div className="text-xl font-bold mb-4">
            {days[selectedDate.getDay()]}, {months[selectedDate.getMonth()]} {selectedDate.getDate()}, {selectedDate.getFullYear()}
          </div>
          <div className="space-y-2">
            <div className="bg-blue-100 p-3 rounded">
              <div className="font-medium">Customer Name</div>
              <div className="text-sm text-gray-600">10:00 AM - 11:00 AM</div>
            </div>
            <div className="bg-pink-100 p-3 rounded">
              <div className="font-medium">Meeting</div>
              <div className="text-sm text-gray-600">2:00 PM - 3:00 PM</div>
            </div>
          </div>
        </div>
      );
    }

    if (viewMode === 'week') {
      const weekStart = new Date(currentDate);
      weekStart.setDate(currentDate.getDate() - currentDate.getDay());
      
      return (
        <div className="h-96 overflow-y-auto">
          <div className="grid grid-cols-7">
            {Array.from({ length: 7 }).map((_, i) => {
              const day = new Date(weekStart);
              day.setDate(weekStart.getDate() + i);
              const isSelected = isSameDay(selectedDate, day);
              
              return (
                <div 
                  key={i} 
                  className={`border p-2 ${isSelected ? 'bg-blue-100' : ''}`}
                  onClick={() => setSelectedDate(day)}
                >
                  <div className="font-medium">{days[day.getDay()]}</div>
                  <div className="text-lg">{day.getDate()}</div>
                  <div className="mt-2 space-y-1">
                    {[1, 2].map((event, j) => (
                      <div key={j} className={`text-xs p-1 rounded truncate ${
                        j % 2 === 0 ? 'bg-blue-500 text-white' : 'bg-pink-500 text-white'
                      }`}>
                        {j % 2 === 0 ? 'Customer' : 'Meeting'}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // Month view
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const calendarDays = [];
    let dayCount = 1;

    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 7; j++) {
        if ((i === 0 && j < firstDay) || dayCount > daysInMonth) {
          calendarDays.push(<div key={`empty-${i}-${j}`} className="h-24 border border-gray-200"></div>);
        } else {
          const isSelected = isSameDay(selectedDate, new Date(currentDate.getFullYear(), currentDate.getMonth(), dayCount));
          calendarDays.push(
            <div
              key={`day-${dayCount}`}
              className={`h-24 border border-gray-200 p-1 ${
                isSelected ? 'bg-blue-100' : ''
              }`}
            >
              <div className="text-right">{dayCount}</div>
              {(dayCount === 2 || dayCount === 21) && (
                <div className="space-y-1 mt-1">
                  <div className="bg-blue-500 text-white text-xs p-1 rounded">Customer Name</div>
                  <div className="bg-pink-500 text-white text-xs p-1 rounded">Time</div>
                </div>
              )}
              {dayCount === 3 && (
                <div className="bg-blue-500 text-white text-xs p-1 rounded mt-1">Customer Name</div>
              )}
              {dayCount++}
            </div>
          );
        }
      }
    }
    return (
      <div className="grid grid-cols-7 gap-px overflow-y-auto h-96">
        {calendarDays}
      </div>
    );
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Follow Up Calendar</h2>
      
      <div className="flex space-x-4">
        {/* Mini Calendar */}
        <div className="w-1/3 bg-white p-4 rounded shadow">
          <div className="text-sm font-medium mb-2">
            {months[currentDate.getMonth()]} {currentDate.getDate()}, {currentDate.getFullYear()}
          </div>
          <div className="grid grid-cols-7 gap-1 mb-1">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
              <div key={day} className="text-center text-xs text-gray-500">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 overflow-y-auto h-48">
            {renderMiniCalendar()}
          </div>
        </div>
        
        {/* Main Calendar */}
        <div className="w-2/3 bg-white p-4 rounded shadow">
          <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-2">
              <button 
                onClick={handlePrev}
                className="p-1 rounded hover:bg-gray-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h3 className="text-md font-semibold text-gray-700">
                {viewMode === 'day' ? (
                  `${days[selectedDate.getDay()]}, ${months[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}`
                ) : viewMode === 'week' ? (
                  `Week of ${months[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`
                ) : (
                  `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`
                )}
              </h3>
              <button 
                onClick={handleNext}
                className="p-1 rounded hover:bg-gray-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="flex space-x-1 bg-gray-100 rounded p-1">
              {['day', 'week', 'month'].map((mode) => (
                <button
                  key={mode}
                  className={`px-3 py-1 text-sm rounded ${
                    viewMode === mode ? 'bg-white shadow' : 'hover:bg-gray-200'
                  }`}
                  onClick={() => setViewMode(mode)}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          {viewMode === 'month' && (
            <div className="grid grid-cols-7 gap-px mb-1">
              {days.map((day) => (
                <div key={day} className="text-center text-sm font-medium text-gray-700 p-2">
                  {day}
                </div>
              ))}
            </div>
          )}
          
          {renderMainCalendar()}
        </div>
      </div>
    </div>
  );
};

export default Calendar;