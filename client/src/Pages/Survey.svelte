<script>
    //import Card from "../Components/Card.svelte";
    import {userService} from "../Services/UserService"
    import {surveyService} from "../Services/SurveyService"
    import {surveyAnswerService} from "../Services/SurveyAnswerService"
    import IntroductionToSurvey from "./IntroductionToSurvey.svelte"
    import {navigate} from "svelte-routing";
    import {navigateWithRefreshToken} from "../Utility/naviagte"
    import { onDestroy, onMount } from "svelte";
    import swal from "sweetalert";
    import { Button, Card, CardText, Overlay, Icon, CardActions, ProgressLinear } from 'svelte-materialify';
    import { fade, fly } from 'svelte/transition';
    import queryString from "query-string";


    export let userInfo;
    export let surveyID;
    export let takingSurvey;
    export let showJudgeOverlay;

    console.log("In survey with surveyid", surveyID);
    let question = "";
    let completed = false
    let navwrap = document.getElementById("navWrapper");

    let survey = {judgeInstructions: "Loading...", surveyQuestion: "Loading...", expectedComparisons:"..."};
    if(navwrap){
        navwrap.style.display = "none";
    }


    let randomPair = null;
    
    let counter = 0;
    let maxCounter = 10;
    let progressPercent = 100*counter/maxCounter;

    

    let leftChoiceClicked = () => {
        const answer = 
        {
            judgeId: userInfo.userid,
            surveyId: surveyID,
            leftOption: randomPair[counter].left._id,
            rightOption: randomPair[counter].right._id,
            winner: 1,
        }
        console.log("Sending left answer: ", answer);
        surveyAnswerService.post(answer).then(res => console.log("Posted answer, leftChoiceClicked, Response: ", res)).catch(err => swal("Something went wrong..", "Could not post answer. Recieved error:\n" + err, "error"));
        if(counter < maxCounter){
            counter++;
            progressPercent = 100*counter/maxCounter;
        }
        if(counter >= maxCounter){
            complete();
        }
        userService.refreshJudgeToken();
    }

    let rightChoiceClicked = () => {
        const answer = 
        {
            judgeId: userInfo.userid,
            surveyId: surveyID,
            leftOption: randomPair[counter].left._id,
            rightOption: randomPair[counter].right._id,
            winner: 0,
        }
        surveyAnswerService.post(answer).then(res => console.log("Posted answer, rightChoiceClicked, Response: ", res)).catch(err => swal("Something went wrong..", "Could not post answer. Recieved error:\n" + err, "error"));
        if(counter < maxCounter){
            counter++;
            progressPercent = 100*counter/maxCounter;
        }
        if(counter >= maxCounter){
            complete();
        }
        userService.refreshJudgeToken();
    }

    let complete = () => {
        if(!completed){
            completed = true
                setTimeout(async ()=>{
                if(navwrap){
                    navwrap.style.display = "initial";
                }
                const res = navigateWithRefreshToken("/")
                console.log("nav with refreshtoken res:",res)
                res.then(data => userInfo = data)
            }
            , 5000)
        }
        userService.logoutJudge().then(() => userInfo = null); 
    }

    onMount(async()=>{
        
    })

    onMount(async () => {
        let params = queryString.parse(window.location.search);
        if(params.takeSurvey == 1 && params.surveyID != undefined){
            surveyID = params.surveyID;
        }
        await surveyService.getJudgeToken(surveyID).then(async data => {
            if(data.status < 300){
                data = data.data
                console.log("Get survey Token data: ", data)
                if(data.role === "judge"){
                    userInfo = data;
                    await surveyService.getSurveyByIdAsJudge(surveyID)
                    .then((surveyData)=>{
                        if(surveyData.status < 300){
                            surveyData = surveyData.data;
                            surveyID = surveyData._id;
                            console.log("Survey data from instructions: ", surveyData);
                            question = surveyData.surveyQuestion;
                            survey = surveyData;
                        }
                        else{
                            swal("Error", "An error occured while getting the survey information. Please retry, and if the problem persists contact an administrator.\nResponse: "+surveyData.data.message, "error").then(() => navigate("/"))
                        }
                        
                    })
                    .catch(err => {console.log(err)})
                }
            }
            else{
                swal("Error", "Could not get authentication cookie for this survey. If the problem persists, please contact an administrator.\nError: "+data.data.message, "error").then(() => navigate("/"))
            }
        })
        .catch(err => swal("Something went wrong..", "Could not get authentication cookie for this survey. If the problem persists, please contact an administrator.", "error").then(() => navigate("/")))

        surveyService.getSurveyByIdAsJudge(surveyID)
        .then(data=>{
            if(data.status == 200){
                question=data.data.surveyQuestion
            }
            else{
                swal("Error", "Could not get survey info. If the problem persists, please contact an administrator.", "error")
            }
        })
        .catch(err => swal("Something went wrong..", "Could not get survey info. If the problem persists, please contact an administrator.", "error"));

        surveyService.getItemsToCompareBySurveyId(surveyID).then((data) => {
            if(data.status < 300){
                data = data.data;
                console.log("Data from randomPair: ", data.data);
                randomPair = data.data;
                maxCounter = data.data.length;
            }
            else{
                swal(
                    "Error",
                    "Something went wrong while fetching the questions. Please try again, and if the problem persists contact an administrator.\nError:"+data.data.message,
                    "error"
                )
            }
        });

        takingSurvey = true;
        showJudgeOverlay = true;

        let main = document.getElementById("surveyWrapper");
        main.focus();
        let arrowHandler = (e) => {
            switch (e.keyCode) {
                case 37:
                    console.log("left arrow");
                    leftChoiceClicked();
                    main.removeEventListener("keyup", arrowHandler);
                    setTimeout(()=>{main.addEventListener("keyup", arrowHandler)}, 1000)
                    break;
                case 39:
                    console.log("right arrow");
                    rightChoiceClicked();
                    main.removeEventListener("keyup", arrowHandler);
                    setTimeout(()=>{main.addEventListener("keyup", arrowHandler)}, 1000)
                    break;
                default:
                    break;
            }
        }
        main.addEventListener("keyup", arrowHandler);
    });

    onDestroy(()=>{
        takingSurvey = false;
        showJudgeOverlay = false;
    })
    

    const in_duration = 1000;
    const in_delay = 500;
    const out_duration = 1000;
    const out_delay = 500;
    const transition_x = 300;

    const changeElevation = (e)=> {
        let nodeToCheck = e.target;
        if(nodeToCheck.classList.contains("cardWrapper")){
            nodeToCheck = nodeToCheck.childNodes[0];
        }
        console.log(e.target, nodeToCheck, nodeToCheck.classList);
        if(nodeToCheck.classList.contains("elevation-8")){
            nodeToCheck.classList.add("elevation-20");
            nodeToCheck.classList.remove("elevation-8");
            e.stopPropagation();
        }
        else if(nodeToCheck.classList.contains("elevation-20")){
            nodeToCheck.classList.add("elevation-8");
            nodeToCheck.classList.remove("elevation-20");
            e.stopPropagation();
        }
    }

</script>
<main id="surveyWrapper" tabindex="0">
    {#if counter < maxCounter}
    {#key counter}
    
    <h1 class="text-h4 mb-4">{question}</h1>
    <div style="width:75%; margin:auto;">
        <ProgressLinear value={progressPercent} height="10px"></ProgressLinear>
        <p class="text-h6" style="text-align:center">{"Comparison " + counter + "/"+maxCounter}</p>
    </div>

    <div id="container" class="d-flex flex-row ">
        <Overlay
            bind:active={showJudgeOverlay}
            opacity={1}
            color={"#eee"}
            style="cursor:default"
        >
        
            <IntroductionToSurvey bind:survey={survey} bind:showJudgeOverlay={showJudgeOverlay}/>

        </Overlay>
        {#if randomPair != null}
            <div class="cardWrapper" in:fly={{ x: -transition_x, duration: in_duration, delay:in_delay }} out:fly={{ x: -transition_x, duration: out_duration, delay:out_delay}} on:mouseover={changeElevation} on:mouseleave={changeElevation}>
                <Card style="min-width:100%; min-height:100%; position: relative; cursor: default;" outlined class="grey lighten-3 elevation-8">
                    <CardText style="text-align: center;">
                        <div class="text--primary text-h4">{randomPair[counter].left.data}</div>
                    </CardText>
    
                    <CardActions>
                        <Button style="position: absolute; left:30%; bottom:0; min-width:40%; height:10%;" outlined on:click={leftChoiceClicked}>Choose left</Button>
                    </CardActions>
                </Card>
            </div>
            <div class="cardWrapper" in:fly={{ x: transition_x, duration: in_duration, delay:in_delay }} out:fly={{ x: transition_x, duration: out_duration, delay:out_delay}} on:mouseover={changeElevation} on:mouseleave={changeElevation}>
                <Card style="min-width:100%; min-height:100%; position: relative; cursor: default;" hover outlined class="grey lighten-3 elevation-8">
                    <CardText style="text-align: center;">
                        <div class="text--primary text-h4">{randomPair[counter].right.data}</div>
                    </CardText>
                    
                    <CardActions>
                        <Button style="position: absolute; left:30%; bottom:0; min-width:40%; height:10%;" outlined on:click={rightChoiceClicked}>Choose right</Button>
                    </CardActions>
                </Card>
            </div>
            {/if}
        </div>
        {/key}
    {:else}
        <div id="thank_you_message">
            <h1 class="text-h2" style="margin-bottom:5vh;">Thank you for participating!</h1>
            <h2 class="text-h3">We greatly appreciate it :)</h2>
        </div>
    {/if}

</main>

<style>
    .cardWrapper {
        width:45%; height:80%;
    }
    main {
        margin:auto;
        margin-top: 0;
        width: 100vw;
        max-width: 100%;
        height: 100vh;
    }
    #container {
        margin: auto;
        padding-top: 5vh;
        width: 80%;
        height: 80%;
        display: flex;
        justify-content: space-evenly;
    }
    #thank_you_message {
        margin: auto;
        padding-top: 10%;
        width: 70%;
        height: 60%;
        text-align: center;
    }
    h1{
        padding-top: 5vh;
        text-align: center;
    }
</style>