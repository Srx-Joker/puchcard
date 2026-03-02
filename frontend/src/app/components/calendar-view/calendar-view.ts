import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api, Subject, PuchCard } from '../../services/api';

@Component({
  selector: 'app-calendar-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calendar-view.html',
  styleUrls: ['./calendar-view.css']
})
export class CalendarView implements OnInit {
  currentYear: number = new Date().getFullYear();
  currentMonth: number = new Date().getMonth() + 1;
  daysInMonth: number[] = [];
  
  activeSubjects: Subject[] = [];
  puchCards: PuchCard[] = [];
  completionStatus: {[key: number]: boolean} = {};

  constructor(private api: Api) {}

  ngOnInit() {
    this.updateDays();
    this.loadData();
  }

  updateDays() {
    const days = new Date(this.currentYear, this.currentMonth, 0).getDate();
    this.daysInMonth = Array.from({ length: days }, (_, i) => i + 1);
  }

  loadData() {
    // 加载启用的打卡项
    this.api.getActiveSubjects().subscribe(subjects => {
      this.activeSubjects = subjects;
    });

    // 加载当月打卡记录
    this.api.getPuchCards(this.currentYear, this.currentMonth).subscribe(cards => {
      this.puchCards = cards;
      this.checkCompletion(); // 加载完打卡记录后，顺便更新一次完成状态
    });
  }

  checkCompletion() {
    this.api.getCompletionStatus(this.currentYear, this.currentMonth).subscribe(status => {
      this.completionStatus = status;
    });
  }

  prevMonth() {
    if (this.currentMonth === 1) {
      this.currentMonth = 12;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.updateDays();
    this.loadData();
  }

  nextMonth() {
    if (this.currentMonth === 12) {
      this.currentMonth = 1;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.updateDays();
    this.loadData();
  }

  isToday(day: number): boolean {
    const today = new Date();
    return today.getFullYear() === this.currentYear && 
           today.getMonth() + 1 === this.currentMonth && 
           today.getDate() === day;
  }

  isFuture(day: number): boolean {
    const today = new Date();
    const date = new Date(this.currentYear, this.currentMonth - 1, day);
    return date > today;
  }

  getPunch(s_id: number, day: number): PuchCard | undefined {
    return this.puchCards.find(c => {
      const d = new Date(c.datetime);
      return c.s_id === s_id && d.getDate() === day;
    });
  }

  isPunched(s_id: number, day: number): boolean {
    return !!this.getPunch(s_id, day);
  }

  togglePunch(s_id: number, day: number, event: any) {
    const checked = event.target.checked;
    if (checked) {
      // Create punch
      const date = new Date(this.currentYear, this.currentMonth - 1, day);
      // Adjust for timezone offset to ensure correct date is sent
      const dateStr = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString();
      
      this.api.createPuchCard(s_id, 1, dateStr).subscribe(newCard => {
        // 如果后端返回了已存在的记录，newCard 可能是旧的。但这里 push 不会去重，虽然显示上没问题（find 只找第一个）。
        if (!this.getPunch(s_id, day)) {
            this.puchCards.push(newCard);
        }
      });
    } else {
      // Cancel punch
      const punch = this.getPunch(s_id, day);
      if (punch) {
        this.api.deletePuchCard(punch.p_id).subscribe(() => {
          this.puchCards = this.puchCards.filter(c => c.p_id !== punch.p_id);
        }, error => {
          console.error('Failed to delete punch', error);
          event.target.checked = true; // Revert if failed
        });
      } else {
        // Should not happen if UI is consistent
        console.warn('Punch not found for deletion');
      }
    }
  }

  isDayComplete(day: number): boolean {
    if (this.activeSubjects.length === 0) return false;
    // Check if every active subject has a punch for this day
    return this.activeSubjects.every(subject => this.isPunched(subject.s_id, day));
  }
}
