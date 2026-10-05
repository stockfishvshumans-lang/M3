
// V23 BOSS PHASES - Epic, 3 phases
export class BossPhases {
  constructor() {
    this.phase = 1;
    this.maxPhases = 3;
    this.bossData = null;
  }

  init(bossType = 'mech') {
    this.phase = 1;
    this.bossData = {
      type: bossType,
      hp: 100,
      maxHp: 100,
      phase: 1,
      speed: 1,
      attackPattern: 'single',
      enraged: false
    };
    
    console.log(`[Boss] ${bossType} Phase 1 - HP 100, slow, single meteor`);
    this.onPhaseChange(1);
    return this.bossData;
  }

  onDamage(damage) {
    if (!this.bossData) return null;
    
    this.bossData.hp = Math.max(0, this.bossData.hp - damage);
    const hpPercent = (this.bossData.hp / this.bossData.maxHp) * 100;
    
    // Phase transitions
    if (hpPercent <= 25 && this.phase < 3) {
      this.phase = 3;
      this.bossData.phase = 3;
      this.bossData.speed = 3;
      this.bossData.attackPattern = 'barrage';
      this.bossData.enraged = true;
      this.onPhaseChange(3);
    } else if (hpPercent <= 50 && this.phase < 2) {
      this.phase = 2;
      this.bossData.phase = 2;
      this.bossData.speed = 2;
      this.bossData.attackPattern = 'double';
      this.onPhaseChange(2);
    }
    
    if (this.bossData.hp <= 0) {
      this.onDefeated();
      return null;
    }
    
    return this.bossData;
  }

  onPhaseChange(phase) {
    console.log(`[Boss] Phase ${phase} - ${phase===2?'DOUBLE SPEED':'ENRAGED BARRAGE'}`);
    
    // Visual effects
    const wrapper = document.getElementById('game-wrapper');
    if (wrapper) {
      wrapper.style.animation = 'none';
      wrapper.offsetHeight;
      wrapper.style.animation = phase === 3 ? 'bossEnrage 0.5s ease-out' : 'bossPhase 0.5s ease-out';
    }
    
    // Screen effects
    if (window.ScreenShake) {
      window.ScreenShake.shake(phase === 3 ? 25 : 15, phase === 3 ? 500 : 300);
    }
    
    // Show phase text
    const phaseText = document.createElement('div');
    phaseText.style.cssText = 'position:fixed;top:30%;left:50%;transform:translate(-50%,-50%);font-size:36px;font-weight:bold;color:#ff4444;text-shadow:0 0 20px #ff4444;pointer-events:none;z-index:10000;font-family:Orbitron,monospace;animation:phasePop 1s ease-out;';
    phaseText.textContent = phase === 2 ? 'PHASE 2 - DOUBLE SPEED!' : 'PHASE 3 - ENRAGED!';
    document.body.appendChild(phaseText);
    setTimeout(() => phaseText.remove(), 2000);
    
    // Audio
    if (window.Sound) {
      window.Sound.play(phase === 3 ? 'boss_enrage' : 'boss_phase');
    }
    
    // Update boss appearance
    const bossEl = document.getElementById('boss-sprite');
    if (bossEl) {
      if (phase === 2) bossEl.style.filter = 'hue-rotate(60deg) brightness(1.2)';
      if (phase === 3) bossEl.style.filter = 'hue-rotate(0deg) brightness(1.5) saturate(1.5)';
    }
  }

  onDefeated() {
    console.log('[Boss] DEFEATED!');
    
    // Epic defeat
    if (window.ScreenShake) window.ScreenShake.shake(30, 800);
    if (window.HitStop) window.HitStop.freeze(300);
    
    const defeatText = document.createElement('div');
    defeatText.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);font-size:48px;font-weight:bold;color:#00ff41;text-shadow:0 0 30px #00ff41;pointer-events:none;z-index:10000;font-family:Orbitron,monospace;animation:victoryPop 1s ease-out;';
    defeatText.textContent = 'BOSS DEFEATED!';
    document.body.appendChild(defeatText);
    setTimeout(() => defeatText.remove(), 2000);
    
    if (window.DailyChallenges) window.DailyChallenges.onEvent('boss_defeated', {});
    if (window.state) {
      window.state.coins = (window.state.coins || 0) + 500;
      window.state.bossActive = false;
      window.state.bossData = null;
    }
    
    if (window.Sound) window.Sound.play('boss_defeated');
  }

  getAttackPattern() {
    if (!this.bossData) return { count: 1, speed: 1 };
    
    switch(this.bossData.phase) {
      case 1: return { count: 1, speed: 1, type: 'single' };
      case 2: return { count: 2, speed: 2, type: 'double', delay: 500 };
      case 3: return { count: 3, speed: 3, type: 'barrage', delay: 200 };
      default: return { count: 1, speed: 1 };
    }
  }
}

window.BossPhases = new BossPhases();

const style = document.createElement('style');
style.textContent = `
@keyframes bossPhase{0%{filter:brightness(1)}50%{filter:brightness(1.5)}100%{filter:brightness(1)}}
@keyframes bossEnrage{0%{filter:brightness(1) hue-rotate(0deg)}25%{filter:brightness(2) hue-rotate(90deg)}50%{filter:brightness(1.5) hue-rotate(180deg)}75%{filter:brightness(2) hue-rotate(270deg)}100%{filter:brightness(1.5) hue-rotate(0deg)}}
@keyframes phasePop{0%{transform:translate(-50%,-50%) scale(0.5);opacity:0}50%{transform:translate(-50%,-50%) scale(1.2);opacity:1}100%{transform:translate(-50%,-50%) scale(1);opacity:1}}
@keyframes victoryPop{0%{transform:translate(-50%,-50%) scale(0.3);opacity:0}50%{transform:translate(-50%,-50%) scale(1.3);opacity:1}100%{transform:translate(-50%,-50%) scale(1);opacity:1}}
`;
document.head.appendChild(style);

console.log('[V23] Boss phases loaded - 3 phases, enrage, barrage');
