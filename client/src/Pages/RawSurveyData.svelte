<script>
    import {surveyService} from "../Services/SurveyService"
    import Table from "../Components/Table.svelte"
    import { saveAs } from 'file-saver';
    import { onMount } from 'svelte';
    import queryString from "query-string";
    import {surveyAnswerService} from "../Services/SurveyAnswerService";
    import axios from "axios";

    export let userInfo;
    
    let params = queryString.parse(window.location.search);
    let surveyID = params.id;
    console.log("SurveyID from RawSurveyData.svelte: ", surveyID)

    let survey = {};
    onMount(async ()=> {
        await surveyService.getSurveyByID(surveyID)
        .then((data) => {
            console.log("onMount survey data with id: " + surveyID, data);
            survey = data;
        })
    });
    
    let currentContentView = "linearRanking";
    let linearRanking = null;
    let allJudges = null;
    let surveyStatistics = null;
    let answerValues= [];
    let answerHeaders = ["winner", "loser", "judge id"];
	let getSurveyAnswers = async ()=>{
        await surveyAnswerService.getBySurveyID(surveyID)
        .then((answers)=>{
            console.log("Survey answers: ", answers);

            // Transform JSON and try to get answer
            let newJSON = [];
            answers.forEach(e => {
                newJSON.push(
                    {
                        "judgeName": e.judge_id,
                        "left": e.winner_id,
                        "right": e.loser_id,
                        "result": 1
                    }
                )
                answerValues.push([e.winner_id, e.loser_id, e.judge_id]);
            });
            console.log("Transformed answer values, attempting to send to analyzing module:\n", answerValues);

            axios.defaults.withCredentials = false;
            axios(
                {
                    headers: {"Content-Type": "text/plain"},
                    method: "post",
                    url: "http://acj.heroesunknown.net:1030/estimate",
                    data: newJSON
                }
            )
            .then(async (response) => {
                surveyStatistics = response.data;
                console.log("Successfully recieved statistics for the survey:\n", surveyStatistics);
                allJudges = response.data.judges;
                linearRanking = surveyStatistics.result.sort((a,b)=> {
                    return b.score - a.score;
                })

                let linearRanking2DArray = [];
                for (let i = 0; i < linearRanking.length; i++) {
                    let answerWithSameId = survey.items.find(obj => obj._id == linearRanking[i].individual);
                    linearRanking2DArray.push([answerWithSameId.data, linearRanking[i].infit, linearRanking[i].outfit, linearRanking[i].score])
                }
                
                console.log("Transformed linear ranking from", linearRanking, "to", linearRanking2DArray);
                linearRanking = linearRanking2DArray;
                
                let allJudges2DArray= [];
                allJudges.forEach(e => {
                    allJudges2DArray.push([e.judge, e.agree, e.infit, e.outfit]);
                });
                console.log("Transformed all judges from", allJudges, "to", allJudges2DArray);
                allJudges = allJudges2DArray;
            })
            .catch(error => console.log("Could not fetch statistics for the survey. Failed with error:\n", error))
        .catch(error => console.log("Could not fetch answers for the survey. Failed with error:\n", error))
        
        answerValues = answerValues;
    })
    }
    getSurveyAnswers();

    let downloadFunc = (headers, rows)=> {
        let csvContent = "SEP=, \r\n" + headers.join(',') + "\r\n";
        rows.forEach(e => {
            csvContent += e.join(",") + "\r\n";
        });
        let blob = new Blob([csvContent], {type: "text/csv;charset=utf-8"});
        saveAs(blob, "survey_data.csv")
    }

    let btn = document.createElement("button");
    btn.innerHTML = "Download as .csv";
    btn.style.float = "";
    btn.onclick = ()=>{
        console.log("You just clicked the button! Downloading...");
        downloadFunc(answerHeaders, answerValues);
    }

    let updateCurrentContentView = () => {
        currentContentView = document.getElementById("viewDropdown").value;
        console.log("Current content view is: ", currentContentView);
    }
    
    $: answerValues & survey & surveyStatistics & linearRanking & allJudges & currentContentView;
</script>

<div id="surveyDataWrapper">
    <h1 id="title">{survey.title}</h1>
    {#if surveyStatistics != null}
        <table>
            <tr>
                <th>Reliability</th>
                <th>Number of items</th>
                <th>Number of answers</th>
                <th>Number of judges</th>
            </tr>
            <td>{surveyStatistics.rel}</td>
            <td>{surveyStatistics.result.length}</td>
            <td>{answerValues.length}</td>
            <td>{surveyStatistics.judges.length}</td>
        </table>
    {/if}
    <ul class="dropdownList">
        <li>
            <label for="view">View</label>
            <select name="view" id="viewDropdown" on:input={updateCurrentContentView}>
                <option value="linearRanking">Linear ranking</option>
                <option value="byJudge">By judge</option>
                <option value="byItem">By item</option>
                <option value="rawdata">Raw data</option>
            </select>
        </li>
    </ul>
    {#if currentContentView=="linearRanking"}
        {#if linearRanking != null}
            <Table bind:tableData={linearRanking} tableAttributes={["option", "infit", "outfit", "score"]}></Table>
        {/if}
    {:else if currentContentView=="rawdata"}
        <Table bind:tableData={answerValues} tableAttributes={answerHeaders} element={btn}></Table>
    {:else if currentContentView=="byJudge"}
        {#if allJudges != null}
            <Table bind:tableData={allJudges} tableAttributes={["id", "agree", "infit", "outfit"]}></Table>
        {/if}
    {:else if currentContentView=="byItem"}

    {/if}

</div>



<style>
    #surveyDataWrapper {
        display: grid;
        grid-template-rows: 1fr;
        width: fit-content;
        text-align: center;
        padding-top: 5vh;
    }
    .dropdownList {
        list-style-type: none;
        padding: 0;
        margin: auto;
    }
    li {
        float:left;
        margin-right: 1vw;
    }
    select {
        width: 10vw;
        text-align: center;
    }
    label {
        font-size: 1.7rem;
    }
    #title {
        width: -moz-fit-content;
        width: fit-content;        
        margin: auto;
        margin-bottom: 3vh;
    }
    table{
        width: 76%;
        margin: auto;
        border: 1px solid grey;
    }
    th{
        border-bottom: 1px solid grey;
    }
    
    </style>
