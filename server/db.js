const Sequelize = require('sequelize');

const config = require('./config');

console.log(config.database);
const sequelize = new Sequelize('shooting', 'root', '', {
    host: '127.0.0.1',
    port: '3306',
    dialect: 'mysql',
    logging: false
});

const ID_TYPE = Sequelize.INTEGER;
const TYPES = ['STRING', 'TEXT', 'INTEGER', 'BIGINT', 'DOUBLE', 'DATE', 'BOOLEAN'];

function defineModel(name, attributes) {
    let attrs = {};
    for (const key in attributes) {
        let value = attributes[key];
        if (typeof value === 'object' && value['type']) {
            value.allowNull = value.allowNull || false;
            attrs[key] = value;
        } else {
            attrs[key] = {
                type: value,
                allowNull: false
            };
        }
    }
    attrs.id = {
        type: ID_TYPE,
        primaryKey: true,
        autoIncrement: true
    };
    return sequelize.define(name, attrs, {
        tableName: name,
        timestamps: false
    });
}

let db = {
    defineModel: defineModel,
    sync: () => sequelize.sync()
};

db.ID = ID_TYPE;
for (const type of TYPES) {
    db[type] = Sequelize[type];
}

module.exports = db;
