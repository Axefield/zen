'use strict';

module.exports = {
  routes: [
    { method: 'GET', path: '/campaigns', handler: 'campaign.find', config: { auth: false } },
    { method: 'GET', path: '/campaigns/:id', handler: 'campaign.findOne', config: { auth: false } },
    { method: 'POST', path: '/campaigns', handler: 'campaign.create', config: { auth: { scope: ['api::campaign.campaign.create'] } } },
    { method: 'PUT', path: '/campaigns/:id', handler: 'campaign.update', config: { auth: { scope: ['api::campaign.campaign.update'] } } },
    { method: 'DELETE', path: '/campaigns/:id', handler: 'campaign.delete', config: { auth: { scope: ['api::campaign.campaign.delete'] } } },
  ],
};
