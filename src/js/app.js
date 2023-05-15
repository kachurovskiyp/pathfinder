import Menu from './components/Menu.js';
import Finder from './components/Finder.js';

const app = {
  initMenu: function() {
    this.menu = new Menu();
  },

  initFinder: function() {
    this.finder = new Finder();
  },

  init: function() {
    // eslint-disable-next-line no-undef
    AOS.init();

    this.initMenu();
    this.initFinder();
  },
};

app.init();
