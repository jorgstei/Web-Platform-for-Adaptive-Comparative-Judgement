import axios from "axios"
import Service from "./Service"

export default class ComparisonObjectService extends Service{
    getAllComparisonObjects() {
        return axios({
            method: "get",
            url: this.path + "/comparisonobject",
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            }
        })
        .then(response => {console.log(response.data);return response.data})
        .catch(error => console.error(error))
    }

    getComparisonObjectByID(id){
        return axios({
            method: "get",
            url: this.path + "/comparisonobject/"+id,
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            }
        })
        .then(response => response.data)
        .catch(error => console.log(error))
    }

    getRandomPairComparisonObject(){
        return axios({
            method: "get",
            url: this.path + "/comparisonobject/random/pair",
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            }
        })
        .then(response => response.data)
        .catch(error => console.log(error))
    }
}

export let comparisonObjectService = new ComparisonObjectService()