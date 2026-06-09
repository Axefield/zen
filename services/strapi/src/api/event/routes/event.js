'use strict';

module.exports = {
  routes: [
    { method: 'GET', path: '/events', handler: 'event.find', config: { auth: false } },
    { method: 'GET', path: '/events/:id', handler: 'event.findOne', config: { auth: false } },
    { method: 'POST', path: '/events', handler: 'event.create', config: { auth: { scope: ['api::event.event.create'] } } },
    { method: 'PUT', path: '/events/:id', handler: 'event.update', config: { auth: { scope: ['api::event.event.update'] } } },
    { method: 'DELETE', path: '/events/:id', handler: 'event.delete', config: { auth: { scope: ['api::event.event.delete'] } } },
  ],
};
