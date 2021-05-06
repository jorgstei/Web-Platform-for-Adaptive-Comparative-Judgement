<script>
    import { Button, Card, CardText, Overlay, Icon } from 'svelte-materialify';
    import { mdiArrowExpand, mdiArrowCollapse } from "@mdi/js";
    import { onMount } from 'svelte';
    import clamp from "clamp-js"

    
    export let showJudgeOverlay;
    export let survey = undefined;

    let navwrap = document.getElementById("navWrapper");
    if(navwrap){
        navwrap.style.display = "none";
    }

    let clampables = []
    onMount(async () => {
        clampables = clampables.concat([...document.getElementsByClassName("instruction-text")])
        clampables = clampables.concat([...document.getElementsByClassName("extra-info-text")])
        for(let i = 0; i < clampables.length; i++){
            clamp(clampables[i], {clamp: (window.innerHeight*0.6)+"px"})
        }
    })

    let showGeneralInfoOverlay = false;
    let showSurveyJudgeInstructions = false;

    let height = window.innerHeight;
    let cardHeight = (window.innerHeight*0.7)+"px"
    let cardWidth = (window.innerWidth*0.47)+"px"

    window.addEventListener("resize", () => {
        height = window.innerHeight
        cardHeight = (window.innerHeight*0.7)+"px"
        cardWidth = (window.innerWidth*0.47)+"px"
        for(let i = 0; i < clampables.length; i++){
            clamp(clampables[i], {clamp: (window.innerHeight*0.6)+"px"})
        }
    })


</script>

<main>
    <Overlay
    bind:active={showSurveyJudgeInstructions}
    on:click={()=> showSurveyJudgeInstructions = false}>
        <div style="min-height: 60vh; width: 90vw; margin: auto;" on:click={(e)=>{e.stopPropagation()}}>
            <Card class="grey lighten-4 instruction-text" style="height:{(height*0.95)+"px"}; width: 90vw; cursor: default; overflow: auto">
                <Button fab class="float-right" style="min-width:3vw; min-height:3vw;" on:click={(e)=>{showSurveyJudgeInstructions = false; e.stopPropagation();}}>
                    <Icon path={mdiArrowCollapse} size="2vw"></Icon>
                </Button>
                <div class="text--primary text-h2" style="padding: 2vh 0 2vh 0;">Researcher instructions</div>
                <div class="text--primary text-h4" style="text-align: left; padding: 1vh 2vw 1vh 2vw;">
                    {survey?.judgeInstructions}
                </div>
            </Card>
        </div>
    </Overlay>
    <Overlay
    bind:active={showGeneralInfoOverlay}
    on:click={()=> showGeneralInfoOverlay = false}>
        <div style="min-height: 60vh; width: 90vw; margin: auto;" on:click={(e)=>{e.stopPropagation()}}>
            <Card class="grey lighten-4" style="height:{(height*0.95)+"px"}; width: 90vw; cursor: default;overflow: auto">
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
                </CardText>
            </Card>
        </div>
    </Overlay>
    <h1 class="question-header" style="margin-top:5vh">The question is:</h1>
    <h2 class="question-text">{survey?.surveyQuestion}</h2>
    <div class="" style="height: 80%; padding-top: 1.5%">
        <div style="float: left; padding-left: 2.5%;">
            <Card style="width:{cardWidth}; height:{cardHeight}; cursor: default; " hover outlined class="grey lighten-4">
                <Button fab class="float-right" style="min-width:3vw; min-height:3vw;" on:click={(e)=>{showSurveyJudgeInstructions = true; e.stopPropagation();}}>
                    <Icon path={mdiArrowExpand} size="2vw"></Icon>
                </Button>
                <div style="text-overflow: ellipsis; overflow-y:hidden; height:{cardHeight}">
                    <div class="text--primary text-h4">Researcher instructions</div>
                    <p class="instruction-text" style="max-height:{cardHeight}">
                        {survey?.judgeInstructions}
                    </p>
                </div>
            </Card>
        </div>
        <div style="float:right; padding-right: 2.5%;">
        <Card style="width:{cardWidth}; height:{cardHeight}; cursor: default; " hover outlined class="grey lighten-4" >
            <Button fab class="float-right" style="min-width:3vw; min-height:3vw;" on:click={(e)=>{showGeneralInfoOverlay = true; e.stopPropagation();}}>
                <Icon path={mdiArrowExpand} size="2vw"></Icon>
            </Button>
            <div style="text-overflow: ellipsis; overflow-y:hidden; height:{cardHeight}">
                <div class="text--primary text-h4">How a survey works</div>
                <div class="extra-info-text">
                {`You will be presented with several pairs of items to compare.\
                These items will be answers to the question above, and you should choose the one which best fits your preference.\
                An item can be a text field, pdf, image, etc.\
                To choose an item you can click the button beneath it.\
                You will be asked to answer ${survey?.expectedComparisons} comparisons!`
                }
                <div class="extra-info-text mt-4" style="justify-self: center">
                    You can also use the arrow keys to choose between options:
                    <br>
                    <img style="height: 10vh; width:auto; margin-top:1vh; align-self: center;"src="../img/arrowKeys.png" alt="You can also use the arrow keys to choose between options.">
                </div>
            </div>
        </div>
        </Card>
    </div>
    <Button outlined style="width: 30%; height: 5vh; margin-top: 2.5vh; margin-bottom:5vh;" class="align-self-center" 
        on:click={() => {showJudgeOverlay = !showJudgeOverlay}}
    >Continue</Button>      
    </div>
</main>

<style>
    main {
        overflow-y: auto;
        height: 100%;
        text-align: center;
        margin: 0;
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
            font-size: 3rem;
        }
        .question-text {
            font-size: 2.25rem;
        }
        .instruction-text, .extra-info-text  {
            font-size: 1.25rem;
        }
    }
    /* Large Screens (1200p and above)*/
    @media (min-width: 1200px) {
        .question-header {
            font-size: 3.5rem;
        }
        .question-text {
            font-size: 3rem;
        }
        .instruction-text, .extra-info-text  {
            font-size: 1.5em;
        }
    }
</style>