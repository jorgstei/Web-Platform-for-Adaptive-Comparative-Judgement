<script>
    import {Link} from "svelte-routing";
    export let userInfo;
    console.log("in menu", userInfo)
    let tabs = ["profile, researchers, invite, surveys, create_survey"]
    let selected = tabs[0];

    let onclickHandler = (event) => {
        
        let links = event.target.parentElement.parentElement.childNodes;
        for (const key in links) {
            if (Object.hasOwnProperty.call(links, key)) {
                if(links[key].firstChild != null){
                    links[key].firstChild.style.backgroundColor = "#eee"
                }
            }
        }
        event.target.style.backgroundColor = "#aaa";
    }
</script>

{#if userInfo != null && userInfo != undefined}
<div id="menu">
    <ul>
        <b><li id="menu_title">Menu</li></b>
        <Link to="profile"><li class="menu_option" on:click={onclickHandler}>Profile</li></Link>
        {#if userInfo.role == "admin"}
            <Link to="researchers"><li class="menu_option" on:click={onclickHandler}>Researchers</li></Link>
            <Link to="invite_researcher"><li class="menu_option" on:click={onclickHandler}>Invite researcher</li></Link>
        {/if}
        <Link to="surveys"><li class="menu_option" on:click={onclickHandler}>Surveys</li></Link>
        <Link to="create_survey"><li class="menu_option" on:click={onclickHandler}>Create Survey</li></Link>
        <Link to="change_password"><li class="menu_option" on:click={onclickHandler}>Change password</li></Link>
    </ul>
</div>
{:else}
<p>You do not appear to be logged in. Please go back to the main menu or log in to see this page.</p>
{/if}
<style>
    .active {
        background-color: red;
    }
    ul {
        list-style-type: none;
        margin: 0;
        padding: 0;
        background-color: #eee;
        border: 1px solid #444;
        text-decoration: none;
    }

    li {
        display: block;
        color: black;
        text-align: left;
        padding: 1vw 1vh;
        text-decoration-line: none;
        
    }
    li:hover{
        
    }
    .menu_option {
    }
    .menu_option:hover {
        background-color: #aaa;
    }

    #menu_title{
        font-size: 2rem;
        color: #000;
        border-bottom: 2px solid #222;
    }
    #menu {
        grid-area: menu;
    }
</style>