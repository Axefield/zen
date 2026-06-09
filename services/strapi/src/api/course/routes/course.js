'use strict';

module.exports = {
  routes: [
    { method: 'GET', path: '/courses', handler: 'course.find', config: { auth: false } },
    { method: 'GET', path: '/courses/:id', handler: 'course.findOne', config: { auth: false } },
    { method: 'POST', path: '/courses', handler: 'course.create', config: { auth: { scope: ['api::course.course.create'] } } },
    { method: 'PUT', path: '/courses/:id', handler: 'course.update', config: { auth: { scope: ['api::course.course.update'] } } },
    { method: 'DELETE', path: '/courses/:id', handler: 'course.delete', config: { auth: { scope: ['api::course.course.delete'] } } },
  ],
};
