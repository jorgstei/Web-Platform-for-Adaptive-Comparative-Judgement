<script>
	export let title;
    export let img;
    export let w;
    export let h;
    export let alt;
</script>

<div class="card" title={alt} width={w} height={h} style="background-image: url({img});">
    {title}
</div>


<style>
    .card {
        width: 400px;
        height: 400px;
        background-size: cover;
        font-size: 30px;
        color: whitesmoke;
    }
</style>