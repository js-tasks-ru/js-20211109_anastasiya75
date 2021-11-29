class Tooltip {
  static instance;
  element;

  constructor() {
    if (Tooltip.instance) {
      return Tooltip.instance;
    }
    Tooltip.instance = this;

    const element = document.createElement('div');
    element.innerHTML = `<div class="tooltip" style="top:0;left:0"></div>`;
    this.element = element.firstElementChild;
  }

  onPointerOut = () => {
    if (this.element) {
      this.remove();
    }
  }

  onPointerOver = (event) => {
    const tooltip = event.target.dataset.tooltip;

    if (tooltip) {
      const positionTooltip = {
        top: Math.round(event.clientY + 10),
        left: Math.round(event.clientX + 20),
      };
      this.element.style.cssText = `top: ${positionTooltip.top}px; left: ${positionTooltip.left}px;`;
      this.render(tooltip);
      this.initialize();
    }
  }

  render (text = '') {
    if (this.element) {
      this.element.textContent = text;
    }
  }

  initialize () {
    document.body.append(this.element);
    this.initEventListeners();
  }

  initEventListeners () {
    document.body.addEventListener('pointerout', this.onPointerOut);
    document.body.addEventListener('pointerover', this.onPointerOver);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    document.body.removeEventListener('pointerout', this.onPointerOut);
    document.body.removeEventListener('pointerover', this.onPointerOver);
    this.remove();
    this.element = null;
  }
}

export default Tooltip;
