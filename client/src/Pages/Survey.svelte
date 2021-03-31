<script>
    import Card from "../Components/Card.svelte";
    import {userService} from "../Services/UserService"
    import {surveyService} from "../Services/SurveyService"
    import {surveyAnswerService} from "../Services/SurveyAnswerService"
    import {navigate} from "svelte-routing";
    import {navigateWithRefreshToken} from "../Utility/naviagte"
    import { onMount } from "svelte";
    
    export let userInfo;
    export let surveyID;
    let completed = false
    console.log("SurveyID from Survey.svelte: ", surveyID)
    console.log("judgeID: ", userInfo.userid)
    let navwrap = document.getElementById("navWrapper");
    if(navwrap){
        navwrap.style.display = "none";
    }


    let randomPair = null;
    surveyService.getRandomPairForSurveyByID(surveyID).then(data => randomPair = data.data);
    let counter = 0;
    const maxCounter = 10;
    const transition_distance = 300;

    let leftChoiceClicked = () => {
        const answer = 
        {
            judgeId: userInfo.userid,
            surveyId: surveyID,
            leftOption: randomPair[0]._id,
            rightOption: randomPair[1]._id,
            winner: 1,
        }
        surveyAnswerService.post(answer).then(res => console.log("Posted answer, rightChoiceClicked, Response: ", res))
        if(counter < maxCounter){
            surveyService.getRandomPairForSurveyByID(surveyID).then(data => randomPair = data.data);
            counter++;
            randomPair = randomPair;
        }
    }

    let rightChoiceClicked = () => {
        const answer = 
        {
            judgeId: userInfo.userid,
            surveyId: surveyID,
            leftOption: randomPair[0]._id,
            rightOption: randomPair[1]._id,
            winner: 0,
        }
        surveyAnswerService.post(answer).then(res => console.log("Posted answer, rightChoiceClicked, Response: ", res))
        if(counter < maxCounter){
            surveyService.getRandomPairForSurveyByID(surveyID).then(data => randomPair = data.data);
            counter++;
            randomPair = randomPair;
        }
    }

    let complete = () => {
        if(!completed){
            completed = true
                setTimeout(async ()=>{
                userService.logoutJudge().then(() => userInfo = null); 
                if(navwrap){
                    navwrap.style.display = "initial";
                }
                const res = navigateWithRefreshToken("/")
                console.log("nav with refreshtoken res:",res)
                res.then(data => userInfo = data)
            }
            , 5000)
        }
    }

    onMount(() => {
        let main = document.getElementById("surveyWrapper");
        main.focus();
        let arrowHandler = (e) => {
            let container = document.getElementById("container");
            if(container != null){
                switch (e.keyCode) {
                case 37:
                    console.log("left arrow");
                    let leftButton = container.childNodes[0].childNodes[2];
                    leftButton.click();
                    main.removeEventListener("keyup", arrowHandler);
                    setTimeout(()=>{main.addEventListener("keyup", arrowHandler)}, 1000)
                    break;
                case 39:
                    console.log("right arrow");
                    let rightButton = container.childNodes[2].childNodes[2];
                    rightButton.click();
                    main.removeEventListener("keyup", arrowHandler);
                    setTimeout(()=>{main.addEventListener("keyup", arrowHandler)}, 1000)
                    break;
                default:
                    break;
                }
            }
        }
        main.addEventListener("keyup", arrowHandler);
    });
    

    
    //img="https://i.pinimg.com/736x/04/f5/8a/04f58afd7424a02a826eb74eddf98d91.jpg" https://wwwremaprodstorage.blob.core.windows.net/sys-master-hyb-prod/he6/h4c/8796881485854
    //img="https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Neckertal_20150527-6384.jpg/1920px-Neckertal_20150527-6384.jpg" https://thestayathomechef.com/wp-content/uploads/2017/08/Most-Amazing-Lasagna-2-e1574792735811.jpg
    //<h1>{surveyTitle}</h1>
</script>
<main id="surveyWrapper" tabindex="0">
    {#if counter < maxCounter}
    {#key counter}
    
    <div id="container">
        {#if randomPair != null}
            <Card className="left" buttonText="Choose left" mediaType="text" text={randomPair[0].data} onClickFunc = {leftChoiceClicked} width=100 height=90  transition_x={-transition_distance} img="https://i.pinimg.com/736x/04/f5/8a/04f58afd7424a02a826eb74eddf98d91.jpg"></Card>
            <Card className="right" buttonText="Choose right" mediaType="text" text={randomPair[1].data} onClickFunc = {rightChoiceClicked} width=100 height=90  transition_x={transition_distance} img="https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Neckertal_20150527-6384.jpg/1920px-Neckertal_20150527-6384.jpg"></Card>
        {/if}
    </div>
    {/key}
    {:else}
        <div id="thank_you_message">
            <h1>Thank you for participating!</h1>
            <h2>We greatly appreciate it :)</h2>
        </div>
        {
            complete()
        }
    {/if}

</main>

<style>
    main {
        margin:auto;
        margin-top: 0;
        width: 100vw;
        height: 100vh;
    }
    #container {
        margin: auto;
        padding-top: 10%;
        width: 80%;
        height: 80%;
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-column-gap: 10%;
        
    }
    #thank_you_message {
        margin: auto;
        padding-top: 10%;
        width: 70%;
        height: 60%;
        text-align: center;
    }

</style>