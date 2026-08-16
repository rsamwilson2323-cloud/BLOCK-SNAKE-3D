export class UIManager {
  constructor() {
    this.hudLayer = document.getElementById('hud-layer');
    this.startScreen = document.getElementById('start-screen');
    this.pauseScreen = document.getElementById('pause-screen');
    this.gameOverScreen = document.getElementById('game-over-screen');
    this.touchControls = document.getElementById('touch-controls');

    this.scoreEl = document.getElementById('score-display');
    this.highScoreEl = document.getElementById('high-score-display');
    this.sectorEl = document.getElementById('sector-display');
    this.lengthEl = document.getElementById('length-display');

    this.nitroBar = document.getElementById('nitro-bar');
    this.nitroVal = document.getElementById('nitro-val');

    this.jumpBar = document.getElementById('jump-bar');
    this.jumpVal = document.getElementById('jump-val');

    this.buffContainer = document.getElementById('buff-container');
    this.objectiveBanner = document.getElementById('objective-banner');
  }

  setTouchVisible(visible) {
    if (!this.touchControls || !document.body.classList.contains('touch-ui')) return;
    this.touchControls.classList.toggle('hidden', !visible);
  }

  updateHUD(score, highScore, sector, lengthMeters, nitroPct, jumpPct, activeBuffs, objectiveText) {
    this.scoreEl.textContent = String(score).padStart(4, '0');
    this.highScoreEl.textContent = String(highScore).padStart(4, '0');
    this.sectorEl.textContent = String(sector).padStart(2, '0');
    this.lengthEl.textContent = `${lengthMeters}m`;

    if (this.objectiveBanner && objectiveText) {
      this.objectiveBanner.textContent = objectiveText;
    }

    const nitroRounded = Math.floor(nitroPct);
    this.nitroBar.style.width = `${nitroRounded}%`;
    this.nitroVal.textContent = `${nitroRounded}%`;

    const jumpRounded = Math.floor(jumpPct);
    this.jumpBar.style.width = `${jumpRounded}%`;
    this.jumpVal.textContent = jumpRounded >= 100 ? 'READY' : `${jumpRounded}%`;

    this.buffContainer.innerHTML = '';
    for (const buff of activeBuffs) {
      const badge = document.createElement('div');
      badge.className = 'buff-badge';
      badge.textContent = buff;
      this.buffContainer.appendChild(badge);
    }
  }

  showStartScreen() {
    this.startScreen.classList.remove('hidden');
    this.hudLayer.classList.add('hidden');
    this.pauseScreen.classList.add('hidden');
    this.gameOverScreen.classList.add('hidden');
    this.setTouchVisible(false);
  }

  showGameHUD() {
    this.startScreen.classList.add('hidden');
    this.hudLayer.classList.remove('hidden');
    this.pauseScreen.classList.add('hidden');
    this.gameOverScreen.classList.add('hidden');
    this.setTouchVisible(true);
  }

  showPauseScreen() {
    this.pauseScreen.classList.remove('hidden');
    this.setTouchVisible(false);
  }

  hidePauseScreen() {
    this.pauseScreen.classList.add('hidden');
    this.setTouchVisible(true);
  }

  showGameOverScreen(finalScore, highScore, cores, maxLength) {
    document.getElementById('final-score').textContent = finalScore;
    document.getElementById('final-high-score').textContent = highScore;
    document.getElementById('final-cores').textContent = cores;
    document.getElementById('final-length').textContent = `${maxLength}m`;

    this.gameOverScreen.classList.remove('hidden');
    this.setTouchVisible(false);
  }
}
