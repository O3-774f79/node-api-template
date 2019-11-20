const axios = require('axios')
let ServiceFlow = require('../asset/db')
const url = 'http://52.163.210.190:23000/api/v1'
const signIn = async () => {
    try {
        const optionForSignin = {
            'Content-Type': 'application/json',
            'x-ais-OrderRef': '20199319954'
        }
        const userSignIn = await axios.post(url + '/auth/signin', {
            "Username": "magellanbroker",
            "Password": "QWlzQGNvdGg="
        }, {
            headers: optionForSignin
        })
        return await userSignIn.data.AccessToken
    }
    catch (e) {
        return await e.response
    }
}
const checkPartner = async (token, email, memberId) => {
    const optionForCreateParthner = {
        'x-ais-OrderRef': '20199319954',
        'x-ais-AccessToken': "Bearer " + token
    }
    try {
        const inquiryPartner = await axios.post(url + '/Partner/InquiryPartner', {
            "PartnerName": email
        }, { headers: optionForCreateParthner })
        console.log(inquiryPartner.data)
        if (inquiryPartner.data.partnerInfo.length === 0 && inquiryPartner.data.AccountInfo === 0) {
            const createPartner = await axios.post(url + '/Partner/CreatePartner', {
                "PartnerName": email,
                "CPID": email,
                "PartnerDetail": {
                    "MerchantContact": email,
                },
                "PartnerType": [
                    "Customer"
                ],
                "Property": {
                    "RouteEngine": true
                }
            }, {
                headers: optionForCreateParthner
            })
            await console.log('createPartner',createPartner.data)
            const createAccount = await axios.post(url + '/Account/CreateAccount', {
                "PartnerId": createPartner.PartnerId,
                "AccountName": email,
                "AccountCode": ServiceFlow + memberId,
            }, {
                headers: optionForCreateParthner
            })
            await console.log('createAccount',createAccount.data)
            // const createSystemUser = await axios.post(url + '/SystemUser/CreateSystemUser', {
            //     "AccountId": [
            //         createAccount.AccountInfo[0].AccountId
            //     ],
            //     "AuthenInfo": {
            //         "Username": "magellan",
            //         "Password": "QWlzQGNvdGg="
            //     },
            //     "UserRole": [
            //         "Customer"
            //     ]
            // }, {
            //     headers: optionForCreateParthner
            // })
            // await console.log(createSystemUser.data)
        } else {
            console.log('')
        }

        await console.log(optionForCreateParthner)
        await console.log(email)
    } catch (e) {
        return await e.response
    }
}
const checkSupplierorder = async (req, res, next) => {
    const { username, memberId } = req.body[0].member
    if (!username || !memberId) {
        await res.status(400).json(
            {
                "resultCode": "400",
                "developerMessage": `require Field ${!username ? "username" : ""} ${!memberId ? "memberId" : ""}`
            })
    }
    try {
        await signIn()
        await checkPartner(await signIn(), req.body[0].member.username, req.body[0].member.memberId)
        await res.set({
            'Content-Type': 'application/json',
            'X-Transaction-Id': `${req.header('X-Transaction-Id')}`,
            'X-Public-Id': `${req.header('X-Public-Id')}`,
        })
        await res.status(200).json({
            data: req.body[0].member,
        });
    }
    catch (err) {
        await res.set({
            'Content-Type': 'application/json',
            'X-Transaction-Id': `${req.header('X-Transaction-Id')}`,
            'X-Public-Id': `${req.header('X-Public-Id')}`,
        })
        await res.status(400).json(
            {
                "resultCode": "40401-order",
                "developerMessage": "Data not found"
            })
    }

};
module.exports = { checkSupplierorder };