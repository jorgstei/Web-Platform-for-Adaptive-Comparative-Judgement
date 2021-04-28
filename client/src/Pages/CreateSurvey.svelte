<script>
    import { v4 as uuidv4 } from "uuid";
    import swal from "sweetalert";
    import { surveyService } from "../Services/SurveyService";
    import { navigate } from "svelte-routing";
    import queryString from "query-string";
    import { onMount, onDestroy } from "svelte";
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
        Overlay,
    } from "svelte-materialify";
    import { mdiEyeOff, mdiEye, mdiDeleteForever, mdiInformationOutline, mdiPlusCircle, mdiFileCancel, mdiAbTesting } from "@mdi/js";

    import TextItem from "../Components/SurveyComponents/TextItem.svelte";
    import PDFItem from "../Components/SurveyComponents/PDFItem.svelte";
    import { surveyItemFileService } from "../Services/SurveyItemFileService";

    export let allowLeavePageWithoutWarning;
    export let warningOnLeaveFunc;
    export let userInfo;
    export let editing = false;

    warningOnLeaveFunc = (link) => {
        swal({
            title: "Are you sure?",
            text: "Are you sure you want to discard your new survey? All unpublished changes will be lost.",
            icon: "warning",
            dangerMode: true,
            buttons: ["Take me back!", "Discard"],
        }).then((willDiscard) => {
            if (willDiscard) {
                allowLeavePageWithoutWarning = true;
                navigate("/admin_board/" + link);
            }
        });
    };

    onDestroy(() => {
        allowLeavePageWithoutWarning = true;
    });

    const pdf = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

    const classes = {
        overall: null,
        controls: null,
        container: null,
    };

    const options = {
        // "paged" or "all"
        display: "paged",
        // "dark" or "light" or your own
        theme: "dark",
    };

    // The current page number
    let currentPage;

    // To override the text between the forward and back buttons
    const pageNumberText = (currentPage, maximumPages) => currentPage + "/" + maximumPages;

    //An array of functions to run when we press submit/edit survey. Remember to remove the corresponding function when removing the item that added the function
    let submitButtonFunctions = [];
    let surveyOptions = [];

    /*
    window.onbeforeunload = function() {
        return "Do you really want to leave our brilliant application?";
    };
    */
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

    /*
        tag: String, user friendly name for the item, f.ex. filename, or whatever the user decides it to be
        mediaType: String, user friendly view of the mimetype (application/pdf -> pdf f.ex.)
        mimeType: String, the mimetype of the data (application/pdf, application/jpg etc.)
        data: Mixed, String for mediaType text, File for other types
        showOverlay: Boolean, used by card to toggle fullscreen/preview of the item
        showTooltip: Boolean, used by card to show info about the component f.ex. when hovering an (i) icon
    */
    const addSurveyOption = (tag, mediaType, mimeType, data, showOverlay, showTooltip, created = true, _id = undefined, fileName = "") => {
        const uuid = uuidv4();
        data = {
            tag: tag,
            fileName: fileName,
            mediaType: mediaType,
            mimeType: mimeType,
            data: data,
            _id: _id,
            showOverlay: showOverlay,
            showTooltip: showTooltip,
            uuid: uuid,
            created: created,
            editedArr: [],
        };
        surveyOptions.push(data);
        console.log("mytag surveyOptions in addSurveyOption:", surveyOptions);

        submitButtonFunctions.push({
            addtype: "surveyItem",
            uuid: uuid,
            func: (surveyId) => {
                let foundObject = surveyOptions.find((e) => {
                    return e.uuid == uuid;
                });
                if (foundObject != null && foundObject != undefined) {
                    console.log("mytag foundObject.editedArr: ", foundObject.editedArr);
                    if (foundObject.created == false && Object.keys(foundObject.editedArr).length == 0) {
                        console.log("mytag not created, no editedArr", foundObject);
                        return Promise.resolve();
                    } else if (foundObject != null && foundObject != undefined && foundObject.created == true) {
                        console.log("mytag created: ", foundObject);
                        return surveyService.uploadFile(foundObject.data, surveyId, foundObject.tag);
                    } else if (foundObject != null && foundObject != undefined && Object.keys(foundObject.editedArr).length > 0) {
                        console.log("mytag editedArr: ", foundObject);
                        let promises = [];
                        for (let fieldName in foundObject.editedArr) {
                            console.log("mytag2, patching with: ", fieldName, " value: ", foundObject[fieldName]);
                            promises.push(surveyItemFileService.patch(fieldName, foundObject[fieldName], foundObject._id));
                        }

                        return promises;
                    } else {
                        console.error("mytag DOING ABSOLUTELY NOTHING");
                        return Promise.reject(new Error("Could not find data to upload"));
                    }
                } else {
                    console.error("Failed to find surveyOption to upload");
                    return Promise.reject(new Error("Could not find data to upload"));
                }
            },
        });
        surveyOptions = surveyOptions;
        console.log("submitButtonFunctions", submitButtonFunctions);
    };

    const removeSurveyOption = (option) => {
        console.log("Trying to remove item: ", option);
        const index = surveyOptions.findIndex((e) => e == option);
        if (index > -1) {
            const submitFunctionIndex = submitButtonFunctions.findIndex((e) => {
                return e.uuid == option.uuid;
            });
            if (submitFunctionIndex > -1) {
                submitButtonFunctions.splice(submitFunctionIndex, 1);
            } else {
                console.error("Unable to find submitButtonFunction even though surveyObject exists");
            }
            const _id = surveyOptions[index]._id;
            if (surveyOptions[index].created == false) {
                submitButtonFunctions.push({
                    addtype: "deleteSurveyItem",
                    func: () => {
                        return surveyItemFileService.delete(_id);
                    },
                });
            }
            surveyOptions.splice(index, 1);
        } else {
            console.error("Tried removing surveyOption but could not find it in array.");
        }
        surveyOptions = surveyOptions;
    };

    onMount(async () => {
        allowLeavePageWithoutWarning = false;
        if (editing) {
            let params = queryString.parse(window.location.search);
            surveyID = params.id;
            console.log("SurveyID from RawSurveyData.svelte: ", surveyID);

            let labels = [...document.getElementsByTagName("label")];
            labels.forEach((e) => {
                e.classList.add("active");
            });

            await surveyService.getSurveyByID(surveyID).then(async (data) => {
                console.log("surveydata in create_survey", data);
                if (data.status == 200) {
                    data = data.data;
                    surveyTitleValue = data.title;
                    surveyQuestionValue = data.surveyQuestion;
                    judgeInstructionsValue = data.judgeInstructions;
                    internalDescriptionValue = data.internalDescription;
                    selectedMediaType = data.mediaType;
                    selectedPurpose = data.purpose;
                    selectedActiveLevel = data.active ? "1" : "0";
                    comparisonsPerJudge = data.expectedComparisons != undefined ? data.expectedComparisons : 2;

                    surveyResearchers = [];
                    //TODO: Change this to a await Promise.all style fetch
                    for (let i = 0; i < data.owners.length; i++) {
                        let owner = await userService.getUserByID(data.owners[i].ownerId);
                        data.owners[i].owner_email = owner.email;
                        surveyResearchers.push(data.owners[i]);
                    }
                    console.log("Survey researcher", surveyResearchers);
                    surveyResearchers = surveyResearchers;

                    console.log("compobj:", data.items);
                    for (let item of data.items) {
                        console.log("optionbox", data);
                        /*
                Special case for plain text items.
                As they are small compared to images or PDFs, AND they otherwise can't convey
                their information to the researcher without the actual data.
            */
                        if (item.type == "plain") {
                            surveyItemFileService.get(item.data).then((result) => {
                                if (result.status < 300) {
                                    result.data.data = String.fromCharCode.apply(null, result.data.data.data);
                                    item = { ...item, ...result.data };

                                    addSurveyOption(
                                        item.tag,
                                        item.type,
                                        getInputFieldTypeFromMediaType(item.type),
                                        item.data,
                                        false,
                                        false,
                                        false,
                                        result.data._id,
                                        item.fileName
                                    );
                                } else {
                                    console.error("Couldn't load view of item.");
                                }
                            });
                        } else {
                            surveyItemFileService.getView(item.data).then((result) => {
                                if (result.status < 300) {
                                    item = { ...item, ...result.data };
                                    addSurveyOption(
                                        item.tag,
                                        item.type,
                                        getInputFieldTypeFromMediaType(item.type),
                                        item.data,
                                        false,
                                        false,
                                        false,
                                        item._id,
                                        item.fileName
                                    );
                                } else {
                                    console.error("Couldn't load view of item.");
                                }
                            });
                        }
                    }

                    surveyOptions = surveyOptions;
                } else {
                    swal("Error", "Error getting survey data: " + data.data.message + ".", "error");
                }
            });
        } else {
            addSurveyOption("tag" + surveyOptions.length, "plain", getInputFieldTypeFromMediaType("text"), "", false, false, true);
            addSurveyOption("tag" + surveyOptions.length, "plain", getInputFieldTypeFromMediaType("text"), "", false, false, true);
        }
    });

    const getAmountOfUniqueComparisons = (arrayLength) => {
        let toAdd = 1;
        let amountOfUniqueComparisons = 0;
        while (toAdd < arrayLength) {
            amountOfUniqueComparisons += toAdd;
            toAdd++;
        }
        return amountOfUniqueComparisons;
    };

    const sendForm = async () => {
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
            owners: surveyResearchers,
        };

        console.log("CREATE SURVEY INFO OBJ", info);
        /*
        info.items.forEach(item=>{
            console.log(item);
            validateFileType(item.data, item.mediaType);
        })
        */

        let [everyFieldFilled, errorMessage] = validateFormInputs(info);
        console.log(errorMessage);
        if (!everyFieldFilled) {
            swal("Invalid input", "Every field is obligatory. " + errorMessage, "error");
        } else {
            let amountOfUniqueComparisons = getAmountOfUniqueComparisons(info.items.length);

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
            } else if (parseInt(info.expectedComparisons) < 1) {
                swal(
                    "Invalid input",
                    "Amount of expected comparisons: '" + info.expectedComparisons + "' must be greater than 1.",
                    "error"
                );
                return;
            }

            swal({
                title: "Does everything look good?",
                text:
                    "You currently have " +
                    info.items.length +
                    " items, " +
                    info.expectedComparisons +
                    " comparisons per judge.\n" +
                    "The questions is '" +
                    info.surveyQuestion +
                    "'.\n" +
                    "If something is not right, please return and fix it first.",
                icon: "warning",
                buttons: ["Take me back!", "Publish changes"],
            }).then(async (willPublish) => {
                if (!willPublish) {
                    return;
                } else {
                    if (editing) {
                        info.items = [];
                        let itemFileResponses = [];
                        submitButtonFunctions.forEach((e) => {
                            let eFuncResponse = e.func(surveyID);
                            if (typeof eFuncResponse == "object" && eFuncResponse.length != 0) {
                                itemFileResponses = itemFileResponses.concat(eFuncResponse);
                            } else {
                                itemFileResponses.push();
                            }
                        });
                        await Promise.all(itemFileResponses);
                        surveyService
                            .put(surveyID, info)
                            .then((data) => {
                                if (data.status < 300) {
                                    data = data.data;
                                    console.log("surveyService put data: ", data);
                                    const survey_link =
                                        window.location.href.split("/admin_board")[0] + "/survey?takeSurvey=1&surveyID=" + surveyID;
                                    let dummy = document.getElementById("dummy");
                                    dummy.value = survey_link;
                                    console.log("Navigator object: ", navigator, "\nNavigator.clipboard", navigator.clipboard);

                                    navigator.clipboard
                                        .writeText(survey_link)
                                        .then(() => {
                                            swal(
                                                "Successfully updated survey!",
                                                "Your link is:\n" + survey_link + "\n It has been copied to your clipboard for you!",
                                                "success"
                                            );
                                            navigateWithRefreshToken("/admin_board/surveys").then((data) => (userInfo = data));
                                        })
                                        .catch((err) => {});
                                } else {
                                    swal(
                                        "Failed to edit survey.",
                                        "Error:\n" +
                                            data.data.message +
                                            "\n\nIf the error message didn't help, please try again, or contact and administrator.",
                                        "error"
                                    );
                                }
                            })
                            .catch((err) => {
                                console.log(err);
                                swal(
                                    "Failed to edit survey.",
                                    "Error:\n" +
                                        err +
                                        "\n\nIf the error message didn't help, please try again, or contact and administrator.",
                                    "error"
                                );
                            });
                    } else {
                        info.items = [];
                        surveyService
                            .postSurvey(info)
                            .then(async (data) => {
                                if (data.status < 300) {
                                    data = data.data;
                                    let itemFileResponses = [];
                                    submitButtonFunctions.forEach((e) => {
                                        itemFileResponses.push(e.func(data.loc));
                                    });
                                    await Promise.all(itemFileResponses).catch((error) =>
                                        console.error("Error when posting item files:", error)
                                    );
                                    console.log("postSurvey data: ", data);
                                    const survey_link =
                                        window.location.href.split("/admin_board")[0] + "/survey?takeSurvey=1&surveyID=" + data.loc;
                                    let dummy = document.getElementById("dummy");
                                    dummy.value = survey_link;
                                    console.log(dummy.value);
                                    console.log(navigator, navigator.clipboard);
                                    navigator.clipboard.writeText(survey_link).then(() => {
                                        swal(
                                            "Successfully created survey!",
                                            "Your link is:\n" + survey_link + "\n It has been copied to your clipboard for you!",
                                            "success"
                                        );
                                        navigateWithRefreshToken("/admin_board/surveys").then((data) => (userInfo = data));
                                    });
                                } else {
                                    swal(
                                        "Failed to create survey.",
                                        "Please try again, and contact an administator if it still doesn't work. Error:\n" +
                                            data.data.message,
                                        "error"
                                    );
                                }
                            })
                            .catch((err) => {
                                console.log(err);
                                swal(
                                    "Failed to create survey.",
                                    "Please try again, and contact an administator if it still doesn't work. Error:\n" + err,
                                    "error"
                                );
                            });
                    }
                }
            });
        }
    };

    const validateFormInputs = (formObj) => {
        let errorMessage = "";
        for (let key in formObj) {
            let val = formObj[key];
            if (val === "" || Number.isNaN(val) || val === undefined || val === null) {
                errorMessage = key + " is not filled out";
                return [false, errorMessage];
            } else if (key === "items") {
                if (val.length < 2) {
                    errorMessage = "The survey must have 2 or more options";
                    return [false, errorMessage];
                }
                for (let i = 0; i < val.length; i++) {
                    for (let key2 in val[i]) {
                        if (val[i][key2] === "") {
                            errorMessage = key2 + " is not filled out in option " + (i + 1);
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
            e.target.value = e.target.value.replace(/[^0-9.]/g, "").replace(/(\..*?)\..*/g, "$1");
        }
        const input = e.target.value;
        const parsed = parseInt(input, 10);
        console.log("validating expected comparisons with input", input);
        if (isNaN(parsed) && input !== "") {
            console.log("validateExpectedComparisons invalid input:", input);
            e.target.value = 1;
            return;
        } else if (typeof parsed == "number") {
            const max = getAmountOfUniqueComparisons(surveyOptions.length);
            console.log("parsed is: ", parsed, "max is", max);
            if (parsed > max) {
                comparisonsPerJudge = max;
            } else if (parsed < 0) {
                comparisonsPerJudge = 0;
            }
        }
    }

    const validateFileType = (file, expectedFiletype) => {
        console.log("validating file type with file", { expectedFiletype, file });
        if (expectedFiletype == "text") {
            console.log("it was just text");
            return true;
        } else {
            if (expectedFiletype == "pdf") {
                console.log("file should be pdf");
                console.log(file.type, file.type === "application/pdf");
            } else if (expectedFiletype == "image") {
                console.log("file should be img");
                console.log(file.type, file.type === "application/image/*");
            }
        }
    };

    const addResearcher = (researcher) => {
        console.log("researcher in add: ", researcher);
        if (researcher != null && researcher != undefined) {
            if (surveyResearchers.find((e) => e.owner_email == researcher.email) === undefined) {
                console.log("researcher is not already added", researcher, "vs ", surveyResearchers);
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
                console.log("added researcher to surveyResearchers", surveyResearchers);
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
        let researcherEmailWithCheckBox = e.target.parentElement.parentElement.parentElement.childNodes[0].childNodes[0].innerHTML;
        let index = surveyResearchers.findIndex((e) => {
            return e.owner_email == researcherEmailWithCheckBox;
        });
        surveyResearchers[index].rights[rightToChange] = !surveyResearchers[index].rights[rightToChange];
        console.log("CHANGED RESEARCHERS RIGHT", rightToChange, "TO: ", surveyResearchers[index].rights);
    };

    const searchForUsers = (e) => {
        console.log("searching for ", search_term);
        if (search_term !== undefined && search_term !== "" && search_term !== oldSearchTerm) {
            const timeSinceLastSearch = new Date().getTime() - epochMsAtLastSearch;

            console.log("epochMsAtLastSearch:", epochMsAtLastSearch, ", timeSinceLastSearch:", timeSinceLastSearch, "keyCode: ", e.keyCode);
            //Check that the search string is at least 3 chars long, is different than the last search term
            //and that at least half a second has gone by since the last search, or that the user manually hit enter to search
            //this is to reduce stress on the backend, save on bandwith and otherwise improve the latency of searching.
            if ((search_term.length > 2 && timeSinceLastSearch > 500) || (e.keyCode === 13 && timeSinceLastSearch > 500)) {
                oldSearchTerm = search_term;
                epochMsAtLastSearch = new Date().getTime();
                console.log("Searching for: ", search_term);
                userService
                    .search(search_term, { limit: 5 })
                    .then((result) => {
                        if (result.status < 300) {
                            console.log("Search result: ", result);
                            searchResults = result.data;
                            if (searchResults.length == 0) {
                                searchHint = "No results for " + search_term;
                            } else {
                                searchHint = "";
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
        { name: "Grading", value: "grading" },
        { name: "Testing", value: "testing" },
        { name: "For fun", value: "fun" },
    ];
    let selectedPurpose = "research";

    //Survey level media type, sets the default type when adding items
    //value: should be the last part of the mimetype (application/pdf -> pdf, text/plain -> plain etc.)
    let mediaTypeItems = [
        { name: "Text", value: "plain" },
        { name: "PDF", value: "pdf" },
    ];
    let selectedMediaType = "plain";

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
            swal("Cannot delete option", "A survey must have at least 2 options.", "warning");
        } else {
            removeSurveyOption(option);
        }
    };

    //Media types per item, used to change what kind of item is rendered.
    //value: should be the last part of the mimetype (application/pdf -> pdf, text/plain -> plain etc.)
    let optionMediaTypeItems = [
        { name: "Text", value: "plain" },
        { name: "PDF", value: "pdf" },
    ];

    let showSurveyTitleTooltip,
        showSurveyQuestionTooltip,
        showSurveyJudgeInstructionsTooltip,
        showSurveyInternalDescriptionTooltip = false;

    let showSurveyComparisonsPerJudgeTooltip,
        showSurveySearchForUsersTooltip,
        showAddOptionTooltip,
        showCancelEditingTooltip = false;

    function getInputFieldTypeFromMediaType(mediaType) {
        if (mediaType == "pdf") {
            return "application/pdf";
        } else if (mediaType == "image") {
            return "image/png, image/jpeg, image/jpeg, image/x-png";
        } else {
            return "text/plain";
        }
    }

    const ruleValidateFieldFilled = (v) => {
        console.log("test result:", v);
        return v.length > 0 || "Field is obligatory";
    };
    let fieldFilledRules = [ruleValidateFieldFilled];

    const activateRules = (value) => {
        console.log("blurred with val", value);
        value = value;
    };

    $: surveyResearchers & searchResults;
</script>

<div id="create_wrapper">
    <div id="titleWrapper">
        {#if editing}
            <h1 class="text-h1 ma-2 mb-6 align-self-center" style="font-size: 5rem">
                Edit Survey: {surveyTitleValue}
            </h1>
        {:else}
            <h1 class="text-h1 ma-2 mb-6 align-self-center" style="font-size: 5rem; margin: auto;">Create Survey</h1>
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
                        text: "Are you sure you want to discard your changes to this survey? All unsaved changes will be lost.",
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
                    <Icon class="red-text" path={mdiFileCancel} size="3vw" />
                    <span slot="tip">Cancel editing</span>
                </Tooltip>
            </Button>
        {/if}
        <Textarea
            style="margin-top: 2vh; line-height: 20px;"
            rows={1}
            autogrow
            noResize
            class="text-h5"
            hint="*Required"
            bind:value={surveyTitleValue}
            on:focus={() => console.log("title got focused")}
        >
            <div slot="append">
                <Tooltip top bind:active={showSurveyTitleTooltip}>
                    <Icon path={mdiInformationOutline} />
                    <span slot="tip"
                        >A title for what you're researching. Will not be shown to the judges.<br />
                        For example: 'Preference of snacks'
                    </span>
                </Tooltip>
            </div>
            Survey title
        </Textarea>

        <Textarea style="margin-top: 2vh;" rows={1} autogrow noResize class="text-h5" hint="*Required" bind:value={surveyQuestionValue}>
            <div slot="append">
                <Tooltip top bind:active={showSurveyQuestionTooltip}>
                    <Icon path={mdiInformationOutline} />
                    <span slot="tip"
                        >The question the judges will answer. Will be shown to judges.<br />
                        For example: 'Which snack do you prefer?'
                    </span>
                </Tooltip>
            </div>
            Survey question
        </Textarea>

        <Textarea style="margin-top: 2vh;" rows={4} autogrow class="text-h6" hint="*Required" bind:value={judgeInstructionsValue}>
            <div slot="append">
                <Tooltip top bind:active={showSurveyJudgeInstructionsTooltip}>
                    <Icon path={mdiInformationOutline} />
                    <span slot="tip"> Extra info you want to give the judges before they answer your survey. </span>
                </Tooltip>
            </div>
            Judge instructions
        </Textarea>

        <Textarea style="margin-top: 2vh;" rows={4} autogrow class="text-h6" bind:value={internalDescriptionValue}>
            <div slot="append">
                <Tooltip top bind:active={showSurveyInternalDescriptionTooltip}>
                    <Icon path={mdiInformationOutline} />
                    <span slot="tip">
                        An internal description of the survey.<br />
                        Will only be shown to co-researchers.
                    </span>
                </Tooltip>
            </div>
            Internal description
        </Textarea>

        <div class="d-flex flex-rows justify-space-between" style="margin-top: 4vh;">
            <div style="min-width: 30%;">
                <Select mandatory items={purposeItems} bind:value={selectedPurpose}>Purpose</Select>
            </div>
            <div style="min-width: 30%;">
                <Select mandatory items={mediaTypeItems} bind:value={selectedMediaType}>Media Type</Select>
            </div>

            <div style="min-width: 30%;">
                <Select mandatory items={activeItems} bind:value={selectedActiveLevel}>Active</Select>
            </div>
        </div>

        <h1 class="text-h4 ma-8" style="text-align:center;">Search for and add co-researchers</h1>
        <div class="centeredInputFieldWrapper">
            <TextField
                type="text"
                bind:hint={searchHint}
                on:input={searchForUsers}
                bind:value={search_term}
                on:keydown={checkIfAddResearcherByEnter}
            >
                <div slot="append">
                    <Tooltip top bind:active={showSurveySearchForUsersTooltip}>
                        <Icon path={mdiInformationOutline} />
                        <span slot="tip">
                            Search for researchers by name or email.<br />
                            Type in at least 3 characters to get results automatically.<br />
                            Optionally, hit enter after a single character to search.
                        </span>
                    </Tooltip>
                </div>
                Add researchers
            </TextField>
            <ListItemGroup class="blue-text">
                {#each searchResults as result}
                    <ListItem style="border: 0.1em solid #aaa; border-top:none;" on:click={() => addResearcher(result)}
                        >{result.email}</ListItem
                    >
                {/each}
            </ListItemGroup>
        </div>

        <div class="d-flex mt-4 mb-4 flex-wrap justify-space-between">
            {#each surveyResearchers as researcher}
                <Card style="width:49%; cursor: default; background-color:rgb(235,235,235);" class="mb-2" hover>
                    {#if researcher.ownerId !== userInfo.userid}
                        <Button fab class="float-right" on:click={() => removeResearcher(researcher.owner_email)}
                            ><Icon path={mdiDeleteForever} /></Button
                        >
                    {/if}
                    <CardText>
                        <div>Researcher</div>
                        <div class="text--primary text-h5">
                            {researcher.owner_email}
                        </div>
                        <div class="text--primary text-h8" style="text-align:left;">Rights:</div>
                    </CardText>
                    <CardActions>
                        <div class="d-flex flex-column justfiy-left">
                            <Checkbox bind:checked={researcher.rights.manageMembers} disabled={researcher.ownerId == userInfo.userid}>
                                Manage members
                            </Checkbox>
                            <Checkbox bind:checked={researcher.rights.editSurvey} disabled={researcher.ownerId == userInfo.userid}
                                >Edit survey</Checkbox
                            >
                            <Checkbox bind:checked={researcher.rights.viewResults} disabled={researcher.ownerId == userInfo.userid}>
                                View results
                            </Checkbox>
                        </div>
                    </CardActions>
                </Card>
            {/each}
        </div>

        <div style="border-bottom: 0.2em solid #aaaaaaaa; width:100%; height:1px; margin: 1em 0 1em 0;" />
        <h1 class="text-h4">Items</h1>
        <div class="d-flex flex-column mt-4 mb-4 align-center">
            {#each surveyOptions as option}
                <div class="d-flex flex-column mb-2" style="width:95%; margin: auto;">
                    <!--Add new media types by adding {:else if option.mediaType == "yourtype"} below-->
                    {#if option.mediaType == "plain"}
                        <TextItem
                            bind:option
                            bind:optionMediaTypeItems
                            functionObject={{
                                getInputFieldTypeFromMediaType: getInputFieldTypeFromMediaType,
                                removeOption: removeOption,
                            }}
                        />
                    {:else if option.mediaType == "pdf"}
                        <PDFItem
                            bind:option
                            bind:optionMediaTypeItems
                            functionObject={{
                                getInputFieldTypeFromMediaType: getInputFieldTypeFromMediaType,
                                removeOption: removeOption,
                            }}
                        />
                    {/if}
                </div>
            {/each}
            <div class="d-flex flex-column mb-2" style="width:95%; margin: auto;">
                <Card style="cursor: default; height:228px; background-color:rgb(235,235,235);" hover>
                    <CardText class="flex-column d-flex justify-space-between">
                        <div class="mb-4">Add item</div>
                        <Button
                            fab
                            style="min-width:110px; min-height:110px;"
                            class="align-self-center"
                            on:click={() => {
                                addSurveyOption(
                                    "tag" + surveyOptions.length,
                                    selectedMediaType,
                                    getInputFieldTypeFromMediaType(selectedMediaType),
                                    "",
                                    false,
                                    false
                                );
                                surveyOptions = surveyOptions;
                                setTimeout(() => window.scrollTo(0, document.body.scrollHeight), 400);
                            }}
                        >
                            <Icon path={mdiPlusCircle} size="110px" />
                        </Button>
                    </CardText>
                </Card>
            </div>
        </div>
        <div class="centeredInputFieldWrapper">
            <TextField type="number" on:input={validateExpectedComparisons} bind:value={comparisonsPerJudge}>
                <div slot="append">
                    <Tooltip top bind:active={showSurveyComparisonsPerJudgeTooltip}>
                        <Icon path={mdiInformationOutline} />
                        <span slot="tip">
                            How many comparisons you want each judge to perform.<br />
                            Minimum value is 1.<br />
                            The maximum value is based on the amount of unique combinations of items in the survey.<br />
                            Current max is {getAmountOfUniqueComparisons(surveyOptions.length)}
                        </span>
                    </Tooltip>
                </div>
                Expected comparisons per judge
            </TextField>
        </div>

        <Button outlined id="submitButton" style="height:6vh; font-size:1.2rem" on:click={sendForm}>Submit survey</Button>
        <input type="text" id="dummy" />
    </div>
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
