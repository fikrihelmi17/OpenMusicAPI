/* eslint-disable camelcase */

exports.up = (pgm) => {
  // create albums table
  pgm.createTable('albums', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    name: {
      type: 'TEXT',
      notNull: true,
    },
    year: {
      type: 'INT',
      notNull: true,
    },
  });
};

exports.down = (pgm) => {
  // drop albums table
  pgm.dropTable('albums');
};
