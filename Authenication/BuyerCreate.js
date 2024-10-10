const express = require('express');
const Buyer = require('../models/BuyerModels');

function generateSecretKey(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let secretKey = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        secretKey += characters[randomIndex];
    }
    return secretKey;
}
exports.BuyerCreate = async(req, res) => {
    try {
        const { AccountName, BusinessUnitID } = req.body;
        const ApiKey = generateSecretKey(9);
        const HashingKey = generateSecretKey(15);

        // Don't include AccountID in the create operation as it will be auto-generated
        const BuyerData = await Buyer.create({ AccountName, BusinessUnitID, ApiKey, HashingKey });

        if (!BuyerData) {
            res.status(400).json({ message: "Buyer not created" });
        } else {
            res.status(200).json({ message: "Buyer created successfully", data: BuyerData });
        }
    } catch(err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
}
