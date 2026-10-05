
// V23 DAILY CHALLENGES - Retention, rewards
export class DailyChallenges {
  constructor() {
    this.challenges = [
      { id: 'solve_20', title: 'Solve 20 equations', desc: 'Solve 20 meteors', target: 20, progress: 0, reward: 100, icon: '🎯' },
      { id: 'hard_10', title: 'Hard Mode Master', desc: 'Solve 10 hard equations', target: 10, progress: 0, reward: 150, icon: '🔥' },
      { id: 'no_damage', title: 'Flawless', desc: 'Win a match without taking damage', target: 1, progress: 0, reward: 200, icon: '💎' },
      { id: 'combo_5', title: 'Combo Builder', desc: 'Get a 5x combo', target: 1, progress: 0, reward: 120, icon: '⚡' },
      { id: 'boss_1', title: 'Boss Slayer', desc: 'Defeat 1 boss', target: 1, progress: 0, reward: 250, icon: '👹' }
    ];
    this.load();
  }

  load() {
    const saved = localStorage.getItem('m3sh_daily_challenges');
    const lastDate = localStorage.getItem('m3sh_daily_date');
    const today = new Date().toDateString();
    
    if (saved && lastDate === today) {
      const data = JSON.parse(saved);
      this.challenges = data.challenges || this.challenges;
    } else {
      // New day, reset
      this.challenges.forEach(c => c.progress = 0);
      localStorage.setItem('m3sh_daily_date', today);
      this.save();
    }
  }

  save() {
    localStorage.setItem('m3sh_daily_challenges', JSON.stringify({ challenges: this.challenges, date: new Date().toDateString() }));
  }

  onEvent(event, data) {
    switch(event) {
      case 'meteor_solved':
        this.updateProgress('solve_20', 1);
        if (data.difficulty === 'hard') this.updateProgress('hard_10', 1);
        break;
      case 'combo':
        if (data.combo >= 5) this.updateProgress('combo_5', 1);
        break;
      case 'boss_defeated':
        this.updateProgress('boss_1', 1);
        break;
      case 'match_won':
        if (data.noDamage) this.updateProgress('no_damage', 1);
        break;
    }
  }

  updateProgress(id, amount) {
    const challenge = this.challenges.find(c => c.id === id);
    if (!challenge) return;
    if (challenge.progress >= challenge.target) return; // already completed
    
    challenge.progress = Math.min(challenge.target, challenge.progress + amount);
    this.save();
    
    if (challenge.progress >= challenge.target) {
      this.onCompleted(challenge);
    }
    
    this.render();
  }

  onCompleted(challenge) {
    // Reward
    if (window.state) {
      window.state.coins = (window.state.coins || 0) + challenge.reward;
      if (window.saveSession) window.saveSession();
    }
    
    // Show popup
    const popup = document.createElement('div');
    popup.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#00ff41,#00cc33);color:#000;padding:15px 25px;border-radius:12px;font-family:Orbitron,monospace;font-weight:bold;z-index:100000;animation:challengePop 0.5s ease-out;box-shadow:0 0 30px #00ff41;';
    popup.innerHTML = `${challenge.icon} Challenge Completed! ${challenge.title} +${challenge.reward} coins`;
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 3000);
    
    // Sound
    if (window.Sound) window.Sound.play('challenge_complete');
    
    console.log(`[Daily] Completed ${challenge.id} +${challenge.reward} coins`);
  }

  render() {
    const container = document.getElementById('daily-challenges');
    if (!container) return;
    
    container.innerHTML = '<h3>📅 Daily Challenges</h3>';
    this.challenges.forEach(c => {
      const progress = Math.floor((c.progress / c.target) * 100);
      const completed = c.progress >= c.target;
      const div = document.createElement('div');
      div.style.cssText = `background:${completed?'rgba(0,255,65,0.2)':'rgba(255,255,255,0.1)'};border:1px solid ${completed?'#00ff41':'#666'};padding:10px;margin:5px 0;border-radius:8px;display:flex;justify-content:space-between;align-items:center;`;
      div.innerHTML = `
        <div><span style="font-size:20px">${c.icon}</span> <strong>${c.title}</strong><br><small>${c.desc}</small></div>
        <div style="text-align:right"><div>${c.progress}/${c.target}</div><div style="width:60px;height:8px;background:#333;border-radius:4px;overflow:hidden"><div style="width:${progress}%;height:100%;background:#00ff41"></div></div><small>+${c.reward} coins</small></div>
      `;
      container.appendChild(div);
    });
  }
}

window.DailyChallenges = new DailyChallenges();

const style = document.createElement('style');
style.textContent = `@keyframes challengePop{0%{transform:translateX(-50%) translateY(-20px) scale(0.8);opacity:0}100%{transform:translateX(-50%) translateY(0) scale(1);opacity:1}}`;
document.head.appendChild(style);

console.log('[V23] Daily challenges loaded - 5 challenges, rewards 100-250 coins');
