<script>
    import {Link, navigate} from "svelte-routing";
    import {userService} from "../Services/UserService";
    export let userInfo;
</script>

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


<style>
    #logout-btn{
        cursor: pointer;
    }
    nav {
        z-index: 3;
        margin: 0;
        padding: 0;
        overflow: hidden;
        /*background-color: #333;*/
        background-color: rgb(18, 73, 144);
        position: fixed;
        display: grid;
        grid-template-columns: 3fr 5fr 3fr;
        grid-column-gap: 20vw;
        top: 0;
        width: 100vw;
        height: 5vh;
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