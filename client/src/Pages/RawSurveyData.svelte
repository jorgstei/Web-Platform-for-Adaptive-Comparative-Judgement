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

    export let userInfo;

    let params = queryString.parse(window.location.search);
    let surveyID = params.id;
    console.log("SurveyID from RawSurveyData.svelte: ", surveyID);

    let survey = {};
    onMount(async () => {
        await surveyService.getSurveyByID(surveyID).then((data) => {
            console.log("onMount survey data with id: " + surveyID, data);
            survey = data;
        });
    });

    let linearRankingHeaders = [
        { fieldName: "", viewName: "option" },
        { fieldName: "", viewName: "infit" },
        { fieldName: "", viewName: "outfit" },
        { fieldName: "", viewName: "wins" },
        { fieldName: "", viewName: "theta" },
    ];
    let linearRanking = null;
    let allJudgesHeaders = [
        { fieldName: "", viewName: "id" },
        { fieldName: "", viewName: "agree" },
        { fieldName: "", viewName: "infit" },
        { fieldName: "", viewName: "outfit" },
        { fieldName: "", viewName: "Left bias" },
        { fieldName: "", viewName: "Right bias" },
        { fieldName: "", viewName: "Median time per answer" },
        { fieldName: "", viewName: "Average time per answer" },
        { fieldName: "", viewName: "delete" },
    ];
    let allJudges = null;
    let allItemsHeaders = [
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

    let currentContentView = "linearRanking";

    let surveyStatistics = null;

    let answerValues = [];
    let answerHeaders = [
        { fieldName: "", viewName: "judge id" },
        { fieldName: "", viewName: "left option" },
        { fieldName: "", viewName: "right option" },
        { fieldName: "", viewName: "result" },
    ];

    let getEstimate = async (newJSON, answers) => {
        surveyService
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
                        if (
                            answerWithSameId == undefined ||
                            answerWithSameId == null
                        ) {
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
                        } else {
                            linearRanking2DArray.push([
                                answerWithSameId.data,
                                linearRanking[i].infit,
                                linearRanking[i].outfit,
                                linearRanking[i].score,
                                linearRanking[i].theta,
                            ]);
                            allItems2DArray.push([
                                answerWithSameId.data,
                                linearRanking[i].infit,
                                linearRanking[i].outfit,
                                linearRanking[i].propscore,
                                linearRanking[i].theta,
                                linearRanking[i].N1,
                                linearRanking[i].N0,
                                linearRanking[i].Ntot,
                                linearRanking[i].id,
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
                        allJudges2DArray.push([
                            e.judge,
                            e.agree,
                            e.infit,
                            e.outfit,
                            leftBias.toFixed(2),
                            (1 - leftBias).toFixed(2),
                            getMedianTime(answers, e.judge).toFixed(2) +
                                " seconds",
                            getAverageTime(answers, e.judge).toFixed(2) +
                                " seconds",
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
                    await getEstimate(newJSON, answers);
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
        let matchingAnswers = answers.filter(
            (answer) => answer.judgeId == judgeId
        );
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
            return (
                (differences[differences.length / 2 - 1] +
                    differences[differences.length / 2]) /
                2
            );
        } else {
            return differences[Math.floor(differences.length / 2)];
        }
    };

    const getAverageTime = (answers, judgeId) => {
        let matchingAnswers = answers.filter(
            (answer) => answer.judgeId == judgeId
        );
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

    //Updates current content view based on value of the dropdown menu
    let updateCurrentContentView = () => {
        currentContentView = document.getElementById("viewDropdown").value;
        console.log("Current content view is: ", currentContentView);
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
        headers.forEach((e) => (headersString += e.viewName + ","));
        let csvContent = "SEP=, \r\n" + headersString + "\r\n";
        rows.forEach((e) => {
            csvContent += e.join(",") + "\r\n";
        });
        let blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
        saveAs(blob, filename + ".csv");
    };

    //Download as csv buttons
    let csvDownloadRawDataButton = document.createElement("button");
    csvDownloadRawDataButton.innerHTML = "Download as .csv";
    csvDownloadRawDataButton.style.float = "";
    csvDownloadRawDataButton.onclick = () => {
        console.log(
            "You just clicked the download raw data button! Downloading..."
        );
        downloadFunc(answerHeaders, answerValues, survey.title + "_raw_data");
    };

    let csvDownloadByItemButton = document.createElement("button");
    csvDownloadByItemButton.innerHTML = "Download as .csv";
    csvDownloadByItemButton.style.float = "";
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
    csvDownloadByJudgeButton.onclick = () => {
        console.log(
            "You just clicked the download by judge button! Downloading..."
        );
        downloadFunc(allJudgesHeaders, allJudges, survey.title + "_judge_data");
    };

    let csvDownloadLinearRankingButton = document.createElement("button");
    csvDownloadLinearRankingButton.innerHTML = "Download as .csv";
    csvDownloadLinearRankingButton.style.float = "";
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
            <select
                name="view"
                id="viewDropdown"
                on:input={updateCurrentContentView}
            >
                <option value="linearRanking">Linear ranking</option>
                <option value="byJudge">By judge</option>
                <option value="byItem">By item</option>
                <option value="rawdata">Raw data</option>
            </select>
        </li>
    </ul>
    {#if currentContentView == "linearRanking"}
        {#if linearRanking != null && linearRanking.length > 0}
            <Table
                bind:tableData={linearRanking}
                bind:userInfo
                tableAttributes={linearRankingHeaders}
                element={csvDownloadLinearRankingButton}
            />
        {:else}
            <h3>
                This survey is yet to be answered. Come back once you've
                gathered some participants, or taken the test yourself!
            </h3>
        {/if}
    {:else if currentContentView == "rawdata"}
        {#if answerValues != null && answerValues.length > 0}
            <Table
                bind:tableData={answerValues}
                bind:userInfo
                tableAttributes={answerHeaders}
                element={csvDownloadRawDataButton}
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
                tableTitle="Judges"
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
        width: -moz-fit-content;
        width: fit-content;
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
