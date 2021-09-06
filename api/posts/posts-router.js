// implement your posts router here
const express = require("express");

const Posts = require("./posts-model.js");

const router = express.Router();

router.get("/", (req, res) => {
  Posts.find()
    .then((posts) => {
      res.status(200).json(posts);
    })
    .catch((error) => {
      console.log(error);
      res
        .status(500)
        .json({ message: "The posts information could not be retrieved" });
    });
});

router.get("/:id", (req, res) => {
  Posts.findById(req.params.id)
    .then((post) => {
      if (post) {
        res.status(200).json(post);
      } else {
        res
          .status(404)
          .json({ message: "The post with the specified ID does not exist" });
      }
    })
    .catch((error) => {
      res.status(500).json({ message: "Error retrieving post" });
    });
});

router.post("/", (req, res) => {
  const { title, contents } = req.body;
  if (!title || !contents) {
    return res
      .status(400)
      .json({ message: "Please provide title and contents for the post" });
  }
  Posts.insert({ title, contents })
    .then((postId) => {
      Posts.findById(postId.id)
        .then((post) => {
          console.log(post);
          res.status(201).send(post);
        })
        .catch();
    })
    .catch((error) => {
      res.status(500).json({
        message: "There was an error while saving the post to the database",
      });
    });
});

router.put("/:id", (req, res) => {
  const id = req.params.id;
  const changes = req.body;
  const { title, contents } = changes;

  if (!title || !contents) {
    return res
      .status(400)
      .json({ message: "Please provide title and contents for the post" });
  }

  Posts.update(id, changes)
    .then((post) => {
      if (!post) {
        return res
          .status(404)
          .json({ message: "The post with the specified ID does not exist" });
      }

      // if post === 1 (which it is here), then we know it was found and updated.
      // Need to refetch updated post from the database.
      Posts.findById(id)
        .then((updatedPost) => {
          res.status(200).json(updatedPost);
        })
        .catch((e) => {
          console.log(e);
        });
    })
    .catch((error) => {
      console.log(error.message);
      res
        .status(500)
        .json({ message: "The post information could not be modified" });
    });
});

router.delete("/:id", (req, res) => {
  const id = req.params.id;
  Posts.findById(id)
    .then((post) => {
      const deletedPost = post;
      Posts.remove(id)
        .then((deletedPostCount) => {
          if (!deletedPostCount) {
            return res.status(404).json({
              message: "The post with the specified ID does not exist",
            });
          }
          res.status(200).send(deletedPost);
        })
        .catch((error) => {
          res.status(500).json({ message: "The post could not be removed" });
        });
    })
    .catch();
});

router.get("/:id/comments", async (req, res) => {
  try {
    const id = req.params.id;

    const foundPost = await Posts.findById(id);
    console.log(foundPost);
    if (!foundPost) {
      return res
        .status(404)
        .json({ message: "The post with the specified ID does not exist" });
    }
    const foundPostComments = await Posts.findPostComments(id);

    res.status(200).send(foundPostComments);
  } catch (error) {
    res
      .status(500)
      .json({ message: "The comments information could not be retrieved" });
  }
  //   const id = req.params.id;
  //   Posts.findById(id)
  //   Posts.findPostComments(id)
  //     .then((post) => {
  //       console.log(post);
  //       if (!post) {
  //         return res
  //           .status(404)
  //           .json({ message: "The post with the specified ID does not exist" });
  //       }
  //       res.status(200).send(post);
  //     })
  //     .catch((error) => {
  //       res
  //         .status(500)
  //         .json({ message: "The comments information could not be retrieved" });
  //     });
});

module.exports = router;
