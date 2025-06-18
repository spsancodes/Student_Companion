import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import TaskForm from '../components/todo/TaskForm';
import TaskList from '../components/todo/TaskList';
import SidebarListSelector from '../components/todo/ListDropdown';
import UndoToast from '../components/todo/UndoToast';

const ToDo = () => {
  const [userId, setUserId] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [lists, setLists] = useState([]);
  const [activeList, setActiveList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [defaultListId, setDefaultListId] = useState(null);
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) setUserId(session.user.id);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!userId) return;
    const fetchLists = async () => {
      const { data, error } = await supabase
        .from('todo_lists')
        .select('*')
        .eq('user_id', userId);

      if (error) return console.error('Error fetching lists:', error);

      const defaultList = data.find(list => list.is_default);
      if (!defaultList) {
        const { data: newList, error: createError } = await supabase
          .from('todo_lists')
          .insert([{ user_id: userId, name: 'My Tasks', is_default: true }])
          .select()
          .single();
        if (createError) return console.error('Error creating default list:', createError);

        setLists([newList]);
        setDefaultListId(newList.id);
        setActiveList(newList.id);
      } else {
        setDefaultListId(defaultList.id);
        setLists(data);
        setActiveList(defaultList.id);
      }
    };
    fetchLists();
  }, [userId]);

  const fetchTasks = async () => {
    if (!userId) return;
    setLoading(true);
    let query = supabase
      .from('todos')
      .select('*')
      .eq('user_id', userId)
      .order('due_date', { ascending: true });
    if (!showAllTasks && activeList) query = query.eq('list_id', activeList);
    const { data, error } = await query;
    if (!error) setTasks(data);
    else console.error('Task fetch error:', error);
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, [activeList, userId, showAllTasks]);

  const handleTaskAdded = () => {
    fetchTasks();
    setShowForm(false);
  };

  const handleTaskComplete = () => {
    fetchTasks();
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <div className={`bg-gray-900 text-white transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-16'} overflow-y-auto overflow-x-hidden`}>
  <div className="p-4 space-y-4">
    {/* Hamburger button - always visible */}
    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="focus:outline-none">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5m-16.5 6h16.5m-16.5 6h16.5" />
      </svg>
    </button>

    {/* Content that should hide when sidebar is closed */}
    {sidebarOpen && (
      <>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-gray-800 w-full py-2 px-3 rounded hover:bg-gray-700 text-sm"
        >
          + Add a task
        </button>

        <div className="pt-4 space-y-2">
          <div
            onClick={() => setShowAllTasks(true)}
            className={`cursor-pointer px-2 py-1 rounded text-sm ${showAllTasks ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
          >
            All tasks
          </div>
          <div
            onClick={() => setShowAllTasks(false)}
            className={`cursor-pointer px-2 py-1 rounded text-sm ${!showAllTasks ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
          >
            By list
          </div>
        </div>

        {!showAllTasks && (
          <SidebarListSelector
            lists={lists}
            setLists={setLists}
            activeList={activeList}
            setActiveList={setActiveList}
            userId={userId}
          />
        )}
      </>
    )}
  </div>
</div>

      {/* Main Panel */}
      <div className="flex-1 p-6 bg-gray-100 overflow-y-auto">
        <div className="max-w-xl mx-auto bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            {showAllTasks ? 'All tasks' : lists.find((l) => l.id === activeList)?.name || 'Tasks'}
          </h2>

          {showForm && (
            <TaskForm
              userId={userId}
              activeList={activeList || defaultListId}
              defaultListId={defaultListId}
              onTaskAdded={handleTaskAdded}
            />
          )}

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !userId ? (
            <p className="text-gray-500">Please log in to view tasks.</p>
          ) : tasks.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-lg text-gray-600">No tasks yet.</p>
              <p className="text-sm text-gray-500">Click the button above to add one.</p>
            </div>
          ) : (
            <TaskList
              userId={userId}
              activeList={activeList}
              tasks={tasks}
              setTasks={setTasks}
              onTaskComplete={handleTaskComplete}
            />
          )}
        </div>
        {showToast && <UndoToast />}
      </div>
    </div>
  );
};

export default ToDo;