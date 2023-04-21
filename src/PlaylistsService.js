const { Pool } = require('pg');

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
  }

  async getPlaylistById(id) {
    const query1 = {
      text: 'SELECT id, name FROM playlists WHERE id = $1',
      values: [id],
    };

    const query2 = {
      text: `SELECT songs.id, songs.title, songs.performer
        FROM playlist_songs
        JOIN songs ON playlist_songs.song_id = songs.id
        WHERE playlist_songs.playlist_id = $1`,
      values: [id],
    };

    const [{ rows: playlists }, { rows: songs }] = await Promise.all([
      this._pool.query(query1),
      this._pool.query(query2),
    ]);

    return {
      playlist: {
        ...playlists[0],
        songs,
      },
    };
  }
}

module.exports = PlaylistsService;
