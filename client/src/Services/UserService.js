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
        .catch(error => console.log(error))
    }

    getUserByID(id){
        return axios({
            method: "get",
            url: this.path + "/user/"+id,
            withCredentials: true
        })
        .then(response => response.data)
        .catch(error => console.log(error))
    }

    registerUser(user){
        return axios({
            method: "post",
            url: this.path + "/user",
            withCredentials: true,
            data: user
        })
        .then(response => response.data)
        .catch(error => console.log(error))
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
        .then(response => response.data)
        .catch(error => console.log(error))
    }

    logout(){
        return axios({
            method: "get",
            url: this.path.split("api")[0]+"auth/logout",
            withCredentials: true
        })
        .then(response => response.data)
        .catch(error => console.log(error))
    }

    logoutJudge(){
        return axios({
            method: "get",
            url: this.path.split("api")[0]+"auth/logout/judge",
            withCredentials: true
        })
        .then(response => response.data)
        .catch(error => console.log(error))
    }

    refreshToken(){
        return axios({
            method: "post",
            url: this.path.split("api")[0]+"auth/refresh-token",
            withCredentials: true
        })
        .then(response => response.data)
        .catch(error => console.log(error))
    }

    patchPassword(id, data){
        return axios({
            method: "patch",
            url: this.path + "/user/" + id + "/change_password",
            data: data,
            withCredentials: true
        })
        .then(response => response)
        .catch(error => console.log(error))
    }

    getCount(){
        return axios({
            method: "get",
            url: this.path + "/user/function/count",
            withCredentials: true,
        })
        .then(response => response.data)
        .catch(error => console.log(error))
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
        .catch(error => console.log(error))
    }

    search(term){
        return axios({
            method: "get",
            url: "http://localhost:3000/api/user/search/"+term,
            withCredentials: true
        })
        .then(response => response)
        .catch(error => console.log(error))
    }

    patchForgottenPassword(data){
        return axios({
            method: "patch",
            url: this.path + "/user/forgotten_password",
            data: data,
            withCredentials: true
        })
        .then(response => response)
        .catch(error => console.error(error))
    }

    sendForgottenPasswordLink(data){
        return axios({
            method: "post",
            url: this.path + "/user/forgotten_my_password",
            data: data,
            withCredentials: true
        })
        .then(response => response)
        .catch(error => console.error(error))
    }

    sendInviteLink(userObj){
        return axios({
            method: "post",
            url: this.path + "/user/invite_link",
            withCredentials:true,
            data: userObj
        })
        .then(response => response.data)
        .catch(error => console.log(error))
    }

    deleteUserByID(id){
        return axios({
            method: "delete",
            url: this.path + "/user/"+id,
            withCredentials: true
        })
        .then(response => response.data)
        .catch(error => console.log(error))
    }
}

export let userService = new UserService()