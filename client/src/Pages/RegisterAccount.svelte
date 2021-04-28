<script>
    import queryString from "query-string";
    import { userService } from "../Services/UserService";
    import swal from "sweetalert";
    import { navigate } from "svelte-routing";
    import { Icon, Tooltip, TextField, Button } from "svelte-materialify";
    import { pwResearcherRequirement, pwAdminRequirement } from "../Utility/passwordRequirement";
    import { mdiInformationOutline, mdiEyeOff, mdiEye } from "@mdi/js";

    let params = queryString.parse(window.location.search);
    if (params.token == null || params.token == undefined) {
        navigate("/");
    } else {
        console.log("RegisterAccount token:", params.token);
    }

    const register = () => {
        const errorField = document.getElementById("errorField");
        let [formIsValid, errormsg] = checkValues(firstName, lastName, email, pw1, pw2);
        if (formIsValid) {
            errorField.innerHTML = "";
            let userObj = {
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: pw1,
                token: params.token,
            };
            console.log("Attempting to register with user object: ", userObj);
            userService
                .registerUser(userObj)
                .then((res) => {
                    if (res.status < 300) {
                        swal(
                            "Success!",
                            "You have successfully made an account for '" + email + "''. You will now be taken to the login page",
                            "success"
                        ).then(navigate("/login"));
                    } else {
                        swal("Error", "Unable to create user.\nReason: " + res.data?.message + ".", "error").then(navigate("/login"));
                    }
                })
                .catch((err) => {
                    console.log(err);
                    swal("Could not create account for " + email);
                });
        } else {
            errorField.innerHTML = errormsg;
            console.log("Show error field bool: ", showErrorField);
        }
    };

    function ruleValidatePasswordComplexity(v) {
        if (params.role == "researcher") {
            return pwResearcherRequirement.test(v) || "Must be minimum 8 characters long.";
        } else {
            return pwAdminRequirement.test(v) || "Must be minimum 12 characters long";
        }
    }

    const validatePasswordFields = [ruleValidatePasswordComplexity];

    // Checks the validity of fields. Optional third parameter for password 2.
    const checkValues = (firstName, lastName, email, pw1, pw2 = pw1) => {
        let valuesAreValid = true;
        let errormsg = "";
        //https://emailregex.com/, might be inefficient, but it haven't failed us yet
        const email_regex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
        console.log("email:", email);
        console.log("email tested:", email_regex.test(email));

        // Checks if each field has a value
        if (firstName === "" || lastName === "" || email === "" || pw1 === "" || pw2 === "") {
            valuesAreValid = false;
            errormsg = "Every field must be filled.";
        }
        // Check that the given mail contains an "@" and ".". Also ensures there are no whitespaces in the email (spaces, tabs, etc.)
        else if (!email_regex.test(email)) {
            valuesAreValid = false;
            errormsg = "Your email must contain '@' and '.' and can not have whitespaces.";
        }

        // Checks that the passwords match.
        else if (pw1 !== pw2) {
            valuesAreValid = false;
            errormsg = "Passwords need to match.";
        } else if (params.role === "admin" && !pwAdminRequirement.test(pw1)) {
            valuesAreValid = false;
            errormsg = "Password must be 12 characters long.";
        } else if (params.role === "researcher" && !pwResearcherRequirement.test(pw1)) {
            valuesAreValid = false;
            errormsg = "Password must be 8 characters long.";
        }
        return [valuesAreValid, errormsg];
    };

    const registerOnEnterPress = (e) => {
        if (e.keyCode == 13) {
            register();
        }
    };

    let firstName,
        lastName,
        email,
        pw1,
        pw2 = "";

    let showEmailTooltip,
        showPw1,
        showPw2,
        showErrorField = false;
</script>

<!--
<div class="wrapper">
    <h1>Register your account!</h1>
    

        <label class="inputLabel" for="firstName">First name</label>
        <input id="firstName" class="inputfield" name="firstName" type="text" on:keydown={registerOnEnterPress}>
    
        <label class="inputLabel" for="lastName">Last name</label>
        <input id="lastName" class="inputfield" name="lastName" type="text" on:keydown={registerOnEnterPress}>
    
        <label class="inputLabel" for="email">Email</label>
        <input id="email" class="inputfield" name="email" type="text" on:keydown={registerOnEnterPress}>
        
        <label class="inputLabel" for="pw1">Password</label>
        <input id="pw1" class="inputfield" name="pw1" type="password" on:keydown={registerOnEnterPress}>
    
        <label class="inputLabel" for="pw2">Repeat password</label>
        <input id="pw2" class="inputfield" name="pw2" type="password" on:keydown={registerOnEnterPress}>
    
        <button class="submitBtn" on:click={register}>Register user</button>
    
    <p id="errorField"></p>
</div>
-->

<div class="d-flex flex-row justify-center">
    <div class="d-flex flex-column">
        <h1 class="text-h1 ma-2 mb-6" style="font-size: 5rem">Register your account!</h1>
        <TextField class="ma-2" hint="*Required" bind:value={firstName} on:keydown={registerOnEnterPress}>First name</TextField>
        <TextField class="ma-2" hint="*Required" bind:value={lastName} on:keydown={registerOnEnterPress}>Last name</TextField>
        <TextField class="ma-2" hint="*Required" bind:value={email} on:keydown={registerOnEnterPress}>
            <div slot="append">
                <Tooltip top bind:active={showEmailTooltip}>
                    <Icon path={mdiInformationOutline} />
                    <span slot="tip"> Must match the mail you were invited from. </span>
                </Tooltip>
            </div>
            Email
        </TextField>
        <TextField
            class="ma-2"
            hint="*Required"
            rules={validatePasswordFields}
            bind:value={pw1}
            type={showPw1 ? "text" : "password"}
            on:keydown={registerOnEnterPress}
        >
            Password
            <div slot="append" on:click={() => (showPw1 = !showPw1)}>
                <Icon path={showPw1 ? mdiEyeOff : mdiEye} />
            </div>
        </TextField>
        <TextField
            class="ma-2"
            hint="*Required"
            rules={validatePasswordFields}
            bind:value={pw2}
            type={showPw2 ? "text" : "password"}
            on:keydown={registerOnEnterPress}
        >
            Repeat password
            <div slot="append" on:click={() => (showPw2 = !showPw2)}>
                <Icon path={showPw2 ? mdiEyeOff : mdiEye} />
            </div>
        </TextField>
        <Button class="ma-2 mt-6" outlined on:click={register}>Register user</Button>
        <p id="errorField" class="align-self-center" />
    </div>
</div>

<style>
    h1 {
        padding: 0;
        margin-top: 0;
        color: #000000;
        font-size: 3rem;
        font-weight: 100;
    }

    .wrapper {
        padding-top: 10vh;
        margin: auto;
        max-width: 60vw;
        display: grid;
        grid-template-rows: auto;
        text-align: center;
        background-color: #eee;
    }
    .inputLabel {
        font-size: 1.5em;
        margin: auto;
        text-align: center;
    }
    .inputfield {
        width: 50%;
        margin: auto;
        margin-bottom: 3vh;
        padding: 0.5em 2em;
        font-size: 1em;
        text-align: center;
        background-color: rgba(200, 200, 200, 0.3);
        border-color: rgba(200, 200, 200, 0.3);
    }
    .inputfield:hover {
        background-color: rgba(150, 150, 150, 0.7);
    }
    .submitBtn {
        width: 20%;
        margin: auto;
        margin-top: 2em;
        font-size: 1em;
        background-color: rgba(100, 100, 100, 0.05);
        border-color: rgba(100, 100, 100, 0.05);
    }
    .submitBtn:hover {
        background-color: rgba(100, 100, 100, 0.3);
    }
    #errorField {
        color: red;
        font-size: 1em;
    }
</style>
