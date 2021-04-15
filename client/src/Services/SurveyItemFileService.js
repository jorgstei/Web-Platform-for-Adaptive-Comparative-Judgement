import axios from "axios"
import Service from "./Service"
axios.defaults.withCredentials = true;
export default class SurveyItemFileService extends Service{
    get(id){
        return axios({
            method: "get",
            url: this.path + "/surveyitemfile/"+id
        })
        .then(response => response)
        .catch(error => error.response)
    }
}

export let surveyItemFileService = new SurveyItemFileService()