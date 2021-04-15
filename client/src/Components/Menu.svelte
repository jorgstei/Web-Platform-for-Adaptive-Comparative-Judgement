<script>
    import {Link, navigate} from "svelte-routing";
    import {
    List,
    ListItemGroup,
    NavigationDrawer,
    ListItem,
    Icon,
    Divider,
    Button,
    } from 'svelte-materialify';
    import { mdiAccount, mdiAccountMultiple, mdiAccountPlus, mdiBookMultiple, mdiBookPlus, mdiChevronLeft, mdiChevronRight} from "@mdi/js";

    
    export let userInfo;
    export let allowLeavePageWithoutWarning = true;
    export let warningOnLeaveFunc = (link)=> {
        swal({
            title: "Are you sure?",
            text:
                "Are you sure you want to discard your changes to this survey? All unsaved changes will be lost.",
            icon: "warning",
            dangerMode: true,
            buttons: ["Nevermind", "Discard"],
        }).then((willDiscard) => {
            if (willDiscard) {
                navigate("/admin_board/"+ link);
            }
        })
    }
    console.log("allow and func in menu", allowLeavePageWithoutWarning, warningOnLeaveFunc);
    const menuItems = [
        {
            text:"Profile", icon: mdiAccount, to:"profile", requireAdmin: false
        },
        {
            text:"Invite", icon: mdiAccountPlus, to: "invite_researcher", requireAdmin: true
        },
        {
            text:"Users", icon: mdiAccountMultiple, to:"researchers", requireAdmin: true
        },
        {
            text:"Create Survey", icon: mdiBookPlus, to: "create_survey", requireAdmin: false
        },
        {
            text:"Surveys", icon: mdiBookMultiple, to: "surveys", requireAdmin: false
        },
    ]
    console.log("in menu", userInfo)
    
    
    let navigateTo = (to) => {
        navigate(to)
    }

    let collapsedMenu = false;

</script>

{#if userInfo != null && userInfo != undefined}
<NavigationDrawer bind:mini={collapsedMenu} style="position:fixed; padding-bottom: 10vh; margin-top:5vh;padding-top:5vh;z-index:2;" miniWidth="5vw;">

    <ListItem>
        <div class="d-flex flex-row justify-space-between">

            {#if !collapsedMenu}
                <h4 class="text-h4">Menu</h4>
            {/if}
            <Button fab style="width:2vw; height: 2vw;" on:click={()=>{collapsedMenu = !collapsedMenu;}}>
                {#if !collapsedMenu}
                    <Icon size="1vw" path={mdiChevronLeft }></Icon>
                {:else}
                <Icon path={mdiChevronRight}></Icon>
                {/if}
            </Button>
        </div>
        
    </ListItem>

    <Divider />
    <List nav dense>
        <ListItemGroup>
            {#each menuItems as item}
                {#if (item.requireAdmin && userInfo.role === "admin") || !item.requireAdmin}
                    <ListItem ripple={false} on:click={(e) => {
                            if(allowLeavePageWithoutWarning){
                                navigateTo("/admin_board/"+item.to);
                            }
                            else{
                                warningOnLeaveFunc(item.to)
                            }      
                        }
                        }>
                        <span slot="prepend">
                            <Icon path={item.icon}/>
                        </span>
                        {item.text}
                    </ListItem>
                {/if}
            {/each}
        </ListItemGroup>
    </List>
</NavigationDrawer>
{:else}
<p>You do not appear to be logged in. Please go back to the main menu or log in to see this page.</p>
{/if}
<style>
</style>