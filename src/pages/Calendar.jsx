import React, { useState, useEffect } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { supabase } from '../supabaseClient';
import { FaCalendarAlt, FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa';
import { FiCalendar, FiBook, FiAward, FiSun } from 'react-icons/fi';
import EventForm from '../components/EventForm'; // Adjust path if needed
import { showInstantNotification } from "../utils/notify";

const localizer = momentLocalizer(moment);

const Calendar = ({ role }) => {
  const [events, setEvents] = useState([]);
  const [currentView, setCurrentView] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const setupNotificationSubscription = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const currentUserId = userData?.user?.id;

      const subscription = supabase
        .channel("calendar-events-channel")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "calendar_events",
          },
          (payload) => {
            const newEvent = payload.new;

            if (newEvent.created_by !== currentUserId) {
              showInstantNotification(
                "📅 New Calendar Event",
                `"${newEvent.title}" was just added.`
              );
            }
          }
        )
        .subscribe();
    };

    setupNotificationSubscription();

    

    return () => {
      supabase.removeChannel("calendar-events-channel");
    };
  }, []);

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
      const { data: { user } } = await supabase.auth.getUser();
const currentUserId = user?.id;

const { data, error } = await supabase
  .from('calendar_events')
  .select('*')
  .or(`is_public.eq.true,user_id.eq.${currentUserId}`);

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
    // Get the current authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log("Logged in user:", user);
    
    if (authError) throw authError;
    if (!user) throw new Error('No authenticated user');

    // Add the user ID to the event data
    const eventWithUser = {
  ...newEvent,
  created_by: user.id,
  is_public: newEvent.is_personal ? false : true,
  user_id: newEvent.is_personal ? user.id : null,
};


    const { data: insertedEvent, error } = await supabase
  .from('calendar_events')
  .insert([eventWithUser])
  .select()
  .single();

if (error) throw error;

// ✅ Now schedule reminders
  const reminderOffsets = insertedEvent.custom_reminder_offsets ?? [5, 2, 0.0333]; // default values in hours
const dueTime = new Date(`${insertedEvent.date}T${insertedEvent.start_time}`);

const { data: students, error: studentError } = await supabase
  .from("profiles")
  .select("id")
  .neq("role", "authority");

if (studentError) throw studentError;

// ✅ Convert IST to UTC properly
function toUTC(dateStr, timeStr) {
  // Append +05:30 to treat input as IST
  return new Date(`${dateStr}T${timeStr}+05:30`);
}

const dueTimeUTC = toUTC(insertedEvent.date, insertedEvent.start_time);

const notifications = [];

for (const student of students) {
  for (const offset of reminderOffsets) {
    const sendAt = new Date(dueTimeUTC.getTime() - offset * 60 * 60 * 1000);

    // Format time difference nicely
    const roundedOffset = Math.round(offset * 100) / 100; // round to 2 decimals
    let timePhrase = "";

    if (roundedOffset >= 1) {
      const hr = Math.floor(roundedOffset);
      timePhrase = `${hr} hour${hr === 1 ? '' : 's'}`;
    } else {
      const mins = Math.round(roundedOffset * 60);
      timePhrase = `${mins} minute${mins === 1 ? '' : 's'}`;
    }

    notifications.push({
      user_id: student.id,
      event_id: insertedEvent.id,
      title: `⏰ Reminder: ${insertedEvent.title}`,
      body: `Due in ${timePhrase}`,
      send_at: sendAt.toISOString(), // Stored in UTC
      sent: false,
      created_at: new Date().toISOString(), // Also in UTC
    });
  }
}

const { error: notificationError } = await supabase
  .from("notifications")
  .insert(notifications);

if (notificationError) throw notificationError;
    setShowForm(false);
    fetchEvents();
  } catch (err) {
    console.error('Error saving event:', err);
    alert('Failed to save event: ' + err.message);
  }
};

const handleUpdateEvent = async (updatedEvent) => {
  try {
    // First, validate we have an ID
    if (!updatedEvent.id) {
      throw new Error('Event ID is missing - cannot update');
    }

    // Get current user to verify ownership
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('No authenticated user');

    // Prepare update data
    const updateData = {
      title: updatedEvent.title,
      description: updatedEvent.description,
      date: updatedEvent.date,
      start_time: updatedEvent.start_time || null, // Handle empty times
      end_time: updatedEvent.end_time || null,
      category: updatedEvent.category,
      semester: updatedEvent.semester,
      event_scope: updatedEvent.event_scope,
      is_public: updatedEvent.is_public,
      reminder_time: updatedEvent.reminder_time || null,
      updated_at: new Date().toISOString() // Track when updated
    };

    // Perform the update with proper error handling
    const { error } = await supabase
      .from('calendar_events')
      .update(updateData)
      .eq('id', updatedEvent.id)
      .eq('created_by', user.id); // Ensure only owner can update

    if (error) throw error;

    // Refresh UI
    setShowForm(false);
    setSelectedEvent(null);
    fetchEvents();
    
  } catch (err) {
    console.error('Update error:', err);
    alert(`Failed to update event: ${err.message}`);
  }
};



const handleDeleteEvent = async (eventId) => {
  const confirmDelete = window.confirm('Are you sure you want to delete this event?');
  if (!confirmDelete) return;

  try {
    const { error } = await supabase.from('calendar_events').delete().eq('id', eventId);
    if (error) throw error;

    setSelectedEvent(null);
    fetchEvents();
  } catch (err) {
    console.error('Delete error:', err);
    alert('Failed to delete event');
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
    const color = event.is_personal ? '#60a5fa' : (event.isAcademic ? '#4ade80' : '#fb923c');

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
              
              <span className="w-3 h-3 rounded-full bg-orange-400 mr-1"></span>
              
              <span className="w-3 h-3 rounded-full bg-green-400 mr-1"></span> Academic
<span className="w-3 h-3 rounded-full bg-orange-400 mr-1"></span> General
<span className="w-3 h-3 rounded-full bg-blue-400 mr-1"></span> Personal

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
            <div className="flex justify-between mt-4">
  {role === 'authority' && (
    <div className="space-x-2">
      <button
        onClick={() => {
          setShowForm(true);
          setShowForm(true);
        }}
        className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Edit
      </button>
      <button
        onClick={() => handleDeleteEvent(selectedEvent.id)}
        className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded hover:bg-red-700"
      >
        Delete
      </button>
    </div>
  )}
  <button
    onClick={() => setSelectedEvent(null)}
    className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
  >
    Close
  </button>
</div>

          </div>
        </div>
      )}

      {/* Add Event Form Modal */}
      {showForm && (
  <EventForm
    onClose={() => {
      setShowForm(false);
      setSelectedEvent(null);
    }}
    onSave={selectedEvent ? handleUpdateEvent : handleSaveEvent}
    initialData={selectedEvent}
    isEditing={!!selectedEvent}
  />
)}

    </div>
  );
};

export default Calendar;
