const { client, getAllUsers, createUser } = require("./index.js")


const testDB = async () => {
    try {
        console.log("Starting to test database...");

        const users = await getAllUsers()
        console.log("GetAllUsers: =>", users);
        console.log("Finished database tests!");
    } catch(err) {
        console.error("Error testing database!");
        throw err
    } finally {
        client.end();
    }
}

const dropTables = async () => {
    try {
        console.log("Starting to drop tables...");
        await client.query(`DROP TABLE IF EXISTS users;`)
        console.log("Finished dropping tables!");
    } catch(err) {
        console.error("Error dropping tables");
        throw err;
    }
}

const createTables = async () => {
    try {
        console.log("Starting to build tables...");

        await client.query(`
            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                username varchar(255) UNIQUE NOT NULL,
                password varchar(255) NOT NULL
            );
        `)

        console.log("Finished building tables!");
    } catch(err) {
        console.error("Error building tables!");
        throw err
    }
}

const createInitialUsers = async () => {
    try {
        console.log("Starting to create users...");
        const albert = await createUser({username: 'albert', password: 'bertie99'})
        const albertTwo = await createUser({username: 'albert', password: 'imposter_albert'})
        console.log(albert);
        console.log("Finished creating user");
    } catch(err) {
        console.error("Error creating users!");
        throw err
    }
}

const rebuildDB = async () => {
    try {
        client.connect();

        await dropTables();
        await createTables();
        await createInitialUsers();
    } catch(err) {
        console.error(err);
    } 
}




rebuildDB()
    .then(testDB)
    .catch(console.error)
    .finally(() => client.end)

