const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistSongsService {
  constructor(activitiesService, usersService, collaborationsService) {
    this._pool = new Pool();
    this._activitiesService = activitiesService;
    this._usersService = usersService;
    this._collaborationsService = collaborationsService;
  }

  async verifyPlaylistIdAndSongId(playlistId, songId) {
    const query = {
      text: 'SELECT id FROM playlists WHERE id = $1',
      values: [playlistId],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const query1 = {
      text: 'SELECT id FROM songs WHERE id = $1',
      values: [songId],
    };
    const result1 = await this._pool.query(query1);

    if (!result1.rows.length) {
      throw new NotFoundError('Song tidak ditemukan');
    }
  }

  async addSongOnPlaylist(playlistId, songId, userId) {
    const id = `plsongs-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Song gagal ditambahkan ke playlist');
    }

    await this._activitiesService.addActivity(playlistId, songId, userId, 'add');
  }

  async getSongsOnPlaylist(playlistId) {
    const query = {
      text: `SELECT songs.id, songs.title, songs.performer
                   FROM songs
                   INNER JOIN playlist_songs ON songs.id = playlist_songs.song_id
                   WHERE playlist_songs.playlist_id = $1`,
      values: [playlistId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async deleteSongOnPlaylist(playlistId, songId, userId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal Menghapus Lagu dalam Playlist');
    }

    await this._activitiesService.addActivity(playlistId, songId, userId, 'delete');
  }

  async getActivityByPlaylistId(playlistId, userId) {
    await this._usersService.verifyUserId(userId);

    const data = {
      playlistId,
      activities: [],
    };

    const result = await this._activitiesService.getActivityByPlaylistId(playlistId, userId);

    if (result.length !== 0) {
      result.forEach((row) => {
        if (row.username && row.title && row.action && row.time) {
          data.activities.push({
            username: row.username,
            title: row.title,
            action: row.action,
            time: row.time,
          });
        }
      });
    }
    return data;
  }
}

module.exports = PlaylistSongsService;
