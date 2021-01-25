<script>
	export let text;
    export let img;
    export let alt;
    export let onClickFunc;
    export let funcParams;
    export let width;
    export let height;
    
</script>

<div class="card" title={alt} style="background-image: url({img}); --w:{width}; --h:{height}" on:click={onClickFunc}>
    {text}
</div>


<style>
    .card {
        width: calc(1% * var(--w));
        height: calc(1% * var(--h));
        margin: auto;
        background-size: 100% 100%;
        text-align: center;
    }
</style>