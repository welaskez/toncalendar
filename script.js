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
    const eventInput = modalContent.querySelector('#event-date');
    const titleInput = modalContent.querySelector('#event-title');
    const descriptionInput = modalContent.querySelector('#event-description');
    const imageInput = modalContent.querySelector('#event-image');

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
        const date = eventInput.value;
        const start = start.value;
        const end = end.value;
        const title = titleInput.value;
        const description = descriptionInput.value;
        const image = imageInput.value;
        
        if (date && title && description && image && start && end) {
            const eventData = { id: events.length, date, start, end, title, description, image };
            if (!Array.isArray(events)) {
                events = [];
            }
            events.push(eventData);
            closeModal();
            displayEvents();
            saveToLocalStorage();
        } else {
            alert("Please complete all fields.");
        }   
        window.location.reload();  
    })

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
                <input type="date" id="event-date">
                <input type="text" id="event-title" placeholder="Event title">
                <div id="timeInputs">
                    Start: <input type="time" id="start-time" placeholder="Start time"> 
                    End: <input type="time" id="end-time" placeholder="End time">
                </div>
                <textarea id="event-description" placeholder="Event description"></textarea>
                <input type="file" id="event-image">
                <button class="save">Save</button>
                <span class="close">&times;</span>
            `;
            const saveButton = modalContent.querySelector('.save'); 
            saveButton.addEventListener("click", function() {
                const date = document.getElementById('event-date').value;
                const start = modalContent.querySelector('#start-time').value;
                const end = modalContent.querySelector('#end-time').value;
                const title = document.getElementById('event-title').value;
                const description = document.getElementById('event-description').value;
                const imageInput = document.getElementById('event-image');
                const image = imageInput.files[0]
                
                if (date && title && description && image && start && end) {
                    const reader = new FileReader();
                    reader.onload = function() {
                        const eventData = { id: events.length, date, start, end, title, description, image: reader.result };
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
            const eventData = events.filter(event => event.date === date);
            if (eventData && eventData.length > 0) {
                modalContent.innerHTML = ''; 
                eventData.forEach((eventData, index) => {
                    const eventElement = document.createElement('div');
                    eventElement.classList.add('modal-content');
                    if (index > 0) {
                        eventElement.classList.add('additional-event');
                    }
                    eventElement.innerHTML = `
                        <p>Date: ${eventData.date}</p>
                        <p>Start: ${eventData.start}</p>
                        <p>End: ${eventData.end}</p>
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
                    <p>Date: ${date}</p>
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
        events.forEach(eventData => {
            const date = eventData.date;
            const eventDataList = eventData.events;
            if (eventDataList && eventDataList.length > 0) {
                eventDataList.forEach((event, index) => {
                    const modalId = `modal-${date}-${index}`; 
                    let modal = document.getElementById(modalId);
                    if (!modal) {
                        modal = createModal(date, modalId);
                        document.body.appendChild(modal);
                    }
                    const eventElement = document.createElement('div');
                    eventElement.classList.add('modal-content');
                    eventElement.innerHTML = `
                        <p>${event.title}</p>
                        <p>Description: ${event.description}</p>
                        <img src="${event.image}" alt="Event Image">
                        <span class="close">&times;</span>
                    `;
                    modal.appendChild(eventElement);
                });
            }
        });
    }  
    
    function createModal(date, modalId) {
        const modal = document.createElement('div');
        modal.id = modalId;
        modal.classList.add('modal');
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>${date}</h2>
            </div>
        `;
        const closeButton = modal.querySelector('.close');
        closeButton.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        return modal;
    }
        
    function highlightEventDates() {
        const cells = document.querySelectorAll('.calendar-table td');
    
        cells.forEach(cell => {
            const date = cell.dataset.date;
            const eventDataForDate = events.filter(event => event.date === date);
            const numberOfEvents = eventDataForDate.length;
    
            let dotsMarkup = '';
            for (let i = 0; i < numberOfEvents; i++) {
                dotsMarkup += '<span class="event-dot"></span>';
            }
            cell.innerHTML += dotsMarkup;
        });
    }
    highlightEventDates()
});
