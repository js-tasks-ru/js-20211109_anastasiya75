export default class SortableList {
  element;
  subElements = {};
  draggingElement = null;
  placeholder = null;
  pointerShift = {}

  onPointerDown = (e) => {
    const element = e.target.closest('.sortable-list__item');
    if (element) {
      if (e.target.closest('[data-grab-handle]')) {
        e.preventDefault();
        this.drag(element, e);
        document.addEventListener('pointermove', this.onPointerMove);
        document.addEventListener('pointerup', this.onPointerUp);
      }

      if (e.target.closest('[data-delete-handle]')) {
        e.preventDefault();
        element.remove();
      }
    }
  }

  onPointerMove = (e) => {
    this.moveAt(e.pageX, e.pageY);

    const prevElem = this.placeholder.previousElementSibling;
    const nextElem = this.placeholder.nextElementSibling;
    //данное решение с расчетом плейсхолдера заимствовано
    const { firstElementChild, lastElementChild } = this.element;
    const { top: firstElementTop } = firstElementChild.getBoundingClientRect();
    const { bottom } = this.element.getBoundingClientRect();

    if (e.clientY < firstElementTop) {
      return firstElementChild.before(this.placeholder);
    }

    if (e.clientY > bottom) {
      return lastElementChild.after(this.placeholder);
    }

    if (prevElem) {
      const { top, height } = prevElem.getBoundingClientRect();
      const middlePrevElem = top + height / 2;

      if (e.clientY < middlePrevElem) {
        return prevElem.before(this.placeholder);
      }
    }

    if (nextElem) {
      const { top, height } = nextElem.getBoundingClientRect();
      const middleNextElem = top + height / 2;

      if (e.clientY > middleNextElem) {
        return nextElem.after(this.placeholder);
      }
    }
  }

  onPointerUp = (e) => {
    this.drop(e);
    this.removeDocumentEventListeners();
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

  drag(element, event) {
    this.draggingElement = element;
    let shiftX = event.clientX - element.getBoundingClientRect().left;
    let shiftY = event.clientY - element.getBoundingClientRect().top;

    this.pointerShift.x = shiftX;
    this.pointerShift.y = shiftY;
    const { offsetWidth, offsetHeight } = element;
    this.placeholder = document.createElement('li');
    this.placeholder.className = 'sortable-list__placeholder';
    this.placeholder.style.cssText = `width: ${offsetWidth}px; height: ${offsetHeight}px`;
    this.draggingElement.after(this.placeholder);

    this.draggingElement.classList.add("sortable-list__item_dragging");
    this.draggingElement.style.cssText = `width: ${offsetWidth}px; height: ${offsetHeight}px; position: absolute; zIndex: 1000;`;

    this.element.append(this.draggingElement);

    this.moveAt(event.pageX, event.pageY);
  }

  moveAt(pageX, pageY) {
    this.draggingElement.style.left = pageX - this.pointerShift.x + 'px';
    this.draggingElement.style.top = pageY - this.pointerShift.y + 'px';
  }

  drop() {
    this.draggingElement.style.cssText = '';
    this.draggingElement.classList.remove('sortable-list__item_dragging');

    this.placeholder.replaceWith(this.draggingElement);
    this.draggingElement = null;
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
