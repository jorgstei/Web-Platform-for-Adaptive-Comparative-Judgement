<script>
    import { fade, fly } from 'svelte/transition';

	export let text;
    export let img = "";
    export let alt;
    export let onClickFunc;
    export let width;
    export let height;
    export let transition_x;
    export let in_duration = 1000;
    export let in_delay = 500;
    export let out_duration = 1000;
    export let out_delay = 500;
    export let className = "card";
    export let mediaType = "text";
    export let buttonText = "Choose";
    
</script>

<div class="cardWrapper" in:fly="{{ x: transition_x, duration: in_duration, delay:in_delay }}" out:fly="{{ x: transition_x, duration: out_duration, delay:out_delay}}">
    {#if mediaType=="text"}
        <textarea class={"card_text card " + className} readonly style="--w:{width}; --h:{height}">{text}</textarea>
    {:else}
        <div class={"card " + className} title={alt} style="background-image: url({img}); --w:{width}; --h:{height}">
            <p class="card_text">{text}</p>
        </div>
    {/if}
    <button class="cardBtn" on:click={onClickFunc}>{buttonText}</button>
</div>



<style>
    .card {
        width: calc(1% * var(--w));
        height: calc(1% * var(--h));
        margin: auto;
        background-size: 100% 100%;
    }
    .card_text{
        font-size: 2rem;
        margin:auto;
        margin-bottom: 2vh;
        text-align: center;
        background-color: rgba(255, 255, 255, 0.01);
        resize: none;
    }
    .cardBtn{
        margin:auto;
        margin-top: 0vh;
        font-size: 2rem;
    }
    .cardWrapper {
        text-align: center;
        display: grid;
        grid-template-rows: auto;
    }
</style>