const express = require('express');
const router = express.Router();
const { getAllTransactions, createTransaction } = require('../../controllers/transactionController');
const { protect, admin } = require('../../middleware/authMiddleware');

router.use(protect, admin);

router.route('/').get(getAllTransactions).post(createTransaction);

module.exports = router;
