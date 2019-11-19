const axios = require('axios')
const instance = axios.create({ baseURL: 'https://jsonplaceholder.typicode.com/todos/1' });
const getData = async () => {
    try{
        axios.get("https://api.neoscan.io/api/main_net/v1/get_all_nodes")
               .then(data => res.status(200).send(data))
               .catch(err => res.send(err));
     }
     catch(err){
        console.error("GG", err);
     }
}
const getExamData = (req, res) => {
    console.log('main work');
    /*step1 เราโยน function ลงไปเป็น parametor*/
    // getData().then(function (result) {
    //     console.log('main todo');
    //     console.log("response total %s <", result.length);
    //     console.log("main end")
    // }).catch(function (error) {
    //     console.log("case error");
    // })
};
module.exports = { getExamData };