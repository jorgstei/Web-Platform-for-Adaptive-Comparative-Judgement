<script>

    export let title = null;
    export let mediaType;
    export let userInfo;
    const capitalize = (str) => {
        return str.charAt(0).toUpperCase() + str.substring(1, str.length);
    }
    console.log(title);
    title = title;
    $: title;
</script>

<div class="wrapperBoxes">
    <input type="text" class="option_title" placeholder="Title for option" value={title || ""}>
    <div class="labelSelectWrapper">
        <label for="media_for_option" class="labels">Media type:</label>
        <select name="media_for_option" class="dropdown_media_options">
            {#if mediaType!=="mix"}
                <option value={mediaType}>{capitalize(mediaType)}</option>
            {:else}
                <option value="text">Text</option>
                <option value="image">Image</option>
                <option value="pdf">PDF</option>
            {/if}
        </select>
        <div class="deleteOption">
            <button class="deleteButton"
            on:click={(e) => {
                let optionWrapper = e.target.parentElement.parentElement.parentElement.parentElement;
                console.log("I want to remove element: ", optionWrapper);
                optionWrapper.remove();
            }}>
            <img class="trashcan_icon"src="https://image.flaticon.com/icons/png/512/542/542724.png" alt="Delete-icon">
        </button>
        </div>
    </div>
</div>

<style>
    .wrapperBoxes{
        margin: 1vh 0vh 1vh 0vh;
        display: grid;
        grid-template-columns: 2fr 1fr;
        grid-column-gap: 2vw;
        border: 1px solid #ddd;
        padding: 1vw;
    }
    .option_title {
        font-size: 1rem;
        grid-area: "title";
        border-top: 0;
        border-left: 0;
        border-right: 0;
    }
    .dropdown_media_options {
        font-size: 1rem;
        float: left;
        grid-area: "dropdown"
    }
    .labels {
        font-size: 1.2rem;
        grid-area:"label";
    }
    .trashcan_icon {
        max-width: 100%;
        margin: auto;
        min-width: 2vw;
    }
    
    .deleteButton{
        background-color: transparent;
        border: 0px;
        max-width: 15%;
        float:right;
    }
    .deleteButton:hover {
        cursor: pointer;
    }
    .deleteButton:focus {
        border: 1px solid rgba(0, 0, 0, 0.5);
    }
</style>