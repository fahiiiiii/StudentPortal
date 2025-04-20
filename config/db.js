const {Sequelize} = require('sequelize');
require('dotenv').config()
async function connectDB(){
    try {
        const sequelize = new Sequelize({
            database:process.env.POSTGRES_DB,
            username:process.env.POSTGRES_USER,
            password:process.env.POSTGRES_PASSWORD,
            host:process.env.POSTGRES_HOST,
            port:process.env.POSTGRES_PORT,
            dialect:'postgres',
            logging:console.log
        })
        await sequelize.authenticate();
        console.log('Postgres connected');
        return sequelize;
    } catch (error) {
        console.error('Could not connet to postgres :',error.message)
        process.exit(1);
    }
}
module.exports=connectDB;