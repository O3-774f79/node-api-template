const axios = require('axios')

const getUserPage = async (req, res) => {
    try{
        const resService1 = await axios.get("https://api.neoscan.io/api/main_net/v1/get_all_nodes")
        const resService2 = await axios.get('https://jsonplaceholder.typicode.com/todos/1')
               await res.status(200).json({
                status: 'API Its Wsorking',
                message: resService2.data
            });
            await console.log(newData)
     }
     catch(err){
        console.error("GG", err.response);
     }
  
};
module.exports = {getUserPage};