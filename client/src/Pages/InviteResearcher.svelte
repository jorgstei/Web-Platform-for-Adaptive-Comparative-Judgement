<script>   
    import { userService } from "../Services/UserService";
    import swal from 'sweetalert';
    import {navigate} from "svelte-routing"
    import { Row, Select, TextField, Button } from 'svelte-materialify';
    import { navigateWithRefreshToken } from "../Utility/naviagte";
    let showErrorField = false;
    export let userInfo;
    //Email regex:
    const email_regex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;


    const register = (role, email) => {
        const errorField = document.getElementById("errorField");
        
        let [formIsValid, errormsg] = checkValues(email);
        if(formIsValid){
            errorField.innerHTML = "";
            let userObj = {
                email: email,
                role: role
            }
            console.log("Form was valid. Attempting to invite user with user object: ", userObj)
            userService.sendInviteLink(userObj)
                .then((res)=>{
                    if(res?.status == 204){

                        swal("Success","You have successfully invited '" + email + " . They should receive an email with a link to complete their registration.",
                        "success")
                        .then(navigateWithRefreshToken("/admin_board/researchers").then(res => res?.status == 200 ? userInfo = res.data : userInfo = null))
                    }
                    else{
                        swal("Error", "Could not invite account.\n"+res?.data?.message, "error")
                    }
                })
                .catch(err => {
                    console.log("Could not invite account for " + email + ". Error:\n", err)
                    swal("Error","Could not invite account for " + email+"\n", "error");
                })       
        }
        else{
            errorField.innerHTML = errormsg;
            console.log("Show error field bool", showErrorField)
        }

    }

    const checkValues = (email) => {    
        let valuesAreValid = true;
        let errormsg = "";
        console.log("Checking value email:", email);
        // Checks if each field has a value
        if(email === ""){
            valuesAreValid = false;
            errormsg = "Every field must be filled."
        }
        // Checks if it looks like a real email
        else if(!email_regex.test(email)){
            valuesAreValid = false;
            errormsg = "Your email must contain '@' and '.' and can not have whitespaces."
        }
        return [valuesAreValid, errormsg]
    }

    const registerOnEnterPress = (e) => {
        if(e.keyCode == 13){
            register();
        }
    }

    const selectItems = [
        {name: "Researcher", value: "researcher"},
        {name: "Admin", value: "admin"}
    ]
    let selectedValue;
    let txtValue;

</script>



<div class="d-flex flex-row justify-center">
    <div class="d-flex flex-column">
        <h1 class="text-h1 ma-2 mb-6" style="font-size: 5rem">Invite Researcher</h1>
        <Select class="ma-2" hint="*Required" items={selectItems} bind:value={selectedValue}>Role</Select>
        <TextField class="ma-2" hint="*Required" bind:value={txtValue}>Email</TextField>
        <Button class="ma-2 mt-6" outlined on:click={()=>{register(selectedValue, txtValue)}}>Register user</Button>
        <p id="errorField"></p>
    </div>
</div>




<style>
    #errorField{
        color:red;
        font-size: 1em;
    }
</style>