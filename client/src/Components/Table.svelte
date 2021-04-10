<script>
    import swal from "sweetalert";
    import {onMount} from 'svelte'
    import { toast } from "@zerodevx/svelte-toast";
    import { Link } from "svelte-routing";
    import { attr } from "svelte/internal";
    export let filterBy = undefined;
    export let tableTitle = undefined;
    // The attributes "data", "edit", "share", "delete" have predefined behaviors. Please be careful with how you use these.
    export let tableAttributes = ["full name", "email", "joined on", "id", "share", "delete"];
    export let tableData = undefined;
    export let deleteFunc = undefined;
    export let copyFunc = undefined;
    export let element = document.createElement("p");
    export let userRights = undefined;
    export let surveyActivityStatus = undefined;
    export let userInfo = undefined
    export let itemName = "item";
    console.log("in table",tableData)

    async function updateFilterBy(e, attr){
        if(!attr.fieldName==""){
            console.log("filter before counter:",filterBy)
            filterBy = {
                filterName: attr.fieldName,
                counter: (filterBy.counter+1)
            }
            console.log("filter after counter:",filterBy)
        }
        
    }
    function printTableData(){
        console.log("tableData in Table:",tableData)
    }
    $: tableData && printTableData()
    $: tableAttributes
    $: deleteFunc
    onMount(()=>{
        document.getElementsByClassName("container")[0].insertBefore(element, document.getElementsByClassName("main_table")[0]);
        console.log("onMount Table.svelte", "tableAttributes: ", tableAttributes)

    })

    const capitalizeFirstCharacter = (str) => {
        const firstChar = str.charAt(0).toUpperCase();
        return firstChar + str.substring(1,str.length);
    }
    
</script>
<div class="container">
    {#if tableTitle !== undefined}
        <h3>{tableTitle}</h3>
    {/if}
    <table class="main_table">
        <tr id="table_header">
            {#each tableAttributes as attr}
                <th class={attr.fieldName === "" ? "col" : "col-sortable"} title={attr.fieldName === "" ? "" : "Click to sort or reverse sort."} on:click={(e) => updateFilterBy(e, attr)}>{attr.viewName}</th>
            {/each}
        </tr>
        {#each tableData as row}
            <tr class="table_row">
                {#each row as datapoint}
                    <td class="col">{datapoint}</td>
                {/each}
                {#if tableAttributes.findIndex(e => e.viewName === 'data') != -1}
                    {#if userRights != undefined && userRights != null && userRights[tableData.findIndex(e=>e==row)].viewResults}
                    <td class="col"><Link to={"survey_data/?id=" + row[tableAttributes.findIndex(e=>e.viewName=="id")]}><img title="View the results of this survey" class="small_icon" src="https://png.pngtree.com/element_our/20190601/ourlarge/pngtree-file-download-icon-image_1344466.jpg" alt="Survey data link"></Link></td>
                    {:else}
                    <td class="col disabledLink"><img title="You are not allowed to view the results of this survey." class="small_icon" src="../img/disabled_download.jpg" alt="You cant access survey data image"></td>
                    {/if}
                {/if}
                {#if tableAttributes.findIndex(e => e.viewName === 'edit') != -1}
                    {#if userRights != undefined && userRights != null && userRights[tableData.findIndex(e=>e==row)].editSurvey}
                    <td class="col"><Link to={"edit_survey/?id=" + row[tableAttributes.findIndex(e=>e.viewName=="id")]}><img title="Edit survey" class="small_icon" src="https://p.kindpng.com/picc/s/154-1541056_edit-edit-icon-svg-hd-png-download.png" alt="Edit survey button"></Link></td>
                    {:else}
                    <td class="col disabledLink"><img title="You are not allowed to edit this survey" class="small_icon" src="../img/disabled_edit.jpg" alt="You cant edit survey image"></td>
                    {/if}
                {/if}
                {#if tableAttributes.findIndex(e => e.viewName === 'share') != -1}
                    {#if surveyActivityStatus[tableData.findIndex(e=>e==row)] === true}
                        <td class="col"><img title="Copy the judge link to your clipboard." class="small_icon" src="https://w7.pngwing.com/pngs/592/864/png-transparent-computer-icons-icon-design-cut-copy-and-paste-taobao-clothing-promotional-copy-text-rectangle-emoticon-thumbnail.png" alt="Share link button" 
                        on:click={()=>{
                            navigator.clipboard.writeText(window.location.href.split("/admin_board")[0] + "/survey?takeSurvey=1&surveyID=" + row[tableAttributes.findIndex(e=>e.viewName=="id")])
                            .then(()=>{
                                toast.push("Link to the survey has been copied to your clipboard!", {duration: 2000});
                            })
                            .catch(err=> console.log(err));
                        }}></td>
                    {:else}
                        <td class="col disabledLink"><img title="The survey must be made active in order for judges to start answering it." class="small_icon" src="../img/disabled_share.png" alt="Share link button"></td>
                    {/if}
                {/if}
                
                {#if tableAttributes.findIndex(e => e.viewName === 'delete') != -1}
                    {#if userRights != undefined && userRights != null && userRights[tableData.findIndex(e=>e==row)].editSurvey}
                    <td class="col">
                        <img class="small_icon" src="https://image.flaticon.com/icons/png/512/542/542724.png" alt="Delete option button" 
                        on:click={()=>{
                            let content_id = row[tableAttributes.findIndex(e=>e.viewName=="id")]; 
                            swal({
                            title: "Are you sure?",
                            text: "Are you sure you want to delete this " + itemName + "?",
                            icon: "warning",
                            dangerMode: true,
                            buttons: ["Cancel", "Delete"]
                            })
                            .then(async willDelete => {
                                if (willDelete) {
                                    await deleteFunc(content_id).then(()=> {
                                        swal("Deleted!", capitalizeFirstCharacter(itemName) + " has been deleted!", "success");
                                            tableData = tableData.filter(e => e[tableAttributes.findIndex(e=>e.viewName=="id")] != content_id);
                                    }).catch((err)=>{
                                        swal("Could not delete", "Due to error: " + err, "error");
                                    })
                                }
                            });
                        }}>
                    </td>
                    {:else if userInfo != undefined && userInfo != null && userInfo.role === "admin"}
                    <td class="col">
                        <img class="small_icon" src="https://image.flaticon.com/icons/png/512/542/542724.png" alt="Delete option button" 
                        on:click={()=>{
                            let content_id = row[tableAttributes.findIndex(e=>e.viewName=="id")];
                            swal({
                            title: "Are you sure?",
                            text: "Are you sure you want to delete this " + itemName + "?",
                            icon: "warning",
                            dangerMode: true,
                            buttons: ["Cancel", "Delete"]
                            })
                            .then(async willDelete => {
                                if (willDelete) {
                                    await deleteFunc(content_id).then(()=> {
                                        swal("Deleted!", capitalizeFirstCharacter(itemName) + " has been deleted!", "success");
                                            tableData = tableData.filter(e => e[tableAttributes.findIndex(e=>e.viewName=="id")] != content_id);
                                    }).catch((err)=>{
                                        swal("Could not delete", "Due to error: " + err, "error");
                                    })
                                }
                            });
                        }}>
                    </td>
                    {:else}
                        <td class="col disabledLink"><img class="small_icon" src="../img/disabled_delete.png" alt="Delete option button"></td>
                    {/if}
                {/if}
            </tr> 
        {/each}
    </table>
</div>


<!--
    Table is loosely based on:  https://codepen.io/faaezahmd/pen/dJeRex
-->

<style>
.container {
    margin-top:5vh;
    max-width: 90vw;
    margin-left: auto;
    margin-right: auto;
    text-align: left;
    padding-left: 2vw;
    padding-right: 2vw;
}

table{
    min-width: 60vw;
    border-top: 0;
    margin-bottom: 1vh;
    border-collapse: collapse;
}

th {
    border-right: 2px solid white;
}
td, th {
    
    padding: 0.5vh 0.5vw 0.5vh 0.5vw;
}
tr {
    border-bottom: 1px solid #888;
}



.col-sortable{
    cursor: pointer;
    title: "Sort by";
}


#table_header {
    background-color: #95A5A6;
    font-size: 1em;
    text-transform: uppercase;
    text-align: center;
    letter-spacing: 0.03em;
    border-radius: 0.1vw;
    margin: 0;
    margin-bottom: 1vh;
}


:global(.table_row) {
    background-color: #ffffff;
    border: 1px solid #777;
    text-align: center;
    margin-bottom: 1vh;
}

:global(.small_icon) {
    max-width: 1.2rem;
    margin-left: auto;
}
:global(.small_icon:hover) {
    cursor: pointer;
}

:root {
    --toastContainerTop: auto;
    --toastContainerRight: auto;
    --toastContainerBottom: 5vh;
    --toastContainerLeft: calc(50vw - 8rem);
    }  
.disabledLink :hover{
    color: red;
    cursor: not-allowed;
}


</style>