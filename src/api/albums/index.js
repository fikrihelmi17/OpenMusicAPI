const AlbumsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'albums',
  version: '1.0.0',
  register: async (server, {
    service,
    albumLikesService,
    storageService,
    validator,
    uploadsValidator,
  }) => {
    const albumsHandler = new AlbumsHandler(
      service,
      albumLikesService,
      storageService,
      validator,
      uploadsValidator,
    );
    server.route(routes(albumsHandler));
  },
};
