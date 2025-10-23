class CalendarWidget {
    constructor() {
        this.currentDate = new Date();
        this.today = new Date();
        this.events = this.loadEvents();
        this.init();
    }

    init() {
        this.createCalendar();
        this.addStyles();
        this.bindEvents();
        this.render();
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .calendar-widget {
                position: fixed;
                top: 20px;
                right: 20px;
                width: 320px;
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 16px;
                padding: 16px;
                box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
                z-index: 9997;
                transform: translateY(-100px);
                opacity: 0;
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }

            .calendar-widget.visible {
                transform: translateY(0);
                opacity: 1;
            }

            .calendar-widget.minimized {
                width: 60px;
                height: 60px;
                padding: 8px;
                border-radius: 50%;
            }

            .calendar-widget.minimized .calendar-content {
                display: none;
            }

            .calendar-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 16px;
            }

            .calendar-title {
                font-size: 14px;
                font-weight: 600;
                color: #333;
                margin: 0;
            }

            .calendar-nav {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .nav-btn {
                background: rgba(255, 255, 255, 0.2);
                border: none;
                border-radius: 50%;
                width: 28px;
                height: 28px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s ease;
                color: #333;
            }

            .nav-btn:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: scale(1.05);
            }

            .month-year {
                font-size: 16px;
                font-weight: 600;
                color: #333;
                min-width: 120px;
                text-align: center;
            }

            .calendar-grid {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                gap: 2px;
                margin-bottom: 12px;
            }

            .day-header {
                text-align: center;
                font-size: 11px;
                font-weight: 600;
                color: #666;
                padding: 8px 4px;
            }

            .day-cell {
                aspect-ratio: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.2s ease;
                position: relative;
            }

            .day-cell:hover {
                background: rgba(255, 255, 255, 0.2);
            }

            .day-cell.today {
                background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
                color: white;
                font-weight: 600;
            }

            .day-cell.other-month {
                color: #ccc;
            }

            .day-cell.has-event::after {
                content: '';
                position: absolute;
                bottom: 2px;
                left: 50%;
                transform: translateX(-50%);
                width: 4px;
                height: 4px;
                background: #ff6b6b;
                border-radius: 50%;
            }

            .today-info {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                padding: 12px;
                text-align: center;
            }

            .today-date {
                font-size: 18px;
                font-weight: 600;
                color: #333;
                margin-bottom: 4px;
            }

            .today-day {
                font-size: 12px;
                color: #666;
            }

            .minimize-btn {
                background: none;
                border: none;
                color: #666;
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
                transition: all 0.2s ease;
            }

            .minimize-btn:hover {
                background: rgba(0, 0, 0, 0.1);
                color: #333;
            }

            @media (max-width: 768px) {
                .calendar-widget {
                    width: 280px;
                    top: 10px;
                    right: 10px;
                }
            }

            @media (max-width: 480px) {
                .calendar-widget {
                    width: calc(100vw - 20px);
                    right: 10px;
                    left: 10px;
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    createCalendar() {
        this.calendarElement = document.createElement('div');
        this.calendarElement.className = 'calendar-widget';
        this.calendarElement.innerHTML = `
            <div class="calendar-content">
                <div class="calendar-header">
                    <h3 class="calendar-title">📅 Calendar</h3>
                    <button class="minimize-btn" title="Minimize">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </button>
                </div>
                
                <div class="calendar-nav">
                    <button class="nav-btn prev-month" title="Previous Month">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="15,18 9,12 15,6"></polyline>
                        </svg>
                    </button>
                    <div class="month-year"></div>
                    <button class="nav-btn next-month" title="Next Month">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="9,18 15,12 9,6"></polyline>
                        </svg>
                    </button>
                </div>
                
                <div class="calendar-grid">
                    <div class="day-header">Sun</div>
                    <div class="day-header">Mon</div>
                    <div class="day-header">Tue</div>
                    <div class="day-header">Wed</div>
                    <div class="day-header">Thu</div>
                    <div class="day-header">Fri</div>
                    <div class="day-header">Sat</div>
                </div>
                
                <div class="today-info">
                    <div class="today-date"></div>
                    <div class="today-day"></div>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.calendarElement);
        
        setTimeout(() => {
            this.calendarElement.classList.add('visible');
        }, 200);
    }

    bindEvents() {
        const prevBtn = this.calendarElement.querySelector('.prev-month');
        const nextBtn = this.calendarElement.querySelector('.next-month');
        const minimizeBtn = this.calendarElement.querySelector('.minimize-btn');

        prevBtn.addEventListener('click', () => this.previousMonth());
        nextBtn.addEventListener('click', () => this.nextMonth());
        minimizeBtn.addEventListener('click', () => this.toggleMinimize());
        
        this.calendarElement.addEventListener('click', (e) => {
            if (this.calendarElement.classList.contains('minimized')) {
                this.toggleMinimize();
            }
        });
    }

    render() {
        this.renderMonthYear();
        this.renderDays();
        this.renderTodayInfo();
    }

    renderMonthYear() {
        const monthYear = this.calendarElement.querySelector('.month-year');
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        monthYear.textContent = `${months[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
    }

    renderDays() {
        const grid = this.calendarElement.querySelector('.calendar-grid');
        const existingDays = grid.querySelectorAll('.day-cell');
        existingDays.forEach(day => day.remove());

        const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        for (let i = 0; i < 42; i++) {
            const cellDate = new Date(startDate);
            cellDate.setDate(startDate.getDate() + i);
            
            const dayCell = document.createElement('div');
            dayCell.className = 'day-cell';
            dayCell.textContent = cellDate.getDate();
            
            if (cellDate.getMonth() !== this.currentDate.getMonth()) {
                dayCell.classList.add('other-month');
            }
            
            if (this.isSameDay(cellDate, this.today)) {
                dayCell.classList.add('today');
            }
            
            if (this.hasEvent(cellDate)) {
                dayCell.classList.add('has-event');
            }
            
            grid.appendChild(dayCell);
        }
    }

    renderTodayInfo() {
        const todayDate = this.calendarElement.querySelector('.today-date');
        const todayDay = this.calendarElement.querySelector('.today-day');
        
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        todayDate.textContent = `${months[this.today.getMonth()]} ${this.today.getDate()}`;
        todayDay.textContent = days[this.today.getDay()];
    }

    previousMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.render();
    }

    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.render();
    }

    toggleMinimize() {
        this.calendarElement.classList.toggle('minimized');
    }

    isSameDay(date1, date2) {
        return date1.getDate() === date2.getDate() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getFullYear() === date2.getFullYear();
    }

    hasEvent(date) {
        return this.events.some(event => this.isSameDay(new Date(event.date), date));
    }

    loadEvents() {
        return [
            { date: '2024-12-25', title: 'Christmas Day' },
            { date: '2024-12-31', title: 'New Year\'s Eve' },
            { date: '2025-01-01', title: 'New Year\'s Day' }
        ];
    }

    destroy() {
        if (this.calendarElement && this.calendarElement.parentNode) {
            this.calendarElement.parentNode.removeChild(this.calendarElement);
        }
    }
}

if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        window.calendarWidget = new CalendarWidget();
    });
}