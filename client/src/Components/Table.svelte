<script>
    import swal from "sweetalert";
    import {onMount} from 'svelte'
    import { toast } from "@zerodevx/svelte-toast";
    import { navigate, Link } from "svelte-routing";
    export let tableTitle;
    export let tableAttributes = ["full name", "email", "joined on", "id", "share", "delete"];
    export let tableData;
    export let deleteFunc;
    export let copyFunc;
    export let element = document.createElement("p");
    console.log("in table",tableData)
    
    $: tableData
    $: deleteFunc
     
    onMount(()=>{
        document.getElementsByClassName("container")[0].insertBefore(element, document.getElementsByClassName("main_table")[0]);
    })
    
</script>
    <div class="container">
        {#if tableTitle}
        <h1>{tableTitle}</h1>
        {/if}
        <table class="main_table">
            <tr id="table_header">
                {#each tableAttributes as attr}
                    <th class="col">{attr}</th>
                {/each}
            </tr>
            {#each tableData as row}
                <tr class="table_row">
                    {#each row as datapoint}
                        <td class="col">{datapoint}</td>
                    {/each}
                    {#if tableAttributes.indexOf('data') != -1}

                        <td class="col"><Link to={"survey_data/?id=" + row[tableAttributes.indexOf("id")]}><img class="small_icon" src="https://png.pngtree.com/element_our/20190601/ourlarge/pngtree-file-download-icon-image_1344466.jpg" alt="Survey data link"></Link></td>
                    {/if}
                    {#if tableAttributes.indexOf('edit') != -1}
                    <td class="col"><Link to={"edit_survey/?id=" + row[tableAttributes.indexOf("id")]}><img class="small_icon" src="https://p.kindpng.com/picc/s/154-1541056_edit-edit-icon-svg-hd-png-download.png" alt="Edit survey button"></Link></td>

                    {/if}
                    {#if tableAttributes.indexOf('share') != -1}
                        <td class="col"><img class="small_icon" src="https://w7.pngwing.com/pngs/592/864/png-transparent-computer-icons-icon-design-cut-copy-and-paste-taobao-clothing-promotional-copy-text-rectangle-emoticon-thumbnail.png" alt="Share link button" 
                            on:click={()=>{
                                navigator.clipboard.writeText(window.location.href.split("/admin_board")[0] + "/?takeSurvey=1&surveyID=" + row[tableAttributes.indexOf("id")])
                                .then(()=>{
                                    toast.push("Link to the survey has been copied to your clipboard!", {duration: 2000});
                                })
                            }}></td>
                    {/if}
                    
                    {#if tableAttributes.indexOf('delete') != -1}
                    <td class="col"><img class="small_icon" src="https://image.flaticon.com/icons/png/512/542/542724.png" alt="Delete option button" 
                    on:click={()=>{
                        let content_id = row[tableAttributes.indexOf("id")];
                        
                        
                        swal({
                        title: "Are you sure?",
                        text: "Are you sure you want to delete this " + tableTitle.toLowerCase().substring(0,tableTitle.length-1) + " ?",
                        icon: "warning",
                        dangerMode: true,
                        buttons: ["Cancel", "Delete"]
                        })
                        .then(async willDelete => {
                            if (willDelete) {
                                await deleteFunc(content_id).then(()=> {
                                    swal("Deleted!", tableTitle.substring(0,tableTitle.length-1) + " has been deleted!", "success");
                                        tableData = tableData.filter(e => e[tableAttributes.indexOf("id")] != content_id);
                                }).catch((err)=>{
                                    swal("Could not delete", "Due to error: " + err, "error");
                                })
                            }
                        });
                    }
                    }></td>
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
    max-width: 90vw;
    margin-left: auto;
    margin-right: auto;
    text-align: left;
    padding-left: 2vw;
    padding-right: 2vw;
}
td, th {
    padding: 0.5vh 0.5vw 0.5vh 0.5vw;
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
    border-radius: 0.1vw;
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

table{
    min-width: 60vw;
    border: 0px black solid;
}

:root {
    --toastContainerTop: auto;
    --toastContainerRight: auto;
    --toastContainerBottom: 5vh;
    --toastContainerLeft: calc(50vw - 8rem);
    }  
</style>