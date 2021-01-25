<script>
    export let fieldTitle;
    export let buttonTitle;
    export let onClickFunc;
    export let funcParams;
    
</script>
<div class="wrapper">
    <label class="inputLabel" for="inp">{fieldTitle}</label>
    <input class="bigInput" name="inp" type="text">
    <button class="submitBtn" on:click={onClickFunc}>{buttonTitle}</button>
</div>


<style>
    .wrapper{
        width: 70%;
        margin: auto;
        display: grid;
        grid-template-columns: auto;
    }
    .inputLabel{
        font-size: 30px;
        margin: auto;
        text-align: center;
    }
    .bigInput{
        width: 40%;
        margin: auto;
        padding: 0.5em 2em;
        font-size: 2em;
        text-align: center;
        background-color: rgba(200, 200, 200, 0.3);
        border-color: rgba(200, 200, 200, 0.3);
    }
    .bigInput:hover{
        background-color: rgba(150, 150, 150, 0.7);
    }
    .submitBtn{
        width: 15%;
        margin: auto;
        margin-top: 2em;
        font-size: 1.5em;
        background-color: rgba(100, 100, 100, 0.05);
        border-color: rgba(100, 100, 100, 0.05);
    }
    .submitBtn:hover{
        background-color:  rgba(100, 100, 100, 0.3);
    }
</style>