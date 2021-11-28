export default class SortableTable {
  element;
  subElements = {};

  static sortableCells;

  handleClick = (e) => {
    this.sorted.order = this.sorted.order === 'asc' ? 'desc' : 'asc';
    this.sorted.id = e.currentTarget.getAttribute('data-id');
    this.sort(this.sorted.id, this.sorted.order);
  }

  constructor(headerConfig, {
    data = [],
    sorted = {}
  } = {}) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.sorted = sorted;
    this.render();
  }

  getTableHeader() {
    return `<div data-element="header" class="sortable-table__header sortable-table__row">
      ${this.headerConfig.map(item => this.getHeaderRow(item)).join('')}
    </div>`;
  }

  getHeaderRow({id, title, sortable}) {
    return `
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-order=''>
        <span>${title}</span>
        <span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>
      </div>
    `;
  }

  getTableBody() {
    return `
      <div data-element="body" class="sortable-table__body">
        ${this.getTableRows(this.data)}
      </div>`;
  }

  getTableRows(data) {
    return data.map(item => {
      return `
        <a href="/products/${item.id}" class="sortable-table__row">
          ${this.getTableRow(item)}
        </a>`;
    }).join('');
  }

  getTableRow(item) {
    const cells = this.headerConfig.map(({id, template}) => {
      return {
        id,
        template
      };
    });

    return cells.map(({id, template}) => {
      return template
        ? template(item[id])
        : `<div class="sortable-table__cell">${item[id]}</div>`;
    }).join('');
  }

  getTable() {
    return `
      <div class="sortable-table">
        ${this.getTableHeader()}
        ${this.getTableBody()}
      </div>`;
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTable();
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);
    SortableTable.sortableCells = this.element.querySelectorAll('.sortable-table__cell[data-sortable="true"]');
    const defaultSortedColumn = this.element.querySelector(`.sortable-table__cell[data-id="${this.sorted.id}"]`);
    defaultSortedColumn.setAttribute('data-order', this.sorted.order);
    this.sort(this.sorted.id, this.sorted.order);

    SortableTable.sortableCells.forEach(el => {
      el.addEventListener('click', this.handleClick);
    });
  }

  sort(field, order) {
    const sortedData = this.sortData(field, order);
    const currentColumn = this.element.querySelector(`.sortable-table__cell[data-id="${field}"]`);

    SortableTable.sortableCells.forEach(column => {
      column.dataset.order = '';
    });

    currentColumn.dataset.order = order;
    this.subElements.body.innerHTML = this.getTableRows(sortedData);
  }

  sortData(field, order) {
    const arr = [...this.data];
    const column = this.headerConfig.find(item => item.id === field);
    const { sortType } = column;
    const directions = {
      asc: 1,
      desc: -1
    };
    const direction = directions[order];
    return arr.sort((a, b) => {
      switch (sortType) {
      case 'number':
        return direction * (a[field] - b[field]);
      case 'string':
        return direction * a[field].localeCompare(b[field], ['ru', 'en'], {sensitivity: 'variant', caseFirst: 'upper'});
      default:
        return direction * (a[field] - b[field]);
      }
    });
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }

    return result;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    SortableTable.sortableCells.forEach(el => {
      el.removeEventListener('click', this.handleClick);
    });
    this.remove();
    this.element = null;
    this.subElements = {};
  }
}
