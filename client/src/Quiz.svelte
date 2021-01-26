<script>
    import Card from "./Card.svelte";
    import {comparisonObjectService} from "./Services/ComparisonObjectService"
    import {navigate} from "svelte-routing";
    
    let randomPair = null;
    comparisonObjectService.getRandomPairComparisonObject().then(data => randomPair = data.data);
    let counter = 0;
    const maxCounter = 5;
    const transition_distance = 300;
    //_id type data
    

    let myOnclick = (e) => {
        if(counter < maxCounter){
            //alert("You clicked on '" + e.target.innerHTML + "'");
            comparisonObjectService.getRandomPairComparisonObject().then(data => randomPair = data.data);
            counter++;
            randomPair = randomPair;
        }
    }

    //img="https://i.pinimg.com/736x/04/f5/8a/04f58afd7424a02a826eb74eddf98d91.jpg"
    //img="https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Neckertal_20150527-6384.jpg/1920px-Neckertal_20150527-6384.jpg"
</script>
    {#if counter < maxCounter}
    {#key counter}
    <div id="container">
        {#if randomPair != null}
            <Card text={randomPair[0].data} onClickFunc = {myOnclick} width=100 height=80  transition_x={-transition_distance} img="https://i.pinimg.com/736x/04/f5/8a/04f58afd7424a02a826eb74eddf98d91.jpg"></Card>
            
            <Card text={randomPair[1].data} onClickFunc = {myOnclick} width=100 height=80  transition_x={transition_distance} img="https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Neckertal_20150527-6384.jpg/1920px-Neckertal_20150527-6384.jpg"></Card>
        {/if}
    </div>
    {/key}
    {:else}
        <div id="thank_you_message">
            <h1>Thank you for participating!</h1>
            <h2>En stor bamseklem fra lasse og jørgen</h2>
        </div>
        {setTimeout(()=>{navigate("/")}, 5000)}
    {/if}


<style>
    #container {
        /*background-color: #333333;*/
        margin: auto;
        margin-top: 10%;
        width: 70%;
        height: 60%;
        display: grid;
        grid-template-columns: 47.5% 47.5%;
        grid-column-gap: 5%;
    }
    #thank_you_message {
        margin: auto;
        margin-top: 10%;
        width: 70%;
        height: 60%;
        text-align: center;
    }

</style>