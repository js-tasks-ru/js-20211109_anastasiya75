class Tooltip {
  static instance;
  element;

  constructor() {
    if (Tooltip.instance) {
      return Tooltip.instance;
    }
    Tooltip.instance = this;
  }

  onPointerOut = () => {
    if (this.element) {
      this.remove();
      document.body.removeEventListener('pointermove', this.onPointerMove);
    }
  }

  onPointerOver = (event) => {
    const tooltip = event.target.dataset.tooltip;

    if (tooltip) {
      this.render(tooltip);
      this.initialize();
      document.body.addEventListener('pointermove', this.onPointerMove);
    }
  }

  onPointerMove = (event) => {
    const positionTooltip = {
      top: Math.round(event.clientY + 10),
      left: Math.round(event.clientX + 20),
    };
    this.element.style.cssText = `top: ${positionTooltip.top}px; left: ${positionTooltip.left}px;`;
  }

  render (text = '') {
    const element = document.createElement('div');
    element.innerHTML = `<div class="tooltip">${text}</div>`;
    this.element = element.firstElementChild;
    document.body.append(this.element);
  }

  initialize () {
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
