<script>

</script>

<main>
    <h1 id="title">Create quiz</h1>
    <div id="general_info_form">
        <label for="quiz_name" class="text_labels">Quiz title</label>
        <input type="text" name="quiz_name" class="text_input">
        <form id="purpose_wrapper">
            <p>Purpose</p>

            <label>
                <input type="radio" name="purpose" value="research" id="research">
                Research
            </label>
            <label>
                <input type="radio" name="purpose" value="grading" id="grading">
                Grading
            </label>
            <label>
                <input type="radio" name="purpose" value="fun" id="for_fun">
                For fun
            </label>

            <label>
                <input type="radio" name="purpose" value="testing" id="test">
                Testing
            </label>
            
            
        </form>
    </div>
</main>

<style>

    p{
        font-size: 1.5rem;
    }
    .text_labels {
        font-size: 1.5rem;
    }
    #general_info_form {
        text-align: left;
    }
    label {
        left: 0;
    }
    input {
        left: 0;
    }

    main{
        display: grid;
        margin: auto;
        width: 80vw;
        text-align: center;
        
    }
</style>