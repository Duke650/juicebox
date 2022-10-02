const {
  client,
  getAllUsers,
  createUser,
  updateUser,
  getUserById,
  createPosts,
  getAllPosts,
  updatePost,
  getPostsByUser,
  createTags,
  addTagstoPost,
  addTagsToPost,
  getAllTags,
} = require("./index");

async function dropTables() {
  try {
    console.log("Starting to drop tables...");

    await client.query(`
        DROP TABLE IF EXISTS post_tags;
        DROP TABLE IF EXISTS tags;
        DROP TABLE IF EXISTS posts;
        DROP TABLE IF EXISTS users;
      `);

    console.log("Finished dropping tables!");
  } catch (error) {
    console.error("Error dropping tables!");
    throw error;
  }
}

async function createTables() {
  try {
    console.log("Starting to build tables...");

    await client.query(`
            CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            username varchar(255) UNIQUE NOT NULL,
            password varchar(255) NOT NULL,
            name VARCHAR(255) NOT NULL,
            location VARCHAR(255) NOT NULL,
            active BOOLEAN DEFAULT true
            );
      `);

    await client.query(`
                CREATE TABLE posts (
                id SERIAL PRIMARY KEY,
                "authorId" INTEGER REFERENCES users(id) NOT NULL,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                active BOOLEAN DEFAULT true
            );
      `);

    await client.query(`
                CREATE TABLE tags (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) UNIQUE NOT NULL
                );
      `);

    await client.query(`
            CREATE TABLE post_tags (
                "postId" INTEGER REFERENCES posts(id),
                "tagId" INTEGER REFERENCES tags(id),
                UNIQUE("postId", "tagId")
            );
      `);

    console.log("Finished building tables!");
  } catch (error) {
    console.error("Error building tables!");
    throw error;
  }
}

async function createInitialUsers() {
  try {
    console.log("Starting to create users...");

    await createUser({
      username: "albert",
      password: "bertie99",
      name: "Al Bert",
      location: "Sidney, Australia",
    });
    await createUser({
      username: "sandra",
      password: "2sandy4me",
      name: "Just Sandra",
      location: "Ain't tellin'",
    });
    await createUser({
      username: "glamgal",
      password: "soglam",
      name: "Joshua",
      location: "Upper East Side",
    });

    console.log("Finished creating users!");
  } catch (error) {
    console.error("Error creating users!");
    throw error;
  }
}

// async function createInitialTags() {
//   try {
//     console.log("Starting to create tags...");

//     const [happy, sad, inspo, catman] = await createTags([
//       "#happy",
//       "#worst-day-ever",
//       "#youcandoanything",
//       "#catmandoeverything",
//     ]);

//     const [postOne, postTwo, postThree] = await getAllPosts();

//     await addTagsToPost(postOne.id, [happy, inspo]);
//     await addTagsToPost(postTwo.id, [sad, inspo]);
//     await addTagsToPost(postThree.id, [happy, catman, inspo]);

//     console.log("Finished creating tags!");
//   } catch (error) {
//     console.log("Error creating tags!");
//     throw error;
//   }
// }

async function rebuildDB() {
  try {
    client.connect();

    await dropTables();
    await createTables();
    await createInitialUsers();
    await createInitialPosts();
  } catch (error) {
    throw error;
  }
}

async function testDB() {
  try {
    console.log("Starting to test database...");

    console.log("Calling getAllUsers");
    const users = await getAllUsers();
    console.log("Result:", users);
    console.log("Calling updateUser on users[0]");
    const updateUserResult = await updateUser(users[0].id, {
      name: "Newname Sogood",
      location: "Lesterville, KY",
    });
    console.log("Result:", updateUserResult);
    await createInitialPosts();
    console.log("Calling getAllPosts");
    const posts = await getAllPosts();
    console.log("Result:!!!!!!!!!", posts);

    console.log("CALLING GetAllTags!!!!");
    const tags = await getAllTags();
    console.log("getAllTags RESULT!!!!", tags);

    console.log("Calling updatePost on posts[0]");
    // const updatePostResult = await updatePost(posts[0].id, {
    //   title: "New Title",
    //   content: "Updated Content",
    // });
    // console.log("Result:", updatePostResult);

    console.log("Calling updatePost on posts[1], only updating tags");
    const updatePostTagsResult = await updatePost(posts[1].id, {
      tags: ["#youcandoanything", "#redfish", "#bluefish"]
    });
    console.log("Result:", updatePostTagsResult);

    console.log("Calling getUserById with 1");
    const albert = await getUserById(1);
    console.log("Result:", albert);
    const newTags = await createTags(["#test", "#myTags"])
    console.log("Create tags TEST!!!!!", newTags);

    // console.log("Calling getPostsByTagName with #happy");
    // const postsWithHappy = await getPostsByTagName("#happy");
    // console.log("Result:", postsWithHappy);

    // console.log("Finished database tests!");
  } catch (error) {
    console.log("Error during testDB");
    console.error(error);
    throw error;
  }
}

async function createInitialPosts() {
  try {
    const [albert, sandra, glamgal] = await getAllUsers();

    await createPosts({
      authorId: albert.id,
      title: "first post",
      content: "This is my first post.",
      tags: ["#happy', '#youcandoanything"],
    });
    await createPosts({
      authorId: sandra.id,
      title: "Im new here",
      content: "Hello everyone",
      tags: ["#happy", "#worst-day-ever"],
    });
    await createPosts({
      authorId: glamgal.id,
      title: "what is my namme?",
      content: "My name is glamgal LOL",
      tags: ["#happy", "#youcandoanything", "#canmancandoanything"],
    });
    console.log("Finished creating posts!");
  } catch (err) {
    console.log("Error creating posts!");
    throw err;
  }
}


rebuildDB()
  .then(testDB)
  .catch(console.error)
  .finally(() => client.end());
