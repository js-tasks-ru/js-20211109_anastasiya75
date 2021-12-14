import SortableList from '../2-sortable-list/index.js';
//import SortableList from "../2-sortable-list";

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

  uploadImage = () => {
    const fileInput = document.createElement('input');

    fileInput.type = 'file';
    fileInput.accept = 'image/*';

    fileInput.addEventListener('change', async () => {
      const [file] = fileInput.files;

      if (file) {
        const formData = new FormData();
        const { uploadImage, imageListContainer } = this.subElements;

        formData.append('image', file);

        uploadImage.classList.add('is-loading');
        uploadImage.disabled = true;

        const result = await fetchJson('https://api.imgur.com/3/image', {
          method: 'POST',
          headers: {
            Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
          },
          body: formData,
          referrer: ''
        });

        imageListContainer.append(this.createImageItem(result.data.link, file.name));

        uploadImage.classList.remove('is-loading');
        uploadImage.disabled = false;

        fileInput.remove();
      }
    });

    // must be in body for IE
    fileInput.hidden = true;
    document.body.append(fileInput);

    fileInput.click();
  };

  onSubmit = e => {
    e.preventDefault();

    this.save();
  };

  constructor (productId) {
    this.productId = productId;
  }

  async render () {
    const wrapper = document.createElement('div');
    const categoriesPromise = this.getCategories();

    const productPromise = this.productId
      ? this.getData(this.productId)
      : [this.defaultData];

    const [categoriesData, productResponse] = await Promise.all([categoriesPromise, productPromise]);
    const [productData] = productResponse;
    this.data = productData;
    this.categories = categoriesData;

    if (this.data) {
      wrapper.innerHTML = this.getTemplate(this.data, this.categories);
    } else {
      wrapper.innerHTML = this.getTemplate(this.defaultData, this.categories);
    }

    const element = wrapper.firstElementChild;
    this.element = element;
    this.subElements = this.getSubElements(element);

    this.initListeners();
    if (this.data) {
      this.createImagesList();
    }
    return this.element;
  }

  initListeners() {
    this.subElements.productForm.addEventListener('submit', this.onSubmit);
    this.subElements.uploadImage.addEventListener('click', this.uploadImage);
  }

  getTemplate(data, categories) {
    const {
      title = '',
      description,
      quantity,
      subcategory,
      status,
      price,
      discount
    } = data;

    return `
      <div class="product-form">
      <form data-element="productForm" class="form-grid">
        <div class="form-group form-group__half_left">
          <fieldset>
            <label class="form-label">Название товара</label>
            <input required
              id="title"
              value='${title}'
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
          <div data-element="imageListContainer"></div>
          <button data-element="uploadImage" type="button" class="button-primary-outline">
            <span>Загрузить</span>
          </button>
        </div>
        <div class="form-group form-group__half_left">
          <label class="form-label">Категория</label>
            ${this.createCategoriesSelect(categories, subcategory)}
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

  async getData(id) {
    const urlProduct = new URL('/api/rest/products', BACKEND_URL);
    urlProduct.searchParams.set('id', id);
    return fetchJson(urlProduct);
  }

  async getCategories() {
    const urlCategories = new URL('/api/rest/categories', BACKEND_URL);
    urlCategories.searchParams.set('_sort', 'weight');
    urlCategories.searchParams.set('_refs', 'subcategory');
    return fetchJson(urlCategories);
  }

  createImagesList() {
    const { images } = this.data;
    const items = images.map(item => this.createImageItem(item.url, item.source));

    const sortableList = new SortableList({
      items
    });

    this.subElements.imageListContainer.append(sortableList.element);
  }

  createImageItem(url, source) {
    const wrapper = document.createElement('ul');
    wrapper.innerHTML =
      `<li class="products-edit__imagelist-item sortable-list__item" style="">
        <input type="hidden" name="url" value="${url}">
        <input type="hidden" name="source" value="${source}">
        <span>
          <img src="icon-grab.svg" data-grab-handle alt="grab">
          <img class="sortable-table__cell-img" alt="${source}" src="${url}">
          <span>${source}</span>
        </span>
        <button type="button">
          <img src="icon-trash.svg" data-delete-handle alt="delete">
        </button>
      </li>`;
    return wrapper.firstElementChild;
  }

  createCategoriesSelect(categories, subcategory = '') {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = `<select class="form-control" id="subcategory" name="subcategory"></select>`;

    const select = wrapper.firstElementChild;

    for (const category of categories) {
      for (const child of category.subcategories) {
        select.append(new Option(`${category.title} > ${child.title}`, child.id));
      }
    }
    return select.outerHTML;
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

  async save() {
    const productData = {};
    productData.id = this.productId;
    const fields = Object.keys(this.defaultData).filter(item => item !== 'images');

    for (let item of fields) {
      let field = this.subElements.productForm.querySelector(`[name=${item}]`);
      productData[item] = field.getAttribute('type') === 'number' || field.getAttribute('name') === 'status'
        ? parseInt(field.value) : field.value;
    }

    productData.images = [];
    const imgCollection = this.subElements.imageListContainer.querySelectorAll('.sortable-table__cell-img');

    for (const image of imgCollection) {
      productData.images.push({
        url: image.src,
        source: image.alt
      });
    }
    try {
      const result = await fetchJson(`${BACKEND_URL}/api/rest/products`, {
        method: this.productId ? 'PATCH' : 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      });

      this.dispatchEvent(result.id);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  dispatchEvent (id) {
    const event = this.productId
      ? new CustomEvent('product-updated', { detail: id })
      : new CustomEvent('product-saved');

    this.element.dispatchEvent(event);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = null;
  }
}
