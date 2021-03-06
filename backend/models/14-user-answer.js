export default (sequelize, DataTypes) => {
	const UserAnswer = sequelize.define("UserAnswer", {
    _id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4 // create a default UUIDV4 for each record
    },
    userId: {
      allowNull: false,
      references: {
        key: '_id',
        model: 'User'
      },
      type: DataTypes.UUID
    },
    questionId: {
      allowNull: false,
      references: {
        key: '_id',
        model: 'Question'
      },
      type: DataTypes.UUID
    },
    mcqOptionId: {
      allowNull: true,
      references: {
        key: '_id',
        model: 'McqOption'
      },
      type: DataTypes.UUID,
      defaultValue: null
    },
    opentextAnswerText: {
      allowNull: true,
      type: DataTypes.STRING(1024),
      defaultValue: null
    },
    finishedAt: {
      allowNull: false,
      type: DataTypes.literal('CURRENT_TIMESTAMP(3)'),
      defaultValue: DataTypes.literal('CURRENT_TIMESTAMP(3)'),
    },
  }, {
		freezeTableName: true, // model name equal to table name
    timestamps: false, // enable timestamps
	});

  UserAnswer.associate = (models) => {
    UserAnswer.belongsTo(models.User, {
      foreignKey: 'userId'
    });
    UserAnswer.belongsTo(models.Question, {
      as: 'question',
      foreignKey: 'questionId'
    });
    UserAnswer.belongsTo(models.McqOption, {
      as: 'mcqOption',
      foreignKey: 'mcqOptionId'
    })
  };

  return UserAnswer;
}
