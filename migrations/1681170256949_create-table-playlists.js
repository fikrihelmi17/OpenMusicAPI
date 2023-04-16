/* eslint-disable camelcase */

exports.up = (pgm) => {
  // create playlists table
  pgm.createTable('playlists', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
      notNull: true,
    },
    name: {
      type: 'TEXT',
      notNull: true,
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  });
};

exports.down = (pgm) => {
  // drop playlists table
  pgm.dropTable('playlists');
};
