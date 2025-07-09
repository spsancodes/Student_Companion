// ===== APPLICATION STATE =====
const AppState = {
  timer: {
    timeLeft: 25 * 60, // 25 minutes in seconds
    totalTime: 25 * 60,
    isRunning: false,
    isPaused: false
  },
  sessions: [], // Keep for analytics data
  charts: {
    progressChart: null,
    distributionChart: null,
    weeklyTrendChart: null
  },
  sounds: {
    complete: new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDaH0fPTgjMGH3DU8+GWRwsTYrvn5Z9NEQ1SqeT5tWMaBjmJ0fLKeSoFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDaH0fPTgjMGH3DU8+GWRwsTYrvn5Z9NEQ1SqeT5tWMaBjmJ0fLKeSoFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDaH0fPTgjMGH3DU8+GWRwsTYrvn5Z9NEQ1SqeT5'),
    tick: new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDaH0fPTgjMGH3DU8+GWRwsTYrvn5Z9NEQ1SqeT5tWMaBjmJ0fLKeSoFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDaH0fPTgjMGH3DU8+GWRwsTYrvn5Z9NEQ1SqeT5')
  }
};

// ===== UTILITY FUNCTIONS =====
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}

function saveData() {
  try {
    const dataToSave = {
      sessions: AppState.sessions,
      timer: {
        timeLeft: AppState.timer.timeLeft,
        totalTime: AppState.timer.totalTime
      }
    };
    // Note: In Claude.ai artifacts, we'll store in memory only
    // localStorage would be used in a real environment
    console.log('Data saved to memory:', dataToSave);
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

function loadData() {
  try {
    // In a real environment, this would load from localStorage
    // For now, we'll start with empty data
    console.log('Data loaded from memory');
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

// ===== NOTIFICATION SYSTEM =====
function showNotification(message, type = 'info', duration = 3000) {
  const container = document.getElementById('notificationContainer');
  const notification = document.createElement('div');
  
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <div style="display: flex; justify-content: between; align-items: center;">
      <span>${message}</span>
      <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: inherit; font-size: 1.2rem; cursor: pointer; margin-left: 10px;">&times;</button>
    </div>
  `;
  
  container.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('slide-out');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 300);
  }, duration);
}

function showConfirmModal(title, message, onConfirm) {
  document.getElementById('confirmModalTitle').textContent = title;
  document.getElementById('confirmModalBody').textContent = message;
  
  const confirmBtn = document.getElementById('confirmModalBtn');
  confirmBtn.onclick = () => {
    onConfirm();
    bootstrap.Modal.getInstance(document.getElementById('confirmModal')).hide();
  };
  
  new bootstrap.Modal(document.getElementById('confirmModal')).show();
}

// ===== SOUND SYSTEM =====
function playSound(type) {
  try {
    if (AppState.sounds[type]) {
      AppState.sounds[type].currentTime = 0;
      AppState.sounds[type].play().catch(e => console.log('Sound play failed:', e));
    }
  } catch (error) {
    console.log('Sound error:', error);
  }
}

// ===== POMODORO TIMER =====
let timerInterval = null;

function togglePomodoro() {
  if (AppState.timer.isRunning) {
    pausePomodoro();
  } else {
    startPomodoro();
  }
}

function startPomodoro() {
  AppState.timer.isRunning = true;
  AppState.timer.isPaused = false;
  
  const btn = document.getElementById('pomodoroBtn');
  btn.innerHTML = '⏸️ Pause';
  btn.className = 'btn btn-warning';
  
  updatePomodoroStatus('Focus time! Stay concentrated and avoid distractions.');
  
  timerInterval = setInterval(() => {
    AppState.timer.timeLeft--;
    updateTimerDisplay();
    updateProgressRing();
    
    if (AppState.timer.timeLeft <= 0) {
      completePomodoro();
    }
  }, 1000);
}

function pausePomodoro() {
  AppState.timer.isRunning = false;
  AppState.timer.isPaused = true;
  
  clearInterval(timerInterval);
  
  const btn = document.getElementById('pomodoroBtn');
  btn.innerHTML = '▶️ Resume';
  btn.className = 'btn btn-success';
  
  updatePomodoroStatus('Timer paused. Click Resume when ready to continue.');
}

function resetPomodoro() {
  AppState.timer.isRunning = false;
  AppState.timer.isPaused = false;
  AppState.timer.timeLeft = AppState.timer.totalTime;
  
  clearInterval(timerInterval);
  
  const btn = document.getElementById('pomodoroBtn');
  btn.innerHTML = '▶️ Start';
  btn.className = 'btn btn-success';
  
  updateTimerDisplay();
  updateProgressRing();
  updatePomodoroStatus('Ready to focus! Click Start to begin.');
}

function completePomodoro() {
  clearInterval(timerInterval);
  
  AppState.timer.isRunning = false;
  AppState.timer.isPaused = false;
  
  // Add session data for analytics
  AppState.sessions.push({
    id: generateId(),
    type: 'pomodoro',
    duration: Math.floor(AppState.timer.totalTime / 60),
    completedAt: new Date().toISOString(),
    focusTime: AppState.timer.totalTime
  });
  
  saveData();
  updateStats();
  updateCharts();
  
  // Play completion sound
  playSound('complete');
  
  // Show completion notification
  showNotification('🎉 Pomodoro completed! Great job!', 'success');
  updatePomodoroStatus('Session completed! Take a well-deserved break.');
  
  // Reset for next session
  resetPomodoro();
  
  // Add celebration effect
  const timerCard = document.querySelector('.pomodoro-card');
  if (timerCard) {
    timerCard.classList.add('pulse-animation');
    setTimeout(() => {
      timerCard.classList.remove('pulse-animation');
    }, 2000);
  }
}

function skipTimer() {
  if (AppState.timer.isRunning || AppState.timer.isPaused) {
    showConfirmModal(
      'Skip Timer',
      'Are you sure you want to skip the current session?',
      () => {
        completePomodoro();
        showNotification('Timer skipped!', 'warning');
      }
    );
  }
}

function setTimer(minutes) {
  if (AppState.timer.isRunning) {
    showNotification('Stop the current timer before setting a new one.', 'warning');
    return;
  }
  
  AppState.timer.timeLeft = minutes * 60;
  AppState.timer.totalTime = minutes * 60;
  
  updateTimerDisplay();
  updateProgressRing();
  updatePomodoroStatus(`Timer set to ${minutes} minutes. Ready to start!`);
  
  showNotification(`Timer set to ${minutes} minutes`, 'info');
}

function setCustomTimer() {
  const customMinutes = parseInt(document.getElementById('customMinutes').value);
  
  if (!customMinutes || customMinutes < 1 || customMinutes > 120) {
    showNotification('Please enter a valid time between 1-120 minutes.', 'error');
    return;
  }
  
  setTimer(customMinutes);
  document.getElementById('customMinutes').value = '';
}

function updateTimerDisplay() {
  const display = document.getElementById('timerDisplay');
  const minutes = Math.floor(AppState.timer.timeLeft / 60);
  const seconds = AppState.timer.timeLeft % 60;
  
  display.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  // Update page title
  if (AppState.timer.isRunning) {
    document.title = `${display.textContent} - Student Academic Companion`;
  } else {
    document.title = 'Student Academic Companion';
  }
}

function updateProgressRing() {
  const circle = document.getElementById('progressCircle');
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  
  const progress = (AppState.timer.totalTime - AppState.timer.timeLeft) / AppState.timer.totalTime;
  const offset = circumference - (progress * circumference);
  
  circle.style.strokeDashoffset = offset;
}

function updatePomodoroStatus(message) {
  document.getElementById('pomodoroStatus').textContent = message;
}

// ===== ANALYTICS & CHARTS =====
function initializeCharts() {
  initializeProgressChart();
  initializeDistributionChart();
  initializeWeeklyTrendChart();
}

function initializeProgressChart() {
  const ctx = document.getElementById('progressChart').getContext('2d');
  
  AppState.charts.progressChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'Focus Time (minutes)',
        data: [],
        borderColor: '#4A90E2',
        backgroundColor: 'rgba(74, 144, 226, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#4A90E2',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Daily Focus Time (Last 7 Days)',
          font: {
            size: 16,
            weight: 'bold'
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Minutes'
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      }
    }
  });
}

function initializeDistributionChart() {
  const ctx = document.getElementById('distributionChart').getContext('2d');
  
  AppState.charts.distributionChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['15-min Sessions', '25-min Sessions', '30-min Sessions', '45+ min Sessions'],
      datasets: [{
        data: [0, 0, 0, 0],
        backgroundColor: [
          '#FF6384',
          '#4A90E2',
          '#FFCE56',
          '#4BC0C0'
        ],
        borderWidth: 3,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
        },
        title: {
          display: true,
          text: 'Session Duration Distribution',
          font: {
            size: 16,
            weight: 'bold'
          }
        }
      }
    }
  });
}

function initializeWeeklyTrendChart() {
  const ctx = document.getElementById('weeklyTrendChart').getContext('2d');
  
  AppState.charts.weeklyTrendChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: [],
      datasets: [{
        label: 'Sessions Completed',
        data: [],
        backgroundColor: 'rgba(74, 144, 226, 0.8)',
        borderColor: '#4A90E2',
        borderWidth: 2,
        borderRadius: 5,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: 'Weekly Session Count',
          font: {
            size: 16,
            weight: 'bold'
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Sessions'
          }
        }
      }
    }
  });
}

function updateCharts() {
  updateProgressChart();
  updateDistributionChart();
  updateWeeklyTrendChart();
}

function updateProgressChart() {
  if (!AppState.charts.progressChart) return;
  
  // Generate last 7 days data
  const last7Days = [];
  const focusData = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    last7Days.push(date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    }));
    
    // Calculate focus time for this day
    const dayFocus = AppState.sessions
      .filter(s => s.completedAt && s.completedAt.startsWith(dateStr))
      .reduce((total, session) => total + (session.duration || 0), 0);
    
    focusData.push(dayFocus);
  }
  
  AppState.charts.progressChart.data.labels = last7Days;
  AppState.charts.progressChart.data.datasets[0].data = focusData;
  AppState.charts.progressChart.update('none');
}

function updateDistributionChart() {
  if (!AppState.charts.distributionChart) return;
  
  const sessionCounts = {
    short: 0,    // 15 min
    medium: 0,   // 25 min
    long: 0,     // 30 min
    extended: 0  // 45+ min
  };
  
  AppState.sessions.forEach(session => {
    const duration = session.duration || 0;
    if (duration <= 20) sessionCounts.short++;
    else if (duration <= 27) sessionCounts.medium++;
    else if (duration <= 35) sessionCounts.long++;
    else sessionCounts.extended++;
  });
  
  AppState.charts.distributionChart.data.datasets[0].data = [
    sessionCounts.short,
    sessionCounts.medium,
    sessionCounts.long,
    sessionCounts.extended
  ];
  AppState.charts.distributionChart.update('none');
}

function updateWeeklyTrendChart() {
  if (!AppState.charts.weeklyTrendChart) return;
  
  // Generate last 7 days data
  const last7Days = [];
  const sessionData = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    last7Days.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
    
    // Count sessions for this day
    const daySessions = AppState.sessions
      .filter(s => s.completedAt && s.completedAt.startsWith(dateStr))
      .length;
    
    sessionData.push(daySessions);
  }
  
  AppState.charts.weeklyTrendChart.data.labels = last7Days;
  AppState.charts.weeklyTrendChart.data.datasets[0].data = sessionData;
  AppState.charts.weeklyTrendChart.update('none');
}

// ===== STATISTICS =====
function updateStats() {
  updateTotalSessions();
  updateTotalFocusTime();
  updateAverageSession();
  updateTodayFocus();
}

function updateTotalSessions() {
  const total = AppState.sessions.length;
  document.getElementById('totalSessions').textContent = total;
}

function updateTotalFocusTime() {
  const totalMinutes = AppState.sessions.reduce((total, session) => {
    return total + (session.duration || 0);
  }, 0);
  
  const hours = (totalMinutes / 60).toFixed(1);
  document.getElementById('totalFocusTime').textContent = hours;
}

function updateAverageSession() {
  if (AppState.sessions.length === 0) {
    document.getElementById('averageSession').textContent = '0';
    return;
  }
  
  const totalMinutes = AppState.sessions.reduce((total, session) => {
    return total + (session.duration || 0);
  }, 0);
  
  const average = Math.round(totalMinutes / AppState.sessions.length);
  document.getElementById('averageSession').textContent = average;
}

function updateTodayFocus() {
  const today = new Date().toISOString().split('T')[0];
  const todayMinutes = AppState.sessions
    .filter(s => s.completedAt && s.completedAt.startsWith(today))
    .reduce((total, session) => total + (session.duration || 0), 0);
  
  document.getElementById('todayFocus').textContent = todayMinutes;
}

// ===== DATA MANAGEMENT =====
function exportProgress() {
  const data = {
    sessions: AppState.sessions,
    exportDate: new Date().toISOString(),
    totalSessions: AppState.sessions.length,
    totalFocusTime: AppState.sessions.reduce((total, session) => total + (session.duration || 0), 0)
  };
  
  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = `pomodoro-data-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  
  showNotification('📊 Data exported successfully!', 'success');
}

function resetProgress() {
  showConfirmModal(
    'Reset All Progress',
    'This will permanently delete all your session data. Are you sure?',
    () => {
      AppState.sessions = [];
      saveData();
      updateStats();
      updateCharts();
      showNotification('🔄 All progress data has been reset!', 'warning');
    }
  );
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
  loadData();
  initializeCharts();
  updateStats();
  updateCharts();
  updateTimerDisplay();
  updateProgressRing();
  
  // Auto-save every 30 seconds
  setInterval(saveData, 30000);
  
  // Handle page visibility change
  document.addEventListener('visibilitychange', function() {
    if (document.hidden && AppState.timer.isRunning) {
      // Page is hidden while timer is running
      console.log('Page hidden, timer continues...');
    } else if (!document.hidden) {
      // Page is visible again
      updateTimerDisplay();
      updateProgressRing();
    }
  });
  
  // Handle beforeunload
  window.addEventListener('beforeunload', function() {
    saveData();
  });
  
  // Initial status
  updatePomodoroStatus('Ready to focus! Click Start to begin.');
  
  console.log('🍅 Student Academic Companion initialized successfully!');
});