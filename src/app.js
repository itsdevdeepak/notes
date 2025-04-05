import Notes from './components/Notes.js';
import Note from './components/Note.js';
import Archive from './components/Archives.js';
import Router from './service/router.js';
import Store from './service/store.js';
import Theme from './service/theme.js';

function init() {
  const app = document.querySelector('.app');

  if (!app) throw new Error('Application mount point not found');

  const routes = [
    {
      path: '/',
      component: new Notes(app)
    },
    {
      path: '/archives',
      component: new Archive(app)
    },
    {
      path: '/note/:title',
      component: new Note(app)
    }
  ];

  Store.init({
    notes: [],
    setting: {
      theme: 'System',
      font: 'Sans'
    }
  });

  Router.init(routes);

  Theme.init();
}

window.addEventListener('DOMContentLoaded', init);
