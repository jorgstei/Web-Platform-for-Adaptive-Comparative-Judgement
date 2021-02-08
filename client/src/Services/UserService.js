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
            url: "http://localhost:3000/auth/login",
            withCredentials: true,
            data: {
                email: user.email,
                password: user.password
            }
        })
        .then(response => response.data)
        .catch(error => console.log(error))
    }
}

export let userService = new UserService()