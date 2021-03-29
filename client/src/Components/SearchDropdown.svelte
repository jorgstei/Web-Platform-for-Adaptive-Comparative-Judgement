<script>
    export let userInfo;
    export let searchFunc;
    export let keydownFunc;
    export let onClickFunc;

    export let searchResults = [];

    $: searchResults;
</script>

<div class="dropdownWrapper">
    <input type="search" id="researcher_search" name="researcher_search" aria-label="Search for researchers" placeholder="🔍Search..." on:keydown={keydownFunc} on:keyup={searchFunc}>
    {#each searchResults.slice(0,5) as result}
        <button on:click={
        ()=>{
            onClickFunc(result);
            document.getElementById("researcher_search").value = "";
            searchResults=[];
            }
        } class="dropdownButtons">{result.email}</button>
    {/each}
</div>


<style>
    .dropdownButtons {
        color: black;
        padding: 12px 16px;
        text-decoration: none;
        display: block;
        width: 100%;
        border: 0;
    }
    .dropdownWrapper {
        display: inline-block;
        background-color: #f6f6f6;
        min-width: 230px;
        border: 1px solid #ddd;
        z-index: 1;
    }
    #researcher_search{
        height: 100%;
        margin:0;
    }
</style>
