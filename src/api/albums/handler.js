const autoBind = require('auto-bind');
const config = require('../../utils/config');

class AlbumsHandler {
  constructor(service, albumLikesService, storageService, validator, uploadsValidator) {
    this._service = service;
    this._albumLikesService = albumLikesService;
    this._storageService = storageService;
    this._validator = validator;
    this._uploadsValidator = uploadsValidator;

    autoBind(this);
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);

    const { name, year } = request.payload;

    const id = await this._service.addAlbum({ name, year });

    const response = h.response({
      status: 'success',
      data: {
        albumId: id,
      },
    });

    response.code(201);
    return response;
  }

  async getAlbumByIdHandler(request) {
    const { id } = request.params;
    const album = await this._service.getAlbumById(id);
    const songs = await this._service.getSongsInAlbumDetail(id);
    const songsInAlbumDetail = { ...album, songs };

    return {
      status: 'success',
      data: {
        album: songsInAlbumDetail,
      },
    };
  }

  async putAlbumByIdHandler(request) {
    await this._validator.validateAlbumPayload(request.payload);

    const { id } = request.params;
    await this._service.editAlbumById(id, request.payload);

    return {
      status: 'success',
      message: 'Album berhasil diperbarui',
    };
  }

  async deleteAlbumByIdHandler(request) {
    const { id } = request.params;
    await this._service.deleteAlbumById(id);

    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    };
  }

  async postAlbumLikeHandler(request, h) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._albumLikesService.verifyUserIdAndAlbumId(credentialId, id);
    await this._albumLikesService.verifyAlbumAlreadyLikes(credentialId, id);
    await this._albumLikesService.likeAlbumByUserId(id, credentialId);

    const response = h.response({
      status: 'success',
      message: 'Album telah di-like',
    });
    response.code(201);
    return response;
  }

  async getAlbumLikesHandler(request, h) {
    const { id } = request.params;

    await this._albumLikesService.verifyAlbumId(id);
    const { likes, cache } = await this._albumLikesService.getAlbumLikesByAlbumId(id);

    const response = h.response({
      status: 'success',
      data: {
        likes,
      },
    });

    if (cache) {
      response.header('X-Data-Source', cache);
    }

    return response;
  }

  async deleteAlbumLikeHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._albumLikesService.verifyUserIdAndAlbumId(credentialId, id);
    await this._albumLikesService.unlikeAlbumByUserId(id, credentialId);

    return {
      status: 'success',
      message: 'Album berhasil unlike',
    };
  }

  async postUploadAlbumCoverHandler(request, h) {
    const { cover } = request.payload;
    const { id } = request.params;

    this._uploadsValidator.validateAlbumCoverHeaders(cover.hapi.headers);

    const filename = await this._storageService.writeFile(cover, cover.hapi);
    const fileLocation = `http://${config.app.host}:${config.app.port}/albums/images/${filename}`;

    await this._service.addAlbumCover(id, fileLocation);

    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    });
    response.code(201);
    return response;
  }
}

module.exports = AlbumsHandler;
