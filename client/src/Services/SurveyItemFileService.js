import axios from "axios"
import Service from "./Service"
axios.defaults.withCredentials = true;
export default class SurveyItemFileService extends Service{
    get(id){
        return axios({
            method: "get",
            url: this.path + "/surveyitemfile/"+id,
            withCredentials: true
        })
        .then(response => response)
        .catch(error => error.response)
    }

    getView(id){
        return axios({
            method: "get",
            url: this.path + "/surveyitemfile/"+id+"/view",
            withCredentials: true
        })
    }

    patch(fieldName, value, itemId){
        console.log("mytag called patch with: fieldName: ", fieldName, ", value: ", value, ", id: ", itemId)

        //Special exception for data as servside requires a post to handle file uploads/large data
        if(fieldName == "data"){
            let formData = new FormData()
            formData.append("value", value)
            return axios({
                method: "post",
                headers: {'content-type': 'multipart/form-data' },
                url: this.path + "/surveyitemfile/"+itemId,
                data: formData,
                withCredentials: true
            })
            .then(response => response)
            .catch(error => error.response)
        }else{
            return axios({
                method: "patch",
                url: this.path + "/surveyitemfile/"+itemId,
                data: {value:value, fieldName: fieldName},
                withCredentials: true
            })
            .then(response => response)
            .catch(error => error.response)
        }
    }

    delete(id){
        return axios({
            method: "delete",
            url: this.path + "/surveyitemfile/"+id,
            withCredentials: true
        })
        .then(response => response)
        .catch(error => error.response)
    }
}

export let surveyItemFileService = new SurveyItemFileService()