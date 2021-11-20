export default class ColumnChart {
  constructor({data = [], label = '', value = 0, link = '', formatHeading = ((data) => data)} = {}) {
    this.data = data;
    this.label = label;
    this.value = value;
    this.link = link;
    this.formatHeading = formatHeading;
    this.chartHeight = 50;
    this.render();
  }

  getTemplate () {
    return `
      <div class="column-chart" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
          Total ${this.label}
          ${this.getLinkBlock()}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">
            ${this.getTitleColumn()}
          </div>
          <div data-element="body" class="column-chart__chart">
            ${this.getChartsBlock(this.data)}
          </div>
        </div>
      </div>
    `;
  }

  getLinkBlock() {
    return this.link ? `<a href=${this.link} class="column-chart__link">View all</a>` : '';
  }

  getTitleColumn() {
    return this.formatHeading(this.value);
  }

  getColumnProps(data) {
    const maxValue = Math.max(...data);
    const scale = 50 / maxValue;

    return data.map(item => {
      return {
        value: String(Math.floor(item * scale)),
        percent: (item / maxValue * 100).toFixed(0) + '%',
      };
    });
  }

  getChartsBlock(data) {
    const columnsProps = this.getColumnProps(data);
    return columnsProps.map(item => {
      return `<div style="--value: ${item.value}" data-tooltip=${item.percent}></div>`;
    }).join('');
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;

    if (this.data.length === 0) {
      element.querySelector(".column-chart").classList.add("column-chart_loading");
    }
  }

  update() {
    this.render();
  }

  remove () {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
