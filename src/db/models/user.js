'use strict';
const { DataTypes } = require('sequelize');
const Token = require('./token');
const bcrypt = require('bcrypt');

const sequelize = require('../../config/database');
const AppError = require('../../utils/appError');
const Role = require('./roles');
const Unit = require('./unit');

const User = sequelize.define(
    'User',
    {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(191),
            allowNull: false
        },
        email: {
            type: DataTypes.STRING(191),
            allowNull: false
        },
        address: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        email_verified_at: {
            type: DataTypes.DATE, // Sử dụng DATE thay vì TIMESTAMP
            allowNull: true
        },
        password: {
            type: DataTypes.STRING(191),
            allowNull: false
        },
        confirmPassword: {
            type: DataTypes.VIRTUAL
        },
        avatar: {
            type: DataTypes.STRING(191),
            allowNull: true
        },
        parent_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        type: {
            type: DataTypes.STRING(191),
            allowNull: false
        },
        branch_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        cash_register_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        lang: {
            type: DataTypes.STRING(191),
            allowNull: false
        },
        mode: {
            type: DataTypes.STRING(100),
            allowNull: false,
            defaultValue: 'light'
        },
        plan_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        plan_expire_date: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        plan_requests: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        is_active: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
        user_status: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        remember_token: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        created_at: {
            type: DataTypes.DATE, // Sử dụng DATE thay vì TIMESTAMP
            allowNull: true
        },
        updated_at: {
            type: DataTypes.DATE, // Sử dụng DATE thay vì TIMESTAMP
            allowNull: true
        },
        last_login_at: {
            type: DataTypes.DATE, // Sử dụng DATE thay vì DATETIME
            allowNull: true
        }
    },
    {
        sequelize,
        underscored: true,
        modelName: 'User',
        tableName: 'users', // Chỉ định rõ tên bảng
        timestamps: false, // Tắt tự động quản lý timestamps vì bạn tự quản lý created_at, updated_at

        hooks: {
            beforeCreate: async User => {
                if (User.password.length < 4) {
                    throw new AppError(
                        'Password must be at least 4 characters long',
                        400
                    );
                }
                if (User.password !== User.confirmPassword) {
                    throw new AppError(
                        'Confirm Password does not match Password'
                    );
                }
                const hashedPassword = await bcrypt.hashSync(User.password, 10);
                User.password = hashedPassword;
            },
            beforeUpdate: async User => {
                if (User.changed('password')) {
                    console.log('password : ', User.password);
                    console.log('confirmPassword : ', User.confirmPassword);

                    // Chỉ chạy khi password thay đổi
                    if (User.password !== User.confirmPassword) {
                        throw new AppError(
                            'Confirm Password does not match Password',
                            400
                        );
                    }
                    const hashedPassword = await bcrypt.hash(User.password, 10);
                    User.password = hashedPassword;
                }
            }
        }
    }
);

//khóa ngoại trong bản project là createdBy
User.hasMany(Token, { foreignKey: 'userId' }); //khi báo 1 user có nhiều token , quan hệ 1 nhiều

//khai báo ngược lại mỗi token thuộc về một user (quan hệ nhiều 1)
Token.belongsTo(User, {
    foreignKey: 'userId',
    as: 'userToken'
});

//foreignKey là của bảng Role
User.hasMany(Role, { foreignKey: 'name' }); //khi báo 1 user có nhiều token , quan hệ 1 nhiều

//khai báo ngược lại mỗi Role thuộc về một user (quan hệ nhiều 1)
//foreignKey là của bảng Role
Role.belongsTo(User, {
    foreignKey: 'name',
    as: 'Role_user'
});

//khóa ngoại trong bản Unit là created_by
User.hasMany(Unit, { foreignKey: 'created_by' }); //khi báo 1 user có nhiều token , quan hệ 1 nhiều

module.exports = User;
