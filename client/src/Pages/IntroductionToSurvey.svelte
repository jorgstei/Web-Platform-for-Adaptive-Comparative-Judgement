<script>
    import { onMount } from "svelte";
    import { navigate } from "svelte-routing";
    import { surveyService } from "../Services/SurveyService";
    import queryString from "query-string";
    
    import { Button } from 'svelte-materialify';


    export let userInfo;
    export let surveyID;
    console.log("SurveyID from IntroductionToSurvey.svelte: ", surveyID);
    let navwrap = document.getElementById("navWrapper");
    if(navwrap){
        navwrap.style.display = "none";
    }

    let survey;

    onMount(async()=>{
        let params = queryString.parse(window.location.search);
        if(params.takeSurvey == 1 && params.surveyID != undefined){
            surveyID = params.surveyID;
        }
        await surveyService.getSurveyToken(surveyID).then(async data => {
            console.log("Get survey Token data: ", data)
            if(data.role === "judge"){
                userInfo = data;
                await surveyService.getSurveyByIdAsJudge(surveyID)
                .then((surveyData)=>{
                    surveyID = surveyData._id;
                    console.log("Survey data from instructions: ", surveyData);
                    survey = surveyData;
                    
                })
                .catch(err => {console.log(err)})
            }
        })
        .catch(err => swal("Something went wrong..", "Could not get authentication cookie for this survey. If the problem persists, please contact an administrator.", "error"));
        let questionHeader = document.getElementById("surveyQuestion");
        questionHeader.innerHTML = survey.surveyQuestion;
        let textarea  = document.getElementById("judgeInstructionTextArea");
        textarea.innerHTML = survey.judgeInstructions;
        textarea.style.height = (textarea.scrollHeight > textarea.clientHeight) ? (textarea.scrollHeight+5)+"px" : "20vh";
        let text2 = document.getElementById("generalInfoTextArea");
        text2.innerHTML = "You will be presented with several pairs of items to compare.\nThese items will be answers to the question above, and you should choose the one which best fits your preference. An item can be a text field, pdf, image, etc. To choose an item you can click the button beneath it, or use the arrow keys.\nYou will be asked to answer 10 comparisons!\n\nGood luck!";
        text2.style.height = (text2.scrollHeight > text2.clientHeight) ? (text2.scrollHeight+5)+"px" : "20vh";
    })

    
    $: survey;
</script>

<main>
    
    <div class="d-flex flex-column " >
        <h1 class="text-h2">You've been asked to participate in this survey!</h1>
        <h2 class="text-h3">The question is:</h2>
        <h1 class="text-h2" id="surveyQuestion"></h1>

        <div class="d-flex flex-row justify-space-between">
            <h3>Researcher instructions:</h3>
            <textarea id="judgeInstructionTextArea" readonly></textarea>

            <h3>How a survey works:</h3>
            <textarea readonly id="generalInfoTextArea"></textarea>
        </div>

    </div>
    
    
    <Button outlined id="startTest" 
    on:click={() => {navigate("/take_survey")}}
    >Take survey</Button>
    
</main>

<style>
    main {
        text-align: center;
        margin: auto;
        grid-template-areas:
        "title title"
        "specific general"
        "specific general"
        "btn btn";
        grid-column-gap: 5vw;
        display: grid;
        width: 80%;
        padding-top: 5vh;
    }
    textarea {
        line-height: 2rem;
        font-size: 1.5rem;
        min-height: 20vh;
        min-width: 40vw;
        height: auto;
        word-wrap:break-word;
        padding: 2vw;
        margin-bottom: 5vh;
        background-color: #eee;
        resize: none;  
    }
    #titleWrapper {
        grid-area: title;
    }
    #judgeInstructionsWrapper{
        grid-area: specific;
    }
    #generalInfoWrapper {
        grid-area: general;
    }
    #startTest {
        grid-area: btn;
        width: 10vw;
        height: 10vh;
        margin: auto;
    }
</style>