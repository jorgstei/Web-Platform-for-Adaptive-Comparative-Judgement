<script>
    export let userInfo = undefined;
    export let researcher = {owner_id: "fillerID", owner_email: "asd", obligatory: false};
    export let deleteFunc;
    export let onchangeFunc;
    export let editable = true;


</script>


<div class="researcherWrapper">
    <div class="headerWrapper">
        <p class="email">{researcher.owner_email}</p>
        {#if !researcher.obligatory && editable}
            <img class="trashcan_icon" src="https://image.flaticon.com/icons/png/512/542/542724.png" alt="Delete researcher button" 
                    on:click={deleteFunc}>
        {/if}
        
    </div>
    
    <div class="rightsWrapper">
        <p class="smallParagraph">Rights:</p>
        <div class="rightWrapper">
            <label for="manageMembers" class="researcherLabels">Manage members</label>
            <input type="checkbox" name="manageMembers" class="checkboxes" checked={researcher.rights.manageMembers} on:change={(event) => onchangeFunc(event, "manageMembers")} disabled={!editable}>
        </div>

        <div class="rightWrapper">
            <label for="editSurvey" class="researcherLabels">Edit Survey</label>
            <input type="checkbox" name="editSurvey" class="checkboxes" checked={researcher.rights.editSurvey} on:change={(event) => onchangeFunc(event, "editSurvey")} disabled={!editable}>
        </div>
        
        <div class="rightWrapper">
            <label for="viewResults" class="researcherLabels">View results</label>
            <input type="checkbox" name="viewResults" class="checkboxes" checked={researcher.rights.viewResults} on:change={(event) => onchangeFunc(event, "viewResults")} disabled={!editable}>
        </div>
    </div>
</div>



<style>
    .researcherWrapper {
        margin-bottom: 2vh;
        border: 1px solid grey;
        padding: 1vw;
    }
    .rightsWrapper {
        margin-bottom: 0.5vh;
    }
    .rightWrapper{
        display: flex;
        justify-content:space-between;
    }
    .checkboxes {
        
    }
    .researcherLabels {
        font-size: 0.8rem;
        margin-right: 0.5vw;
        display: inline-block;
    }
    
    .smallParagraph {
        font-size: 0.9rem;
        font-weight: bold;
        margin-bottom: 0;
    }
    .trashcan_icon {
        display: inline;
        max-width: 3rem;
        max-height: 3rem;
        margin-right:0;
    }
    .email {
        display: inline;
    }
    .headerWrapper {
        overflow: auto;
        white-space: nowrap;
        margin: auto;
        display: flex;
        justify-content:space-between;
    }
</style>