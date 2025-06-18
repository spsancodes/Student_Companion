import React, { useState, useEffect } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { supabase } from '../supabaseClient';
import { FaCalendarAlt, FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa';
import { FiCalendar, FiBook, FiAward, FiSun } from 'react-icons/fi';
import EventForm from '../components/EventForm'; // Adjust path if needed

const localizer = momentLocalizer(moment);

const Calendar = ({ role }) => {
  const [events, setEvents] = useState([]);
  const [currentView, setCurrentView] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const CustomToolbar = (toolbar) => {
    const goToToday = () => {
      toolbar.onNavigate('TODAY');
      setCurrentDate(new Date());
    };

    const viewNames = {
      month: 'Month',
      week: 'Week',
      day: 'Day',
      agenda: 'Agenda'
    };

    return (
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 px-2 py-3 bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center space-x-2 mb-2 md:mb-0">
          <button onClick={() => toolbar.onNavigate('PREV')} className="p-2 rounded-full hover:bg-gray-100">
            <FaChevronLeft className="text-gray-600" />
          </button>
          <button onClick={goToToday} className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
            Today
          </button>
          <button onClick={() => toolbar.onNavigate('NEXT')} className="p-2 rounded-full hover:bg-gray-100">
            <FaChevronRight className="text-gray-600" />
          </button>
          <h2 className="text-lg font-semibold text-gray-800 ml-2">
            {moment(toolbar.date).format('MMMM YYYY')}
          </h2>
        </div>

        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {['month', 'week', 'day'].map(view => (
            <button
              key={view}
              onClick={() => toolbar.onView(view)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                toolbar.view === view 
                  ? 'bg-white shadow-sm text-blue-600 font-medium' 
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              {viewNames[view]}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('calendar_events').select('*');
      if (error) throw error;

      const mapped = data.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        start: event.start_time ? new Date(`${event.date}T${event.start_time}`) : new Date(event.date),
        end: event.end_time ? new Date(`${event.date}T${event.end_time}`) : new Date(event.date),
        allDay: !(event.start_time && event.end_time),
        category: event.category,
        isAcademic: event.is_academic_calendar,
      }));

      setEvents(mapped);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSaveEvent = async (newEvent) => {
    try {
      const { error } = await supabase.from('calendar_events').insert([
        { ...newEvent, created_by: supabase.auth.getUser()?.user?.id },
      ]);

      if (error) {
        console.error('Error saving:', error);
        alert('Failed to save event');
        return;
      }

      setShowForm(false);
      fetchEvents();
    } catch (err) {
      console.error(err);
    }
  };

  const getEventIcon = (category) => {
    switch (category) {
      case 'exam': return <FiAward className="inline mr-1" />;
      case 'holiday': return <FiSun className="inline mr-1" />;
      case 'academic': return <FiBook className="inline mr-1" />;
      default: return <FiCalendar className="inline mr-1" />;
    }
  };

  const eventStyleGetter = (event) => {
    const color = event.isAcademic ? '#4ade80' : '#fb923c';
    const bg = event.isAcademic ? '#f0fdf4' : '#fff7ed';
    return {
      style: {
        backgroundColor: bg,
        borderLeft: `4px solid ${color}`,
        color: '#1f2937',
        fontSize: '0.75rem',
        padding: '2px 4px',
        borderRadius: '4px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      },
    };
  };

  const customDayHeader = ({ label }) => (
    <div className="text-xs font-medium text-gray-500 py-1 text-center">
      {label}
    </div>
  );

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto rounded-xl shadow-sm border border-gray-200 overflow-hidden bg-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <FaCalendarAlt className="text-white mr-3 text-xl" />
              <div>
                <h1 className="text-2xl font-bold">Academic Calendar</h1>
                <p className="text-blue-100 text-sm">{moment(currentDate).format('MMMM YYYY')}</p>
              </div>
            </div>
            <div className="flex items-center text-sm">
              <span className="w-3 h-3 rounded-full bg-green-400 mr-1"></span>
              <span className="text-white mr-3">Academic</span>
              <span className="w-3 h-3 rounded-full bg-orange-400 mr-1"></span>
              <span className="text-white">General</span>
            </div>
          </div>
        </div>

        {/* Add Event Button */}
        {role === 'authority' && (
          <div className="flex justify-end p-4">
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700 transition"
            >
              ➕ Add Event
            </button>
          </div>
        )}

        {/* Calendar */}
        <div className="p-4 md:p-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <BigCalendar
              localizer={localizer}
              events={events}
              view={currentView}
              date={currentDate}
              onView={setCurrentView}
              onNavigate={(date) => setCurrentDate(date)}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '70vh' }}
              components={{
                toolbar: CustomToolbar,
                month: { header: customDayHeader },
                week: { header: customDayHeader },
                day: { header: customDayHeader },
              }}
              eventPropGetter={eventStyleGetter}
              onSelectEvent={setSelectedEvent}
              titleAccessor={(event) => (
                <div className="truncate">{getEventIcon(event.category)} {event.title}</div>
              )}
            />
          )}
        </div>
      </div>

      {/* View Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl border border-gray-200 relative">
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100"
            >
              <FaTimes className="text-gray-500" />
            </button>
            <div className="flex items-start mb-4">
              <div className={`p-2 rounded-lg mr-3 ${selectedEvent.isAcademic ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                {getEventIcon(selectedEvent.category)}
              </div>
              <div>
                <h3 className="text-xl font-semibold">{selectedEvent.title}</h3>
                <p className="text-sm text-gray-500">
                  {moment(selectedEvent.start).format('MMMM D, YYYY')}
                  {selectedEvent.start.getHours() > 0 && ` • ${moment(selectedEvent.start).format('h:mm A')} - ${moment(selectedEvent.end).format('h:mm A')}`}
                </p>
              </div>
            </div>
            {selectedEvent.description && (
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-gray-700">{selectedEvent.description}</p>
              </div>
            )}
            <div className="flex justify-end">
              <button onClick={() => setSelectedEvent(null)} className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Event Form Modal */}
      {showForm && (
        <EventForm
          onClose={() => setShowForm(false)}
          onSave={handleSaveEvent}
        />
      )}
    </div>
  );
};

export default Calendar;
