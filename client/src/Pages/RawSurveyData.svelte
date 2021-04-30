<script>
    import { surveyService } from "../Services/SurveyService";
    import Table from "../Components/Table.svelte";
    import { saveAs } from "file-saver";
    import { onMount } from "svelte";
    import queryString from "query-string";
    import { surveyAnswerService } from "../Services/SurveyAnswerService";
    import axios from "axios";
    import swal from "sweetalert";
    import { dateFromObjectId } from "../Utility/dateFromObjectId";
    import {Select, Row, Col, ButtonGroup, ButtonGroupItem} from "svelte-materialify"
import { surveyItemFileService } from "../Services/SurveyItemFileService";

    export let userInfo;

    let params = queryString.parse(window.location.search);
    let surveyID = params.id;
    console.log("SurveyID from RawSurveyData.svelte: ", surveyID);

    let survey = {};
    onMount(async () => {
        await surveyService.getSurveyByID(surveyID).then((data) => {
            if(data.status == 200){
                data = data.data;
                console.log("onMount survey data with id: " + surveyID, data);
                survey = data;
            }
            else{
                swal("Error", "Error getting survey data: "+data.data.message+".", "error")
            }
        });
    });

    // Linear ranking
    let linearRankingHeaders = [
        { fieldName: "", viewName: "tag" },
        { fieldName: "", viewName: "option" },
        { fieldName: "", viewName: "infit" },
        { fieldName: "", viewName: "outfit" },
        { fieldName: "", viewName: "wins" },
        { fieldName: "", viewName: "theta" },
    ];
    let linearRanking = null;

    // By judge
    let allJudgesHeaders = [
        { fieldName: "", viewName: "judge id" },
        { fieldName: "", viewName: "answers" },
        { fieldName: "", viewName: "agree" },
        { fieldName: "", viewName: "infit" },
        { fieldName: "", viewName: "outfit" },
        { fieldName: "", viewName: "Left bias" },
        { fieldName: "", viewName: "Right bias" },
        { fieldName: "", viewName: "Median seconds per answer" },
        { fieldName: "", viewName: "Average seconds per answer" },
        { fieldName: "", viewName: "delete" },
    ];
    let allJudges = null;

    // By item
    let allItemsHeaders = [
        { fieldName: "", viewName: "tag" },
        { fieldName: "", viewName: "option" },
        { fieldName: "", viewName: "infit" },
        { fieldName: "", viewName: "outfit" },
        { fieldName: "", viewName: "propscore" },
        { fieldName: "", viewName: "theta" },
        { fieldName: "", viewName: "wins" },
        { fieldName: "", viewName: "losses" },
        { fieldName: "", viewName: "total comparisons" },
        { fieldName: "", viewName: "option number" },
    ];
    let allItems2DArray = null;

    
    // Raw data
    let answerValues = [];
    let answerHeaders = [
        { fieldName: "", viewName: "judge id" },
        { fieldName: "", viewName: "left item" },
        { fieldName: "", viewName: "right item" },
        { fieldName: "", viewName: "result" },
    ];

    // Default content view
    let currentContentView = "linearRanking";

    let surveyStatistics = null;

    //Object that maps keys (item id) to values (item tag)
    let itemIdToTag = {};

    let getEstimate = async (newJSON, answers) => {
        await surveyService
            .estimate(newJSON)
            .then(async (response) => {
                if (response.status == 200) {
                    surveyStatistics = response.data;
                    console.log(
                        "Successfully recieved statistics for the survey:\n",
                        surveyStatistics
                    );
                    allJudges = response.data.judges;
                    linearRanking = surveyStatistics.result.sort((a, b) => {
                        return b.theta - a.theta;
                    });

                    let linearRanking2DArray = [];
                    allItems2DArray = [];
                    for (let i = 0; i < linearRanking.length; i++) {
                        console.log("Survey items: ", survey.items);
                        console.log(
                            "Linrank individual: ",
                            linearRanking[i].individual
                        );
                        let answerWithSameId = survey.items.find(
                            (obj) => obj._id == linearRanking[i].individual
                        );
                        if ( answerWithSameId == undefined || answerWithSameId == null) {
                            linearRanking2DArray.push([
                                "none",
                                "NaN",
                                "NaN",
                                "NaN",
                            ]);
                            allItems2DArray.push([
                                "none",
                                "NaN",
                                "NaN",
                                "NaN",
                                "Nan",
                                "NaN",
                                "Nan",
                                "NaN",
                                "Nan",
                            ]);
                        } 
                        else {
                            let itemFile = await surveyItemFileService.getView(answerWithSameId.data);
                            console.log("itemfile", itemFile);
                            itemIdToTag[answerWithSameId._id] = itemFile.data.tag;
                            console.log("andtags", itemIdToTag);
                            console.log("linrank2d arr getting pushed, linrank[i] is", linearRanking[i]);
                            linearRanking2DArray.push([
                                itemFile.data.tag,
                                answerWithSameId.data,
                                linearRanking[i].infit === undefined ? "N/A": linearRanking[i].infit,
                                linearRanking[i].outfit === undefined ? "N/A": linearRanking[i].outfit,
                                linearRanking[i].score === undefined ? "N/A": linearRanking[i].score,
                                linearRanking[i].theta === undefined ? "N/A": linearRanking[i].theta,
                            ]);
                            allItems2DArray.push([
                                itemFile.data.tag,
                                answerWithSameId.data,
                                linearRanking[i].infit === undefined ? "N/A": linearRanking[i].infit,
                                linearRanking[i].outfit === undefined ? "N/A": linearRanking[i].outfit,
                                linearRanking[i].propscore === undefined ? "N/A": linearRanking[i].propscore,
                                linearRanking[i].theta === undefined ? "N/A": linearRanking[i].theta,
                                linearRanking[i].N1 === undefined ? "N/A": linearRanking[i].N1,
                                linearRanking[i].N0 === undefined ? "N/A": linearRanking[i].N0,
                                linearRanking[i].Ntot === undefined ? "N/A": linearRanking[i].Ntot,
                                linearRanking[i].id === undefined ? "N/A": linearRanking[i].id,
                            ]);
                        }
                    }

                    console.log(
                        "Transformed linear ranking from",
                        linearRanking,
                        "to",
                        linearRanking2DArray
                    );
                    linearRanking = linearRanking2DArray;
                    allItems2DArray = allItems2DArray;

                    let allJudges2DArray = [];
                    allJudges.forEach((e) => {
                        const leftBias = getLeftBias(answers, e.judge);
                        const medianTime = getMedianTime(answers, e.judge);
                        const averageTime = getAverageTime(answers, e.judge);

                        allJudges2DArray.push([
                            e.judge === undefined ? "N/A": e.judge,
                            answers.filter((answer) => answer.judgeId == e.judge).length,
                            e.agree === undefined ? "N/A": e.agree,
                            e.infit === undefined ? "N/A": e.infit,
                            e.outfit === undefined ? "N/A": e.outfit,
                            leftBias === "N/A" ? leftBias: leftBias.toFixed(2),
                            leftBias === "N/A" ? leftBias: (1 - leftBias).toFixed(2),
                            medianTime === "N/A" ? medianTime: medianTime.toFixed(2),
                            averageTime === "N/A" ? averageTime: averageTime.toFixed(2),
                        ]);
                    });
                    console.log(
                        "Transformed all judges from",
                        allJudges,
                        "to",
                        allJudges2DArray
                    );
                    allJudges = allJudges2DArray;
                } else {
                    swal(
                        "Error",
                        "Error analyzing survey data: " + response.data.message +".\nA likely cause of this is too few answers for the survey, or little variance in the answers.",
                        "error"
                    );
                }
            })
            .catch((error) => {
                console.log(error)
                swal(
                    "Error",
                    "An error occured when fetching statistics for the survey",
                    "error"
                );
            });
    };

    let getSurveyAnswers = async () => {
        await surveyAnswerService
            .getBySurveyID(surveyID)
            .then(async (answers) => {
                console.log("Survey answers: ", answers);
                if (answers.status == 200) {
                    answers = answers.data;
                    // Transform JSON and try to get answer
                    let newJSON = [];
                    answers.forEach((e) => {
                        newJSON.push({
                            judgeName: e.judgeId,
                            left: e.leftOption,
                            right: e.rightOption,
                            result: e.winner,
                        });
                        answerValues.push([
                            e.judgeId,
                            e.leftOption,
                            e.rightOption,
                            e.winner,
                        ]);
                    });
                    console.log(
                        "Transformed answer values, attempting to send to analyzing module:\n",
                        answerValues
                    );
                    await getEstimate(newJSON, answers)
                    
                    console.log("ansvals", answerValues);
                    answerValues.forEach((answer)=>{
                        itemIdToTag[answer[1]] !== undefined ? answer[1] = itemIdToTag[answer[1]]: {};
                        // Adding left tag to answervalues
                        //(itemIdToTag[answer[1]] !== undefined || itemIdToTag[answer[1]] !== null) ? answer.splice(1, 0, itemIdToTag[answer[1]]): answer.splice(1, 0, "N/A");
                        itemIdToTag[answer[2]] !== undefined ? answer[2] = itemIdToTag[answer[2]]: {};
                        // Adding right tag to answervalues
                        //(itemIdToTag[answer[3]] !== undefined || itemIdToTag[answer[3]] !== null) ? answer.splice(2, 0, itemIdToTag[answer[3]]): answer.splice(2, 0, "N/A");
                    })
                    console.log("ansvals2", answerValues);
                    answerValues = answerValues;
                } else {
                    swal(
                        "Error",
                        "Error getting survey data: " + answers.data.message,
                        "error"
                    );
                }
            })
            .catch((error) => {
                swal(
                    "Error",
                    "An error occured when fetching survey data",
                    "error"
                );
            });
    };
    getSurveyAnswers();

    const getLeftBias = (answers, judgeId) => {
        if(judgeId == "N/A"){
            return "N/A";
        }
        let matchingAnswers = answers.filter(
            (answer) => answer.judgeId == judgeId
        );
        let totalLeftChoices = 0;
        matchingAnswers.forEach((e) =>
            e.winner == 1 ? totalLeftChoices++ : {}
        );
        return totalLeftChoices / matchingAnswers.length;
    };

    const getMedianTime = (answers, judgeId) => {
        if(judgeId == "N/A"){
            return "N/A";
        }
        let matchingAnswers = answers.filter(
            (answer) => answer.judgeId == judgeId
        );
        if(matchingAnswers.length < 2){
            return "N/A";
        }
        let timestamps = matchingAnswers.map(
            (e) => dateFromObjectId(e._id).getTime() / 1000
        );
        let differences = [];
        for (let i = 0; i < timestamps.length - 1; i++) {
            differences.push(timestamps[i + 1] - timestamps[i]);
        }
        differences.sort((a, b) => {
            return b - a;
        });
        if (differences.length % 2 == 0) {
            return ((differences[differences.length / 2 - 1] + differences[differences.length / 2]) / 2);
        } else {
            return differences[Math.floor(differences.length / 2)];
        }
    };

    const getAverageTime = (answers, judgeId) => {
        if(judgeId == "N/A"){
            return "N/A";
        }
        let matchingAnswers = answers.filter(
            (answer) => answer.judgeId == judgeId
        );
        if(matchingAnswers.length < 2){
            return "N/A";
        }
        let timestamps = matchingAnswers.map((e) => {
            return dateFromObjectId(e._id).getTime() / 1000;
        });
        timestamps.sort((a, b) => {
            return a - b;
        });
        console.log(timestamps);
        console.log(
            "len-1, 0",
            timestamps[timestamps.length - 1],
            timestamps[0]
        );
        return (
            (timestamps[timestamps.length - 1] - timestamps[0]) /
            timestamps.length
        );
    };


    /*  Downloads data as a csv file
     *   @param {string[]} headers - The headers for the csv file
     *   @param {*[]} rows - Array of arrays which contain the data for each row
     *   @param {string} - Filename of the csv-file. Should not contain the .csv extension at the end
     *
     */
    let downloadFunc = (headers, rows, filename) => {
        console.log("In download func");
        console.log("rows: ", rows);
        let headersString = "";
        headers.forEach((e) => (headersString += '"'+e.viewName + '",'));
        let csvContent = "SEP=, \r\n" + headersString + '\r\n';
        rows.forEach((e) => {
            csvContent += '"' + e.join('","') + '"\r\n';
        });
        let blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
        saveAs(blob, filename + ".csv");
    };

    //Download as csv buttons
    //Raw data
    let csvDownloadRawDataButton = document.createElement("button");
    csvDownloadRawDataButton.innerHTML = "Download as .csv";
    csvDownloadRawDataButton.style.float = "";
    csvDownloadRawDataButton.style.border = "1px solid #aaa";
    csvDownloadRawDataButton.onclick = () => {
        console.log(
            "You just clicked the download raw data button! Downloading..."
        );
        downloadFunc(answerHeaders, answerValues, survey.title + "_raw_data");
    };

    let resultInfo = document.createElement("p");
    resultInfo.innerHTML = "Note: A result of 0 means right item won. 1 means left item won."
    resultInfo.style.display = "inline";
    resultInfo.style.marginLeft = "1vw";
    let rawDataWrapper = document.createElement("div");
    rawDataWrapper.appendChild(csvDownloadRawDataButton);
    rawDataWrapper.appendChild(resultInfo);

    let csvDownloadByItemButton = document.createElement("button");
    csvDownloadByItemButton.innerHTML = "Download as .csv";
    csvDownloadByItemButton.style.float = "";
    csvDownloadByItemButton.style.border = "1px solid #aaa";
    csvDownloadByItemButton.onclick = () => {
        console.log(
            "You just clicked the download by item button! Downloading..."
        );
        downloadFunc(
            allItemsHeaders,
            allItems2DArray,
            survey.title + "_survey_data"
        );
    };

    let csvDownloadByJudgeButton = document.createElement("button");
    csvDownloadByJudgeButton.innerHTML = "Download as .csv";
    csvDownloadByJudgeButton.style.float = "";
    csvDownloadByJudgeButton.style.border = "1px solid #aaa";
    csvDownloadByJudgeButton.onclick = () => {
        console.log(
            "You just clicked the download by judge button! Downloading..."
        );
        downloadFunc(allJudgesHeaders, allJudges, survey.title + "_judge_data");
    };

    let csvDownloadLinearRankingButton = document.createElement("button");
    csvDownloadLinearRankingButton.innerHTML = "Download as .csv";
    csvDownloadLinearRankingButton.style.float = "";
    csvDownloadLinearRankingButton.style.border = "1px solid #aaa";
    csvDownloadLinearRankingButton.onclick = () => {
        console.log(
            "You just clicked the download linear ranking button! Downloading..."
        );
        downloadFunc(
            linearRankingHeaders,
            linearRanking,
            survey.title + "_basic_survey_data"
        );
    };

    $: answerValues &
        survey &
        surveyStatistics &
        linearRanking &
        allJudges &
        allItems2DArray &
        currentContentView;
</script>

<h1 class="text-h1 ma-2" style="font-size: 5rem;">{survey.title}</h1>
<br>
<div class="d-flex flex-column align-center">
    {#if surveyStatistics != null}
        <div style="border:1px solid #aaa; width:60%; margin-bottom:4vh;">
            <Row class="align-start" noGutters style="width:1+0%;">
                <Col>
                  <div class="font-weight-bold">Reliability</div>
                </Col>
                <Col>
                  <div class="font-weight-bold">Number of items</div>
                </Col>
                <Col>
                    <div class="font-weight-bold">Expected comparisons per judge</div>
                </Col>
                <Col>
                  <div class="font-weight-bold">Number of answers</div>
                </Col>
                <Col>
                    <div class="font-weight-bold">Number of judges</div>
                </Col>
            </Row>
            <Row class="align-start" noGutters style="width:100%; border-top: 1px solid #aaa;">
                <Col>
                  <div class="">{surveyStatistics.rel}</div>
                </Col>
                <Col>
                  <div class="">{surveyStatistics.result.length}</div>
                </Col>
                <Col>
                    <div class="">{survey.expectedComparisons}</div>
                </Col>
                <Col>
                  <div class="">{answerValues.length}</div>
                </Col>
                <Col>
                    <div class="">{surveyStatistics.judges.length}</div>
                </Col>
            </Row>
        </div>

        <ButtonGroup mandatory tile activeClass="primary-color" bind:value={currentContentView}>
            <ButtonGroupItem value="linearRanking">Linear ranking</ButtonGroupItem>
            <ButtonGroupItem value="byJudge">By judge</ButtonGroupItem>
            <ButtonGroupItem value="byItem">By item</ButtonGroupItem>
            <ButtonGroupItem value="rawdata">Raw data</ButtonGroupItem>
        </ButtonGroup>
    {/if}

    
    
    {#if currentContentView == "linearRanking"}
        {#if linearRanking != null && linearRanking.length > 0}
            <Table
                bind:tableData={linearRanking}
                bind:userInfo
                tableAttributes={linearRankingHeaders}
                element={csvDownloadLinearRankingButton}
            />
        {:else}
            <h3 class="text-h5">
                This survey is yet to be answered enough for us to analyze. <br>
                Come back once you've gathered some participants, or taken the test yourself!
            </h3>
        {/if}
    {:else if currentContentView == "rawdata"}
        {#if answerValues != null && answerValues.length > 0}
            <Table
                bind:tableData={answerValues}
                bind:userInfo
                tableAttributes={answerHeaders}
                element={rawDataWrapper}
            />
        {:else}
            <h3>
                This survey is yet to be answered. Come back once you've
                gathered some participants, or taken the test yourself!
            </h3>
        {/if}
    {:else if currentContentView == "byJudge"}
        {#if allJudges != null && allJudges.length > 0}
            <Table
                bind:tableData={allJudges}
                bind:userInfo
                tableAttributes={allJudgesHeaders}
                element={csvDownloadByJudgeButton}
                itemName="judge's answers"
                deleteFunc={async (id) => {
                    await surveyAnswerService.deleteByJudgeID(id);
                }}
            />
        {:else}
            <h3>
                This survey is yet to be answered. Come back once you've
                gathered some participants, or taken the test yourself!
            </h3>
        {/if}
    {:else if currentContentView == "byItem"}
        {#if allItems2DArray != null && allItems2DArray.length > 0}
            <Table
                bind:tableData={allItems2DArray}
                bind:userInfo
                tableAttributes={allItemsHeaders}
                element={csvDownloadByItemButton}
            />
        {:else}
            <h3>
                This survey is yet to be answered. Come back once you've
                gathered some participants, or taken the test yourself!
            </h3>
        {/if}
    {/if}
</div>

<style>
    
    .dropdownList {
        list-style-type: none;
        padding: 0;
        margin: auto;
    }
    li {
        float: left;
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

        margin: auto;
        margin-bottom: 3vh;
    }
    table {
        width: 76%;
        margin: auto;
        border: 1px solid grey;
    }
    th {
        border-bottom: 1px solid grey;
    }
</style>
