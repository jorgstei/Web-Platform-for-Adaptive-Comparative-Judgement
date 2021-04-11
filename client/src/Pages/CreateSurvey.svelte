<script>
    import OptionBox from "../Components/OptionBox.svelte";
    import ResearcherBox from "../Components/ResearcherBox.svelte";
    import SearchDropdown from "../Components/SearchDropdown.svelte";
    import swal from "sweetalert";
    import { surveyService } from "../Services/SurveyService";
    import { navigate } from "svelte-routing";
    import queryString from "query-string";
    import { onMount } from "svelte";
    import { userService } from "../Services/UserService";
    import { navigateWithRefreshToken } from "../Utility/naviagte";
    import {
        TextField,
        Button,
        Icon,
        Tooltip,
        Textarea,
        Select,
        ListItemGroup,
        ListItem,
        Card,
        CardText,
        CardActions,
        Checkbox,
        Row,
        Col,
    } from "svelte-materialify";
    import {
        mdiEyeOff,
        mdiEye,
        mdiDeleteForever,
        mdiInformationOutline,
        mdiPlusCircle,
        mdiFileCancel,
    } from "@mdi/js";

    export let userInfo;
    export let editing = false;

    let surveyOptions = [];

    let searchHint = "";
    let oldSearchTerm = "";
    let epochMsAtLastSearch = new Date().getTime();
    let surveyResearchers = [
        {
            ownerId: userInfo.userid,
            owner_email: userInfo.email,
            obligatory: true,
            rights: {
                manageMembers: true,
                editSurvey: true,
                viewResults: true,
            },
        },
    ];

    let searchResults = [];
    let surveyID = null;

    if (editing) {
        let params = queryString.parse(window.location.search);
        surveyID = params.id;
        console.log("SurveyID from RawSurveyData.svelte: ", surveyID);
        onMount(async () => {
            let labels = [...document.getElementsByTagName("label")];
            labels.forEach((e) => {
                e.classList.add("active");
            });

            await surveyService.getSurveyByID(surveyID).then(async (data) => {
                console.log("surveydata in create_survey", data);
                if (data.status == 200) {
                    data = data.data
                    surveyTitleValue = data.title;
                    surveyQuestionValue = data.surveyQuestion;
                    judgeInstructionsValue = data.judgeInstructions;
                    internalDescriptionValue = data.internalDescription;
                    selectedMediaType = data.mediaType;
                    selectedPurpose = data.purpose;
                    selectedActiveLevel = data.active ? "1" : "0";
                    comparisonsPerJudge =
                        data.expectedComparisons != undefined
                            ? data.expectedComparisons
                            : 2;

                    surveyResearchers = [];
                    for (let i = 0; i < data.owners.length; i++) {
                        let owner = await userService.getUserByID(
                            data.owners[i].ownerId
                        );
                        data.owners[i].owner_email = owner.email;
                        surveyResearchers.push(data.owners[i]);
                    }
                    console.log("Survey researcher", surveyResearchers);
                    surveyResearchers = surveyResearchers;

                    console.log("compobj:", data.items);
                    for (const item of data.items) {
                        console.log("optionbox", data);
                        surveyOptions.push({
                            input: item.data,
                            mediaType: item.type,
                        });
                    }

                    surveyOptions = surveyOptions;
                } else {
                    swal(
                        "Error",
                        "Error getting survey data: " + data.data.message + ".",
                        "error"
                    );
                }
            });
        });
    } else {
        surveyOptions.push({
            input: "",
            mediaType: "text",
            showOptionTooltip: false,
        });
        surveyOptions.push({
            input: "",
            mediaType: "text",
            showOptionTooltip: false,
        });
    }

    const textAreaAdjust = (e) => {
        console.log("adjusting", e);
        e.target.style.height =
            e.target.scrollHeight > e.target.clientHeight
                ? e.target.scrollHeight + "px"
                : "12vh";
    };

    const sendForm = () => {
        let optionsData = [];

        surveyOptions.forEach((e) => {
            optionsData.push({ data: e.input, type: e.mediaType });
        });

        let info = {
            title: surveyTitleValue,
            surveyQuestion: surveyQuestionValue,
            expectedComparisons: parseInt(comparisonsPerJudge, 10),
            judgeInstructions: judgeInstructionsValue,
            internalDescription: internalDescriptionValue,
            purpose: selectedPurpose,
            mediaType: selectedMediaType,
            active: selectedActiveLevel === "1",
            items: optionsData,
            owners: surveyResearchers
        };

        console.log("CREATE SURVEY INFO OBJ", info);

        let [everyFieldFilled, errorMessage] = validateFormInputs(info);
        console.log(errorMessage);
        if (!everyFieldFilled) {
            swal(
                "Invalid input",
                "Every field is obligatory. " + errorMessage,
                "error"
            );
        } else {
            let amountOfUniqueComparisons = 0;
            let toAdd = 1;
            while (toAdd < info.items.length) {
                amountOfUniqueComparisons += toAdd;
                toAdd++;
            }
            if (amountOfUniqueComparisons < parseInt(info.expectedComparisons)) {
                swal(
                    "Invalid input",
                    "Amount of expected comparisons: " +
                        info.expectedComparisons +
                        " must be less than or equal to amount of possible unique comparisons" +
                        amountOfUniqueComparisons,
                    "error"
                );
                return;
            }
            else if(parseInt(info.expectedComparisons) < 1){
                swal(
                    "Invalid input",
                    "Amount of expected comparisons: '" +
                        info.expectedComparisons +
                        "' must be greater than 1.",
                    "error"
                );
                return;
            }
            console.log(surveyService);
            if (editing) {
                surveyService
                    .put(surveyID, info)
                    .then((data) => {
                        if(data.status < 300){
                            data = data.data;
                            console.log("surveyService put data: ", data);
                            const survey_link =
                                window.location.href.split("/admin_board")[0] +
                                "/survey?takeSurvey=1&surveyID=" +
                                surveyID;
                            let dummy = document.getElementById("dummy");
                            dummy.value = survey_link;
                            console.log(
                                "Navigator object: ",
                                navigator,
                                "\nNavigator.clipboard",
                                navigator.clipboard
                            );

                            navigator.clipboard
                            .writeText(survey_link)
                            .then(() => {
                                swal(
                                    "Successfully updated survey!",
                                    "Your link is:\n" +
                                        survey_link +
                                        "\n It has been copied to your clipboard for you!",
                                    "success"
                                );
                                navigateWithRefreshToken(
                                    "/admin_board/surveys"
                                ).then((data) => (userInfo = data));
                            })
                            .catch((err) => {});
                        }
                        else{
                            swal(
                                "Failed to edit survey.",
                                "Please try again, and contact an administator if it still doesn't work. Error:\n" +
                                    data.data.message,
                                "error"
                            )
                        }
                    })
                    .catch((err) => {
                        console.log(err);
                        swal(
                            "Failed to edit survey.",
                            "Please try again, and contact an administator if it still doesn't work. Error:\n" +
                                err,
                            "error"
                        );
                    });
            } else {
                surveyService
                    .postSurvey(info)
                    .then((data) => {
                        if(data.status < 300){
                            data = data.data;
                            console.log("postSurvey data: ", data);
                            const survey_link =
                            window.location.href.split("/admin_board")[0] +
                            "/survey?takeSurvey=1&surveyID=" +
                            data.loc;
                            let dummy = document.getElementById("dummy");
                            dummy.value = survey_link;
                            console.log(dummy.value);
                            console.log(navigator, navigator.clipboard);
                            navigator.clipboard.writeText(survey_link).then(() => {
                                swal(
                                "Successfully created survey!",
                                "Your link is:\n" +
                                survey_link +
                                "\n It has been copied to your clipboard for you!",
                                "success"
                                );
                                navigateWithRefreshToken(
                                    "/admin_board/surveys"
                                ).then((data) => (userInfo = data));
                            });
                        }
                        else{
                            swal(
                                "Failed to create survey.",
                                "Please try again, and contact an administator if it still doesn't work. Error:\n" +
                                    data.data.message,
                                "error"
                            )
                        }
                    })
                    .catch((err) => {
                        console.log(err);
                        swal(
                            "Failed to create survey.",
                            "Please try again, and contact an administator if it still doesn't work. Error:\n" +
                                err,
                            "error"
                        );
                    });
            }
        }
    };

    const validateFormInputs = (formObj) => {
        let errorMessage = "";
        for (let key in formObj) {
            let val = formObj[key];
            if (val === "" || Number.isNaN(val) || val===undefined || val===null) {
                errorMessage = key + " is not filled out";
                return [false, errorMessage];
            }
            else if (key === "items") {
                if (val.length < 2) {
                    errorMessage = "The survey must have 2 or more options";
                    return [false, errorMessage];
                }
                for (let i = 0; i < val.length; i++) {
                    for (let key2 in val[i]) {
                        if (val[i][key2] === "") {
                            errorMessage =
                                key2 +
                                " is not filled out in option " +
                                (i + 1);
                            return [false, errorMessage];
                        }
                    }
                }
            }
        }
        return [true, ""];
    };

    function validateExpectedComparisons(e) {
        if (e.target.value === "") {
            e.target.value = e.target.value
                .replace(/[^0-9.]/g, "")
                .replace(/(\..*?)\..*/g, "$1");
        }
        const input = e.target.value;
        const parsed = parseInt(input, 10);
        console.log("validating expected comparisons with input", input);
        if (isNaN(parsed) && input !== "") {
            console.log("validateExpectedComparisons invalid input:", input);
            e.target.value = 2;
            return;
        } else if (typeof parsed == "number") {
            if (parsed > 100) {
                comparisonsPerJudge = 100;
            } else if (parsed < 0) {
                comparisonsPerJudge = 0;
            }
        }
    }

    const addResearcher = (researcher) => {
        console.log("researcher in add: ", researcher);
        if (researcher != null && researcher != undefined) {
            if (
                surveyResearchers.find(
                    (e) => e.owner_email == researcher.email
                ) === undefined
            ) {
                console.log(
                    "researcher is not already added",
                    researcher,
                    "vs ",
                    surveyResearchers
                );
                surveyResearchers.push({
                    ownerId: researcher._id,
                    owner_email: researcher.email,
                    obligatory: false,
                    rights: {
                        manageMembers: false,
                        editSurvey: false,
                        viewResults: true,
                    },
                });
                surveyResearchers = surveyResearchers;
                console.log(
                    "added researcher to surveyResearchers",
                    surveyResearchers
                );
                search_term = "";
                searchResults = [];
            } else {
                swal("Researcher is already added").then(() => {
                    search_term = "";
                    searchResults = [];
                });
                return;
            }
        }
    };

    const removeResearcher = (researcherEmail) => {
        //console.log("Survey researchers before deletion: ", surveyResearchers);
        let index = surveyResearchers.findIndex((e) => {
            return researcherEmail === e.owner_email && !e.obligatory;
        });
        console.log(index, surveyResearchers);
        surveyResearchers.splice(index, 1);
        surveyResearchers = surveyResearchers;
        console.log("Survey researchers after deletion: ", surveyResearchers);
    };

    const changeResearcherRights = (e, rightToChange) => {
        let researcherEmailWithCheckBox =
            e.target.parentElement.parentElement.parentElement.childNodes[0]
                .childNodes[0].innerHTML;
        let index = surveyResearchers.findIndex((e) => {
            return e.owner_email == researcherEmailWithCheckBox;
        });
        surveyResearchers[index].rights[rightToChange] = !surveyResearchers[
            index
        ].rights[rightToChange];
        console.log(
            "CHANGED RESEARCHERS RIGHT",
            rightToChange,
            "TO: ",
            surveyResearchers[index].rights
        );
    };

    const searchForUsers = (e) => {
        console.log("searching for ", search_term);
        if (
            search_term !== undefined &&
            search_term !== "" &&
            search_term !== oldSearchTerm
        ) {
            const timeSinceLastSearch =
                new Date().getTime() - epochMsAtLastSearch;

            console.log(
                "epochMsAtLastSearch:",
                epochMsAtLastSearch,
                ", timeSinceLastSearch:",
                timeSinceLastSearch,
                "keyCode: ",
                e.keyCode
            );
            //Check that the search string is at least 3 chars long, is different than the last search term
            //and that at least half a second has gone by since the last search, or that the user manually hit enter to search
            //this is to reduce stress on the backend, save on bandwith and otherwise improve the latency of searching.
            if (
                (search_term.length > 2 && timeSinceLastSearch > 500) ||
                (e.keyCode === 13 && timeSinceLastSearch > 500)
            ) {
                oldSearchTerm = search_term;
                epochMsAtLastSearch = new Date().getTime();
                console.log("Searching for: ", search_term);
                userService
                    .search(search_term, { limit: 5 })
                    .then((result) => {
                        if(result.status < 300){
                            console.log("Search result: ", result);
                            searchResults = result.data;
                            if(searchResults.length == 0){
                                searchHint = "No results for " + search_term;
                            }
                            else{
                                searchHint = ""
                            }
                        }

                    })
                    .catch((err) => console.log(err));
            }
        } else {
            console.log("Search term was ", search_term);
            if (search_term !== oldSearchTerm) searchResults = [];
        }
    };

    const checkIfAddResearcherByEnter = (e) => {
        console.log("in checkifadd researcher with keycode", e);
        if (e.keyCode == 13) {
            searchForUsers(e);
        }
    };

    let purposeItems = [
        { name: "Research", value: "research" },
        { name: "Testing", value: "testing" },
    ];
    let selectedPurpose = "research";
    let mediaTypeItems = [
        { name: "Text", value: "text" },
    ];
    let selectedMediaType = "text";

    let selectedAccessibility = "link";

    let activeItems = [
        { name: "Yes", value: "1" },
        { name: "No", value: "0" },
    ];
    let selectedActiveLevel = "1";

    let surveyTitleValue;
    let surveyQuestionValue;
    let judgeInstructionsValue;
    let internalDescriptionValue;

    let comparisonsPerJudge;
    let search_term;

    //Options is an object with .input and .mediaType
    const removeOption = (option) => {
        if (surveyOptions.length <= 2) {
            swal(
                "Cannot delete option",
                "A survey must have at least 2 options.",
                "warning"
            );
        } else {
            let deleteIndex = surveyOptions.findIndex((e) => {
                let allKeysMatch = true;
                for (const key in e) {
                    if (option[key] !== e[key]) {
                        allKeysMatch = false;
                    }
                }
                return allKeysMatch;
            });
            console.log(
                "Found index: ",
                deleteIndex,
                "which corresponds to object:",
                surveyOptions[deleteIndex]
            );
            if (deleteIndex >= 0) {
                surveyOptions.splice(deleteIndex, 1);
                surveyOptions = surveyOptions;
            }
        }
    };

    let optionMediaTypeItems = [
        { name: "Text", value: "text" },
    ];

    let showSurveyTitleTooltip,
        showSurveyQuestionTooltip,
        showSurveyJudgeInstructionsTooltip,
        showSurveyInternalDescriptionTooltip
        = false;

    let showSurveyComparisonsPerJudgeTooltip,
        showSurveySearchForUsersTooltip,
        showAddOptionTooltip,
        showCancelEditingTooltip
        = false;


    $: surveyResearchers & searchResults;
</script>

<div id="create_wrapper">

        <div id="titleWrapper">
            {#if editing}
                <h1 class="text-h1 ma-2 mb-6 align-self-center" style="font-size: 5rem">Edit Survey: {surveyTitleValue}</h1>
                {:else}
                <h1 class="text-h1 ma-2 mb-6 align-self-center" style="font-size: 5rem; margin: auto;" >Create Survey</h1>
            {/if}
        </div>
        <div id="main_input_wrapper">
            {#if editing}
                <Button
                    fab
                    style="right: 2vw; top:7vh; position: fixed; min-width:4vw; min-height:4vw;"
                    on:click={() => {
                        swal({
                            title: "Are you sure?",
                            text:
                                "Are you sure you want to discard your changes to this survey? All unsaved changes will be lost.",
                            icon: "warning",
                            dangerMode: true,
                            buttons: ["Nevermind", "Discard"],
                        }).then((willDiscard) => {
                            if (willDiscard) {
                                navigate("/admin_board/surveys");
                            }
                        });
                    }}
                    >
                    
                    <Tooltip top bind:active={showCancelEditingTooltip}>
                        <Icon class="red-text" path={mdiFileCancel} size="3vw"/>
                        <span slot="tip">Cancel editing</span>
                    </Tooltip>
                </Button>
            {/if}
            <Textarea
                style="margin-top: 2vh;"
                rows={2}
                noResize
                class="text-h5"
                bind:value={surveyTitleValue}
                on:focus={() => console.log("title got focused")}
            >
                <div slot="append">
                    <Tooltip top bind:active={showSurveyTitleTooltip}>
                        <Icon path={mdiInformationOutline} />
                        <span slot="tip"
                            >A title for what you're researching. Will not be
                            shown to the judges. e.g. 'Preference of snacks'</span
                        >
                    </Tooltip>
                </div>
                Survey title
            </Textarea>

            <Textarea
                style="margin-top: 2vh;"
                rows={2}
                noResize
                class="text-h5"
                bind:value={surveyQuestionValue}
            >
                <div slot="append">
                    <Tooltip top bind:active={showSurveyQuestionTooltip}>
                        <Icon path={mdiInformationOutline} />
                        <span slot="tip"
                            >The question the judges will answer. Will be shown
                            to judges. e.g. 'Which snack do you prefer?'</span
                        >
                    </Tooltip>
                </div>
                Survey question
            </Textarea>

            <Textarea
                style="margin-top: 2vh;"
                rows={4}
                autogrow
                class="text-h6"
                bind:value={judgeInstructionsValue}
            >
                <div slot="append">
                    <Tooltip
                        top
                        bind:active={showSurveyJudgeInstructionsTooltip}
                    >
                        <Icon path={mdiInformationOutline} />
                        <span slot="tip"
                            >A field for extra info you want to give the judge
                            before they answer your survey</span
                        >
                    </Tooltip>
                </div>
                Judge instructions
            </Textarea>

            <Textarea
                style="margin-top: 2vh;"
                rows={4}
                autogrow
                class="text-h6"
                bind:value={internalDescriptionValue}
            >
                <div slot="append">
                    <Tooltip
                        top
                        bind:active={showSurveyInternalDescriptionTooltip}
                    >
                        <Icon path={mdiInformationOutline} />
                        <span slot="tip"
                            >An internal description of the survey. Will not be
                            shown to judges</span
                        >
                    </Tooltip>
                </div>
                Survey description
            </Textarea>

            <div class="d-flex flex-rows" style="margin-top: 4vh;">
                <div style="min-width: 33%;">
                    <Select mandatory items={purposeItems} bind:value={selectedPurpose}
                        >Purpose</Select
                    >
                </div>
                <div style="min-width: 34%;">
                    <Select mandatory
                        items={mediaTypeItems}
                        bind:value={selectedMediaType}>Media Type</Select
                    >
                </div>

                <div style="min-width: 33%;">
                    <Select mandatory items={activeItems} bind:value={selectedActiveLevel}
                        >Active</Select
                    >
                </div>
            </div>

            <div class="centeredInputFieldWrapper">
                <TextField
                    type="number"
                    on:input={validateExpectedComparisons}
                    bind:value={comparisonsPerJudge}
                >
                    <div slot="append">
                        <Tooltip
                            top
                            bind:active={showSurveyComparisonsPerJudgeTooltip}
                        >
                            <Icon path={mdiInformationOutline} />
                            <span slot="tip"
                                >How many comparisons you want each judge to
                                perform</span
                            >
                        </Tooltip>
                    </div>
                    Expected comparisons per judge
                </TextField>
            </div>

            <div class="centeredInputFieldWrapper">
                <TextField
                    type="text"
                    bind:hint={searchHint}
                    on:input={searchForUsers}
                    bind:value={search_term}
                    on:keydown={checkIfAddResearcherByEnter}
                >
                    <div slot="append">
                        <Tooltip
                            top
                            bind:active={showSurveySearchForUsersTooltip}
                        >
                            <Icon path={mdiInformationOutline} />
                            <span slot="tip">
                                Search for researchers by name or email. Type
                                in at least 3 characters to get results automatically, or just press enter to search.
                            </span>
                        </Tooltip>
                    </div>
                    Add researchers
                </TextField>
                <ListItemGroup class="blue-text">
                    {#each searchResults as result}
                        <ListItem on:click={() => addResearcher(result)}
                            >{result.email}</ListItem
                        >
                    {/each}
                </ListItemGroup>
            </div>

            <div class="d-flex mt-4 mb-4 flex-wrap align-content-space-between">
                {#each surveyResearchers as researcher}
                    <Card style="min-width:50%" class="mb-2" hover>
                        {#if researcher.ownerId !== userInfo.userid}
                            <Button
                                fab
                                class="float-right"
                                on:click={() =>
                                    removeResearcher(researcher.owner_email)}
                                ><Icon path={mdiDeleteForever} /></Button
                            >
                        {/if}
                        <CardText>
                            <div>Researcher</div>
                            <div class="text--primary text-h4">
                                {researcher.owner_email}
                            </div>
                            <div class="text--primary text-h6" style="text-align: left;">Rights:</div>
                        </CardText>
                        <CardActions>
                            <div class="d-flex flex-column justfiy-left">
                                <Checkbox
                                    bind:checked={researcher.rights
                                        .manageMembers}
                                    disabled={researcher.ownerId ==
                                        userInfo.userid}
                                    >Manage members</Checkbox
                                >
                                <Checkbox
                                    bind:checked={researcher.rights.editSurvey}
                                    disabled={researcher.ownerId ==
                                        userInfo.userid}>Edit survey</Checkbox
                                >
                                <Checkbox
                                    bind:checked={researcher.rights.viewResults}
                                    disabled={researcher.ownerId ==
                                        userInfo.userid}>View results</Checkbox
                                >
                            </div>
                        </CardActions>
                    </Card>
                {/each}
            </div>

            <div class="d-flex mt-4 mb-4 flex-wrap align-content-space-between">
                {#each surveyOptions as option}
                    <Card
                        class="d-flex flex-column mb-2"
                        style="min-width:50%;"
                        hover
                    >
                    <Row>
                        <Col cols={11}>
                            <CardText>
                                <div>Option</div>
                                <TextField
                                    type={option.mediaType}
                                    bind:value={option.input}
                                    class="mt-4"
                                    style="min-width:100%;"
                                >
                                    <div slot="append">
                                        <Tooltip
                                            top
                                            bind:active={option.showOptionTooltip}
                                        >
                                            <Icon path={mdiInformationOutline} />
                                            <span slot="tip"
                                                >Input for your option</span
                                            >
                                        </Tooltip>
                                    </div>
                                    Option value
                                </TextField>
    
                                <Select
                                    items={optionMediaTypeItems}
                                    bind:value={option.mediaType}
                                    class="mt-4">Media Type</Select
                                >
                            </CardText>
                        </Col>
                        <Col cols={1}>
                            <Button
                                fab
                                class="float-right"
                                on:click={() => removeOption(option)}
                                >
                                <Icon path={mdiDeleteForever}/>
                            </Button>
                        </Col>
                    </Row>
                    </Card>
                {/each}
            </div>

            <Button outlined id="submitButton" on:click={sendForm}
                >Submit</Button
            >
            <input type="text" id="dummy" />
        </div>
        <Button
            fab
            style="right: 2vw; bottom:7vh; position: fixed; min-width:4vw; min-height:4vw;"
            on:click={() => {
                surveyOptions.push({
                    input: "",
                    mediaType: "text",
                    showOptionTooltip: false,
                });
                surveyOptions = surveyOptions;
                setTimeout(
                    () => window.scrollTo(0, document.body.scrollHeight),
                    100
                );
            }}
        >
            <Tooltip top bind:active={showAddOptionTooltip}>
            
                <Icon path={mdiPlusCircle} size="3vw" />
                <span slot="tip">Add option</span>
            </Tooltip>

        </Button>
</div>

<style>
    .centeredInputFieldWrapper {
        width: 50%;
        margin: 2vh auto 2vh auto;
    }
    #create_wrapper {
        margin: auto;
        text-align: center;
    }

    #main_input_wrapper {
        display: flex;
        flex-direction: column;
        justify-content: center;
        background-color: #fff;
        width: 60vw;
        padding: 1vh;
        margin: 1vh auto 1vh auto;
        border: 0.2vw solid rgba(200, 200, 200, 0.6);
    }

    #titleWrapper {
        display: flex;
        flex-direction: column;
        justify-content: center;
    }

    input {
        padding: 2vw;
        border-top: 0px;
        border-left: 0px;
        border-right: 0px;
    }
    :global(.option_title) {
        font-size: 1rem;
        float: left;
    }
    :global(.dropdown_media_options) {
        font-size: 1rem;
        float: left;
    }

    #dummy {
        visibility: hidden;
        height: 1vh;
        margin: auto;
    }

    :global(#cancelButton) {
        background-color: red;
        width: 6vw;
        height: 4rem;
        font-size: 1.5rem;
        right: 2vw;
        top: 10vh;
        position: fixed;
    }
</style>
