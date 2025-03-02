const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Kết nối sequelize
const User = require('./User'); // Model User

const Token = sequelize.define(
    'Token',
    {
        userId: {
            type: DataTypes.INTEGER,
            references: {
                model: User, // Tham chiếu đến model User
                key: 'id' // Giả sử key trong model User là 'id'
            },
            allowNull: false
        },
        refreshToken: {
            type: DataTypes.STRING,
            allowNull: false
        },
        expiresAt: {
            type: DataTypes.DATE,
            allowNull: false
        },
        isValid: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    },
    {
        tableName: 'tokens', // Tên bảng trong DB
        timestamps: false // Nếu không cần tự động quản lý createdAt, updatedAt
    }
);

// Quan hệ Token -> User (N-1: Một Token thuộc về một User)
Token.belongsTo(User, { foreignKey: 'userId' });

module.exports = Token;
