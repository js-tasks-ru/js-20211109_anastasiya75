import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  element;
  subElements = {};

  constructor(headerConfig = {}, {
    url = '',
    sorted = {
      id: headerConfig.find(item => item.sortable).id,
      order: 'asc'
    },
  } = {}) {
    this.headerConfig = headerConfig;
    this.url = url;
    this.sorted = sorted;
    this.data = [];
    this.isSortingOnBackend = true;
    this.start = 1;
    this.step = 10;
    this.end = this.start + this.step;

    this.render();
  }

  onSortClick = event => {
    const column = event.target.closest('[data-sortable="true"]');

    const toggleOrder = order => {
      const orders = {
        asc: 'desc',
        desc: 'asc'
      };

      return orders[order];
    };
      //debugger;
    if (column) {
      const { id, order } = column.dataset;
      const newOrder = toggleOrder(order);

      this.sorted = {
        id,
        order: newOrder
      };

      column.dataset.order = newOrder;

      const arrow = column.querySelector('.sortable-table__sort-arrow');
      if (!arrow) {
        column.append(this.subElements.arrow);
      }

      if (this.isSortingOnBackend) {
        this.sortOnServer(id, newOrder);
      }
      this.sortOnClient(id, newOrder);
    }
  };

  onScrollLoadData = async () => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

    if (clientHeight + scrollTop >= scrollHeight - 50) {
      this.start = this.end;
      this.end = this.start + this.step;

      const newData = await this.loadData(this.sorted.id, this.sorted.order, this.start, this.end);
      this.update(newData);
      console.log('scroll', this.data);
    }
  }

  async render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTable();
    const element = wrapper.firstElementChild;

    this.element = element;
    this.subElements = this.getSubElements(element);

    const data = await this.loadData(this.sorted.id, this.sorted.order, this.start, this.end);
    this.data = data;
    console.log('render', this.data);
    this.subElements.body.innerHTML = this.getTableRows(data);

    this.initEventListeners();
  }

  initEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.onSortClick);
    window.addEventListener('scroll', this.onScrollLoadData);
  }

  getTableHeader() {
    return `<div data-element="header" class="sortable-table__header sortable-table__row">
      ${this.headerConfig.map(item => this.getHeaderRow(item)).join('')}
    </div>`;
  }

  getHeaderRow ({id, title, sortable}) {
    const order = this.sorted.id === id ? this.sorted.order : 'asc';

    return `
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-order="${order}">
        <span>${title}</span>
        ${this.getHeaderSortingArrow(id)}
      </div>
    `;
  }

  getHeaderSortingArrow (id) {
    const isOrderExist = this.sorted.id === id ? this.sorted.order : '';

    return isOrderExist
      ? `<span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>`
      : '';
  }

  getTableBody(data = this.data) {
    return `
      <div data-element="body" class="sortable-table__body">
        ${this.getTableRows(data)}
      </div>`;
  }

  getTableRows (data) {
    return data.map(item => `
      <div class="sortable-table__row">
        ${this.getTableRow(item, data)}
      </div>`
    ).join('');
  }

  getTableRow (item) {
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
        ${this.getTableBody(this.data)}
        <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
        <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
          No products
        </div>
      </div>`;
  }

  sortData(id, order) {
    const arr = [...this.data];
    const column = this.headerConfig.find(item => item.id === id);
    const {sortType, customSorting} = column;
    const direction = order === 'asc' ? 1 : -1;

    return arr.sort((a, b) => {
      switch (sortType) {
      case 'number':
        return direction * (a[id] - b[id]);
      case 'string':
        return direction * a[id].localeCompare(b[id], 'ru');
      case 'custom':
        return direction * customSorting(a, b);
      default:
        return direction * (a[id] - b[id]);
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

  update(newData) {
    const rows = document.createElement('div');

    this.data = [...this.data, ...newData];
    rows.innerHTML = this.getTableRows(newData);

    this.subElements.body.append(...rows.childNodes);
  }

  sortOnClient (id, order) {
    //const column = this.element.querySelector(`.sortable-table__cell[data-id="${id}"]`);
    const sortedData = this.sortData(id, order);
    this.update(sortedData);
  }

  async sortOnServer (id, order) {
    const data = await this.loadData(id, order, this.start, this.end);
    this.data = data;
    console.log('sortOnServer', this.data);

    //this.update(data);
    if (data.length) {
      this.element.classList.remove('sortable-table_empty');
      this.subElements.body.innerHTML = this.getTableRows(data);
    } else {
      this.element.classList.add('sortable-table_empty');
    }
  }

  async loadData(id, order, start, end) {
    const apiUrl = new URL(this.url, BACKEND_URL);
    apiUrl.searchParams.set('_sort', id);
    apiUrl.searchParams.set('_order', order);
    apiUrl.searchParams.set('_start', start);
    apiUrl.searchParams.set('_end', end);

    this.element.classList.add('sortable-table_loading');

    const data = await fetchJson(apiUrl);

    this.element.classList.remove('sortable-table_loading');

    if (data.length === 0) {
      return this.element.innerHTML = `<p>По заданному критерию запроса данные отсутствуют</p>`;
    }

    return data;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};
    window.removeEventListener('scroll', this.onScrollLoadData);
  }
}
