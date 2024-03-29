const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsService {
  constructor(collaborationsService) {
    this._pool = new Pool();
    this._collaborationsService = collaborationsService;
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this._collaborationsService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }

  async addPlaylist(name, owner) {
    const id = nanoid(16);

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Gagal membuat playlist baru.');
    }

    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    try {
      await this._collaborationsService.verifyAsCollaborator(owner);

      const query = {
        text: `SELECT playlists.id, playlists.name, users.username
                       FROM playlists
                       JOIN collaborations ON collaborations.playlist_id = playlists.id
                       JOIN users ON collaborations.user_id = $1
                       WHERE playlists.owner = users.id
                       ORDER BY playlists.id`,
        values: [owner],
      };
      const result = await this._pool.query(query);
      return result.rows;
    } catch (error) {
      const query = {
        text: `SELECT playlists.id, playlists.name, users.username
                         FROM playlists
                         LEFT JOIN users ON users.id = playlists.owner
                         WHERE users.id = $1`,
        values: [owner],
      };
      const result = await this._pool.query(query);
      return result.rows;
    }
  }

  async getPlaylistById(id) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username
                   FROM playlists
                   LEFT JOIN users ON users.id = playlists.owner
                   WHERE playlists.id = $1`,
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    return result.rows[0];
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal Menghapus Playlist, Playlist tidak ditemukan');
    }
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Resource yang Anda minta tidak ditemukan');
    }

    if (result.rows[0].owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }

    return result.rows;
  }

  async verifyPlaylistId(playlistId) {
    const query = {
      text: 'SELECT id FROM playlists WHERE id = $1',
      values: [playlistId],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
  }
}

module.exports = PlaylistsService;
