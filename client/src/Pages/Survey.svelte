<script>
    import {userService} from "../Services/UserService"
    import {surveyService} from "../Services/SurveyService"
    import {surveyAnswerService} from "../Services/SurveyAnswerService"
    import IntroductionToSurvey from "./IntroductionToSurvey.svelte"
    import {navigate} from "svelte-routing";
    import {navigateWithRefreshToken} from "../Utility/naviagte"
    import { afterUpdate, beforeUpdate, onDestroy, onMount } from "svelte";
    import swal from "sweetalert";
    import { Button, Card, CardText, Overlay, Icon, CardActions, ProgressLinear } from 'svelte-materialify';
    import { fade, fly } from 'svelte/transition';
    import queryString from "query-string";
    import { surveyItemFileService } from "../Services/SurveyItemFileService";
    import { nodeBufferToFile } from "../Utility/nodeBufferToBlobURL";
    import TextView from '../Components/SurveyComponents/TextView.svelte';
    import PDFView from '../Components/SurveyComponents/PDFView.svelte';
    import { mdiFullscreen } from "@mdi/js";
    import clamp from "clamp-js"

    /*
        TODO: Currently if a judge refreshes the page, they have no way
        to get back to the state they were in.
        A possible solution to this is to store the survey id, and the pairs of IDs a judge is supposed
        to judge in the judge-token, as well as the number of comparisons completed.
        This will be at a cost of higher network usage.
        Another solution is to no longer have a stateless backend.
    */

    export let userInfo;
    export let surveyID;
    export let takingSurvey;
    export let showJudgeOverlay = false;
    export let surveyQuestionInNavBar = "";

    let question = undefined
    let completed = false
    let navwrap = document.getElementById("navWrapper");
    let clampables = []

    let survey;
    if(navwrap){
        navwrap.style.display = "none";
    }

    let randomPair = [];
    
    let counter = -1;
    let maxCounter = 10;
    let progressPercent = 100*counter/maxCounter;

    let showLeftItemOverlay = false;
    let showRightItemOverlay = false;

    const in_duration = 800;
    const in_delay = 300;
    const out_duration = 800;
    const out_delay = 300;
    const transition_x = 300;

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
        }
    }

    beforeUpdate(() => {
        console.log("FINDME beforeupdate")
        window.scrollTo(0,0);
        window.scrollBy(0, window.innerHeight)
    })

    onMount(async () => {
        document.ontouchmove = () => e.preventDefault();
        let params = queryString.parse(window.location.search);
        if(params?.takeSurvey == 1 && params?.surveyID != undefined){
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
                            console.log("Survey data from onMount in survey: ", surveyData);
                            question = surveyData.surveyQuestion;
                            survey = surveyData;
                            surveyQuestionInNavBar = question;
                        }
                        else{
                            swal("Error", "An error occured while getting the survey information. Please retry, and if the problem persists contact an administrator.\nResponse: "+surveyData.data.message, "error").then(() => navigate("/"))
                        }
                        
                    })
                    .catch(err => {console.log(err)})
                }
            }
            else{
                swal("Error", "Could not get authentication cookie for this survey. If the problem persists, please contact an administrator.\nError: "+data.data.message, "error")
                .then(() => {
                    navigate("/")
                })
            }
        })
        .catch(err => swal("Something went wrong..", "Could not get authentication cookie for this survey. If the problem persists, please contact an administrator.", "error")
        .then(() => navigate("/")))

        if(surveyID != undefined){
            surveyService.getItemsToCompareBySurveyId(surveyID)
            .then((data) => {
                if(data.status < 300){
                    data = data.data;
                    console.log("Data from randomPair: ", data);
                    maxCounter = data.data.length;
                    data.data.forEach(async (item) => {
                        let left = {};
                        let right = {};
                        if(item.left.type=="pdf"){
                            left.type= "pdf";
                            left._id = item.left._id;
                            await surveyItemFileService.get(item.left.data)
                            .then(res => {
                                left.data = URL.createObjectURL(nodeBufferToFile(res.data.data, "application/pdf"));
                            })
                        }
                        else{
                            left = item.left;
                        }
                        if(item.right.type=="pdf"){
                            right.type= "pdf";
                            await surveyItemFileService.get(item.right.data)
                            .then(res => {
                                right._id = item.right._id;
                                right.data = URL.createObjectURL(nodeBufferToFile(res.data.data, "application/pdf"));
                            })
                        }
                        else{
                            right = item.right;
                        }
                        randomPair.push({"left": left, "right": right});
                        randomPair = randomPair;
                        console.log("pushed to randompair", randomPair);
                    });
                    randomPair = randomPair;
                    
                }
                else{
                    swal(
                        "Error",
                        "Something went wrong while fetching the questions. Please try again, and if the problem persists contact an administrator.\nError:"+data.data.message,
                        "error"
                    )
                }
            })
            .catch(err => swal("Could not get survey items.", "Error:\n" + err, "error"));
        }
        takingSurvey = true;
        showJudgeOverlay = true;

        let main = document.getElementById("surveyWrapper");
        main.focus();
        let arrowHandler = (e) => {
            switch (e.keyCode) {
                case 37:
                    leftChoiceClicked();
                    main.removeEventListener("keyup", arrowHandler);
                    setTimeout(()=>{main.addEventListener("keyup", arrowHandler)}, 1000)
                    break;
                case 39:
                    rightChoiceClicked();
                    main.removeEventListener("keyup", arrowHandler);
                    setTimeout(()=>{main.addEventListener("keyup", arrowHandler)}, 1000)
                    break;
                default:
                    break;
            }
        }
        main.addEventListener("keyup", arrowHandler);
        clampText()
        counter++;
    });

    /*
        This function will prevent overflow and add "..." at the end of the text
    */
    let clampText = () => {
        clampables = [...document.getElementsByClassName("card-text")]
        for(let i = 0; i < clampables.length; i++){
            let height = (clampables[i].parentElement.clientHeight)+"px"
            clampables[i].style = `max-height: ${height}`
            clamp(clampables[i], {clamp: height})
        }
    }
    /*
        When this component gets destroyed we change the booleans for the parent to show the correct state.
    */
    onDestroy(()=>{
        takingSurvey = false;
        showJudgeOverlay = false;
        document.ontouchmove = (e) => {
            return true;
        }
    })
    

    /*
        When we mouse over or leave the cards we change the elevation to "show" that the item is hovered.
        (Might be confused for a button despite the cursor being default)
    */
    const changeElevation = (e)=> {
        let nodeToCheck = e.target;
        if(nodeToCheck.classList.contains("cardWrapper")){
            nodeToCheck = nodeToCheck.childNodes[0];
        }
        //console.log(e.target, nodeToCheck, nodeToCheck.classList);
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

    /*
        If the size of our window changes, we should reclamp the text
    */
    window.addEventListener("resize", () => {
        clampText();
    })

    afterUpdate(() => {
        clampText();
    })

    const scrollProgressBarIntoView = () => {
        console.log("FINDME")
        window.scrollTo(0,0)
        setTimeout(() => window.scrollTo(0,0), 1000)
    }
    

    $: survey;
    $: showJudgeOverlay && scrollProgressBarIntoView();
    // apply to left and right cards for animation, currently messes up rerendering pdfs
    // in:fly={{ x: -transition_x, duration: in_duration, delay:in_delay }} out:fly={{ x: -transition_x, duration: out_duration, delay:out_delay}}
    // in:fly={{ x: transition_x, duration: in_duration, delay:in_delay }} out:fly={{ x: transition_x, duration: out_duration, delay:out_delay}}
</script>
<main id="surveyWrapper" tabindex="0">
    {#if counter < maxCounter}
    {#key counter}
    
    <div style="width:100%; margin:auto;">
        <ProgressLinear id="survey-progressbar" value={progressPercent} height="1vh"></ProgressLinear>
        <p class="text-h6" style="text-align:center">{"Comparison " + (counter+1) + "/"+maxCounter}</p>
    </div>

    <Overlay
        bind:active={showJudgeOverlay}
        opacity={1}
        color={"#eee"}
        style="cursor:default;"
    >
    <IntroductionToSurvey bind:survey={survey} bind:showJudgeOverlay={showJudgeOverlay}/>
    </Overlay>
    <div id="container" class="d-flex flex-row justify-space-between">
        <!-- Add new media types with {:else if ...} Remember to do this to both left and right card-->
        {#if randomPair.length != 0 && randomPair[counter] != undefined}
            <div class="cardWrapper" on:mouseover={changeElevation} on:mouseleave={changeElevation}>
                <Card style="min-width:100%; height:100%; position: relative; cursor: default;" outlined class="grey lighten-3 elevation-8">
                    <div style="float: right; cursor:pointer; margin:0;padding:0;" on:click={()=>showLeftItemOverlay = true}><Icon path={mdiFullscreen}></Icon></div>
                    <div style="text-align: center; display:flex; align-items: center; justify-content: center; height:85%; margin: auto;">
                        {#if randomPair[counter].left.type == "plain"}
                            <TextView class="card-text card-text-scale" style="overflow: hidden; height:100%" textID={randomPair[counter].left.data}></TextView>
                            <Overlay
                            bind:active={showLeftItemOverlay}
                            opacity={1}
                            color={"#eee"}
                            style="cursor:default;">
                                <TextView class="overlay-item card-text-scale" style="overflow: auto" textID={randomPair[counter].left.data}></TextView>
                                <Button outlined on:click={()=>showLeftItemOverlay = false}>Continue</Button>
                            </Overlay>
                        {:else if randomPair[counter].left.type == "pdf"}
                            <PDFView src={randomPair[counter].left.data} iframeId="lefOption" width="100%" height="100%"></PDFView>
                            <Overlay
                            bind:active={showLeftItemOverlay}
                            opacity={1}
                            color={"#eee"}
                            style="cursor:default;">
                                <PDFView src={randomPair[counter].left.data} iframeId="lefOptionOverlay" width="100vw" height="90vh"></PDFView>
                                <Button outlined on:click={()=>showLeftItemOverlay = false}>Continue</Button>
                            </Overlay>
                        {/if}
                    </div>
                    <CardActions>
                        <Button style="position: absolute; left:30%; bottom:0; min-width:40%; height:10%;margin-top:7px" outlined on:click={leftChoiceClicked}>Choose left</Button>
                    </CardActions>
                </Card>
            </div>
            <div class="cardWrapper"  on:mouseover={changeElevation} on:mouseleave={changeElevation}>
                <Card style="min-width:100%; height:100%; position: relative; cursor: default;" hover outlined class="grey lighten-3 elevation-8">
                    <div style="float: right; cursor:pointer; margin:0;padding:0;" on:click={()=>showRightItemOverlay = true}><Icon path={mdiFullscreen}></Icon></div>
                    <div style="text-align: center; display:flex; align-items: center; justify-content: center; height:85%; margin: auto;">
                        {#if randomPair[counter].right.type == "plain"}
                        <TextView class="card-text card-text-scale" style="overflow: hidden; height:100%" textID={randomPair[counter].right.data}></TextView>
                            <Overlay
                            bind:active={showRightItemOverlay}
                            opacity={1}
                            color={"#eee"}
                            style="cursor:default;">
                                <TextView class="overlay-item card-text-scale" style="overflow: auto" textID={randomPair[counter].right.data}></TextView>
                                <Button outlined on:click={()=>showRightItemOverlay = false}>Continue</Button>
                            </Overlay>
                        {:else if randomPair[counter].right.type == "pdf"}
                            <PDFView src={randomPair[counter].right.data} iframeId="rightOption" width="100%" height="100%"></PDFView>

                            <Overlay
                            bind:active={showRightItemOverlay}
                            opacity={1}
                            color={"#eee"}
                            style="cursor:default;">
                                <PDFView src={randomPair[counter].right.data} iframeId="rightOptionOverlay" width="100vw" height="90vh"></PDFView>
                                <Button outlined on:click={()=>showRightItemOverlay = false}>Continue</Button>
                            </Overlay>
                        {/if}
                    </div>
                    
                    <CardActions>
                        <Button style="position: absolute; left:30%; bottom:0; min-width:40%; height:10%;margin-top:7px" outlined on:click={rightChoiceClicked}>Choose right</Button>
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
            <Button style="margin-top:5vh;" outlined on:click={()=>{
                takingSurvey = false;
                if(navwrap){
                    navwrap.style.display = "initial";
                }
                const res = navigateWithRefreshToken("/")
                console.log("nav with refreshtoken res:",res)
                res.then(data => userInfo = data)
                userService.logoutJudge().then(() => userInfo = null); 
            }}>Return to home</Button>
        </div>
    {/if}

</main>

<style>
    .cardWrapper {
        width:48%; height:100%;
    }
    main {
        margin:0;
        width: 100vw;
        max-width: 100%;
        height: 100%;
        overflow: hidden;
    }
    #container {
        margin: 0;
        padding-top: 0.5vh;
        width: 100%;
        height: 90%;
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
    :global(.overlay-item){
        height: 90vh;
        width: 90vw;
        text-align: center;
        text-justify: center;
        align-content: center;
        justify-content: center;
    }
    :global(.card-text) {
        text-align: center;
        text-overflow: ellipsis;
        overflow: hidden; 
    }
    /* Small Screens (mobile, tablet)*/
    @media (min-width: 0px) and (max-width: 768px) {
        :global(.card-text-scale)  {
            font-size: 1rem;
        }
    }
    /* Medium Screens (laptops, desktops)*/
    @media (min-width: 769px) and (max-width: 1199px) {
        :global(.card-text-scale)  {
            font-size: 1.25rem;
        }
    }
    /* Large Screens (1200p and above)*/
    @media (min-width: 1200px) {
        :global(.card-text-scale)  {
            font-size: 1.5em;
        }
    }
</style>