<script>
    import {Link, navigate} from "svelte-routing";
    import {userService} from "../Services/UserService";
    import {AppBar, List, ListItemGroup, ListItem, Icon, Button} from "svelte-materialify"
    import { mdiInformationOutline } from "@mdi/js";
    import { onMount } from "svelte";

    export let refreshToken;
    export let userInfo;
    export let takingSurvey;
    export let showJudgeOverlay;
    export let allowLeavePageWithoutWarning = true;

    /*
        Allow tab navigation to click the elements with space or enter
        This will affect both "Navbar" items and "Menu" items.
    */
    let makeNavBarElementsTabbable = () => {
        [...document.getElementsByClassName("s-list-item link")]
        .forEach(e => {
            console.log("Found element to put onkeyup")
            console.log(e)
            e.onkeyup = tabSpaceOrEnter 
        })  
    }

    onMount(() => {
        makeNavBarElementsTabbable()
    })

    let warningOnLeaveFunc = (link)=> {
        swal({
            title: "Are you sure?",
            text:
                "Are you sure you want to discard your changes to this survey? All unsaved changes will be lost.",
            icon: "warning",
            dangerMode: true,
            buttons: ["Take me back!", "Discard"],
        }).then((willDiscard) => {
            if (willDiscard) {
                allowLeavePageWithoutWarning = true
                navigate(link);
            }
        })
    }

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
    //Changes to userInfo might trigger the navbar to change state, 
    //because of this we need to update the new elements to support tab navigation
    $: userInfo && makeNavBarElementsTabbable()
</script>


<AppBar class=" d-flex flex-row align-content-right justify-content-right" style="position:fixed;width:100%; padding:0;">
    <div slot="icon" style="height:100%; width:auto; cursor: pointer;" on:click={()=>{takingSurvey = false; showJudgeOverlay = false; navigate("/")}}>
        <img src="/img/Compair.svg" style="height: 100%; width:100%; min-height:50%;" alt="Compair logo"/>
    </div>
    
    {#if takingSurvey}
        <div style="position:fixed; right:1vw;">
            <Button outlined on:click={()=>{showJudgeOverlay = true}}>
                <Icon size="1.5vw" path={mdiInformationOutline}></Icon>
            </Button>
        </div>
    {:else}
    <div style="width:100%;height:100%;"/>
    <List nav class="d-flex flex-row justify-self-right" style="float:right;" >
        <ListItemGroup mandatory class="d-flex flex-row" style="text-align: center;">
            <ListItem ripple={false} style="margin: 0; padding: 0 0 0 8;" on:click={() => navigateWithRefreshToken("/")}>
                {"Home"}
            </ListItem>
            {#if userInfo != null && userInfo.role !== "judge"}
                <ListItem role="button" ripple={false} style="margin: 0; padding: 0 0 0 8;" on:click={() => navigateWithRefreshToken("/test")}>
                    {"Test"}
                </ListItem>
                <ListItem role="button" ripple={false} style="margin: 0; padding: 0 0 0 8;" on:click={() => navigateWithRefreshToken("/admin_board/profile")}>
                    {"Board"}
                </ListItem>
            {/if}
            <ListItem role="button" ripple={false} style="margin: 0; padding: 0 0 0 8;" on:click={() => navigateWithRefreshToken("/about")}>
                {"About"}
            </ListItem>
            {#if userInfo != null && userInfo.role !== "judge"}
                <ListItem role="button" ripple={false} style="margin: 0; padding: 0 0 0 8;" on:click={() => logout()}>
                    {"Log out"}
                </ListItem>
            {:else}
                <ListItem role="button" ripple={false} style="margin: 0; padding: 0 0 0 8;" on:click={() => navigateWithRefreshToken("/login")}>
                    {"Log in"}
                </ListItem>
            {/if}
            
        </ListItemGroup>
    </List>
    {/if}
</AppBar>

<style>

</style>