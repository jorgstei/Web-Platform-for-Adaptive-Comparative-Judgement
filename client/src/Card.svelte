<script>
    import { fade, fly } from 'svelte/transition';

	export let text;
    export let img;
    export let alt;
    export let onClickFunc;
    export let width;
    export let height;
    export let transition_x;
    
</script>

<div class="card" title={alt} style="background-image: url({img}); --w:{width}; --h:{height}" on:click={onClickFunc} in:fly="{{ x: transition_x, duration: 2000, delay:1000 }}" out:fly="{{ x: transition_x, duration: 500, delay:500}}">
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