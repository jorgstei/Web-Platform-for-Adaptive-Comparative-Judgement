<script>
    export let fieldTitle;
    export let buttonTitle;
    export let onClickFunc;
</script>

<div class="wrapper">
    <label class="inputLabel" for="inp">{fieldTitle}</label>
    <input class="bigInput" name="inp" type="text" maxlength=6 on:keydown={(e)=>{
        if(e.keyCode == 13){
            onClickFunc();
        }
    }}>
    <button class="submitBtn" on:click={onClickFunc}>{buttonTitle}</button>
</div>


<style>
    .wrapper{
        width: 30vw;
        margin: auto;
        display: grid;
        grid-template-columns: auto;
        background-color: rgba(0,0,0,0.5);
    }
    .inputLabel{
        font-size: 1.5em;
        margin: auto;
        text-align: center;
        color: rgba(255,255,255,1);
    }
    .bigInput{
        width: 50%;
        margin: auto;
        padding: 0.5em 0.5em;
        font-size: 1.5em;
        text-align: center;
        background-color: rgba(200, 200, 200, 0.7);
        border-color: rgba(200, 200, 200, 0.7);
    }
    .bigInput:hover{
        background-color: rgba(150, 150, 150, 0.7);
    }
    .submitBtn{
        width: 50%;
        margin: auto;
        margin-top: 2em;
        font-size: 1.2em;
        background-color: rgba(100, 100, 100, 0.7);
        border-color: rgba(100, 100, 100, 0.7);
        color: rgba(255,255,255,0.9);
        margin-bottom: 1em;
    }
    .submitBtn:hover{
        background-color:  rgba(100, 100, 100, 0.7);
    }
</style>