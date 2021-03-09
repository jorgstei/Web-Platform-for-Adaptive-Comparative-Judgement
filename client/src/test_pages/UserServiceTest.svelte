<script>
    import { object_without_properties } from "svelte/internal";
    import Footer from "../Components/Footer.svelte";
    import Navbar from "../Components/Navbar.svelte";
    import {userService} from "../Services/UserService"
    let all = null
    userService.getAllUsers().then(data => all = data)
    console.log(all)
    let byID = null
    $: all && userService.getUserByID(all[0]._id).then(data => byID = data)

</script>
<main>
	<div id="welcomeWrapper">
        <h1>Welcome</h1>
        <h2>All comparison objects</h2>
        {#if all != null}      
            {#each all as obj}
                <h3>{obj._id} - {obj.email} - {obj.role}</h3>
            {/each}
        {/if}
        <h2>Comparison object by id</h2>
        {#if byID != null}
            <h3>{byID._id} - {byID.email} {byID.role}</h3>
        {/if}
	</div>
</main>

<style>
    main {
        padding-top: 5vh;
        width: 60%;
        margin: auto;
    }
    #welcomeWrapper {
        text-align: left;
    }
</style>