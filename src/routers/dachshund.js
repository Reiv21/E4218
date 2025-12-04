const express = require("express");
const router = express.Router();
const controller = require("../controllers/dachshundController");

router.get("/", controller.index);
router.get("/new", controller.newForm);
router.post("/new", controller.create);
router.get("/:id", controller.show);
router.get("/:id/edit", controller.editForm);
router.post("/:id", controller.update);
router.post("/:id/delete", controller.delete);

module.exports = router;
