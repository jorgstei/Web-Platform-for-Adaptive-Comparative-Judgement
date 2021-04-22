import axios from "axios"
import Service from "./Service"
axios.defaults.withCredentials = true;
export default class UserService extends Service{
    getAllUsers(){
        return axios({
            method: "get",
            url: this.path + "/user",
            withCredentials: true
        })
        .then(response => response.data)
        .catch(error => error.response)
    }

    getUserByID(id){
        return axios({
            method: "get",
            url: this.path + "/user/"+id,
            withCredentials: true
        })
        .then(response => response.data)
        .catch(error => error.response)
    }

    registerUser(user){
        return axios({
            method: "post",
            url: this.path + "/user",
            withCredentials: true,
            data: user
        })
        .then(response => response)
        .catch(error => error.response)
    }

    login(user){
        return axios({
            method: "post",
            url: this.path.split("api")[0]+"auth/login",
            withCredentials: true,
            data: {
                email: user.email,
                password: user.password
            }
        })
        .then(response => response)
        .catch(error => {
            return error.response
        })
    }

    logout(){
        return axios({
            method: "get",
            url: this.path.split("api")[0]+"auth/logout",
            withCredentials: true
        })
        .then(response => response)
        .catch(error => error.response)
    }

    logoutJudge(){
        return axios({
            method: "get",
            url: this.path.split("api")[0]+"auth/logout/judge",
            withCredentials: true
        })
        .then(response => response.data)
        .catch(error => error.response)
    }

    refreshToken(){
        return axios({
            method: "post",
            url: this.path.split("api")[0]+"auth/refresh-token",
            withCredentials: true
        })
        .then(response => response)
        .catch(error => error.response)
    }

    refreshJudgeToken(){
        return axios({
            method: "post",
            url: this.path.split("api")[0]+"auth/refresh-judge-token",
            withCredentials: true
        })
        .then(response => response.data)
        .catch(error => error.response)
    }

    patchPassword(id, data){
        return axios({
            method: "patch",
            url: this.path + "/user/" + id + "/change_password",
            data: data,
            withCredentials: true
        })
        .then(response => response)
        .catch(error => {
            console.log("patchPassword error:",error,"type of error:", typeof error)
            console.log("error response:", error.response)
            return error.response
        })
    }

    getCount(){
        return axios({
            method: "get",
            url: this.path + "/user/function/count",
            withCredentials: true,
        })
        .then(response => response)
        .catch(error => error.response)
    }

    getSorted(field, skip, limit, direction){
        if(field == undefined || field == "") {
            return
        }
        return axios({
            method: "get",
            url: this.path+`/user/function/sort/?field=${field}&skip=${skip}&limit=${limit}&direction=${direction}`,
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

    search(term, data){
        return axios({
            method: "post",
            url: this.path+"/user/search/"+term,
            data: data,
            withCredentials: true
        })
        .then(response => response)
        .catch(error => error.response)
    }

    patchForgottenPassword(data){
        return axios({
            method: "patch",
            url: this.path + "/user/forgotten_password",
            data: data,
            withCredentials: true
        })
        .then(response => response)
        .catch(error => error.response)
    }

    sendForgottenPasswordLink(data){
        return axios({
            method: "post",
            url: this.path + "/user/forgotten_my_password",
            data: data,
            withCredentials: true
        })
        .then(response => response)
        .catch(error => error.response)
    }

    sendInviteLink(userObj){
        return axios({
            method: "post",
            url: this.path + "/user/invite_link",
            withCredentials:true,
            data: userObj
        })
        .then(response => response)
        .catch(error => error.response)
    }

    deleteUserByID(id, deleteTransientData=false){
        /*
        return axios({
            method: "delete",
            url: this.path + "/user/"+id,
            data: deleteTransientData,
            withCredentials: true
        })
        .then(response => response)
        .catch(error => error.response)
        */
       return axios.delete(this.path + "/user/"+id, {
           data: {deleteTransientData: deleteTransientData},
           withCredentials: true
       })
       .then(response => response)
       .catch(error => error.response)
    }
}

export let userService = new UserService()