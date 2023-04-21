const autoBind = require('auto-bind');

class PlaylistsHandler {
  constructor(playlistsService, playlistSongsService, songsService, validator) {
    this._playlistsService = playlistsService;
    this._playlistSongsService = playlistSongsService;
    this._songsService = songsService;
    this._validator = validator;

    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePlaylistPayload(request.payload);

    const { name } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    const id = await this._playlistsService.addPlaylist(name, credentialId);

    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
      data: {
        playlistId: id,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const playlists = await this._playlistsService.getPlaylists(credentialId);

    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistByIdHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner(id, credentialId);
    await this._playlistsService.deletePlaylistById(id);

    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }

  async postSongToPlaylistHandler(request, h) {
    this._validator.validateSongOnPlaylistPayload(request.payload);

    const { id } = request.params;
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistAccess(id, credentialId);
    await this._playlistsService.verifyPlaylistId(id);
    await this._songsService.verifySongId(songId);
    await this._playlistSongsService.addSongOnPlaylist(id, songId, credentialId);

    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
    });
    response.code(201);
    return response;
  }

  async getSongsOnPlaylistHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this._playlistsService.verifyPlaylistAccess(id, credentialId);

    const playlist = await this._playlistsService.getPlaylistById(id);
    const songs = await this._playlistSongsService.getSongsOnPlaylist(id);
    playlist.songs = songs;

    return {
      status: 'success',
      data: {
        playlist,
      },
    };
  }

  async deleteSongOnPlaylistHandler(request) {
    this._validator.validateSongOnPlaylistPayload(request.payload);

    const { id } = request.params;
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistAccess(id, credentialId);
    await this._playlistSongsService.deleteSongOnPlaylist(id, songId, credentialId);

    return {
      status: 'success',
      message: 'Song dalam playlist berhasil dihapus',
    };
  }

  async getActivityByPlaylistIdHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this._playlistsService.verifyPlaylistAccess(id, credentialId);

    const activitites = await this._playlistSongsService.getActivityByPlaylistId(
      id, credentialId,
    );

    return {
      status: 'success',
      data: activitites,
    };
  }
}

module.exports = PlaylistsHandler;
