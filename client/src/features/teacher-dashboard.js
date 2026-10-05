
// V23 TEACHER DASHBOARD - Live classroom view
export class TeacherDashboard {
  constructor() {
    this.students = new Map();
    this.isTeacher = false;
    this.classroomId = null;
  }

  init(classroomId, isTeacher = true) {
    this.classroomId = classroomId;
    this.isTeacher = isTeacher;
    
    if (isTeacher) {
      this.renderDashboard();
      console.log(`[Teacher] Dashboard for classroom ${classroomId}`);
    }
  }

  onStudentUpdate(studentId, data) {
    // data: {name, health, score, accuracy, timePerQuestion, currentEquation, status}
    this.students.set(studentId, {
      ...data,
      lastUpdate: Date.now(),
      id: studentId
    });
    
    if (this.isTeacher) {
      this.renderDashboard();
    }
  }

  onStudentJoined(studentId, name) {
    this.students.set(studentId, {
      id: studentId,
      name: name,
      health: 100,
      score: 0,
      accuracy: 100,
      timePerQuestion: 0,
      status: 'playing',
      lastUpdate: Date.now()
    });
    
    if (this.isTeacher) {
      this.showNotification(`${name} joined classroom`);
      this.renderDashboard();
    }
  }

  onStudentLeft(studentId) {
    const student = this.students.get(studentId);
    if (student) {
      this.showNotification(`${student.name} left`);
      this.students.delete(studentId);
      if (this.isTeacher) this.renderDashboard();
    }
  }

  renderDashboard() {
    let container = document.getElementById('teacher-dashboard');
    if (!container) {
      container = document.createElement('div');
      container.id = 'teacher-dashboard';
      container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.95);z-index:20000;overflow:auto;padding:20px;box-sizing:border-box;';
      document.body.appendChild(container);
    }

    const students = Array.from(this.students.values());
    const avgAccuracy = students.length ? (students.reduce((sum, s) => sum + (s.accuracy || 0), 0) / students.length).toFixed(1) : 0;
    const avgScore = students.length ? Math.floor(students.reduce((sum, s) => sum + (s.score || 0), 0) / students.length) : 0;

    container.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
        <h2 style="color:#00e5ff;margin:0">📚 Classroom ${this.classroomId} - Teacher Dashboard</h2>
        <div>
          <button onclick="TeacherDashboard.pauseAll()" style="background:#ffaa00;color:#000;padding:10px 20px;border:none;border-radius:8px;margin-right:10px;cursor:pointer;font-weight:bold">⏸️ Pause All</button>
          <button onclick="TeacherDashboard.resumeAll()" style="background:#00ff41;color:#000;padding:10px 20px;border:none;border-radius:8px;margin-right:10px;cursor:pointer;font-weight:bold">▶️ Resume All</button>
          <button onclick="document.getElementById('teacher-dashboard').remove()" style="background:#ff4444;color:#fff;padding:10px 20px;border:none;border-radius:8px;cursor:pointer;font-weight:bold">✕ Close</button>
        </div>
      </div>
      
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:15px;margin-bottom:20px">
        <div style="background:rgba(0,229,255,0.2);border:1px solid #00e5ff;padding:15px;border-radius:8px;text-align:center">
          <div style="font-size:24px;font-weight:bold;color:#00e5ff">${students.length}</div>
          <div style="color:#ccc">Students Online</div>
        </div>
        <div style="background:rgba(0,255,65,0.2);border:1px solid #00ff41;padding:15px;border-radius:8px;text-align:center">
          <div style="font-size:24px;font-weight:bold;color:#00ff41">${avgAccuracy}%</div>
          <div style="color:#ccc">Avg Accuracy</div>
        </div>
        <div style="background:rgba(255,170,0,0.2);border:1px solid #ffaa00;padding:15px;border-radius:8px;text-align:center">
          <div style="font-size:24px;font-weight:bold;color:#ffaa00">${avgScore}</div>
          <div style="color:#ccc">Avg Score</div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:15px">
        ${students.map(s => `
          <div style="background:rgba(255,255,255,0.1);border:1px solid ${s.health<=0?'#ff4444':s.health<30?'#ffaa00':'#00ff41'};padding:15px;border-radius:8px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
              <strong style="color:#fff;font-size:16px">${s.name}</strong>
              <span style="background:${s.status==='playing'?'#00ff41':s.status==='paused'?'#ffaa00':'#ff4444'};color:#000;padding:2px 8px;border-radius:12px;font-size:10px;font-weight:bold">${s.status?.toUpperCase()||'PLAYING'}</span>
            </div>
            <div style="margin-bottom:8px">
              <div style="display:flex;justify-content:space-between;font-size:12px;color:#ccc"><span>Health</span><span>${s.health}%</span></div>
              <div style="width:100%;height:6px;background:#333;border-radius:3px;overflow:hidden"><div style="width:${s.health}%;height:100%;background:${s.health<30?'#ff4444':s.health<60?'#ffaa00':'#00ff41'}"></div></div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:12px">
              <div><div style="color:#ccc">Score</div><div style="color:#fff;font-weight:bold;font-size:14px">${s.score||0}</div></div>
              <div><div style="color:#ccc">Accuracy</div><div style="color:#fff;font-weight:bold;font-size:14px">${s.accuracy||0}%</div></div>
              <div><div style="color:#ccc">Avg Time</div><div style="color:#fff">${s.timePerQuestion||0}s</div></div>
              <div><div style="color:#ccc">Equation</div><div style="color:#00e5ff;font-family:monospace;font-size:10px">${s.currentEquation||'...'}</div></div>
            </div>
            <div style="margin-top:10px;display:flex;gap:5px">
              <button onclick="TeacherDashboard.helpStudent('${s.id}')" style="flex:1;background:#00e5ff;color:#000;padding:5px;border:none;border-radius:4px;cursor:pointer;font-size:11px">💡 Help</button>
              <button onclick="TeacherDashboard.pauseStudent('${s.id}')" style="flex:1;background:#ffaa00;color:#000;padding:5px;border:none;border-radius:4px;cursor:pointer;font-size:11px">⏸️ Pause</button>
            </div>
          </div>
        `).join('')}
      </div>

      <div style="margin-top:20px;background:rgba(0,229,255,0.1);border:1px solid #00e5ff;padding:15px;border-radius:8px">
        <h4 style="color:#00e5ff;margin:0 0 10px 0">📊 Class Insights</h4>
        <div style="color:#ccc;font-size:13px">
          ${this.generateInsights(students)}
        </div>
      </div>
    `;
  }

  generateInsights(students) {
    if (students.length === 0) return 'No students yet';
    
    const struggling = students.filter(s => (s.accuracy||100) < 60);
    const fast = students.filter(s => (s.timePerQuestion||10) < 3);
    const slow = students.filter(s => (s.timePerQuestion||0) > 10);
    
    let insights = [];
    if (struggling.length > 0) insights.push(`⚠️ ${struggling.length} student(s) struggling (<60% accuracy): ${struggling.map(s=>s.name).join(', ')} - Recommend practice with ${this.guessWeakArea(struggling)}`);
    if (fast.length > 0) insights.push(`⚡ ${fast.length} student(s) very fast (<3s): ${fast.map(s=>s.name).join(', ')} - Consider harder difficulty`);
    if (slow.length > 0) insights.push(`🐢 ${slow.length} student(s) slow (>10s): ${slow.map(s=>s.name).join(', ')} - May need help`);
    if (insights.length === 0) insights.push('✅ All students performing well!');
    
    return insights.map(i => `<div style="margin-bottom:5px">• ${i}</div>`).join('');
  }

  guessWeakArea(students) {
    // Analyze common mistakes - simplified
    return 'negative numbers and division';
  }

  showNotification(text) {
    const notif = document.createElement('div');
    notif.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#00e5ff;color:#000;padding:10px 15px;border-radius:8px;font-weight:bold;z-index:30000;animation:slideIn 0.3s ease-out;';
    notif.textContent = text;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 3000);
  }

  pauseAll() {
    if (window.M3SHSocket) window.M3SHSocket.emit('teacher_command', { room: this.classroomId, command: 'pause_all' });
    this.showNotification('Paused all students');
  }

  resumeAll() {
    if (window.M3SHSocket) window.M3SHSocket.emit('teacher_command', { room: this.classroomId, command: 'resume_all' });
    this.showNotification('Resumed all students');
  }

  helpStudent(id) {
    const student = this.students.get(id);
    if (student) {
      if (window.M3SHSocket) window.M3SHSocket.emit('teacher_command', { room: this.classroomId, command: 'help', target: id });
      this.showNotification(`Sent help to ${student.name}`);
    }
  }

  pauseStudent(id) {
    const student = this.students.get(id);
    if (student) {
      if (window.M3SHSocket) window.M3SHSocket.emit('teacher_command', { room: this.classroomId, command: 'pause', target: id });
      this.showNotification(`Paused ${student.name}`);
    }
  }
}

window.TeacherDashboard = new TeacherDashboard();

const style = document.createElement('style');
style.textContent = `@keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}`;
document.head.appendChild(style);

console.log('[V23] Teacher dashboard loaded - live view, pause/resume, insights');
