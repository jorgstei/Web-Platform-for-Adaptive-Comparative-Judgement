<script>
    import {comparisonObjectService} from "../Services/ComparisonObjectService"
    let all = null
    comparisonObjectService.getAllComparisonObjects().then(data => all = data)
    console.log(all)
    let byID = null
    $: all && comparisonObjectService.getComparisonObjectByID(all[0]._id).then(data => byID = data)
    let randomPair = null
    comparisonObjectService.getRandomPairComparisonObject().then(data => randomPair = data.data)
</script>
<main>
	<div id="welcomeWrapper">
        <h1>Welcome</h1>
        <h2>All comparison objects</h2>
        {#if all != null}      
            {#each all as obj}
                <h3>{obj._id} - {obj.type} - {obj.data}</h3>
            {/each}
        {/if}
        <h2>Comparison object by id</h2>
        {#if byID != null}
            <h3>{byID._id} - {byID.type} {byID.data}</h3>
        {/if}
        <h2>Random Pair of Comparison objects</h2>
        {#if randomPair != null}
            {#each randomPair as obj}
                <h3>{obj._id} - {obj.type} - {obj.data}</h3>
            {/each}
        {/if}
	</div>
</main>