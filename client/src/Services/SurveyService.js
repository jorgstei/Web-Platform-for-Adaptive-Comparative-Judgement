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
        .catch(error => error.response)
    }

    getSurveyByID(id){
        return axios({
            method: "get",
            url: this.path + "/survey/"+id,
            withCredentials: true
        })
        .then(response => response)
        .catch(error => error.response)
    }

    getSurveyByUserID(id){
        return axios({
            method: "get",
            url: this.path + "/survey/user/"+id,
            withCredentials: true
        })
        .then(response => response)
        .catch(error => error.response)
    }

    getSurveyByIdAsJudge(id){
        return axios({
            method: "get",
            url: this.path + "/survey/judge/"+id,
            withCredentials: true
        })
        .then(response => response)
        .catch(error => error.response)
    }

    getPinIsValid(pin){
        return axios({
            method: "get",
            url: this.path + "/survey/function/checkPIN/" + pin,
            withCredentials: false
        })
        .then(response => response)
        .catch(error => error.response)
    }

    postSurvey(survey){
        return axios({
            method: "post",
            url: this.path + "/survey",
            withCredentials: true,
            data: survey
        })
        .then(response => response)
        .catch(error => error.response)
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
        .then(response => response)
        .catch(error => error.response)
    }


    getItemsToCompareBySurveyId(id){
        return axios({
            method: "get",
            url: this.path + "/survey/items_to_compare/"+id,
            withCredentials: true
        })
        .then(response => response)
        .catch(error => error.response)
    }

    deleteSurvey(id){
        return axios({
            method: "delete",
            url: this.path + "/survey/"+id,
            withCredentials: true,
        })
        .then(response => response)
        .catch(error => error.response)
    }

    getCount(){
        return axios({
            method: "get",
            url: this.path + "/survey/function/count",
            withCredentials: true,
        })
        .then(response => response)
        .catch(error => error.response)
    }

    getJudgeToken(surveyID, passphrase){
        return axios({
            method: "post",
            url: this.path.split("api")[0]+"auth/login/judge",
            data:{
                requestedSurveyID: surveyID,
                passphrase: passphrase
            }
        })        
        .then(response => response)
        .catch(error => error.response)
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
        .catch(error => error.response)
    }

    search(data, term){
        return axios({
            method: "get",
            url: this.path+"/survey/function/search/"+term,
            data: data,
            withCredentials: true
        })        
        .then(response => response)
        .catch(error => error.response)
    }

    uploadFile(file, surveyId){
        let formData = new FormData()
        formData.append('file', file)
        console.log("uploadFile file:", file)
        console.log("formData: ", formData)
        return axios({
            method: "post",
            data: formData,
            url: this.path + "/survey/function/upload_item/"+surveyId,
            headers: {
                "Content-Type": "multipart/form-data"
            },
            withCredentials: true
        })
        .then(response => response)
        .catch(error => error.response)
    }
}

export let surveyService = new SurveyService()