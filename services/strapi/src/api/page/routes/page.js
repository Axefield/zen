'use strict';

module.exports = {
  routes: [
    { method: 'GET', path: '/pages', handler: 'page.find', config: { auth: false } },
    { method: 'GET', path: '/pages/:id', handler: 'page.findOne', config: { auth: false } },
    { method: 'POST', path: '/pages', handler: 'page.create', config: { auth: { scope: ['api::page.page.create'] } } },
    { method: 'PUT', path: '/pages/:id', handler: 'page.update', config: { auth: { scope: ['api::page.page.update'] } } },
    { method: 'DELETE', path: '/pages/:id', handler: 'page.delete', config: { auth: { scope: ['api::page.page.delete'] } } },
  ],
};
