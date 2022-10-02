const express = require('express');
const postsRouter = express.Router();

const {getAllPosts, createPosts, updatePost, getPostById} = require('../db');
const { requireUser } = require("./utils");

postsRouter.post("/", requireUser, async (req, res, next) => {
    const { title, content, tags = ""} = req.body;

    const tagArr = tags.trim().split(/\s+/);
    const postData = {};

    if (tagArr.length) {
        postData.tags = tagArr;
    }

    try {
        postData.authorId = req.user.id;
        postData.title = title;
        postData.content = content;

        const post = await createPosts(postData);
        if (post) {
            res.send({ post })
        } else {
            next({
                name: "Error creating posts!",
                message: "Something went wrong"
            })
        }
    } catch ({ name, message }) {
        next({name, message})
    }

})

postsRouter.use((req, res, next) => {
    console.log("A request is being made to /posts");
    next();
})

postsRouter.get('/', async (req, res) => {
    try {
        const allPosts = await getAllPosts();

        const posts = allPosts.filter(post => {
            console.log('post :>> ', post);
            return post.active || (req.user && req.user.id === post.author.id)
        })

        res.send({
            "posts": posts
        })
    } catch ({name, message}) {
        next({name, message})
    }
})

postsRouter.delete("/:postId", requireUser, async (req, res, next) => {
    try {
        const post = await getPostById(req.params.postId);

        if (post && post.author.id === req.user.id) {
            const updatedPost = await updatePost(post.id, { active: false} )

            res.send({ post: updatedPost })
        } else {
            next(post ? {
                name: "Unauthorized User Error",
                message: "You cannot delete a post which is not yours"
            } : {
                name: "Post not found error",
                message: "That post deos not exist"
            });
        }
    } catch ({name, message}) {
        next({name, message})
    }
})

postsRouter.patch("/:postId", requireUser, async (req, res, next) => {
    const { postId } = req.params;
    const { title, content, tags } = req.body;

    const updateFields = {};

    if (tags && tags.length > 0) {
        updateFields.tags = tags.trim().split(/\s+/);
    }

    if (title) {
        updateFields.title = title;
    }

    if (content) {
        updateFields.content = content;
    }

    try {
        const originalPost = await getPostById(postId);

        if (originalPost.author.id === req.user.id) {
            const updatedPost = await updatePost(postId, updateFields);
            res.send({post: updatedPost })
        } else {
            next({
                name: "Unauthorized User Error",
                message: "You cant update a post that is not yours"
            })
        }
    } catch ({name, message}) {
        next({name, message})
    }
})

module.exports = postsRouter;