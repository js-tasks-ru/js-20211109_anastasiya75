export default class SortableTable {
  element;
  subElements = {};

  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = Array.isArray(data) ? data : data.data;
    this.render();
  }

  getArrowBlock(isSortable) {
    if (isSortable) {
      return `
        <span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>`;
    } else {
      return '';
    }
  }

  getHeader(config) {
    return config.map(item => {
      return `
        <div class="sortable-table__cell" data-id=${item.id} data-sortable=${item.sortable} data-order=''>
          <span>${item.title}</span>
          ${this.getArrowBlock(item.sortable)}
        </div>
      `;
    }).join('');
  }

  getBody(data) {
    return data.map(item => {
      return `
        <a href="/products/${item.id}" class="sortable-table__row">
          ${this.getCells(item, this.headerConfig)}
        </a>
      `;
    }).join('');
  }

  getCells(dataItem, config) {
    return config.map(item => {
      if (item.template) {
        return item.template(dataItem[item.id]);
      } else {
        return `<div class="sortable-table__cell">${dataItem[item.id]}</div>`;
      }
    }).join('');
  }

  get template () {
    return `
      <div class="sortable-table">
        <div data-element="header" class="sortable-table__header sortable-table__row">
          ${this.getHeader(this.headerConfig)}
        </div>
        <div data-element="body" class="sortable-table__body">
          ${this.getBody(this.data)}
        </div>
        <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
        <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
          <div>
            <p>No products satisfies your filter criteria</p>
            <button type="button" class="button-primary-outline">Reset all filters</button>
          </div>
        </div>
      </div>
    `;
  }

  sort(field, order) {
    const directions = {
      asc: 1,
      desc: -1
    };
    const direction = directions[order];

    const tableBody = this.element.querySelector('[data-element="body"]');
    const activeColumn = this.element.querySelector(`.sortable-table__cell[data-id="${field}"]`);
    activeColumn.setAttribute('data-order', order);

    const elColumn = this.headerConfig.find(item => item.id === field);

    const arrSorted = [...this.data].sort((a, b) => {
      if (elColumn.sortType === 'string') {
        return direction * a[field].localeCompare(b[field], ['ru', 'en']);
      } else if (elColumn.sortType === 'number') {
        return direction * (a[field] - b[field]);
      } else {
        return this.data;
      }
    });


    tableBody.innerHTML = this.getBody(arrSorted);
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);
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
    this.remove();
    this.element = null;
    this.subElements = {};
  }
}

