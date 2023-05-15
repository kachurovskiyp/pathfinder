import { select, classNames } from '../settings.js';

class Menu {
  constructor() {
    this.dom = {};

    this.activePage = select.menu.mainPageId;
    this.dom.pages = document.querySelectorAll(select.containerOf.page);

    this.init();
  }

  activatePage(pageId) {
    if(this.activePage !== pageId) {
      this.dom.pages.forEach((page) => {
        page.classList.toggle(classNames.hidden, pageId !== page.getAttribute('data-page'));

        if(pageId == page.getAttribute('data-page')) {
          this.activePage = page.getAttribute('data-page');
        }
      });
    }
  }

  init() {
    this.dom.wrapper = document.querySelector(select.containerOf.menu);

    this.dom.wrapper.addEventListener('click', (event) => {
      event.preventDefault();

      if(event.target.tagName == 'A') {
        this.activatePage(event.target.getAttribute('href').slice(1));
      }
    });
  }

}

export default Menu;