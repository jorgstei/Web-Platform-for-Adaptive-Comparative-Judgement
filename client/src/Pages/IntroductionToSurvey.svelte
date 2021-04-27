<script>
    import { Button, Card, CardText, Overlay, Icon } from 'svelte-materialify';
    import { mdiArrowExpand, mdiArrowCollapse } from "@mdi/js";
    import swal from "sweetalert";
    
    export let showJudgeOverlay;
    export let survey = undefined;
    console.log("Survey from IntroductionToSurvey.svelte: ", survey);
    let navwrap = document.getElementById("navWrapper");
    if(navwrap){
        navwrap.style.display = "none";
    }

    let showGeneralInfoOverlay = false;
    let showSurveyJudgeInstructions = false;

    const printout = () => {
        console.log("updated survey")
    }
    $: survey && printout();
</script>

<main>
    <div class="d-flex flex-column justify-center" style="">
        <h1 class="question-header" style="padding-bottom: 1vh;">The question is:</h1>
        <h2 class="question-text" style="padding-bottom: 1vh;">{survey?.surveyQuestion}</h2>
        <div class="d-flex flex-row justify-space-around" style="margin-top: 1vh;">

            <Card style="width:40%; cursor: default;" hover outlined class="grey lighten-4">
                <Button fab class="float-right" style="min-width:3vw; min-height:3vw;" on:click={(e)=>{showSurveyJudgeInstructions = true; e.stopPropagation();}}>
                    <Icon path={mdiArrowExpand} size="2vw"></Icon>
                </Button>
                <CardText>
                    <div class="instruction-text">
                        <div>Extra info</div>
                        <div class="text--primary text-h4">Researcher instructions</div>
                        <div class="text--primary" style="text-align: left; padding-top: 1vh;">
                            {survey?.judgeInstructions}
                        </div>
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
                        <CardText class="align-items-center ">
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
                    <div class="extra-info-text">
                        <div>Extra info</div>
                        <div class="text--primary text-h4">How a survey works</div>
                        <div class="text--primary" style="text-align: left; padding-top: 1vh;">
                            You will be presented with several pairs of items to compare.
                            These items will be answers to the question above, and you should choose the one which best fits your preference.
                            An item can be a text field, pdf, image, etc.
                            To choose an item you can click the button beneath it.
                            You will be asked to answer {survey?.expectedComparisons} comparisons! 
                        </div>
                        <div class="text--primary text-h6 mt-4">
                            You can also use the arrow keys to choose between options:
                            <br>
                            <img style="height: 10vh; width:auto; margin-top:1vh;"src="../img/arrowKeys.png" alt="You can also use the arrow keys to choose between options.">
                        </div>
                        <div class="text--primary text-h5" style="text-align: left; margin-top: 1vh;">
                            Good luck!
                        </div>
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
                            <div class="text--primary text-h4 mt-4">
                                You can also use the arrow keys to choose between options:
                                <br>
                                <img style="height: 10vh; width:auto; margin-top:1vh;"src="../img/arrowKeys.png" alt="You can also use the arrow keys to choose between options.">
                            </div>
                            <div class="text--primary text-h3" style="text-align: left; padding: 1vh 2vw 1vh 2vw;">
                                Good luck!
                            </div>
                        </CardText>
                    </Card>
                </div>
            </Overlay>

        </div>
        
        <Button outlined style="width: 30%; height: 5vh; margin-top: 5vh; margin-bottom:5vh;" class="align-self-center" 
            on:click={() => {showJudgeOverlay = false}}
        >Continue</Button>      
    </div>
</main>

<style>
    main {
        overflow-y: auto;
        height: 100vh;
        text-align: center;
        margin: auto;
        width: 100%;
        padding: 0
    }
    h1, h2 {
        line-height: 1;
        height: auto
    }
    img {
        max-width: 100%;
    }
    /* Small Screens (mobile, tablet)*/
    @media (min-width: 0px) and (max-width: 768px) {
        .question-header {
            font-size: 2.75rem;
        }
        .question-text {
            font-size: 2rem;
        }
        .instruction-text, .extra-info-text  {
            font-size: 0.75rem;
        }
    }
    /* Medium Screens (laptops, desktops)*/
    @media (min-width: 769px) and (max-width: 1199px) {
        .question-header {
            font-size: 5rem;
        }
        .question-text {
            font-size: 3.5rem;
        }
        .instruction-text, .extra-info-text  {
            font-size: 1.25rem;
        }
    }
    /* Large Screens (1200p and above)*/
    @media (min-width: 1200px) and (max-width: 4320px) {
        .question-header {
            font-size: 6rem;
        }
        .question-text {
            font-size: 4.5rem;
        }
        .instruction-text, .extra-info-text  {
            font-size: 1.5em;
        }
    }
</style>