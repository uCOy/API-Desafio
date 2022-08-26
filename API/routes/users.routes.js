const usersRoutes = require('express').Router();
const users = require('../controllers/users.controller');

usersRoutes.get("/all", users.findAll);

usersRoutes.get("/show/:id", users.findOne);

usersRoutes.post("/create", users.create);

usersRoutes.put("/update", users.update);

usersRoutes.delete("/delete/:id", users.delete);

usersRoutes.post("/login", users.login);

usersRoutes.get("/validatoken", users.validarToken);

usersRoutes.put("/password", users.password);

usersRoutes.put("/recovery", users.recovery);

usersRoutes.post("/updatepassword", users.updatepassword);

module.exports = usersRoutes;