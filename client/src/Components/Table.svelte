<script>
    import swal from "sweetalert";
    import {onMount} from 'svelte'
    import { toast } from "@zerodevx/svelte-toast";
    import { Link } from "svelte-routing";
    import { mdiChevronDown, mdiChevronUp, mdiUnfoldMoreHorizontal, mdiPoll, mdiShare, mdiDelete, mdiSquareEditOutline } from "@mdi/js";
    import { Icon } from 'svelte-materialify';

    export let filterBy = undefined;
    export let dir = 1;
    export let tableTitle = undefined;
    // The attributes "data", "edit", "share", "delete" have predefined behaviors. Please be careful with how you use these.
    export let tableAttributes = ["full name", "email", "joined on", "id", "share", "delete"];
    export let tableData = undefined;
    export let deleteFunc = undefined;
    export let copyFunc = undefined;
    export let element = document.createElement("p");
    export let userRights = [];
    export let surveyActivityStatus = [];
    export let userInfo = undefined
    export let itemName = "item";
    export let selectedMenuListValue;

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
        console.log("Updated tableData in Table: ",tableData)
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

    console.log("refresh")
    let logDir = ()=> console.log("Direction changed. It is currently: ", dir);

    $:dir && logDir();
    
</script>
<div class="container">
    {#if tableTitle !== undefined}
        <h3>{tableTitle}</h3>
    {/if}
    <table class="main_table">
        <tr id="table_header">
            {#each tableAttributes as attr}
                {#if attr.viewName !== "id"}
                    <th class={attr.fieldName === "" ? "col" : "col-sortable"} title={attr.fieldName === "" ? "" : "Click to sort or reverse sort."} on:click={(e) => updateFilterBy(e, attr)}>
                        {attr.viewName}
                        {#if dir==1 && attr.fieldName != "" && attr.fieldName == filterBy.filterName}
                            <Icon path={mdiChevronUp} size="20px" style="float: right;"on:click={(e) => updateFilterBy(e, attr)}></Icon>
                        {:else if dir==-1 && attr.fieldName != "" && attr.fieldName == filterBy.filterName}
                            <Icon path={mdiChevronDown} size="20px" style="float: right;"on:click={(e) => updateFilterBy(e, attr)}></Icon>
                        {:else if attr.fieldName != ""}
                            <Icon path={mdiUnfoldMoreHorizontal } size="20px" style="float: right;"on:click={(e) => updateFilterBy(e, attr)}></Icon>
                        {/if}
                    </th>
                {/if}
            {/each}
        </tr>
        {#if tableData != undefined && tableData != null && typeof tableData == "object" && tableData.length != undefined && tableData.length != null}
            {#each tableData as row}
                <tr class="table_row">
                    {#if row != undefined && row != null && typeof row == "object" && row.length != undefined && row.length != null}
                        {#each row as datapoint, index}
                            {#if tableAttributes.findIndex(e=>e.viewName == "id") !== index}
                                <td class="col">{datapoint}</td>
                            {/if}
                        {/each}
                    {/if}
                    {#if tableAttributes.findIndex(e => e.viewName === 'data') != -1}
                        {#if userRights != undefined && userRights != null && userRights[tableData.findIndex(e=>e==row)].viewResults}
                            <td class="col" title="See the data for this survey." style="cursor:pointer;"><Link to={"survey_data/?id=" + row[tableAttributes.findIndex(e=>e.viewName=="id")]}><Icon path={mdiPoll}></Icon></Link></td>
                        {:else}
                        <td class="col disabledLink"  title="You are not allowed to view the results of this survey."><Icon alt="You cant access survey data image" path={mdiPoll} style="color: red; cursor: not-allowed;" disabled></Icon></td>
                        {/if}
                    {/if}
                    {#if tableAttributes.findIndex(e => e.viewName === 'edit') != -1}
                        <td class="col" title="Edit survey"><Link to={"edit_survey/?id=" + row[tableAttributes.findIndex(e=>e.viewName=="id")]} on:click={()=>{selectedMenuListValue = "Create Survey"}}><Icon path={mdiSquareEditOutline}></Icon></Link></td>
                    {/if}
                
                    {#if tableAttributes.findIndex(e => e.viewName === 'share') != -1}
                        {#if surveyActivityStatus[tableData.findIndex(e=>e==row)] === true}
                            <td class="col" style="cursor: pointer;" title="Copy link to survey to clipboard."
                            on:click={()=>{
                                navigator.clipboard.writeText(window.location.href.split("/admin_board")[0] + "/survey?takeSurvey=1&surveyID=" + row[tableAttributes.findIndex(e=>e.viewName=="id")])
                                .then(()=>{
                                    toast.push("A link to the survey has been copied to your clipboard!", {duration: 4000});
                                })
                                .catch(err=> console.log(err));
                            }}> 
                                <Icon path={mdiShare}></Icon>
                            </td>
                        {:else}
                            <td class="col disabledLink" title="The survey must be made active in order for judges to start answering it."><Icon path={mdiShare}  alt="Share link button" style="color:red; cursor: not-allowed;" disabled ></Icon></td>
                        {/if}
                    {/if}

                    {#if tableAttributes.findIndex(e => e.viewName === 'delete') != -1}
                        {#if userRights != undefined && userRights != null && userRights.length > 0 && userRights[tableData.findIndex(e=>e==row)].editSurvey}
                        <td class="col" title="{"Deletess " + itemName}"  style="cursor:pointer;"
                            on:click={()=>{
                                // Content id is gotten from a column with the header id or judge id. These are necessary to make the delete function work.
                                // 
                                let tableIndex = tableAttributes.findIndex(e=>e.viewName=="id" || e.viewName=="judge id");
                                if(tableIndex != -1){
                                    let content_id = row[tableIndex]; 
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
                                                const idAttrIndex = tableAttributes.findIndex(attr=>attr.viewName=="id" || attr.viewName=="judge id");
                                                const surveyIndex = tableData.findIndex(e => e[idAttrIndex] == content_id);
                                                //console.log("idattrindex", idAttrIndex, "surveyindex", surveyIndex);
                                                tableData.splice(surveyIndex, 1);
                                                surveyActivityStatus.splice(surveyIndex, 1);
                                                userRights.splice(surveyIndex, 1);
    
                                                tableData = tableData;
                                                surveyActivityStatus = surveyActivityStatus;
                                                userRights = userRights;
                                            }).catch((err)=>{
                                                swal("Could not delete", "Due to error: " + err, "error");
                                            })
                                        }
                                    });
                                }
                            }}>
                            <Icon path={mdiDelete}></Icon>
                        </td>
                        {:else if userInfo != undefined && userInfo != null && userInfo.role === "admin"}
                        <td class="col" title="Delete survey." style="cursor:pointer;"
                            on:click={()=>{
                                let tableIndex = tableAttributes.findIndex(e=>e.viewName=="id" || e.viewName=="judge id");
                                if(tableIndex != -1){
                                    let content_id = row[tableIndex];
                                    let checkBoxContainer = document.createElement("div")
                                    let deleteTransientData = document.createElement("input")
                                    let deleteTransientDataLabel = document.createElement("label")
                                    deleteTransientData.type = "checkbox"
                                    deleteTransientData.checked = false
                                    deleteTransientData.id = "deleteTransientData"
                                    deleteTransientDataLabel.setAttribute("for", "deleteTransientData")
                                    deleteTransientDataLabel.innerText = "Delete this reseachers surveys as well: "
                                    deleteTransientDataLabel.style = "color:black; display:inline;"
                                    checkBoxContainer.appendChild(deleteTransientDataLabel)
                                    checkBoxContainer.appendChild(deleteTransientData)
                                    if(itemName == "researcher"){
                                        swal({
                                            title: "Are you sure?",
                                            content: checkBoxContainer,
                                            text: "Are you sure you want to delete this " + itemName + "?",                                            
                                            icon: "warning",
                                            dangerMode: true,
                                            buttons: ["Cancel", "Delete"]
                                        })
                                        .then(async willDelete => {
                                            if (willDelete) {
                                                await deleteFunc(content_id, deleteTransientData.checked).then((res)=> {
                                                    console.log("deleteFunc res:", res)
                                                    if(res?.status < 300){
                                                        console.log("Delete ok")
                                                        swal("Deleted!", capitalizeFirstCharacter(itemName) + " has been deleted!", "success");
                                                        const idAttrIndex = tableAttributes.findIndex(attr=>attr.viewName=="id" || attr.viewName=="judge id");
                                                        const surveyIndex = tableData.findIndex(e => e[idAttrIndex] == content_id);
                                                        //console.log("idattrindex", idAttrIndex, "surveyindex", surveyIndex);
                                                        tableData.splice(surveyIndex, 1);
                                                        surveyActivityStatus.splice(surveyIndex, 1);
                                                        userRights.splice(surveyIndex, 1);
                                                        
                                                        tableData = tableData;
                                                        surveyActivityStatus = surveyActivityStatus;
                                                        userRights = userRights;
                                                    }
                                                    else{
                                                        console.log("Delete not ok")
                                                        swal("Error", "Unable to delete researcher\nReason: " + res?.data?.message, "error")
                                                    }
                                                    
                                                }).catch((err)=>{
                                                    swal("Could not delete", "Due to error: " + err, "error");
                                                })
                                            }
                                        })
                                    }
                                    else{
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
                                                    const idAttrIndex = tableAttributes.findIndex(attr=>attr.viewName=="id" || attr.viewName=="judge id");
                                                    const surveyIndex = tableData.findIndex(e => e[idAttrIndex] == content_id);
                                                    //console.log("idattrindex", idAttrIndex, "surveyindex", surveyIndex);
                                                    tableData.splice(surveyIndex, 1);
                                                    surveyActivityStatus.splice(surveyIndex, 1);
                                                    userRights.splice(surveyIndex, 1);
                                                    
                                                    tableData = tableData;
                                                    surveyActivityStatus = surveyActivityStatus;
                                                    userRights = userRights;
                                                    
                                                }).catch((err)=>{
                                                    swal("Could not delete", "Due to error: " + err, "error");
                                                })
                                            }
                                        });
                                    }
                                }
                            }}>
                            <Icon path={mdiDelete}></Icon>
                            
                        </td>
                        {:else}
                        <td class="col" title="You do not have permission to delete this survey.">
                            <Icon path={mdiDelete} style="color:red; cursor: not-allowed;" disabled></Icon>
                        {/if}
                    {/if} 
                </tr> 
            {/each}
        {/if}
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