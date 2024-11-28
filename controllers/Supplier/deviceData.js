const DeviceData = require("../../models/deviceModels");

exports.getDeviceData = async (req, res) => {
    try {
        const data = req.body;
        await DeviceData.create(data);
        res.status(200).send({ message: "Device data saved successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Error saving device data", error: err.message });
    }
}
