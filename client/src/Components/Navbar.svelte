<script>
    import {Link, navigate} from "svelte-routing";
    import {userService} from "../Services/UserService";
    import {AppBar, List, ListItemGroup, ListItem, Icon, Button} from "svelte-materialify"
    import { mdiInformationOutline } from "@mdi/js";

    export let refreshToken;
    export let userInfo;
    export let takingSurvey;
    export let showJudgeOverlay;

    const navigateWithRefreshToken = (to) => {
        refreshToken()
        navigate(to)
    }


    const logout = () => {
        userService.logout()
        .then(()=>{
            userInfo=null; 
            navigate("/")
            console.log("After log out: ", userInfo)
        })
    }
    $: userInfo
</script>


<AppBar class=" d-flex flex-row align-content-right justify-content-right" style="position:fixed;width:100%; padding:0;">
    <div slot="icon" style="height:150%; width:auto; cursor: pointer;" on:click={()=>{takingSurvey = false; showJudgeOverlay = false; navigate("/")}}>
        <img src="/img/Compair.svg" style="width:100%; height: 100%;" alt="Compair logo"/>
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
        <ListItemGroup class="d-flex flex-row" style="text-align: center;">
            <ListItem ripple={false} style="margin: 0; padding: 0 0 0 8;" on:click={() => navigateWithRefreshToken("/")}>
                {"Home"}
            </ListItem>
            {#if userInfo != null && userInfo.role !== "judge"}
                <ListItem ripple={false} style="margin: 0; padding: 0 0 0 8;" on:click={() => navigateWithRefreshToken("/admin_board/profile")}>
                    {"Board"}
                </ListItem>
            {/if}
            <ListItem ripple={false} style="margin: 0; padding: 0 0 0 8;" on:click={() => navigateWithRefreshToken("/about")}>
                {"About"}
            </ListItem>
            {#if userInfo != null && userInfo.role !== "judge"}
                <ListItem ripple={false} style="margin: 0; padding: 0 0 0 8;" on:click={() => logout()}>
                    {"Log out"}
                </ListItem>
            {:else}
                <ListItem ripple={false} style="margin: 0; padding: 0 0 0 8;" on:click={() => navigateWithRefreshToken("/login")}>
                    {"Log in"}
                </ListItem>
            {/if}
            
        </ListItemGroup>
    </List>
    {/if}
</AppBar>

<style>

</style>
<!-- Write your comments here

<div id="navWrapper">
    <nav id="navbar">
        <Link to="/"><img id="logo" src="/img/logo.png" alt="Logo"></Link>
        <img id="name" src="/img/name.png" alt="ASD">
        <ul>
            <Link to="/"><li>Home</li></Link>
            <Link to="test"><li>Test</li></Link>
            <Link to="about"><li>About</li></Link>
            {#if userInfo==null}
                <Link to="login"><li>Log in</li></Link>
            {:else}
                <Link to="admin_board"><li>Board</li></Link>
                <li id="logout-btn" on:click={() => {userService.logout().then(()=>{userInfo=null; navigate("/")})}}>Log out</li>
            {/if}
        </ul>
    </nav>
</div>
 -->

<!-- Write your comments here
<style>
    #navWrapper{
        z-index: 3;
        position: fixed;
    }
    #logout-btn{
        cursor: pointer;
    }
    nav {
        margin: 0;
        padding: 0;
        overflow: hidden;
        /*background-color: #333;*/
        background-color: rgb(18, 73, 144);
        display: grid;
        grid-template-columns: 3fr 5fr 3fr;
        grid-column-gap: 20vw;
        top: 0;
        width: 100vw;
        height: 5vh;
        margin-bottom: 5vh;
        font-size: 1.5vh;
        border-bottom: 2px solid #333;
    }
    ul {
        list-style-type: none;
        margin: 0;
        padding: 0;
        overflow: hidden;
        /*background-color: #333;*/
        background-color: rgb(18, 73, 144);
        height: 5vh;
        top: 0;
        position: fixed;
        right:0;
        text-decoration: none;
    }

    li {
        float: left;
        display: block;
        color: white;
        text-align: center;
        padding: 1vw 1vh;
        text-decoration: none;
    }

    li:hover {
        background-color: #111;
    }

    #logo {
        margin:auto;
        margin-left: 3vw;
        height: 5vh;
        
    }
    #name {
        height: 5vh;
        margin: auto;

    }
</style>
 -->