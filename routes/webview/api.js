const express = require('express');
const router = express.Router();
const helpCenterContent = require('../../webview/helpCenterContent');

router.get('/help-center', (req, res) => {
  res.json(helpCenterContent);
});

module.exports = router;
