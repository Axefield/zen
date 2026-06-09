'use strict';

module.exports = {
  routes: [
    { method: 'GET', path: '/articles', handler: 'article.find', config: { auth: false } },
    { method: 'GET', path: '/articles/:id', handler: 'article.findOne', config: { auth: false } },
    { method: 'POST', path: '/articles', handler: 'article.create', config: { auth: { scope: ['api::article.article.create'] } } },
    { method: 'PUT', path: '/articles/:id', handler: 'article.update', config: { auth: { scope: ['api::article.article.update'] } } },
    { method: 'DELETE', path: '/articles/:id', handler: 'article.delete', config: { auth: { scope: ['api::article.article.delete'] } } },
  ],
};
