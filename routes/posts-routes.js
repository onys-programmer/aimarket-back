const express = require('express');
const { check } = require('express-validator');

const {
  createPost,
  getPosts,
  getPostById,
  getPostsByUserId,
  updatePost,
  deletePost
} = require('../controllers/posts-controllers');

const fileUpload = require('../middleware/file-upload');

const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.get('/', getPosts);
router.get('/:pid', getPostById);
router.get('/user/:uid', getPostsByUserId);

router.use(checkAuth);

router.post(
  '/',
  fileUpload.single('image'),
  [
    check('title').not().isEmpty()
  ],
  createPost
);
router.patch('/:pid', updatePost);
router.delete('/:pid', deletePost);

module.exports = router;
