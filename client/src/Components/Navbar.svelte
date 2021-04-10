<script>
    import {Link, navigate} from "svelte-routing";
    import {userService} from "../Services/UserService";
    import {AppBar, List, ListItemGroup, ListItem} from "svelte-materialify"

    export let userInfo;

    const navigateTo = (to) => navigate(to);
    let navItems = [
        {
            text: "Home", fun: navigateTo, to: "/"
        },
        {
            text: "Board", fun: navigateTo, to: "/admin_board/profile"
        },
        {
            text: "About", fun: navigateTo, to: "/about"
        },
        (userInfo == null || userInfo.role === "judge") ? 
        {
            text: "Log in", fun: navigateTo, to: "/login"
        }
        :
        {
            text: "Log out", fun: () => {userService.logout().then((res)=>{userInfo=null; navigate("/"); return;})}
        }
    ].reverse()

    const setNavItems = () => {
        navItems = [
            {
                text: "Home", fun: navigateTo, to: "/"
            },
            {
                text: "Board", fun: navigateTo, to: "/admin_board"
            },
            {
                text: "About", fun: navigateTo, to: "/about"
            },
            (userInfo == null || userInfo.role === "judge") ? 
            {
                text: "Log in", fun: navigateTo, to: "/login"
            }
            :
            {
                text: "Log out", fun: () => {userService.logout().then(()=>{userInfo=null; navigate("/")})}
            }
        ].reverse()
    }
    $: userInfo && setNavItems()
</script>

<AppBar class=" d-flex flex-row align-content-right justify-content-right" style="position:fixed;width:100%;">
    <div slot="icon">
        <Link to="/">
            <img src="/img/Compair.svg" style="width:100%; height: auto;" alt="Compair logo"/>
        </Link>
    </div>
    <div style="width:100%"/>
    <List nav class="d-flex flex-row justify-self-right" style="float:right; width: 30%" >
        <ListItemGroup class="d-flex flex-row-reverse">
            {#each navItems as item}
                <ListItem ripple={false} style="margin: 0; padding: 0 0 0 8;" on:click={() => item.fun(item.to)}>
                    {item.text}
                </ListItem>
            {/each}
        </ListItemGroup>
    </List>
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