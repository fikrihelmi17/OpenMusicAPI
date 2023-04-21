const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class LikesService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async verifyAlbumId(albumId) {
    const query = {
      text: 'SELECT id FROM albums WHERE id = $1',
      values: [albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }
  }

  async verifyAlbumAlreadyLikes(userId, albumId) {
    const query = {
      text: 'SELECT * FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    if (result.rowCount > 0) {
      throw new InvariantError('Album sudah di-like');
    }
  }

  async verifyUserIdAndAlbumId(userId, albumId) {
    const query1 = {
      text: 'SELECT id FROM users WHERE id = $1',
      values: [userId],
    };

    const result1 = await this._pool.query(query1);

    if (!result1.rows.length) {
      throw new NotFoundError('User tidak ditemukan');
    }

    const query2 = {
      text: 'SELECT id FROM albums WHERE id = $1',
      values: [albumId],
    };

    const result2 = await this._pool.query(query2);

    if (!result2.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }
  }

  async likeAlbumByUserId(albumId, userId) {
    const id = `albumLikes-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
      values: [id, userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Tidak dapat like album');
    }

    await this._cacheService.delete(`albumLikes:${albumId}`);
  }

  async getAlbumLikesByAlbumId(albumId) {
    try {
      const result = await this._cacheService.get(`albumLikes:${albumId}`);

      const data = {
        likes: parseInt(result, 10),
        cache: 'cache',
      };

      return data;
    } catch (error) {
      const query = {
        text: 'SELECT COUNT(*) FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };

      const result = await this._pool.query(query);

      const likes = parseInt(result.rows[0].count, 10);
      await this._cacheService.set(`albumLikes:${albumId}`, likes);

      return { likes };
    }
  }

  async unlikeAlbumByUserId(albumId, userId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal untuk unlike album');
    }

    await this._cacheService.delete(`albumLikes:${albumId}`);
  }
}

module.exports = LikesService;
