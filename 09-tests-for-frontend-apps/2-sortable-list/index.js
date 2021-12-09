export default class SortableList {
  element;
  subElements = {};
  currentDroppable = null;
  draggingElement = null;
  pointerShift = {}

  onPointerDown = (e) => {
    const element = e.target.closest('.sortable-list__item');
    if (element) {
      if (e.target.closest('[data-grab-handle]')) {
        e.preventDefault();
        this.dragStart(element, e);
        document.addEventListener('pointermove', this.onPointerMove);
        document.addEventListener('pointerup', this.onPointerUp);
      }

      if (e.target.closest('[data-delete-handle]')) {
        e.preventDefault();
        element.remove();
      }
    }
  }

  onPointerMove = () => {
    console.log('move');
  }

  onPointerUp = () => {
    console.log('onPointerUp');
  }

  constructor({ items = [] } = {}) {
    this.items = items;

    this.render();
  }

  render() {
    this.element = document.createElement('ul');
    this.element.className = 'sortable-list';

    for (const item of this.items) {
      item.classList.add('sortable-list__item');
    }

    this.element.append(...this.items);
    this.initEventListeners();
  }

  initEventListeners() {
    this.element.addEventListener('pointerdown', e => {
      this.onPointerDown(e);
    });
  }

  dragStart(element, event) {
    this.draggingElement = element;
    let shiftX = event.clientX - element.getBoundingClientRect().left;
    let shiftY = event.clientY - element.getBoundingClientRect().top;

    this.pointerShift.x = shiftX;
    this.pointerShift.y = shiftY;

    console.log(shiftX, shiftY);

    element.style.position = 'absolute';
    element.style.zIndex = '100';
    document.body.append(element);

    this.moveAt(event.pageX, event.pageY);
  }

  moveAt(pageX, pageY) {
    this.draggingElement.style.left = pageX - this.pointerShift.x + 'px';
    this.draggingElement.style.top = pageY - this.pointerShift.y + 'px';
  }

  removeDocumentEventListeners() {
    document.removeEventListener('pointermove', this.onPointerMove);
    document.removeEventListener('pointerup', this.onPointerUp);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.removeDocumentEventListeners();
    this.remove();
    this.subElements = {};
  }
}
