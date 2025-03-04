export default class ServicesApi {
  constructor(server, local) {
    this.local = local;
    this.server = server;
  }

  all() {
    return this.server.getServices();
  }

  create(recipeId, data) {
    return this.server.createService(recipeId, data);
  }

  delete(serviceId) {
    return this.server.deleteService(serviceId);
  }

  update(serviceId, data) {
    return this.server.updateService(serviceId, data);
  }

  reorder(data) {
    return this.server.reorderService(data);
  }

  clearCache(serviceId) {
    return this.local.clearCache(serviceId);
  }
}
