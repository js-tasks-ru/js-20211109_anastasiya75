import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  element;
  subElements = {};
  defaultData = {
    title: '',
    description: '',
    quantity: 1,
    subcategory: '',
    status: 1,
    images: [],
    price: 100,
    discount: 0
  };

  constructor (productId) {
    this.productId = productId;
    this.data = [];
  }

  async render () {
    const [data, categories] = await Promise.all([this.productId ? this.getData(this.productId) : [this.defaultData], this.getCategories()]);
    console.log(data, categories);
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate(data, categories);
    const element = wrapper.firstElementChild;
    this.element = element;
    this.subElements = this.getSubElements(element);
  }

  getTemplate (data, categories) {
    const {
      title,
      description,
      quantity,
      subcategory,
      status,
      price,
      discount
    } = this.productId ? data[0] : this.defaultFormData;
    return `
      <div class="product-form">
      <form data-element="productForm" class="form-grid">
        <div class="form-group form-group__half_left">
          <fieldset>
            <label class="form-label">Название товара</label>
            <input required
              id="title"
              value="${title}"
              type="text"
              name="title"
              class="form-control"
              placeholder="Название товара">
          </fieldset>
        </div>
        <div class="form-group form-group__wide">
          <label class="form-label">Описание</label>
          <textarea required
            id="description"
            class="form-control"
            name="description"
            data-element="productDescription"
            placeholder="Описание товара">${description}</textarea>
        </div>
        <div class="form-group form-group__wide">
          <label class="form-label">Фото</label>
          <ul class="sortable-list" data-element="imageListContainer">
            ${this.createImagesList(data[0].images)}
          </ul>
          <button data-element="uploadImage" type="button" class="button-primary-outline">
            <span>Загрузить</span>
          </button>
        </div>
        <div class="form-group form-group__half_left">
          <label class="form-label">Категория</label>
          <select class="form-control" name="category">
            ${this.createCategoriesSelect(categories, subcategory)}
          </select>
        </div>
        <div class="form-group form-group__half_left form-group__two-col">
          <fieldset>
            <label class="form-label">Цена ($)</label>
            <input required
              id="price"
              value="${price}"
              type="number"
              name="price"
              class="form-control"
              placeholder="${this.defaultData.price}">
          </fieldset>
          <fieldset>
            <label class="form-label">Скидка ($)</label>
            <input required
              id="discount"
              value="${discount}"
              type="number"
              name="discount"
              class="form-control"
              placeholder="${this.defaultData.discount}">
          </fieldset>
        </div>
        <div class="form-group form-group__part-half">
          <label class="form-label">Количество</label>
          <input required
            id="quantity"
            value="${quantity}"
            type="number"
            class="form-control"
            name="quantity"
            placeholder="${this.defaultData.quantity}">
        </div>
        <div class="form-group form-group__part-half">
          <label class="form-label">Статус</label>
          <select id="status" class="form-control" name="status">
            <option value="1" ${status === 1 ? 'selected' : ''}>Активен</option>
            <option value="0" ${status === 0 ? 'selected' : ''}>Неактивен</option>
          </select>
        </div>
        <div class="form-buttons">
          <button type="submit" name="save" class="button-primary-outline">
            ${this.productId ? "Сохранить" : "Добавить"} товар
          </button>
        </div>
      </form>
    </div>
    `;
  }

  getData(id) {
    const urlProduct = new URL('/api/rest/products', BACKEND_URL);
    urlProduct.searchParams.set('id', id);
    return fetchJson(urlProduct);
  }

  getCategories() {
    const urlCategories = new URL('/api/rest/categories', BACKEND_URL);
    urlCategories.searchParams.set('_sort', 'weight');
    urlCategories.searchParams.set('_refs', 'subcategory');
    return fetchJson(urlCategories);
  }

  createImagesList(images) {
    return images.map(item => {
      return `
      <li class="products-edit__imagelist-item sortable-list__item" style="">
        <input type="hidden" name="url" value="${item.url}">
        <input type="hidden" name="source" value="${item.source}">
        <span>
          <img src="icon-grab.svg" data-grab-handle="" alt="grab">
          <img class="sortable-table__cell-img" alt="Image" src="${item.url}">
          <span>${item.source}</span>
        </span>
        <button type="button">
          <img src="icon-trash.svg" data-delete-handle="" alt="delete">
        </button>
      </li>`;
    }).join('');
  }

  createCategoriesSelect(categories, subcategory) {
    let list;
    for (let item of categories) {
      for (let subItem of item.subcategories) {
        list += `
          <option value="${item.id}" ${item.id === subcategory ? 'selected' : ''}>${item.title} &gt; ${subItem.title}</option>
        `;
      }
    }

    return list;
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
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};
  }
}

