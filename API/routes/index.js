const router = require('express').Router();

const usersRoutes = require('./users.routes');
router.use('/user', usersRoutes);


module.exports = router;