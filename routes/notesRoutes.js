const express = require("express");
const router = express.Router();
const notesController = require("./../controllers/notesController");

// TODO Student Side
// router.route('/subject')
// .get()
router
  .route("/:noteId")
  .get(notesController.getNote)
  .patch(notesController.updateNotes)
  .delete(notesController.deleteNotes);

router
  .route("/subject/:subjectId")
  .get(notesController.getNotes)
  .post(notesController.addNotes);

module.exports = router;
