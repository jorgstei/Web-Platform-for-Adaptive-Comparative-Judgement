<script>
    import { onMount } from "svelte";
    import {Card, CardText, CardActions, SlideGroup, SlideItem, Ripple, Button} from "svelte-materialify"
    import { navigate } from "svelte-routing";
    import swal from "sweetalert";
    import { surveyService } from "../Services/SurveyService";
    import { userService } from "../Services/UserService";

    export let userInfo = null;
    export let allowLeavePageWithoutWarning;
    allowLeavePageWithoutWarning = true;

    let numberOfSurveys = undefined
    onMount(() => {
        surveyService.getCount().then(response => {
            if(response.status < 300){
                numberOfSurveys = response.data
            }
            else{
                swal(
                    "Error",
                    "Error getting number of surveys you have access to.\nError:"+response.data.message,
                    "error"
                )
            }
        })
    })

    const deleteAccountClicked = () => {
        "Warning",
            "If you delete your account you will lose access to this service.\nYour created surveys and their data will not be deleted. If you require that these be deleted along with your account, please contact an administrator.",
            "warning"
        swal(
            {
                title: "Are you sure you want to delete your account?",
                text: "If you delete your account you will lose access to this service.\nYour created surveys and their data will not be deleted. If you require that these be deleted along with your account, please contact an administrator.",
                icon: "warning",
                dangerMode: true,
                buttons: ["No, take me back", "Yes, delete my account"]
            }
        ).then((e) => {
            if(e === true){
                userService.deleteUserByID(userInfo.userid).then(res => {
                    if(res.status < 300){
                        userInfo.logout().then(() => {
                            userInfo = null
                            navigate("/")
                        })
                    }
                    else{
                        swal(
                            "Error",
                            "Could not delete your account. Please contact an administrator.\nServer answer: " + res.data.message
                        )
                    }
                })
            }
        })
    }
</script>

{#if userInfo != null}
    <div class="d-flex flex-column justify-content-center align-content-center">
        <h1 class="text-h1 ma-2 mb-6" style="font-size: 5rem">Profile</h1>
        <Card class="elevation-4 align-self-center justify-self-center" style="width:50vh;height:auto;">
            <CardText class="justify-content-left">
                <h5 class="text-h5 ma-2 mb-6">Welcome {userInfo.email}</h5>
                <p>Number of surveys you have access too: {numberOfSurveys}</p>
            </CardText>
            <CardActions class="d-flex flex-row justify-space-around" style="width: 100%;">
                <Button class="red white-text" on:click={() => deleteAccountClicked()}>
                    Delete Account
                </Button>
                <div class="justicy-self-center align-self-center">
                    <Button on:click={() => navigate("/admin_board/change_password")}>
                        Change Password
                    </Button>
                </div>
            </CardActions>
        </Card>
    </div>
{/if}

