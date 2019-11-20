const axios = require('axios')

const getUserPage = async (req, res) => {
    try {
        await res.status(200).json({
            status: 'API Its Wsorking',
            message: 'API Its Wsorking'
        });
    }
    catch (err) {
        await res.status(400).json(
            {
                "resultCode": "40401-order",
                "developerMessage": "Data not found"
            })
    }

};
module.exports = { getUserPage };