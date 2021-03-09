<script>   
    import { userService } from "../Services/UserService";
    import swal from 'sweetalert';
    import {navigate} from "svelte-routing"
    let showErrorField = false;
    export let userInfo;


    const register = () => {
        const email = document.getElementById("email").value;
        const role = document.getElementById("role_dropdown").value;
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
                .then(()=>{
                    swal("You have successfully made an account for '" + email + "''.").then(navigate("/admin_board/researchers"));
                })
                .catch(err => {
                    console.log("Could not create account for " + email + ". Error:\n", err)
                    swal("Could not create account for " + email);
                })       
        }
        else{
            errorField.innerHTML = errormsg;
            console.log("Show error field bool", showErrorField)
        }

    }

    // Checks the validity of fields. Optional third parameter for password 2. Made this way for reusability.
    const checkValues = (email) => {
        
        let valuesAreValid = true;
        let errormsg = "";
        console.log("Checking value email:", email);
        // Checks if each field has a value
        if(email === ""){
            valuesAreValid = false;
            errormsg = "Every field must be filled."
        }
        //TODO: Make better regex <3
        // Check that the given mail contains an "@" and ".". Also ensures there are no whitespaces in the email (spaces, tabs, etc.)
        else if(!/@/.test(email) || !/./.test(email) || /\s/.test(email)){
            valuesAreValid = false;
            errormsg = "Your email must contain '@' and '.' and can not have whitespaces."
        }
        //TODO: Database call to check if email is taken
        return [valuesAreValid, errormsg]
    }

    const registerOnEnterPress = (e) => {
        if(e.keyCode == 13){
            register();
        }
    }


</script>


<div class="wrapper">
    <h1>Invite a researcher!</h1>
    <select name="role" id="role_dropdown">
        <option value="scientist">Researcher</option>
        <option value="admin">Admin</option>
    </select>
    <label class="inputLabel" for="email">Email</label>
    <input id="email" class="inputfield" name="email" type="text" on:keydown={registerOnEnterPress}>
    
    <button class="submitBtn" on:click={register}>Register user</button>
    <p id="errorField"></p>
</div>




<style>
    #role_dropdown {
        width: 25%;
        margin: auto;
        margin-bottom: 3vh;
    }
    h1 {
		padding: 0;
        margin-top: 0;
		color: #000000;
		font-size: 3rem;
		font-weight: 100;
	}

    .wrapper{
        max-width: 60vw;
        display: grid;
        grid-template-rows: auto;
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