import axios from "axios"
import Service from "./Service"
axios.defaults.withCredentials = true;
export default class SurveyService extends Service{
    getAllSurveys(){
        return axios({
            method: "get",
            url: this.path + "/survey",
            withCredentials: true
        })
        .then(response => response.data)
        .catch(error => console.log(error))
    }

    getSurveyByID(id){
        return axios({
            method: "get",
            url: this.path + "/survey/"+id,
            withCredentials: true
        })
        .then(response => response.data)
        .catch(error => console.log(error))
    }

    getSurveyByUserID(id){
        return axios({
            method: "get",
            url: this.path + "/survey/user/"+id,
            withCredentials: true
        })
        .then(response => response.data)
        .catch(error => console.log(error))
    }

    postSurvey(survey){
        return axios({
            method: "post",
            url: this.path + "/survey",
            withCredentials: true,
            data: survey
        })
        .then(response => response.data)
        .catch(error => console.log(error))
    }

    put(id, survey){
        return axios(
            {
                method: "put",
                url: this.path + "/survey/"+id,
                withCredentials: true,
                data: survey
            }
        )
        .then(response => response.data)
        .catch(error => console.log(error))
    }


    getRandomPairForSurveyByID(id){
        return axios({
            method: "get",
            url: this.path + "/survey/item/"+id,
            withCredentials: true
        })
        .then(response => response.data)
        .catch(error => console.log(error))
    }

    deleteSurvey(id){
        return axios({
            method: "delete",
            url: this.path + "/survey/"+id,
            withCredentials: true,
        })
        .then(response => response.data)
        .catch(error => console.log(error))
    }

    getSurveyToken(surveyID, passphrase){
        return axios({
            method: "post",
            url: this.path.split("api")[0]+"auth/login/judge",
            data:{
                requestedSurveyID: surveyID,
                passphrase: passphrase
            }
        })        
        .then(response => response.data)
        .catch(error => console.log(error))
    }
}

export let surveyService = new SurveyService()