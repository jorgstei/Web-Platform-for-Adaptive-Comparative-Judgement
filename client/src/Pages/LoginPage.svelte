<script>
    import { userService } from "../Services/UserService";
    import { navigate } from "svelte-routing";
    import swal from "sweetalert";
    import Link from "svelte-routing/src/Link.svelte";
    import { Button, TextField, Icon } from "svelte-materialify";
    import { mdiEyeOff, mdiEye } from "@mdi/js";
    import {pwResearcherRequirement, pwAdminRequirement} from '../Utility/passwordRequirement'

    let oldPasswordShow = false;
    let newPw1Show = false;
    let newPw2Show = false;

    /*
        Input field variables
    */
    let email;
    let oldPw;
    let newPw1;
    let newPw2;

    export let newUser = false;
    export let userInfo;
    export let changePassword = false;

    //Email regex:
    const email_regex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

    const validatePasswordFields = [ruleValidatePasswordComplexity];

    console.log("NewUser?: ", newUser);

    const login = () => {
        let [formIsValid, errormsg] = checkValues(email, newPw1);
        if (formIsValid) {
            userService
                .login({ email: email, password: newPw1 })
                .then((res) => {
                    if (res != null && res.status == 200) {
                        userInfo = res.data;
                        console.log(userInfo)
                        navigate("/admin_board");
                    } else {
                        swal("Failed to log in", res.data.message, "error")
                    }
                })
                .catch((err) => {
                    swal(
                        "An error occured while trying to log in",
                        err,
                        "error"
                    );
                });
        } else {
            swal("Error", errormsg, "error")
        }
    };

    function validateEmail(v) {
        return (
            email_regex.test(email) ||
            "Please make sure this is a valid email address."
        );
    }

    function ruleValidatePasswordComplexity(v) {
        console.log("test result:", pwResearcherRequirement.test(v))
        if (userInfo.role == "researcher") {
            return (
                pwResearcherRequirement.test(v) ||
                "Must be minimum 8 characters long."
            );
        } else {
            return (
                pwAdminRequirement.test(v) ||
                "Must be minimum 12 characters long"
            );
        }
    }
    function checkChangePasswordFields() {
        if (oldPw == "") {
            return {
                valid: false,
                msg: "Old Password must be filled in.",
            };
        }

        if (newPw1 == "") {
            return {
                valid: false,
                msg: "New Password must be filled in.",
            };
        }
        if (newPw2 == "") {
            return {
                valid: false,
                msg: "New Password Repeated must be filled in.",
            };
        }
        if (userInfo.role === "admin") {
            if (
                !pwAdminRequirement.test(newPw1) ||
                !pwAdminRequirement.test(newPw2)
            ) {
                return {
                    valid: false,
                    msg:
                        "All password fields must be minimum 10 characters long",
                };
            }
        } else {
            if (
                !pwResearcherRequirement.test(newPw1) ||
                !pwResearcherRequirement.test(newPw2)
            ) {
                return {
                    valid: false,
                    msg:
                        "All password fields must be minimum 8 characters long",
                };
            }
        }
        if (newPw1 !== newPw2) {
            return {
                valid: false,
                msg: "New Password and New Password Repeated must match.",
            };
        }
        return {
            valid: true,
            msg: "",
        };
    }

    function checkLoginFields() {
        // Checks if each field has a value
        if (email === "" || newPw1 === "" || newPw2 === "") {
            return {
                valid: false,
                msg: "Every field must be filled.",
            };
        } else if (email.length > 64) {
            return {
                valid: false,
                msg:
                    "This email is too long. Please choose a shorter one (below 64 characters).",
            };
        }
        // Check that the given mail contains an "@" and ".". Also ensures there are no whitespaces in the email (spaces, tabs, etc.)
        else if (!email_regex.test(email)) {
            return {
                valid: false,
                msg:
                    "This email is not valid. Please double check that it contains '@' and '.', and does not include whitespaces.",
            };
        }
        return {
            valid: true,
            msg:""
        }
    }

    const changeThePassword = () => {
        let [formIsValid, errormsg] = checkValues();
        if (formIsValid) {
            console.log(
                "Form was valid, attempting to patch password with old password, pw1, pw2, userinfo",
                oldPw,
                newPw1,
                newPw2,
                userInfo
            );
            userService
                .patchPassword(userInfo.userid, {
                    currentPassword: oldPw,
                    newPassword: newPw1,
                })
                .then((res) => {
                    if (res.status == 204) {
                        swal(
                            "Your password has been changed!",
                            "You will now be logged out",
                            "success"
                        ).then(() => {
                            userService.logout().then(() => {
                                userInfo = null;
                                navigate("/");
                            });
                        });
                    } else {
                        console.log("oooopsies");
                        swal(
                            "Unable to change password",
                            res.data.error,
                            "error"
                        );
                    }
                })
                .catch((err) => {
                    console.log("Failed to patch password. Error:\n", err);
                });
        } else {
            //TODO: Validate error text
            swal("Unable to change password", errormsg, "error");
            console.log("Not valid: ", errormsg);
        }
    };

    // Checks the validity of fields. Optional third parameter for password 2. Optional third parameter for if user is changing password or not.
    // If the user is changing password the email parameter should be the old password, and it will not be checked for @ . and whitespaces.
    const checkValues = () => {
        let valuesAreValid = true;
        let errormsg = "";
        if (changePassword) {
            const result = checkChangePasswordFields();
            valuesAreValid = result.valid;
            errormsg = result.msg;
        } else {
            const result = checkLoginFields();
            valuesAreValid = result.valid;
            errormsg = result.msg;
        }
        return [valuesAreValid, errormsg];
    };

    const loginOnEnterPress = (e) => {
        if (e.keyCode == 13) {
            login();
        }
    };
</script>

<div>
{#if changePassword == true}
    <div class="d-flex flex-column justify-left align-left">
        <h3 class="text-h3 mb-2">Change Password</h3>
        <div class="d-flex flex-column justify-center align-left">
            <TextField
                class="ma-2"
                hint="*Required"
                bind:value={oldPw}
                type={oldPasswordShow ? "text" : "password"}
            >
                Old Password
                <div
                    slot="append"
                    on:click={() => (oldPasswordShow = !oldPasswordShow)}
                >
                    <Icon path={oldPasswordShow ? mdiEyeOff : mdiEye} />
                </div>
            </TextField>
            <TextField
                class="ma-2"
                hint="*Required"
                rules={validatePasswordFields}
                bind:value={newPw1}
                type={newPw1Show ? "text" : "password"}
            >
                New Password
                <div slot="append" on:click={() => (newPw1Show = !newPw1Show)}>
                    <Icon path={newPw1Show ? mdiEyeOff : mdiEye} />
                </div>
            </TextField>
            <TextField
                class="ma-2"
                hint="*Required"
                rules={validatePasswordFields}
                bind:value={newPw2}
                type={newPw2Show ? "text" : "password"}
            >
                New Password Repeated
                <div slot="append" on:click={() => (newPw2Show = !newPw2Show)}>
                    <Icon path={newPw2Show ? mdiEyeOff : mdiEye} />
                </div>
            </TextField>
            <Button class="ma-2 mt-6" outlined on:click={changeThePassword}
                >Change Password</Button
            >
        </div>
    </div>
{:else}
    <div class="d-flex flex-column justify-center align-center">
        <div class="d-flex flex-column">
            <h1 class="text-h3 mb-3 align-self-center">Welcome back to ACJ!</h1>
            <h2 class="text-h4 mb-6 align-self-center">
                Log in below to see your surveys, and continue making new ones.
            </h2>
            <div class="d-flex flex-column justify-center align-left">
                <TextField class="ma-2" rules={[validateEmail]} bind:value={email}>
                    Email
                </TextField>
                <TextField
                    class="ma-2"
                    bind:value={newPw1}
                    type={newPw1Show ? "text" : "password"}
                >
                    Password
                    <div slot="append" on:click={() => (newPw1Show = !newPw1Show)}>
                        <Icon path={newPw1Show ? mdiEyeOff : mdiEye} />
                    </div>
                </TextField>
                <Button class="ma-2 mt-6 mb-4" outlined on:click={login}>Log in</Button>
                <Link class="align-self-center text-h5" to="forgotten_password">Forgotten your password?</Link>
            </div>
        </div>
    </div>
{/if}
</div>