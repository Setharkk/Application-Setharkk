<template>
  <div class="calendar">
    <div class="calendar-header">
      <h1>Calendrier</h1>
      <div class="header-actions">
        <div class="view-selector">
          <button 
            v-for="view in views" 
            :key="view"
            :class="{ active: currentView === view }"
            @click="currentView = view"
            class="view-button"
          >
            {{ view }}
          </button>
        </div>
        <button class="btn-primary" @click="showNewEventModal = true">
          Nouvel Événement
        </button>
      </div>
    </div>

    <!-- Vue mensuelle -->
    <div v-if="currentView === 'Mois'" class="month-view">
      <div class="month-header">
        <button class="nav-button" @click="previousMonth">&lt;</button>
        <h2>{{ currentMonthName }} {{ currentYear }}</h2>
        <button class="nav-button" @click="nextMonth">&gt;</button>
      </div>
      
      <div class="weekdays">
        <div v-for="day in weekDays" :key="day" class="weekday">{{ day }}</div>
      </div>

      <div class="days-grid">
        <div 
          v-for="day in monthDays" 
          :key="day.date"
          class="day-cell"
          :class="{ 
            'other-month': !day.isCurrentMonth,
            'today': day.isToday
          }"
        >
          <div class="day-number">{{ day.dayNumber }}</div>
          <div class="day-events">
            <div 
              v-for="event in day.events" 
              :key="event.id"
              class="event-pill"
              :class="event.type"
              :title="event.title"
            >
              {{ event.title }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Vue hebdomadaire -->
    <div v-if="currentView === 'Semaine'" class="week-view">
      <div class="week-header">
        <button class="nav-button" @click="previousWeek">&lt;</button>
        <h2>Semaine du {{ currentWeekStart }}</h2>
        <button class="nav-button" @click="nextWeek">&gt;</button>
      </div>

      <div class="week-grid">
        <div class="time-column">
          <div v-for="hour in hours" :key="hour" class="hour-cell">
            {{ hour }}:00
          </div>
        </div>
        <div 
          v-for="day in weekDays" 
          :key="day" 
          class="day-column"
        >
          <div class="day-header">{{ day }}</div>
          <div 
            v-for="hour in hours" 
            :key="hour"
            class="hour-cell"
          >
            <div 
              v-for="event in getEventsForHour(day, hour)" 
              :key="event.id"
              class="event-block"
              :class="event.type"
              :style="{ 
                height: `${event.duration * 60}px`,
                top: `${event.minuteOffset}px`
              }"
            >
              {{ event.title }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal pour nouvel événement -->
    <div v-if="showNewEventModal" class="modal">
      <div class="modal-content">
        <h2>Nouvel Événement</h2>
        <form @submit.prevent="createEvent">
          <div class="form-group">
            <label>Titre</label>
            <input v-model="newEvent.title" type="text" required>
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea v-model="newEvent.description"></textarea>
          </div>
          <div class="form-group">
            <label>Type</label>
            <select v-model="newEvent.type" required>
              <option value="meeting">Réunion</option>
              <option value="task">Tâche</option>
              <option value="reminder">Rappel</option>
            </select>
          </div>
          <div class="form-group">
            <label>Date</label>
            <input v-model="newEvent.date" type="date" required>
          </div>
          <div class="form-group">
            <label>Heure de début</label>
            <input v-model="newEvent.startTime" type="time" required>
          </div>
          <div class="form-group">
            <label>Durée (minutes)</label>
            <input v-model="newEvent.duration" type="number" min="15" step="15" required>
          </div>
          <div class="form-group">
            <label>Participants</label>
            <div class="participants-list">
              <div 
                v-for="member in teamMembers" 
                :key="member.id"
                class="participant-item"
              >
                <input 
                  type="checkbox" 
                  :id="'member-' + member.id"
                  v-model="newEvent.participants"
                  :value="member.id"
                >
                <label :for="'member-' + member.id">
                  <img :src="member.avatar" :alt="member.name" class="avatar">
                  {{ member.name }}
                </label>
              </div>
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-outline" @click="showNewEventModal = false">
              Annuler
            </button>
            <button type="submit" class="btn-primary">
              Créer
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from '@vue/runtime-core'

interface Event {
  id: number
  title: string
  date: string
  time: string
  description: string
}

export default defineComponent({
  name: 'Calendar',
  setup() {
    const events = ref<Event[]>([])
    const newEvent = ref<Event>({
      id: 0,
      title: '',
      date: '',
      time: '',
      description: ''
    })

    // ... existing code ...
  }
})
</script>

<style scoped>
.calendar {
  padding: 20px;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  gap: 15px;
}

.view-selector {
  display: flex;
  gap: 5px;
}

.view-button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}

.view-button.active {
  background: #2196F3;
  color: white;
  border-color: #2196F3;
}

.month-view, .week-view {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.month-header, .week-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.nav-button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-weight: bold;
  margin-bottom: 10px;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: #eee;
}

.day-cell {
  background: white;
  min-height: 100px;
  padding: 5px;
}

.day-cell.other-month {
  background: #f9f9f9;
  color: #999;
}

.day-cell.today {
  background: #e3f2fd;
}

.day-number {
  font-weight: bold;
  margin-bottom: 5px;
}

.day-events {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.event-pill {
  padding: 2px 4px;
  border-radius: 2px;
  font-size: 0.8em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-pill.meeting {
  background: #bbdefb;
  color: #1976d2;
}

.event-pill.task {
  background: #c8e6c9;
  color: #388e3c;
}

.event-pill.reminder {
  background: #ffecb3;
  color: #ffa000;
}

.week-grid {
  display: grid;
  grid-template-columns: 60px repeat(7, 1fr);
  gap: 1px;
  background: #eee;
}

.time-column {
  background: white;
}

.day-column {
  background: white;
}

.hour-cell {
  height: 60px;
  border-bottom: 1px solid #eee;
  padding: 2px;
  position: relative;
}

.event-block {
  position: absolute;
  left: 2px;
  right: 2px;
  padding: 2px;
  font-size: 0.8em;
  border-radius: 2px;
  overflow: hidden;
}

.event-block.meeting {
  background: #bbdefb;
  color: #1976d2;
}

.event-block.task {
  background: #c8e6c9;
  color: #388e3c;
}

.event-block.reminder {
  background: #ffecb3;
  color: #ffa000;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.participants-list {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
}

.participant-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px 0;
}

.participant-item label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.btn-primary {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-outline {
  background: white;
  color: #666;
  border: 1px solid #ddd;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}
</style> 