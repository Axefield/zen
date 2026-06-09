'use strict';

module.exports = {
  routes: [
    { method: 'GET', path: '/faqs', handler: 'faq.find', config: { auth: false } },
    { method: 'GET', path: '/faqs/:id', handler: 'faq.findOne', config: { auth: false } },
    { method: 'POST', path: '/faqs', handler: 'faq.create', config: { auth: { scope: ['api::faq.faq.create'] } } },
    { method: 'PUT', path: '/faqs/:id', handler: 'faq.update', config: { auth: { scope: ['api::faq.faq.update'] } } },
    { method: 'DELETE', path: '/faqs/:id', handler: 'faq.delete', config: { auth: { scope: ['api::faq.faq.delete'] } } },
  ],
};
