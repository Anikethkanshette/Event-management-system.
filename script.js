const eventList = document.getElementById('eventList');
const eventForm = document.getElementById('eventForm');
const eventName = document.getElementById('eventName');
const eventDate = document.getElementById('eventDate');
const eventLocation = document.getElementById('eventLocation');
const eventCategory = document.getElementById('eventCategory');
const searchBox = document.getElementById('searchBox');
const sortBy = document.getElementById('sortBy');
const modal = document.getElementById('modal');
const modalDetails = document.getElementById('modalDetails');
const modalClose = document.getElementsByClassName("close")[0];

let events = JSON.parse(localStorage.getItem('events')) || [];
let filterText = '';
let sortField = 'date';

// Animation for card fade-in
function animateCard(el) {
    el.style.opacity = "0";
    el.style.transform = "translateY(40px) scale(0.95)";
    setTimeout(() => {
        el.style.transition = "opacity 0.7s cubic-bezier(.5,1.8,.5,0.8), transform 0.7s cubic-bezier(.5,1.8,.5,0.8)";
        el.style.opacity = "1";
        el.style.transform = "none";
    }, 10);
}

// Modal
function showModal(event) {
    modalDetails.innerHTML = `
        <h2>${event.name}</h2>
        <p><span class="category-tag category-${event.category}">${event.category}</span></p>
        <p><strong>Date:</strong> ${event.date}</p>
        <p><strong>Location:</strong> ${event.location}</p>
    `;
    modal.style.display = "block";
}
modalClose.onclick = function() { modal.style.display = "none"; }
window.onclick = function(event) {
    if (event.target == modal) modal.style.display = "none";
}

// Render
function renderEvents() {
    eventList.innerHTML = '';
    let filtered = events.filter(ev => {
        let s = filterText.toLowerCase();
        return (
            ev.name.toLowerCase().includes(s) ||
            ev.location.toLowerCase().includes(s) ||
            ev.category.toLowerCase().includes(s) ||
            ev.date.includes(s)
        );
    });
    filtered.sort((a, b) => {
        if (sortField === 'date') return a.date.localeCompare(b.date);
        if (sortField === 'name') return a.name.localeCompare(b.name);
        if (sortField === 'location') return a.location.localeCompare(b.location);
        if (sortField === 'category') return a.category.localeCompare(b.category);
        return 0;
    });

    if(filtered.length === 0) {
        eventList.innerHTML = '<li style="text-align:center;color:#fff;font-size:1.1em;opacity:.7;letter-spacing:1px;">No events found.</li>';
        return;
    }

    filtered.forEach((event, idx) => {
        const li = document.createElement('li');
        li.className = 'event-item';
        animateCard(li);

        // For edit mode
        if (event._edit) {
            li.innerHTML = `
                <div class="event-details">
                    <input type="text" class="edit-name" value="${event.name}" />
                    <input type="date" class="edit-date" value="${event.date}" />
                    <input type="text" class="edit-location" value="${event.location}" />
                    <select class="edit-category">
                        <option value="Meeting" ${event.category === "Meeting" ? "selected":""}>Meeting</option>
                        <option value="Birthday" ${event.category === "Birthday" ? "selected":""}>Birthday</option>
                        <option value="Conference" ${event.category === "Conference" ? "selected":""}>Conference</option>
                        <option value="Holiday" ${event.category === "Holiday" ? "selected":""}>Holiday</option>
                        <option value="Other" ${event.category === "Other" ? "selected":""}>Other</option>
                    </select>
                </div>
                <div class="btns">
                    <button class="save-btn">Save</button>
                    <button class="cancel-btn">Cancel</button>
                </div>
            `;
            // Save/Cancel
            li.querySelector('.save-btn').onclick = () => {
                const n = li.querySelector('.edit-name').value.trim();
                const d = li.querySelector('.edit-date').value;
                const l = li.querySelector('.edit-location').value.trim();
                const c = li.querySelector('.edit-category').value;
                if(n && d && l && c) {
                    events[events.indexOf(event)] = { name: n, date: d, location: l, category: c };
                    localStorage.setItem('events', JSON.stringify(events));
                    renderEvents();
                }
            };
            li.querySelector('.cancel-btn').onclick = () => {
                delete event._edit;
                renderEvents();
            };
            eventList.appendChild(li);
            return;
        }

        // Normal card
        const details = document.createElement('div');
        details.className = 'event-details';
        details.innerHTML = `
            <span class="category-tag category-${event.category}">${event.category}</span>
            <strong>${event.name}</strong>
            <span>📅 ${event.date}</span>
            <span>📍 ${event.location}</span>
        `;
        details.onclick = () => showModal(event);

        const btns = document.createElement('div');
        btns.className = 'btns';

        const editBtn = document.createElement('button');
        editBtn.className = 'edit-btn';
        editBtn.textContent = 'Edit';
        editBtn.onclick = (e) => {
            event._edit = true;
            renderEvents();
            e.stopPropagation();
        };

        const delBtn = document.createElement('button');
        delBtn.className = 'delete-btn';
        delBtn.textContent = 'Delete';
        delBtn.onclick = (e) => {
            li.style.transition = "opacity 0.5s, transform 0.5s";
            li.style.opacity = "0";
            li.style.transform = "translateX(80px) scale(0.9) rotateZ(-7deg)";
            setTimeout(() => {
                events.splice(events.indexOf(event), 1);
                localStorage.setItem('events', JSON.stringify(events));
                renderEvents();
            }, 480);
            e.stopPropagation();
        };

        btns.appendChild(editBtn);
        btns.appendChild(delBtn);

        li.appendChild(details);
        li.appendChild(btns);
        eventList.appendChild(li);
    });
}

eventForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const name = eventName.value.trim();
    const date = eventDate.value;
    const location = eventLocation.value.trim();
    const category = eventCategory.value;
    if (name && date && location && category) {
        events.push({ name, date, location, category });
        localStorage.setItem('events', JSON.stringify(events));
        renderEvents();
        eventForm.reset();
        eventCategory.selectedIndex = 0;
    }
});
searchBox.addEventListener('input', function() {
    filterText = this.value;
    renderEvents();
});
sortBy.addEventListener('change', function() {
    sortField = this.value;
    renderEvents();
});
window.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.fade-in').forEach(el => {
        el.style.opacity = '0';
        setTimeout(() => {
            el.style.transition = "opacity 1s, transform 1s";
            el.style.opacity = '1';
            el.style.transform = 'none';
        }, 150);
    });
    renderEvents();
});