module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('solicitations', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      address: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      cpf: {
        type: Sequelize.STRING(11),
        allowNull: false,
      },
      avatar_id: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'files',
            schema: 'public',
          },
          key: 'id',
        },
        onDelete: 'set null',
        onUpdate: 'cascade',
        allowNull: false,
      },
      certified_id: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'files',
            schema: 'public',
          },
          key: 'id',
        },
        onDelete: 'set null',
        onUpdate: 'cascade',
        allowNull: false,
      },
      rg_id: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'files',
            schema: 'public',
          },
          key: 'id',
        },
        onDelete: 'set null',
        onUpdate: 'cascade',
        allowNull: false,
      },
      work_location: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      password_hash: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('solicitations');
  },
};
