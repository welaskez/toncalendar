document.addEventListener("DOMContentLoaded", function() {
    const calendarBody = document.getElementById("calendar-body");
    const currentMonthElement = document.querySelector(".current-month");
    const prevMonthButton = document.querySelector(".prev-month");
    const nextMonthButton = document.querySelector(".next-month");
    const addEventButton = document.querySelector(".add-event-button");
    const modal = document.getElementById("myModal");
    const modalContent = document.querySelector('.modal-content');
    const closeButton = modalContent.querySelector('.close');
    const saveButton = modalContent.querySelector('.save');

    let events = [];
    
    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();

    renderCalendar(currentMonth, currentYear);

    prevMonthButton.addEventListener("click", function() {
        if (currentMonth === 0) {
            currentMonth = 11;
            currentYear--;
        } else {
            currentMonth--;
        }
        renderCalendar(currentMonth, currentYear);
    });

    nextMonthButton.addEventListener("click", function() {
        if (currentMonth === 11) {
            currentMonth = 0;
            currentYear++;
        } else {
            currentMonth++;
        }
        renderCalendar(currentMonth, currentYear);
    });

    addEventButton.addEventListener("click", function() {
        openModal(true);
    });

    function loadFromLocalStorage() {
        const localStorageData = localStorage.getItem("events");
        if (localStorageData) {
            events = JSON.parse(localStorageData);
            console.log("Data loaded from local storage:", events);
            if (!Array.isArray(events)) {
                events = [];
            }
            displayEvents();
        } else {
            console.log("No data found in local storage.");
        }
    }

    loadFromLocalStorage();

    function saveToLocalStorage() {
        const localStorageData = JSON.stringify(events);
        console.log("Saving to local storage:", localStorageData);
        localStorage.setItem("events", localStorageData);
        console.log("Data saved to local storage successfully.");
    }

    saveButton.addEventListener("click", function() {
        const startDate = document.getElementById('start-date').value;
        const startTime = document.getElementById('start-time').value;
        const endDate = document.getElementById('end-date').value;
        const endTime = document.getElementById('end-time').value;
        const title = document.getElementById('event-title').value;
        const description = document.getElementById('event-description').value;
        const imageInput = document.getElementById('event-image');
        const image = imageInput.files[0];
        
        if (startDate && startTime && endDate && endTime && title && description && image) {
            const eventData = {
                id: events.length,
                date: startDate,
                startTime,
                startDate,
                endTime,
                endDate,
                title,
                description,
                image
            };
            events.push(eventData);
            closeModal();
            displayEvents();
            saveToLocalStorage();
        } else {
            alert("Please complete all fields.");
        }   
    });

    function renderCalendar(month, year) {
        calendarBody.innerHTML = "";
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay();

        currentMonthElement.textContent = getMonthName(month);

        let date = 1;
        for (let i = 0; i < 6; i++) {
            const row = document.createElement("tr");
            for (let j = 0; j < 7; j++) {
                if (i === 0 && j < firstDayOfMonth) {
                    const cell = document.createElement("td");
                    row.appendChild(cell);
                } else if (date > daysInMonth) {
                    break;
                } else {
                    const cell = document.createElement("td");
                    cell.textContent = date;
                    cell.dataset.date = `${year}-${(month + 1).toString().padStart(2, '0')}-${date.toString().padStart(2, '0')}`;
                    row.appendChild(cell);
                    date++;
                }
            }
            calendarBody.appendChild(row);
        }

        const cells = document.querySelectorAll('.calendar-table td');

        cells.forEach(cell => {
            cell.addEventListener('click', () => {
                const date = cell.dataset.date;
                openModal(false, date);
            });
        });
    }

    function getMonthName(monthIndex) {
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        return months[monthIndex];
    }

    closeButton.addEventListener('click', closeModal);

    function openModal(addEvent, date = "") {
        if (addEvent) {
            modalContent.innerHTML = `
                <input type="text" id="event-title" placeholder="Event title">
                <div id="timeInputs">
                    <div id="start">
                        Start: <input type="time" id="start-time" placeholder="Start time"> 
                        <input type="date" id="start-date">
                    </div>
                    <div id="end">
                        End: <input type="time" id="end-time" placeholder="End time">
                        <input type="date" id="end-date">
                    </div>
                </div>
                <textarea id="event-description" placeholder="Event description"></textarea>
                <input type="file" id="event-image">
                <button class="save">Save</button>
                <span class="close">&times;</span>
            `;
            const saveButton = modalContent.querySelector('.save'); 
            saveButton.addEventListener("click", function() {
                const startTime = modalContent.querySelector('#start-time').value;
                const startDate = modalContent.querySelector('#start-date').value;
                const endTime = modalContent.querySelector('#end-time').value;
                const endDate = modalContent.querySelector('#end-date').value;
                const title = document.getElementById('event-title').value;
                const description = document.getElementById('event-description').value;
                const imageInput = document.getElementById('event-image');
                const image = imageInput.files[0]
                
                if (title && description && image && startDate && startTime && endTime && endDate) {
                    const reader = new FileReader();
                    reader.onload = function() {
                        const eventData = { id: events.length, startTime, startDate ,endTime, endDate, title, description, image: reader.result };
                        events.push(eventData);
                        closeModal();
                        displayEvents();
                        saveToLocalStorage()
                    }
                    reader.readAsDataURL(image);
                } else {
                    alert("Please complete all fields.");
                }
                window.location.reload()
            });
        } else {
            const eventData = events.filter(event => event.startDate === date);
            console.log(date)
            if (eventData && eventData.length > 0) {
                modalContent.innerHTML = ''; 
                eventData.forEach((eventData, index) => {
                    const eventElement = document.createElement('div');
                    eventElement.classList.add('modal-content');
                    if (index > 0) {
                        eventElement.classList.add('additional-event');
                    }
                    eventElement.innerHTML = `
                        <p>Start: ${eventData.startTime} ${eventData.startDate}</p>
                        <p>End: ${eventData.endTime} ${eventData.endDate}</p>
                        <p>Title: ${eventData.title}</p>
                        <p class="description">Description: ${eventData.description}</p>
                        <img src="${eventData.image}" alt="Event Image">
                        <span class="close">&times;</span>
                    `;
                    modalContent.appendChild(eventElement); 

                    const closeButton = eventElement.querySelector('.close');
                    closeButton.addEventListener('click', closeModal);
                });
            } else {
                modalContent.innerHTML = `
                    <p>No events for this date</p>
                    <span class="close">&times;</span>
                `;
            }
        }

        const closeButton = modalContent.querySelector('.close');
        closeButton.addEventListener('click', closeModal);
    
        document.body.classList.add('modal-open'); 
        modal.style.display = 'block'; 
    }

    function closeModal() {
        document.body.classList.remove('modal-open'); 
        modal.style.display = "none";
        modalContent.innerHTML = ""; 
    }

    function displayEvents() {
        const modalContent = document.querySelector('.modal-content');
        modalContent.innerHTML = '';
        
        events.forEach(eventData => {
            const eventElement = document.createElement('div');
            eventElement.classList.add('modal-content');
            eventElement.innerHTML = `
                <p>Start: ${eventData.startTime} ${eventData.startDate}</p>
                <p>End: ${eventData.endTime} ${eventData.endDate}</p>
                <p>Title: ${eventData.title}</p>
                <p class="description">Description: ${eventData.description}</p>
                <img src="${eventData.image}" alt="Event Image">
                <span class="close">&times;</span>
            `;
            modalContent.appendChild(eventElement); 
    
            const closeButton = eventElement.querySelector('.close');
            closeButton.addEventListener('click', closeModal);
        });
    }  
    

        
    function highlightEventDates() {
        const cells = document.querySelectorAll('.calendar-table td');
        
        cells.forEach(cell => {
            const date = cell.dataset.date;
            const eventDataForDate = events.filter(event => event.startDate === date);
            const numberOfEvents = eventDataForDate.length;
    
            if (numberOfEvents > 0) {
                const existingContent = cell.innerHTML; 
                cell.innerHTML = `<span class="event-dot">${numberOfEvents}</span>${existingContent}`; 
            }
        });
    }
    highlightEventDates()
});
