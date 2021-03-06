export async function down(queryInterface, DataTypes) {
  await queryInterface.dropTable('Language');
}

export async function up(queryInterface, DataTypes) {
  await queryInterface.createTable('Language', {
    _id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID
    },
    name: {
      allowNull: false,
      type: DataTypes.STRING // 255
    },
    templateId: {
      allowNull: false,
      onDelete: 'CASCADE',
      references: {
        key: '_id',
        model: 'Template'
      },
      type: DataTypes.UUID
    },
    platform: {
      allowNull: false,
      type: DataTypes.STRING
    },
    translations: {
      allowNull: false,
      type: DataTypes.TEXT
    }
  });
  await queryInterface.addIndex('Language', ['templateId', 'name', 'platform']);
}

