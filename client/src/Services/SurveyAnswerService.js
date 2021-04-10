import axios from "axios"
import Service from "./Service"
axios.defaults.withCredentials = true;
export default class SurveyAnswerService extends Service{
    getAll(){
        return axios({
            method: "get",
            url: this.path + "/surveyanswer",
            withCredentials: true
        })
        .then(response => response.data)
        .catch(error => console.log(error))
    }

    getByID(id){
        return axios({
            method: "get",
            url: this.path + "/surveyanswer/"+id,
            withCredentials: true
        })
        .then(response => response.data)
        .catch(error => console.log(error))
    }

    getByJudgeID(id){
        return axios({
            method: "get",
            url: this.path + "/surveyanswer/judge/"+id,
            withCredentials: true
        })
        .then(response => response.data)
        .catch(error => console.log(error))
    }

    getBySurveyID(id){
        return axios({
            method: "get",
            url: this.path + "/surveyanswer/survey/"+id,
            withCredentials: true,
        })
        .then(response => response)
        .catch(error => error.response)
    }

    post(surveyanswer){
        return axios({
            method: "post",
            url: this.path + "/surveyanswer",
            withCredentials: true,
            data: surveyanswer
        })
        .then(response => response.data)
        .catch(error => console.log(error))
    }

    deleteByID(id){
        return axios({
            method: "delete",
            url: this.path + "/surveyanswer/"+id,
            withCredentials: true,
        })
        .then(response => response.data)
        .catch(error => console.log(error))
    }
    
    deleteByJudgeID(id){
        return axios({
            method: "delete",
            url: this.path + "/surveyanswer/judge/"+id,
            withCredentials: true
        })
        .then(response => response.data)
        .catch(error => console.log(error))
    }
}

export let surveyAnswerService = new SurveyAnswerService()