<script>
    import Card from "./Card.svelte";
    let cardClick = () => {
        alert("You clicked on card 1")
    }
    
    let cardClick2 = () => {
        alert("You clicked on card 2")
    }
    
</script>

<div id="container">
    <Card text="Card 1" onClickFunc = {() => cardClick()} width=100 height=80 img="https://i.pinimg.com/736x/04/f5/8a/04f58afd7424a02a826eb74eddf98d91.jpg"}></Card>

    <Card text="Card 2" onClickFunc = {() => cardClick2()} width=100 height=80 img="https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Neckertal_20150527-6384.jpg/1920px-Neckertal_20150527-6384.jpg"}></Card>
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

</style>