<script>
    import {Link, navigate} from "svelte-routing";
    import {userService} from "../Services/UserService";
    import {AppBar, List, ListItemGroup, ListItem, Icon, Button} from "svelte-materialify"
    import { mdiInformationOutline } from "@mdi/js";
    import { onMount } from "svelte";
    import clamp from "clamp-js"

    export let refreshToken;
    export let userInfo;
    export let takingSurvey;
    export let showJudgeOverlay;
    export let allowLeavePageWithoutWarning = true;
    export let warningOnLeaveFunc;
    export let selectedNavbarListValue;
    export let surveyQuestionInNavBar = "";

    

    /*
        Allow tab navigation to click the elements with space or enter
        This will affect both "Navbar" items and "Menu" items.
    */
    let makeNavBarElementsTabbable = () => {
        [...document.getElementsByClassName("s-list-item link")]
        .forEach(e => {
            //console.log("Found element to put onkeyup")
            //console.log(e)
            e.onkeyup = tabSpaceOrEnter 
        })  
    }

    onMount(() => {
        makeNavBarElementsTabbable();
        clampSurveyQuestion();
    })

    const navigateWithRefreshToken = (to) => {
        refreshToken()
        if(!allowLeavePageWithoutWarning){
            warningOnLeaveFunc(to);
        }
        else{
            navigate(to);
        }
    }


    const logout = () => {
        if(!allowLeavePageWithoutWarning){
            swal({
            title: "Are you sure?",
            text:
                "Are you sure you want to discard your changes to this survey? All unsaved changes will be lost.",
            icon: "warning",
            dangerMode: true,
            buttons: ["Nevermind", "Discard"],
            })
            .then((willDiscard) => {
                if (willDiscard) {
                    allowLeavePageWithoutWarning = true
                    userService.logout()
                    .then(()=>{
                        userInfo=null;

                        navigate("/")
                        console.log("After log out: ", userInfo)
                    })
                }
            })
        }
        else{
            userService.logout()
            .then(()=>{
                userInfo=null; 
                navigate("/")
                console.log("After log out: ", userInfo)
            })
        }
    }

    //Allow enter(13) and space(32) to simulate click events
    const tabSpaceOrEnter = (e) => {
        if(e.keyCode == 13 || e.keyCode == 32) {
            e.target.click()
        }
    }

    const clampSurveyQuestion = () => {
        let questionContainer = document.getElementById("navbar-surveyquestion")
        if(questionContainer != undefined && questionContainer != null){
            console.log("FINDME clampSurveyQuestion")
            clamp(questionContainer, {clamp: 1})
        }
    }

    $: surveyQuestionInNavBar && clampSurveyQuestion();
    //Changes to userInfo might trigger the navbar to change state, 
    //because of this we need to update the new elements to support tab navigation
    $: userInfo && makeNavBarElementsTabbable();
    $: warningOnLeaveFunc;
    $: selectedNavbarListValue;
</script>

<div class="navbar" style="position:fixed;width:100%; padding:0; height: 56px;">
    <div style="height:100%; width:auto; cursor: pointer; padding-left: 1vw" on:click={()=>{takingSurvey = false; showJudgeOverlay = false; navigate("/")}}>
        <img src="/img/Compair.svg" style="height: 100%; width:100%; min-height:50%;" alt="Compair logo"/>
    </div>
    
    {#if takingSurvey}
        <div id="navbar-surveyquestion">
            {surveyQuestionInNavBar}
        </div>
        <div style="position:fixed; right:1vw;">
            <Button outlined on:click={()=>{showJudgeOverlay = true}}>
                <Icon size="1.5vw" path={mdiInformationOutline}></Icon>
            </Button>
        </div>
    {:else}
    <div style="width:100%;height:100%;"/>
    <List nav class="d-flex flex-row justify-self-right" style="float:right;" >
        <ListItemGroup mandatory class="d-flex flex-row" style="text-align: center;" bind:value={selectedNavbarListValue}>
            <ListItem ripple={false} style="margin: 0; padding: 0 0 0 8;" on:click={() => navigateWithRefreshToken("/")} value="Home">
                Home
            </ListItem>
            {#if userInfo != null && userInfo.role !== "judge"}
                <ListItem ripple={false} style="margin: 0; padding: 0 0 0 8;" on:click={() => navigateWithRefreshToken("/admin_board/profile")} value="Board">
                    Board
                </ListItem>
            {/if}
            <ListItem ripple={false} style="margin: 0; padding: 0 0 0 8;" on:click={() => navigateWithRefreshToken("/about")} value="About">
                About
            </ListItem>
            {#if userInfo != null && userInfo.role !== "judge"}
                <ListItem ripple={false} style="margin: 0; padding: 0 0 0 8;" on:click={() => logout()} value="Log out">
                    Log out
                </ListItem>
            {:else}
                <ListItem ripple={false} style="margin: 0; padding: 0 0 0 8;" on:click={() => navigateWithRefreshToken("/login")} value="Log in">
                    Log in
                </ListItem>
            {/if}
            
        </ListItemGroup>
    </List>
    {/if}
</div>

<style>
    .navbar{
        display: flex;
        flex-direction: row;
        align-items: center;
        background-color: #f5f5f5;
        z-index: 5;
    }
    #navbar-surveyquestion {
        display:block; 
        align-items: center; 
        justify-content: center; 
        font-size:x-large;
        text-align: center;
        text-overflow: ellipsis;
        padding-top: 10px;
        overflow: hidden; 
        width: calc(90% - 364px);
        height: 56px;
        max-height: 56px;
        white-space: nowrap;
    }
</style>