const axios = require('axios')
const uuid = require('uuid');
let ServiceFlow = require('../asset/db')
const urlMGcore = 'http://52.163.210.190:23000/api/v1'
const urlMG = 'http://192.168.2.123:37000/api'
const signIn = async () => {
    try {
        const optionForSignin = {
            'Content-Type': 'application/json',
            'x-ais-OrderRef': '20199319954'
        }
        const userSignIn = await axios.post(urlMGcore + '/auth/signin', {
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
const checkPartnerForCreate = async (email, optionForCreateParthner, inquiryPartner) => {
    if (inquiryPartner.data.partnerInfo.length === 0) {
        console.time('createPartner')
        let createPartner = await axios.post(urlMGcore + '/Partner/CreatePartner', {
            "PartnerName": email,
            "PartnerDetail": {
                "MerchantContact": email,
                "CPID": email,
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
        console.timeEnd('createPartner')
        return await createPartner.data
    } else {
        return false
    }
}
const checkAccountForCreate = async (email, memberId, optionForCreateParthner, inquiryPartner) => {
    if (inquiryPartner.data.partnerInfo.length === 0 || inquiryPartner.data.partnerInfo[0].AccountInfo.length === 0) {
        console.log(inquiryPartner.data.partnerInfo[0].PartnerId)
        console.log(email)
        console.log(ServiceFlow.serviceFlow + memberId)
        console.log(optionForCreateParthner)
        let createAccount = await axios.post(urlMGcore + '/Account/CreateAccount', {
            "PartnerId": inquiryPartner.data.partnerInfo[0].PartnerId,
            "AccountName": email,
            "AccountCode": ServiceFlow.serviceFlow + memberId,
        }, {
            headers: optionForCreateParthner
        })
        return await createAccount.data
    } else {
        return false
    }
}
const checkUserSystemForCreate = async () => {
    const password = Buffer.from(uuid.v4()).toString('base64')
    const username = "MgBroker_" + new Date().getTime() //memberId
    // let createSystemUser = await axios.post(urlMGcore + '/SystemUser/CreateSystemUser', {
    //     "AccountId": [
    //         createAccount.data.PartnerInfo.AccountInfo[0].AccountId
    //     ],
    //     "AuthenInfo": {
    //         "Username": username,
    //         "Password": password
    //     },
    //     "UserRole": [
    //         "Customer"
    //     ]
    // }, {
    //     headers: optionForCreateParthner
    // })
}
const checkPartner = async (token, email, memberId) => {
    await console.time("checkPartner")
    const optionForCreateParthner = {
        'x-ais-OrderRef': '20199319954',
        'x-ais-AccessToken': "Bearer " + token
    }
    try {
        console.time('inquiryPartner')
        const inquiryPartner = await axios.post(urlMGcore + '/Partner/InquiryPartner', {
            "PartnerName": email
        }, { headers: optionForCreateParthner })
        console.timeEnd('inquiryPartner')
        console.log('inquiryPartner', inquiryPartner.data)

        const partner = await checkPartnerForCreate(email, optionForCreateParthner, inquiryPartner)
        await console.log('checkPartnerForCreate', partner)
        const account = await checkAccountForCreate(email, memberId, optionForCreateParthner, inquiryPartner)
        await console.log('checkAccountForCreate', account)

        if (createSystemUser.data.OperationStatus.Code === '20000') {

            const checkAccountMapping = async (UserId, Email) => {
                try {
                    await console.time("checkAccountMapping")
                    await axios.post(urlMG + '/Profile/CheckMappingAccount', {
                        "UserId": UserId,
                        "AccountId": createAccount.data.PartnerInfo.AccountInfo[0].AccountId

                    }, {
                        headers: {
                            'Content-Type': 'application/json',
                            "Authorization": "Basic bWFnZWxsYW46QWlzQGNvdGg="
                        }
                    })
                    await console.timeEnd("checkAccountMapping")
                    await console.time("MappingAccount")
                    await axios.post(urlMG + '/Profile/MappingAccount', {
                        "Email": Email,
                        "UserId": UserId,
                        "AccountInfo": {
                            "AccountId": createAccount.data.PartnerInfo.AccountInfo[0].AccountId,
                            "AccountName": createAccount.data.PartnerInfo.AccountInfo[0].AccountName,
                            "CreatedDate": createAccount.data.PartnerInfo.AccountInfo[0].CreatedDate,
                            "ExpireDate": createAccount.data.PartnerInfo.AccountInfo[0].ExpireDate
                        },
                        "AuthenInfo": {
                            "ClientId": username,
                            "ClientSerect": password
                        }
                    }, {
                        headers: {
                            'Content-Type': 'application/json',
                            "Authorization": "Basic bWFnZWxsYW46QWlzQGNvdGg="
                        }
                    })
                    await console.timeEnd("MappingAccount")
                } catch (e) {
                    console.log(e.response.data)
                }
            }
            const checkAccount = async () => {
                try {
                    await console.time("checkAccount")
                    let createUserProfile = await axios.post(urlMG + '/Profile/CreateUserProfile', {
                        "Email": email
                    }, {
                        headers: {
                            'Content-Type': 'application/json',
                            "Authorization": "Basic bWFnZWxsYW46QWlzQGNvdGg="
                        }
                    })
                    const { UserId, Email } = createUserProfile.data.ProfileInfo
                    await console.timeEnd("checkAccount")
                    await checkAccountMapping(UserId, Email)
                } catch (e) {
                    console.log("catch checkfunc")
                    console.log(e)
                }
            }
            await checkAccount()
        } else {
            console.log('else', createSystemUser.data.OperationStatus.Code)
        }

    } catch (e) {
        return await e.response
    }
    await console.timeEnd("checkPartner")
}
const checkSupplierorder = async (req, res, next) => {
    const { username, memberId } = req.body[0].member
    if (!username || !memberId) {
        await res.status(400).json(
            {
                "resultCode": "40401-order",
                "developerMessage": "Data not found"
            })
    }
    try {
        console.time('sigIn')
        await signIn()
        console.timeEnd('sigIn')
        await checkPartner(await signIn(), req.body[0].member.username, req.body[0].member.memberId)
        await res.status(200).json();
    }
    catch (err) {
        await res.status(400).json(
            {
                "resultCode": "40401-order",
                "developerMessage": "Data not found"
            })
    }

};
module.exports = { checkSupplierorder };