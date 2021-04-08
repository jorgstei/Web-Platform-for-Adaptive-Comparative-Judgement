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

    estimate(data){
        console.log("Data sent to function/esitmate:",data)
        return axios(
            {
                method: "post",
                url: this.path + "/survey/function/estimate",//processs.envv.estimateServicePath,
                data: data,
                withCredentials: true
            }
        )
        .then(response => response)
        .catch(response => response)
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

    getSurveyByIdAsJudge(id){
        return axios({
            method: "get",
            url: this.path + "/survey/judge/"+id,
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

    getCount(){
        return axios({
            method: "get",
            url: this.path + "/survey/function/count",
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

    getSorted(field, skip, limit, direction){
        if(field == undefined || field == "") {
            return Promise.resolve(undefined)
        }
        return axios({
            method: "get",
            url: this.path+`/survey/function/sort/?field=${field}&skip=${skip}&limit=${limit}&direction=${direction}`,
            data:{
                field:field,
                skip:skip,
                limit:limit,
                direction:direction
            },
            withCredentials: true
        })        
        .then(response => response)
        .catch(error => console.log(error))
    }

    search(data, term){
        return axios({
            method: "get",
            url: this.post+"/survey/function/search/"+term,
            data: data
        })        
        .then(response => response)
        .catch(error => console.log(error))
    }
}

export let surveyService = new SurveyService()