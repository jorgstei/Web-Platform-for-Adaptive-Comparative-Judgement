<script>
    //import Card from "../Components/Card.svelte";
    import {userService} from "../Services/UserService"
    import {surveyService} from "../Services/SurveyService"
    import {surveyAnswerService} from "../Services/SurveyAnswerService"
    import {navigate} from "svelte-routing";
    import {navigateWithRefreshToken} from "../Utility/naviagte"
    import { onMount } from "svelte";
    import swal from "sweetalert";
    import { Button, Card, CardText, Overlay, Icon, CardActions } from 'svelte-materialify';
    import { fade, fly } from 'svelte/transition';


    export let userInfo;
    export let surveyID;
    console.log("In survey with surveyid", surveyID);
    let question = "";
    let completed = false
    let navwrap = document.getElementById("navWrapper");
    if(navwrap){
        navwrap.style.display = "none";
    }


    let randomPair = null;
    
    let counter = 0;
    let maxCounter = 10;
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

    onMount(() => {
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
    

    const in_duration = 1000;
    const in_delay = 500;
    const out_duration = 1000;
    const out_delay = 500;
    const transition_x = 300;

    //img="https://i.pinimg.com/736x/04/f5/8a/04f58afd7424a02a826eb74eddf98d91.jpg" https://wwwremaprodstorage.blob.core.windows.net/sys-master-hyb-prod/he6/h4c/8796881485854
    //img="https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Neckertal_20150527-6384.jpg/1920px-Neckertal_20150527-6384.jpg" https://thestayathomechef.com/wp-content/uploads/2017/08/Most-Amazing-Lasagna-2-e1574792735811.jpg
    //<h1>{surveyTitle}</h1>
    
</script>
<main id="surveyWrapper" tabindex="0">
    {#if counter < maxCounter}
    {#key counter}
    
    <h1 class="text-h3">{question}</h1>
    <div id="container" class="d-flex flex-row ">
        {#if randomPair != null}
        <!--

            <Card className="left" buttonText="Choose left" mediaType="text" text={randomPair[counter].left.data} onClickFunc = {leftChoiceClicked} width=100 height=90  transition_x={-transition_distance} img="https://i.pinimg.com/736x/04/f5/8a/04f58afd7424a02a826eb74eddf98d91.jpg"></Card>
            <Card className="right" buttonText="Choose right" mediaType="text" text={randomPair[counter].right.data} onClickFunc = {rightChoiceClicked} width=100 height=90  transition_x={transition_distance} img="https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Neckertal_20150527-6384.jpg/1920px-Neckertal_20150527-6384.jpg"></Card>
        -->
            <div style="width:40%; height:80%;" in:fly={{ x: -transition_x, duration: in_duration, delay:in_delay }} out:fly={{ x: -transition_x, duration: out_duration, delay:out_delay}}>
                <Card style="min-width:100%; min-height:100%; position: relative;" hover outlined class="grey lighten-4">
                    <CardText style="text-align: center;">
                        <div class="text--primary text-h4">{randomPair[counter].left.data}</div>
                    </CardText>
    
                    <CardActions>
                        <Button style="position: absolute; left:30%; bottom:0; min-width:40%; height:10%;" outlined on:click={leftChoiceClicked}>Choose left</Button>
                    </CardActions>
                </Card>
            </div>
            <div style="width:40%; height:80%;"in:fly={{ x: transition_x, duration: in_duration, delay:in_delay }} out:fly={{ x: transition_x, duration: out_duration, delay:out_delay}}>
                <Card style="min-width:100%; min-height:100%; position: relative;" hover outlined class="grey lighten-4">
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
    .leftRightButtons{

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