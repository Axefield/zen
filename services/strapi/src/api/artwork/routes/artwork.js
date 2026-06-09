'use strict';

module.exports = {
  routes: [
    { method: 'GET', path: '/artworks', handler: 'artwork.find', config: { auth: false } },
    { method: 'GET', path: '/artworks/:id', handler: 'artwork.findOne', config: { auth: false } },
    { method: 'POST', path: '/artworks', handler: 'artwork.create', config: { auth: { scope: ['api::artwork.artwork.create'] } } },
    { method: 'PUT', path: '/artworks/:id', handler: 'artwork.update', config: { auth: { scope: ['api::artwork.artwork.update'] } } },
    { method: 'DELETE', path: '/artworks/:id', handler: 'artwork.delete', config: { auth: { scope: ['api::artwork.artwork.delete'] } } },
  ],
};
