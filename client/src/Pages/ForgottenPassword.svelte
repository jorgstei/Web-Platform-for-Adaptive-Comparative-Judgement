<script>   
    import { userService } from "../Services/UserService";
    import {navigate} from "svelte-routing";
    import queryString from "query-string";
    import swal from 'sweetalert';
    import { TextField, Button, Icon, Tooltip } from 'svelte-materialify';
    import { mdiEyeOff, mdiEye } from "@mdi/js";
    import { mdiInformationOutline } from '@mdi/js'
    import {pwResearcherRequirement, pwAdminRequirement} from '../Utility/passwordRequirement'

    export let userInfo;
    export let resetPassword = false;
    let token = null
    const email_regex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
    let params = queryString.parse(window.location.search);
    if(params.token == null || params.token == undefined){
        resetPassword = false
    }
    else{
        resetPassword = true
        token = params.token
        console.log("Forgotten password token:", token)
    }
    let showErrorField = false;
    let email;
    let pw1;
    let pw2;
    let showpw1;
    let showpw2;

    const sendForgottenPasswordLink = () => {
        let [formIsValid, errormsg] = checkValues();
        if(formIsValid){
            userService.sendForgottenPasswordLink({email: email}).then(res => {
                console.log("Successfully sent password reset link. Response: ", res);
                if(res != null){
                    swal("Success", "If there is a user registered with this email, a mail has been sent with a link to reset the password.", "success")
                    .then(() => navigate("/login"))
                }
                else{
                    document.getElementById("errorField").innerHTML = "Invalid email. Please try to re-enter your email.";
                }
            })
            .catch((err) => {
                console.error("An error occured while trying to send password reset link:\n", err)
            })
        }
        else{
            document.getElementById("errorField").innerHTML = errormsg;
        }
    }

    const changeThePassword = () => {
        const errorField = document.getElementById("errorField");
        let [formIsValid, errormsg] = checkValues();
        if(formIsValid){
            errorField.innerHTML = "";
            userService.patchForgottenPassword({email: email, newPassword: pw1, token: token})
            .then((res)=>{
                if(res.status == 204){
                    swal("Success","Your password has been changed!\nYou will now be logged out", "success")
                    .then(()=>{
                        userInfo=null;
                        navigate("/");
                    })
                }
                else{
                    swal("Error", "Failed to set password. \nReason: "+res?.data.message, "error")
                }
            })
            .catch((err)=>{
                console.log("Failed to patch password. Error:\n", err);
                swal("Invalid password!", "err", "error")
            })
        }
        else{
            errorField.innerHTML = errormsg;
            console.log("Show error field bool", showErrorField)
        }

    }

    function checkResetPasswordFields(){
        // Checks if each field has a value
        if(email === "" || pw1 === "" || pw2 === ""){
            return {
                valid: false,
                msg: "Every field must be filled."
            }
        }

        if(!email_regex.test(email)){
            return {
                valid: false,
                msg: "Email input is not a valid email address."
            }
        }

        if(pw1 !== pw2){
            return {
                valid: false,
                msg: "Password and repeated password does not match"
            }
        }
        if(params.role === "admin" && !pwAdminRequirement.test(pw1)){
            return {
                valuesAreValid: false,
                errormsg: "Password must be at least 12 characters long."
            }
        }
        if(params.role === "researcher" && !pwResearcherRequirement.test(pw1)){
            return {
                valuesAreValid: false,
                errormsg: "Password must be 8 characters long."
            }
        }

        return {
                valid: true,
                msg: ""
        }
    }

    function checkSendForgottenpasswordLinkFields(){
        if(email.length > 64){
            return {
                valid:false,
                msg: "Max length of email is 64 characters."
            }
        }

        if(email === ""){
            return {
                valid: false,
                msg: "Email not filled in."
            }
        }
        if(!email_regex.test(email)){
            return {
                valid: false,
                msg: "Email input is not a valid email address."
            }
        }
        return {
                valid: true,
                msg: ""
        }
    }
    // Checks the validity of fields. Optional third parameter for password 2. Optional third parameter for if user is changing password or not.
    // If the user is changing password the email parameter should be the old password, and it will not be checked for @ . and whitespaces.
    const checkValues = () => {
        let valuesAreValid = true;
        let errormsg = "";
        if(resetPassword){
            const result = checkResetPasswordFields();
            valuesAreValid = result.valid;
            errormsg = result.msg;
            return [valuesAreValid, errormsg]
        }
        const result = checkSendForgottenpasswordLinkFields();
        valuesAreValid = result.valid;
        errormsg = result.msg;

        return [valuesAreValid, errormsg]
    }

    const loginOnEnterPress = (e) => {
        if(e.keyCode == 13){
            resetPassword ? changeThePassword() : sendForgottenPasswordLink();
        }
    }

    const clearErrorField = () => {
        document.getElementById("errorField").innerHTML = "";
    }

    let show=false;
</script>

<main>
    <div class="d-flex flex-row justify-center">
        <div class="d-flex flex-column">
            <h1 class="text-h1 ma-2">Forgotten password</h1>
            {#if resetPassword == false}
            <h2 class="text-h2 ma-2">Submit your email below to recieve an email with instructions on how to create a new password</h2>
            {:else}
            <h2 class="text-h2 ma-2">Please fill in the email address your account was created with, then create a new password and repeat it in the following fields. </h2>
            {/if}
            
            <TextField class="ma-2" bind:value={email} on:keydown={loginOnEnterPress} on:input={clearErrorField}>
                Email
                <div slot="append">
                    <Tooltip top bind:active={show} >
                        <Icon path={mdiInformationOutline} />
                        <span slot="tip">Enter your email</span>
                    </Tooltip>
                </div>
                
            </TextField>
            <!--
                <label class="inputLabel" for="email">Email</label>
                <input id="email" class="inputfield" name="email" type="text" on:keydown={loginOnEnterPress} on:input={clearErrorField}>
            -->
            {#if resetPassword == true}

                <TextField type={showpw1 ? "text" : "password"} class="ma-2" bind:value={pw1} on:keydown={loginOnEnterPress} on:input={clearErrorField}>
                    New password
                    <div
                        slot="append"
                        on:click={() => (showpw1 = !showpw1)}
                    >
                        <Icon path={showpw1 ? mdiEyeOff : mdiEye} />
                    </div>
                </TextField>

                <TextField type={showpw2 ? "text" : "password"} class="ma-2" bind:value={pw2} on:keydown={loginOnEnterPress} on:input={clearErrorField}>
                    Repeat new password
                    <div
                        slot="append"
                        on:click={() => (showpw2 = !showpw2)}
                    >
                        <Icon path={showpw2 ? mdiEyeOff : mdiEye} />
                    </div>
                </TextField>
            {/if}
            <p id="errorField"></p>
            <Button class="ma-2 mt-6" outlined on:click={()=>{resetPassword ? changeThePassword() : sendForgottenPasswordLink()}}>{resetPassword ? "Change Password" : "Send reset password link"}</Button>
            
        </div>
    </div>
</main>



<style>
    h1 {
		padding-top: 10vh;
		color: #000000;
		font-size: 3rem;
		font-weight: 100;
	}
	h2 {
		color: #000000;
		font-size: 1.5rem;
		font-weight: 100;
		margin-bottom: 15vh;
	}

    main {
		text-align: center;
		background-color: #eee;
		/*background-color: rgb(255, 245, 196);*/
		margin: auto;
        display:grid;
        grid-template-rows: 2fr 1fr 5fr 10fr;
        
        height: 100vh;
	}

    .wrapper{
        width: 80%;
        margin: auto;
        display: grid;
        grid-template-columns: auto;
        text-align: center;
        background-color: #eee;
    }
    .inputLabel{
        font-size: 1.5em;
        margin: auto;
        text-align: center;
    }
    .inputfield{
        width: 50%;
        margin: auto;
        margin-bottom: 3vh;
        padding: 0.5em 2em;
        font-size: 1em;
        text-align: center;
        background-color: rgba(200, 200, 200, 0.3);
        border-color: rgba(200, 200, 200, 0.3);
        
    }
    .inputfield:hover{
        background-color: rgba(150, 150, 150, 0.7);
    }
    .submitBtn{
        width: 20%;
        margin: auto;
        margin-top: 2em;
        font-size: 1em;
        background-color: rgba(100, 100, 100, 0.05);
        border-color: rgba(100, 100, 100, 0.05);
    }
    .submitBtn:hover{
        background-color:  rgba(100, 100, 100, 0.3);
    }
    #errorField{
        color:red;
        font-size: 1em;
    }
</style>