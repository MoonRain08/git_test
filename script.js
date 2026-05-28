let currentDate = new Date();
let events = {}; // Store events by date

// Load events from browser storage
function loadEvents() {
    const stored = localStorage.getItem('calendarEvents');
    if (stored) {
        events = JSON.parse(stored);
    }
}

// Save events to browser storage
function saveEvents() {
    localStorage.setItem('calendarEvents', JSON.stringify(events));
}

const monthYear = document.getElementById('monthYear');
const calendarDays = document.getElementById('calendarDays');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const eventModal = document.getElementById('eventModal');
const eventInput = document.getElementById('eventInput');
const eventTime = document.getElementById('eventTime');
const addEventBtn = document.getElementById('addEventBtn');
const cancelEventBtn = document.getElementById('cancelEventBtn');
const closeBtn = document.querySelector('.close');
const eventsList = document.getElementById('eventsList');
const eventModalTitle = document.getElementById('eventModalTitle');

let selectedDate = null;

const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

function getDateKey(year, month, day) {
    return `${year}-${month}-${day}`;
}

function getSelectedColor() {
    return document.querySelector('input[name="event-color"]:checked').value;
}

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Update header
    monthYear.textContent = `${months[month]} ${year}`;

    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    // Clear calendar
    calendarDays.innerHTML = '';

    // Add previous month's days
    for (let i = firstDay - 1; i >= 0; i--) {
        const dayElement = createDayElement(daysInPrevMonth - i, 'other-month');
        calendarDays.appendChild(dayElement);
    }

    // Add current month's days
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = createDayElement(day, '');
        
        // Highlight today
        if (year === today.getFullYear() && 
            month === today.getMonth() && 
            day === today.getDate()) {
            dayElement.classList.add('today');
        }

        // Check if day has events
        const dateKey = getDateKey(year, month, day);
        if (events[dateKey] && events[dateKey].length > 0) {
            dayElement.classList.add('has-event');
            const dot = document.createElement('div');
            dot.className = 'event-dot';
            dayElement.appendChild(dot);
        }
        
        calendarDays.appendChild(dayElement);
    }

    // Add next month's days
    const totalCells = calendarDays.children.length;
    const remainingCells = 42 - totalCells; // 6 rows × 7 days
    for (let day = 1; day <= remainingCells; day++) {
        const dayElement = createDayElement(day, 'other-month');
        calendarDays.appendChild(dayElement);
    }
}

function createDayElement(day, className) {
    const dayElement = document.createElement('div');
    dayElement.className = `day ${className}`;
    dayElement.textContent = day;
    dayElement.addEventListener('click', () => {
        if (!className.includes('other-month')) {
            openEventModal(day);
        }
    });
    return dayElement;
}

function openEventModal(day) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    selectedDate = getDateKey(year, month, day);
    
    const dateStr = `${months[month]} ${day}, ${year}`;
    eventModalTitle.textContent = `✨ Events for ${dateStr} ✨`;
    eventInput.value = '';
    eventTime.value = '';
    document.getElementById('color-red').checked = true;
    displayEvents();
    eventModal.style.display = 'block';
}

function closeEventModal() {
    eventModal.style.display = 'none';
    selectedDate = null;
}

function displayEvents() {
    eventsList.innerHTML = '';
    if (selectedDate && events[selectedDate]) {
        events[selectedDate].forEach((event, index) => {
            const eventItem = document.createElement('div');
            eventItem.className = `event-item ${event.color}`;
            
            const timeDisplay = event.time ? `<span class="event-time">${event.time}</span>` : '';
            
            eventItem.innerHTML = `
                <div class="event-item-text">
                    🎀 ${event.name}
                    ${timeDisplay}
                </div>
                <button class="event-delete" onclick="deleteEvent(${index})">✕</button>
            `;
            eventsList.appendChild(eventItem);
        });
    } else {
        eventsList.innerHTML = '<p style="color: #999; text-align: center;">No events yet ✨</p>';
    }
}

function addEvent() {
    const eventText = eventInput.value.trim();
    if (eventText === '') {
        alert('Please enter an event name');
        return;
    }

    const color = getSelectedColor();
    const time = eventTime.value || 'No time set';

    if (!events[selectedDate]) {
        events[selectedDate] = [];
    }
    
    events[selectedDate].push({
        name: eventText,
        time: eventTime.value,
        color: color
    });
    
    saveEvents();
    eventInput.value = '';
    eventTime.value = '';
    displayEvents();
    renderCalendar();
}

function deleteEvent(index) {
    if (events[selectedDate]) {
        events[selectedDate].splice(index, 1);
        if (events[selectedDate].length === 0) {
            delete events[selectedDate];
        }
        saveEvents();
        displayEvents();
        renderCalendar();
    }
}

addEventBtn.addEventListener('click', addEvent);
cancelEventBtn.addEventListener('click', closeEventModal);
closeBtn.addEventListener('click', closeEventModal);

eventInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addEvent();
    }
});

window.addEventListener('click', (e) => {
    if (e.target === eventModal) {
        closeEventModal();
    }
});

prevBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

nextBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

// Initialize
loadEvents();
renderCalendar();
