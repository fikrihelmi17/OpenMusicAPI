/* eslint-disable camelcase */

exports.up = (pgm) => {
  // create songs table
  pgm.createTable('songs', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    title: {
      type: 'TEXT',
      notNull: true,
    },
    year: {
      type: 'INT',
      notNull: true,
    },
    performer: {
      type: 'TEXT',
      notNull: true,
    },
    genre: {
      type: 'TEXT',
      notNull: true,
    },
    duration: {
      type: 'INT',
      notNull: false,
    },
    album_id: {
      type: 'TEXT',
      notNull: false,
    },
  });
};

exports.down = (pgm) => {
  // drop songs table
  pgm.dropTable('songs');
};
