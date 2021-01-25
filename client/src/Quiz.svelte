<script>
    let cardClick = () => {
        alert("You clicked on a card")
    }
</script>

<div id="container">
    <div id="card1" class="card" on:click={() => cardClick()}>

    </div>
    <div id="card2" class="card" on:click={() => cardClick()}>

    </div>
</div>

<style>
    #container {
        /*background-color: #333333;*/
        margin: auto;
        margin-top: 10%;
        width: 70%;
        height: 60%;
        display: grid;
        grid-template-columns: 40% 40%;
        grid-column-gap: 20%;
    }
    .card {
        width: 100%;
        height: 80%;
        margin: auto;
    }
    #card1 {
        background-color: royalblue;
        
    }
    #card2 {
        
        background-color: saddlebrown;
    }

</style>