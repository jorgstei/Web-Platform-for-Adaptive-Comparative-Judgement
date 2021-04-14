<script>
    import { onMount } from "svelte";
    import { navigate } from "svelte-routing";
    import { surveyService } from "../Services/SurveyService";
    import queryString from "query-string";
    import { Button, Card, CardText, Overlay, Icon } from 'svelte-materialify';
    import { mdiArrowExpand, mdiArrowCollapse } from "@mdi/js";
    import swal from "sweetalert";
    


    export let userInfo;
    export let surveyID;
    console.log("SurveyID from IntroductionToSurvey.svelte: ", surveyID);
    let navwrap = document.getElementById("navWrapper");
    if(navwrap){
        navwrap.style.display = "none";
    }

    let survey = {judgeInstructions: "Loading...", surveyQuestion: "Loading...", expectedComparisons:"..."};

    onMount(async()=>{
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
    })

    let showGeneralInfoOverlay = false;
    let showSurveyJudgeInstructions = false;
    $: survey;
</script>

<main>
    <div class="d-flex flex-column justify-center" style=" padding-top: 10vh;">
        <h1 class="text-h2" style="margin-bottom: 3vh;">You've been asked to participate in a survey!</h1>
        <h2 class="text-h3" style="margin-bottom: 2vh;">The question is:</h2>
        <h1 class="text-h2" style="margin-bottom: 3vh;">{survey.surveyQuestion}</h1>

        <div class="d-flex flex-row justify-space-between" style="margin-top: 5vh;">

            <Card style="width:40%; cursor: default;" hover outlined class="grey lighten-4">
                <Button fab class="float-right" style="min-width:3vw; min-height:3vw;" on:click={(e)=>{showSurveyJudgeInstructions = true; e.stopPropagation();}}>
                    <Icon path={mdiArrowExpand} size="2vw"></Icon>
                </Button>
                <CardText>
                  <div>Extra info</div>
                  <div class="text--primary text-h4">Researcher instructions</div>
                  <div class="text--primary text-h6" style="text-align: left; padding-top: 1vh;">
                    {survey.judgeInstructions}
                  </div>
                </CardText>
            </Card>

            <Overlay
                bind:active={showSurveyJudgeInstructions}
                on:click={()=> showSurveyJudgeInstructions = false}>
                <div style="min-height: 60vh; width: 60vw; margin: auto;" on:click={(e)=>{e.stopPropagation()}}>
                    <Card class="grey lighten-4" style="min-height: 60vh; cursor: default;">
                        <Button fab class="float-right" style="min-width:3vw; min-height:3vw;" on:click={(e)=>{showSurveyJudgeInstructions = false; e.stopPropagation();}}>
                            <Icon path={mdiArrowCollapse} size="2vw"></Icon>
                        </Button>
                        <CardText class="align-items-center">
                            <div class="text-h6">Extra info</div>
                            <div class="text--primary text-h2" style="padding: 2vh 0 2vh 0;">Researcher instructions</div>
                            <div class="text--primary text-h4" style="text-align: left; padding: 1vh 2vw 1vh 2vw;">
                                {survey.judgeInstructions}
                            </div>
                        </CardText>
                    </Card>
                </div>
            </Overlay>
            
            <Card style="width:40%; cursor: default;" hover outlined class="grey lighten-4" >
                <Button fab class="float-right" style="min-width:3vw; min-height:3vw;" on:click={(e)=>{showGeneralInfoOverlay = true; e.stopPropagation();}}>
                    <Icon path={mdiArrowExpand} size="2vw"></Icon>
                </Button>
                <CardText>
                    <div>Extra info</div>
                    <div class="text--primary text-h4">How a survey works</div>
                    <div class="text--primary text-h6" style="text-align: left; padding-top: 1vh;">
                        You will be presented with several pairs of items to compare.
                        These items will be answers to the question above, and you should choose the one which best fits your preference.
                        An item can be a text field, pdf, image, etc.
                        To choose an item you can click the button beneath it, or use the arrow keys.
                        You will be asked to answer {survey.expectedComparisons} comparisons! 
                    </div>
                    <div class="text--primary text-h5" style="text-align: left; margin-top: 1vh;">
                        Good luck!
                    </div>
                </CardText>
            </Card>

            <Overlay
                bind:active={showGeneralInfoOverlay}
                on:click={()=> showGeneralInfoOverlay = false}>
                <div style="min-height: 60vh; width: 60vw; margin: auto;" on:click={(e)=>{e.stopPropagation()}}>
                    <Card class="grey lighten-4" style="min-height: 60vh; cursor: default;">
                        <Button fab class="float-right" style="min-width:3vw; min-height:3vw;" on:click={(e)=>{showGeneralInfoOverlay = false; e.stopPropagation();}}>
                            <Icon path={mdiArrowCollapse} size="2vw"></Icon>
                        </Button>
                        <CardText class="align-items-center">
                            <div class="text-h6">Extra info</div>
                            <div class="text--primary text-h2" style="padding: 2vh 0 2vh 0;">How a survey works</div>
                            <div class="text--primary text-h4" style="text-align: left; padding: 1vh 2vw 1vh 2vw;">
                                You will be presented with several pairs of items to compare.
                                These items will be answers to the question above, and you should choose the one which best fits your preference.
                                An item can be a text field, pdf, image, etc.
                                To choose an item you can click the button beneath it, or use the arrow keys.
                                You will be asked to answer {survey.expectedComparisons} comparisons! 
                            </div>
                            <div class="text--primary text-h3" style="text-align: left; padding: 1vh 2vw 1vh 2vw;">
                                Good luck!
                            </div>
                        </CardText>
                    </Card>
                </div>
            </Overlay>

        </div>
        
        <Button outlined style="width: 30%; height: 5vh; margin-top: 10vh;" class="align-self-center" 
            on:click={() => {navigate("/take_survey")}}
        >Take survey</Button>
    </div>
    
    
    
    
</main>

<style>
    main {
        text-align: center;
        margin: auto;
        width: 80%;
    }
</style>