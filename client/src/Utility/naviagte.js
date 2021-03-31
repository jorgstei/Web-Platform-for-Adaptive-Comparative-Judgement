import {navigate} from "svelte-routing";
import {userService} from "../Services/UserService";
export function navigateWithRefreshToken(to){
    navigate(to)
    return userService.refreshToken()
}