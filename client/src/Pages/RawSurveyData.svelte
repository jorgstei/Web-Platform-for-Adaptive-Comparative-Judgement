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
    

    let linearRankingHeaders = ["option", "infit", "outfit", "wins", "theta"];
    let linearRanking = null;
    let allJudgesHeaders = ["id", "agree", "infit", "outfit"];
    let allJudges = null;
    let allItemsHeaders = ["option", "infit", "outfit", "propscore", "theta", "wins", "losses", "total comparisons", "option number"];
    let allItems2DArray = null;
    
    let currentContentView = "linearRanking";

    let surveyStatistics = null;
    
    let answerValues= [];
    let answerHeaders = ["judge id", "left option", "right option", "result"];
	let getSurveyAnswers = async ()=>{
        await surveyAnswerService.getBySurveyID(surveyID)
        .then((answers)=>{
            console.log("Survey answers: ", answers);

            // Transform JSON and try to get answer
            let newJSON = [];
            answers.forEach( e => {
                newJSON.push(
                    {
                        "judgeName": e.judgeId,
                        "left": e.leftOption,
                        "right": e.rightOption,
                        "result": e.winner
                    }
                )
                answerValues.push([e.judgeId, e.leftOption, e.rightOption, e.winner]);
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
                    return b.theta - a.theta;
                })
                
                let linearRanking2DArray = [];
                allItems2DArray = [];
                for (let i = 0; i < linearRanking.length; i++) {
                    console.log("Survey items: ", survey.items);
                    console.log("Linrank individual: ", linearRanking[i].individual);
                    let answerWithSameId = survey.items.find(obj => obj._id == linearRanking[i].individual);
                    if(answerWithSameId == undefined || answerWithSameId == null){
                        linearRanking2DArray.push(["none", "NaN", "NaN", "NaN"]);
                        allItems2DArray.push(["none", "NaN", "NaN", "NaN", "Nan", "NaN", "Nan", "NaN", "Nan"]);
                    }
                    else{
                        linearRanking2DArray.push([answerWithSameId.data, linearRanking[i].infit, linearRanking[i].outfit, linearRanking[i].score, linearRanking[i].theta])
                        allItems2DArray.push([answerWithSameId.data, linearRanking[i].infit, linearRanking[i].outfit, linearRanking[i].propscore, linearRanking[i].theta,  linearRanking[i].N1, linearRanking[i].N0, linearRanking[i].Ntot, linearRanking[i].id])
                    }
                }
                
                console.log("Transformed linear ranking from", linearRanking, "to", linearRanking2DArray);
                linearRanking = linearRanking2DArray;
                allItems2DArray = allItems2DArray;
                
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

    

    

    //Updates current content view based on value of the dropdown menu
    let updateCurrentContentView = () => {
        currentContentView = document.getElementById("viewDropdown").value;
        console.log("Current content view is: ", currentContentView);
    }

    /*  Downloads data as a csv file
    *   @param {string[]} headers - The headers for the csv file
    *   @param {*[]} rows - Array of arrays which contain the data for each row
    *   @param {string} - Filename of the csv-file. Should not contain the .csv extension at the end
    *   
    */
    let downloadFunc = (headers, rows, filename)=> {
        console.log("In download func");
        console.log("rows: ", rows);
        let csvContent = "SEP=, \r\n" + headers.join(',') + "\r\n";
        rows.forEach(e => {
            console.log("E", e);
            csvContent += e.join(",") + "\r\n";
        });
        let blob = new Blob([csvContent], {type: "text/csv;charset=utf-8"});
        saveAs(blob, filename + ".csv")
    }

    //Download as csv buttons
    let csvDownloadRawDataButton = document.createElement("button");
    csvDownloadRawDataButton.innerHTML = "Download as .csv";
    csvDownloadRawDataButton.style.float = "";
    csvDownloadRawDataButton.onclick = ()=>{
        console.log("You just clicked the download raw data button! Downloading...");
        downloadFunc(answerHeaders, answerValues, survey.title + "_raw_data");
    }

    let csvDownloadByItemButton = document.createElement("button");
    csvDownloadByItemButton.innerHTML = "Download as .csv";
    csvDownloadByItemButton.style.float = "";
    csvDownloadByItemButton.onclick = ()=>{
        console.log("You just clicked the download by item button! Downloading...");
        downloadFunc(allItemsHeaders, allItems2DArray, survey.title + "_survey_data");
    }

    let csvDownloadByJudgeButton = document.createElement("button");
    csvDownloadByJudgeButton.innerHTML = "Download as .csv";
    csvDownloadByJudgeButton.style.float = "";
    csvDownloadByJudgeButton.onclick = ()=>{
        console.log("You just clicked the download by judge button! Downloading...");
        downloadFunc(allJudgesHeaders, allJudges, survey.title + "_judge_data");
    }

    let csvDownloadLinearRankingButton = document.createElement("button");
    csvDownloadLinearRankingButton.innerHTML = "Download as .csv";
    csvDownloadLinearRankingButton.style.float = "";
    csvDownloadLinearRankingButton.onclick = ()=>{
        console.log("You just clicked the download linear ranking button! Downloading...");
        downloadFunc(linearRankingHeaders, linearRanking, survey.title + "_basic_survey_data");
    }
    
    $: answerValues & survey & surveyStatistics & linearRanking & allJudges & allItems2DArray & currentContentView;
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
        {#if linearRanking != null && linearRanking.length > 0}
            <Table bind:tableData={linearRanking} tableAttributes={linearRankingHeaders} element={csvDownloadLinearRankingButton}></Table>
        {:else}
            <h3>This survey is yet to be answered. Come back once you've gathered some participants, or taken the test yourself!</h3>
        {/if}
    {:else if currentContentView=="rawdata"}
        {#if answerValues != null && answerValues.length > 0}
            <Table bind:tableData={answerValues} tableAttributes={answerHeaders} element={csvDownloadRawDataButton}></Table>
        {:else}
            <h3>This survey is yet to be answered. Come back once you've gathered some participants, or taken the test yourself!</h3>
        {/if}
    {:else if currentContentView=="byJudge"}
        {#if allJudges != null && allJudges.length > 0}
            <Table bind:tableData={allJudges} tableAttributes={allJudgesHeaders} element={csvDownloadByJudgeButton}></Table>
        {:else}
            <h3>This survey is yet to be answered. Come back once you've gathered some participants, or taken the test yourself!</h3>
        {/if}
    {:else if currentContentView=="byItem"}
        {#if allItems2DArray != null && allItems2DArray.length > 0}
            <Table bind:tableData={allItems2DArray} tableAttributes={allItemsHeaders} element={csvDownloadByItemButton}></Table>
        {:else}
            <h3>This survey is yet to be answered. Come back once you've gathered some participants, or taken the test yourself!</h3>
        {/if}
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
        width: 20vw;
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
