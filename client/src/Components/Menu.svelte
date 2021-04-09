<script>
    import {Link, navigate} from "svelte-routing";
    import {
    List,
    ListItemGroup,
    NavigationDrawer,
    ListItem,
    Avatar,
    Icon,
    Divider } from 'svelte-materialify';
    import { mdiAccount, mdiAccountMultiple, mdiAccountPlus, mdiBook, mdiBookMultiple, mdiBookPlus } from "@mdi/js";

    const menuItems = [
        {
            text:"Profile", icon: mdiAccount, to:"profile"
        },
        {
            text:"Invite", icon: mdiAccountPlus, to: "invite_researcher"
        },
        {
            text:"Users", icon: mdiAccountMultiple, to:"researchers"
        },
        {
            text:"Create Survey", icon: mdiBookPlus, to: "create_survey"
        },
        {
            text:"Surveys", icon: mdiBookMultiple, to: "surveys"
        },
    ]
    export let userInfo;
    console.log("in menu", userInfo)

    let navigateTo = (to) => {
        navigate(to)
    }
</script>

{#if userInfo != null && userInfo != undefined}
<NavigationDrawer style="position: fixed; margin-top:5vh;margin-right:auto;z-index:2;">
    <h4 class="text-h4 mb-2 mt-2">Menu</h4>
    <List nav dense>
        <ListItemGroup>
            {#each menuItems as item}
                <ListItem on:click={() => navigateTo("/admin_board/"+item.to)}>
                    <span slot="prepend">
                        <Icon path={item.icon}/>
                    </span>
                    {item.text}
                </ListItem>
            {/each}
        </ListItemGroup>
    </List>
</NavigationDrawer>
{:else}
<p>You do not appear to be logged in. Please go back to the main menu or log in to see this page.</p>
{/if}
<style>
</style>