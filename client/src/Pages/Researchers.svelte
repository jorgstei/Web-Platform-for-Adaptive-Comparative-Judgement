<script>
    import {userService} from "../Services/UserService"
    import { onMount } from 'svelte';
    import Table from "../Components/Table.svelte"
    export let userInfo;
    
    console.log("in researchers")
    let data2DArray;
	onMount(async () => {
        let data = await userService.getAllUsers().catch(err => console.log("Could not get all users\n", err));
        console.log("Researchers data: ", data);
        
        data2DArray = [];
        for (let i = 0; i < data.length; i++) {
            // add data according to tableAttributes array
            let arr = [data.firstName != null & data.lastName != null ? data.firstName + " " + data.lastName: data[i].email.split('@')[0], data[i].email, "18.02.2021", data[i]._id]
            data2DArray.push(arr);
        }
        console.log("Tranformed researchers data 2D array", data2DArray);
	});
</script>



{#if data2DArray}
    <Table tableTitle="Researchers" bind:tableData={data2DArray} tableAttributes={["full name", "email", "joined on", "id", "delete"]} 
    deleteFunc={async (id)=>{
        await userService.deleteUserByID(id)
    }
    }></Table>
{/if}    

    

<style>

</style>