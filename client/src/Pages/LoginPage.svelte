<script>   
    import { userService } from "../Services/UserService";
    import {navigate} from "svelte-routing";
    import swal from 'sweetalert';
import Link from "svelte-routing/src/Link.svelte";

    let showErrorField = false;
    export let newUser = false;
    export let userInfo;
    export let changePassword = false;

    console.log("NewUser?: ", newUser)

    const login = () => {
        const email = document.getElementById("email").value;
        const pw = document.getElementById("password").value;
        let [formIsValid, errormsg] = checkValues(email, pw);
        if(formIsValid){
            userService.login({email: email, password: pw}).then(res => {
                console.log("Successfully logged in with response: ", res);
                if(res != null){
                    userInfo = res;
                    console.log("Welcome " + email + " with password " + pw);
                    navigate("/admin_board");
                }
                else{
                    document.getElementById("errorField").innerHTML = "Invalid credentials. Please try to re-enter your email/password.";
                }
            })
            .catch((err) => {
                console.error("An error occured while trying to log in:\n", err)
            })
        }
        else{
            document.getElementById("errorField").innerHTML = errormsg;
        }
    }

    const changeThePassword = () => {
        const oldpw = document.getElementById("oldPassword").value;
        const pw1 = document.getElementById("pw1").value;
        const pw2 = document.getElementById("pw2").value;
        const errorField = document.getElementById("errorField");
        let [formIsValid, errormsg] = checkValues(oldpw, pw1,pw2, true);
        if(formIsValid){
            //register
            errorField.innerHTML = "";
            console.log("Form was valid, attempting to patch password with old password, pw1, pw2, userinfo", oldpw, pw1, pw2, userInfo);
            userService.patchPassword(userInfo.userid, {currentPassword: oldpw, newPassword: pw1})
            .then((res)=>{
                if(res.status == 204){
                    swal("Your password has been changed!\nYou will now be logged out").then(()=>{
                        userService.logout().then(()=>{
                            userInfo=null;
                            navigate("/");
                        }
                    )});
                }
            })
            .catch((err)=>{
                console.log("Failed to patch password. Error:\n", err);
            })
        }
        else{
            errorField.innerHTML = errormsg;
            console.log("Show error field bool", showErrorField)
        }

    }

    // Checks the validity of fields. Optional third parameter for password 2. Optional third parameter for if user is changing password or not.
    // If the user is changing password the email parameter should be the old password, and it will not be checked for @ . and whitespaces.
    const checkValues = (email, pw1, pw2=pw1, changingPassword=false) => {
        
        let valuesAreValid = true;
        let errormsg = "";
        console.log("Checking values email, pw1, pw2", email, pw1, pw2);
        const email_regex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
        
        // Checks if each field has a value
        if(email === "" || pw1 === "" || pw2 === ""){
            valuesAreValid = false;
            errormsg = "Every field must be filled."
        }
        
        else if(email.length > 64){
            valuesAreValid = false;
            errormsg = "This email is too long. Please choose a shorter one (below 64 characters).";
        }
        // Check that the given mail contains an "@" and ".". Also ensures there are no whitespaces in the email (spaces, tabs, etc.)
        else if(!email_regex.test(email)){
            if(!changingPassword){
                valuesAreValid = false;
                errormsg = "This email is not valid. Please double check that it contains '@' and '.', and does not include whitespaces."
            }
        }
        // Checks that the passwords match.
        else if(pw1 !== pw2){
            valuesAreValid = false;
            errormsg = "Passwords need to match."
        }
        //TODO: Database call to check if email is taken
        return [valuesAreValid, errormsg]
    }

    const loginOnEnterPress = (e) => {
        if(e.keyCode == 13){
            login();
        }
    }

    const clearErrorField = () => {
        document.getElementById("errorField").innerHTML = "";
    }

</script>

<main>
    {#if changePassword==true}
        <h1>Change password</h1>
    {:else}
        <h1>Welcome back to ACJ!</h1>
        <h2>Log in below to see your surveys, and continue making new ones.</h2>
    {/if}
    
    <div class="wrapper">
        {#if changePassword==true}

            <label class="inputLabel" for="oldPassword">Old password</label>
            <input id="oldPassword" class="inputfield" name="oldPassword" type="password" on:input={clearErrorField}>

            <label class="inputLabel" for="pw1">New password</label>
            <input id="pw1" class="inputfield" name="pw1" type="password" on:input={clearErrorField}>

            <label class="inputLabel" for="pw2">Repeat new password</label>
            <input id="pw2" class="inputfield" name="pw2" type="password" on:input={clearErrorField}>

            <p id="errorField"></p>

            <button class="submitBtn" on:click={changeThePassword}>Change password</button>
        
        {:else}
            <label class="inputLabel" for="email">Email</label>
            <input id="email" class="inputfield" name="email" type="text" on:keydown={loginOnEnterPress} on:input={clearErrorField}>

            <label class="inputLabel" for="password">Password</label>
            <input id="password" class="inputfield" name="password" type="password" on:keydown={loginOnEnterPress} on:input={clearErrorField}>

            <p id="errorField"></p>

            <button class="submitBtn" on:click={login}>Log in</button>
            <Link to="forgotten_password">Forgotten your password?</Link>

        {/if}

        
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