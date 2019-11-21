const axios = require('axios')
const uuid = require('uuid');
let ServiceFlow = require('../asset/db')
const urlMGcore = 'http://52.163.210.190:23000/api/v1'
const urlMG = 'http://192.168.2.123:37000/api​'
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
const checkPartner = async (token, email, memberId) => {
    const optionForCreateParthner = {
        'x-ais-OrderRef': '20199319954',
        'x-ais-AccessToken': "Bearer " + token
    }
    try {
        const inquiryPartner = await axios.post(urlMGcore + '/Partner/InquiryPartner', {
            "PartnerName": email
        }, { headers: optionForCreateParthner })
        if (inquiryPartner.data.partnerInfo.length === 0) {
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
            const password = Buffer.from(uuid.v4()).toString('base64')
            const username = "MgBroker_" + new Date().getTime()
            let createAccount = await axios.post(urlMGcore + '/Account/CreateAccount', {
                "PartnerId": createPartner.data.PartnerInfo.PartnerId,
                "AccountName": email,
                "AccountCode": ServiceFlow.serviceFlow + memberId,
            }, {
                headers: optionForCreateParthner
            })
            let createSystemUser = await axios.post(urlMGcore + '/SystemUser/CreateSystemUser', {
                "AccountId": [
                    createAccount.data.PartnerInfo.AccountInfo[0].AccountId
                ],
                "AuthenInfo": {
                    "Username": username,
                    "Password": password
                },
                "UserRole": [
                    "Customer"
                ]
            }, {
                headers: optionForCreateParthner
            })
            if (createSystemUser.data.OperationStatus.Code === '20000') {
                const checkAccountMapping = async (UserId, Email) => {
                    try {
                        await axios.post("http://192.168.2.123:37000/api" + '/Profile/CheckMappingAccount', {
                            "UserId": UserId,
                            "AccountId": createAccount.data.PartnerInfo.AccountInfo[0].AccountId

                        }, {
                            headers: {
                                'Content-Type': 'application/json',
                                "Authorization": "Basic bWFnZWxsYW46QWlzQGNvdGg="
                            }
                        })
                        let mappingAccount = await axios.post("http://192.168.2.123:37000/api" + '/Profile/MappingAccount', {
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
                    } catch (e) {
                        console.log(e.response.data)
                    }
                }
                const checkAccount = async () => {
                    try {
                        let createUserProfile = await axios.post("http://192.168.2.123:37000/api" + '/Profile/CreateUserProfile', {
                            "Email": email
                        }, {
                            headers: {
                                'Content-Type': 'application/json',
                                "Authorization": "Basic bWFnZWxsYW46QWlzQGNvdGg="
                            }
                        })
                        const { UserId, Email } = createUserProfile.data.ProfileInfo
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
        } else {
            await console.log("#### inelse")
            const inquirySystemUser = await axios.post(urlMGcore + '/SystemUser/InquirySystemUser', {
                "AccountId": [
                    inquiryPartner.data.partnerInfo[0].AccountInfo[0].AccountId
                ]

            }, { headers: optionForCreateParthner })
        }
    } catch (e) {
        return await e.response
    }
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
        await signIn()
        await checkPartner(await signIn(), req.body[0].member.username, req.body[0].member.memberId)
        await res.set({
            'Content-Type': 'application/json',
            'X-Transaction-Id': `${req.header('X-Transaction-Id')}`,
            'X-Public-Id': `${req.header('X-Public-Id')}`,
        })
        await res.status(200).json();
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