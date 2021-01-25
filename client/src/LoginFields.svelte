<script>   
    export let newUser;
    import { sha512 } from 'js-sha512'
    import secureRandom from 'secure-random'
    let showErrorField = false;
    const login = () => {
        const email = document.getElementById("email").value;
        const pw = document.getElementById("password").value;
        let [formIsValid, errormsg] = checkValues(email, pw);
        console.log("Welcome " + email + " with password " + pw);
    }

    const register = () => {
        const email = document.getElementById("email").value;
        const pw1 = document.getElementById("pw1").value;
        const pw2 = document.getElementById("pw2").value;
        const errorField = document.getElementById("errorField");
        let [formIsValid, errormsg] = checkValues(email, pw1,pw2);
        if(formIsValid){
            //register
            errorField.innerHTML = "";
            alert("Welcome to ACJ " + email + ".\n Your hash is: " + sha512(pw1));
        }
        else{
            errorField.innerHTML = errormsg;
            console.log(showErrorField)
        }

    }

    // Checks the validity of fields. Optional third parameter for password 2. Made this way for reusability.
    const checkValues = (email, pw1, pw2=pw1) => {
        
        let valuesAreValid = true;
        let errormsg = "";
        console.log(email, pw1, pw2);
        // Checks if each field has a value
        if(email === "" || pw1 === "" || pw2 === ""){
            valuesAreValid = false;
            errormsg = "Every field must be filled."
        }
        // Check that the given mail contains an "@" and ".". Also ensures there are no whitespaces in the email (spaces, tabs, etc.)
        else if(!/@/.test(email) || !/./.test(email) || /\s/.test(email)){
            valuesAreValid = false;
            errormsg = "Your email must contain '@' and '.' and can not have whitespaces."
        }
        // Checks that the passwords match.
        else if(pw1 !== pw2){
            valuesAreValid = false;
            errormsg = "Passwords need to match."
        }
        //TODO: Database call to check if email is taken
        return [valuesAreValid, errormsg]
    }

    const generateSalt = () => {

    }
</script>


<div class="wrapper">
    {#if !newUser}
        <label class="inputLabel" for="email">Email</label>
        <input id="email" class="inputfield" name="email" type="text">

        <label class="inputLabel" for="pw1">Password</label>
        <input id="pw1" class="inputfield" name="pw1" type="password">

        <label class="inputLabel" for="pw2">Repeat password</label>
        <input id="pw2" class="inputfield" name="pw2" type="password">

        <button class="submitBtn" on:click={register}>Register user</button>
    
    {:else}
        <label class="inputLabel" for="email">Email</label>
        <input id="email" class="inputfield" name="email" type="text">

        <label class="inputLabel" for="password">Password</label>
        <input id="password" class="inputfield" name="password" type="password">

        <button class="submitBtn" on:click={login}>Log in</button>
    {/if}

    <p id="errorField"></p>
    
    
</div>


<style>
    .wrapper{
        width: 80%;
        margin: auto;
        display: grid;
        grid-template-columns: auto;
        text-align: center;
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