import { Sequelize, DataTypes } from "sequelize";

const User = (sequelize, DataTypes) => {
  const UserModel = sequelize.define(
    "User",
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {}
  );
  UserModel.associate = function (models) {
    // associations can be defined here
  };
  return UserModel;
};

export default User;