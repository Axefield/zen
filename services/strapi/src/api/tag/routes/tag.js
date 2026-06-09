'use strict';

module.exports = {
  routes: [
    { method: 'GET', path: '/tags', handler: 'tag.find', config: { auth: false } },
    { method: 'GET', path: '/tags/:id', handler: 'tag.findOne', config: { auth: false } },
    { method: 'POST', path: '/tags', handler: 'tag.create', config: { auth: { scope: ['api::tag.tag.create'] } } },
    { method: 'PUT', path: '/tags/:id', handler: 'tag.update', config: { auth: { scope: ['api::tag.tag.update'] } } },
    { method: 'DELETE', path: '/tags/:id', handler: 'tag.delete', config: { auth: { scope: ['api::tag.tag.delete'] } } },
  ],
};
