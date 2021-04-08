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
    export let purpose = "research";
    export let surveyMediaType = "text";
    export let accessibility = "link";
    export let optionsData = [];
    export let userInfo;
    export let editing = false;

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
            await surveyService.getSurveyByID(surveyID).then(async (data) => {
                console.log("surveydata in create_survey", data);

                document.getElementById("survey_title").value = data.title;
                document.getElementById("survey_question").value =
                    data.surveyQuestion;
                document.getElementById("judge_instructions").value =
                    data.judgeInstructions;
                document.getElementById("survey_description").value =
                    data.internalDescription;
                document.getElementById("purposeDropdown").value = data.purpose;
                document.getElementById("accessibilityDropdown").value =
                    data.accessibility;
                document.getElementById("activeCheckbox").checked = data.active;
                document.getElementById("expected_comparisons").value = data.expectedComparisons != undefined ? data.expectedComparisons : 2
                textAreaAdjustByElement(
                    document.getElementById("judge_instructions")
                );
                textAreaAdjustByElement(
                    document.getElementById("survey_description")
                );

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
                    optionsData.push({
                        title: item.data,
                        mediatype: item.type,
                    });
                }
                optionsData = optionsData;
                const generalInfoForm = document.getElementById("general_info_form");
                if(generalInfoForm){
                    console.log("passed createwrapper")
                    let cancelButton = document.createElement("button");
                    cancelButton.id = "cancelButton";
                    cancelButton.innerHTML="Cancel";
                    cancelButton.onclick = () => {
                        swal({
                            title: "Are you sure?",
                            text: "Are you sure you want to discard your changes to this survey? All your work will be lost.",
                            icon: "warning",
                            dangerMode: true,
                            buttons: ["Nevermind", "Discard"]
                        })
                        .then(willDiscard => {
                            if(willDiscard){
                                navigate("/admin_board/surveys")
                            }
                        })
                    }
                    const main_input_wrapper = document.getElementById("main_input_wrapper");
                    if (main_input_wrapper){
                        generalInfoForm.insertBefore(cancelButton, main_input_wrapper);
                    }
                }
            });
        });
    } else {
        optionsData.push({ name: "", mediatype: "text" });
        optionsData.push({ name: "", mediatype: "text" });
    }

    const getMediaType = () => {
        const select = document.getElementById("mediaTypeDropdown");
        return select.value;
    };

    const textAreaAdjust = (e) => {
        console.log("adjusting", e);
        e.target.style.height =
            e.target.scrollHeight > e.target.clientHeight
                ? e.target.scrollHeight + "px"
                : "12vh";
    };

    const textAreaAdjustByElement = (el) => {
        console.log("adjusting", el);
        el.style.height =
            el.scrollHeight > el.clientHeight ? el.scrollHeight + "px" : "12vh";
    };

    const createNewOption = () => {
        optionsData = [
            ...optionsData,
            { title: "", mediatype: getMediaType() },
        ];
        let dummy = document.getElementById("dummy");
        dummy.scrollIntoView(true);
    };

    const sendForm = () => {
        let optionsContent = document.getElementById("options_wrapper")
            .children;
        optionsContent = [...optionsContent];
        const optionArr = optionsContent.slice(0, optionsContent.length - 1);

        let optionsData = [];
        for (let i = 0; i < optionArr.length; i++) {
            const children = [...optionArr[i].children];
            const text = children[0].value;
            const wrapper = [...children[1].children];
            const mediaType = wrapper[1].value;
            optionsData.push({ data: text, type: mediaType });
        }

        let info = {
            title: document.getElementById("survey_title").value,
            internalDescription: document.getElementById("survey_description").value,
            judgeInstructions: document.getElementById("judge_instructions").value,
            surveyQuestion: document.getElementById("survey_question").value,
            purpose: document.getElementById("purposeDropdown").value,
            accessibility: document.getElementById("accessibilityDropdown").value,
            mediaType: getMediaType(),
            active: document.getElementById("activeCheckbox").checked,
            items: optionsData,
            owners: surveyResearchers,
            expectedComparisons: parseInt(document.getElementById("expected_comparisons").value, 10)
        };

        console.log("CREATE SURVEY INFO OBJ", info);

        let [everyFieldFilled, errorMessage] = validateFormInputs(info);
        console.log(errorMessage);
        if (!everyFieldFilled) {
            swal("Invalid input", "Every field is obligatory. " + errorMessage, "error");
        } else {
            let amountOfUniqueComparisons = 0;
            let toAdd = 1;
            while(toAdd < info.items.length){
                amountOfUniqueComparisons += toAdd;
                toAdd++;
            }
            if(amountOfUniqueComparisons < info.expectedComparisons){
                swal("Invalid input", "Amount of expected comparisons: " + info.expectedComparisons + " must be less than or equal to amount of possible unique comparisons " + amountOfUniqueComparisons, "error");
                return
            }
            console.log(surveyService);
            if (editing) {
                surveyService
                    .put(surveyID, info)
                    .then((data) => {
                        console.log("surveyService put data: ", data);
                        const survey_link =
                            window.location.href.split("/admin_board")[0] +
                            "?takeSurvey=1&surveyID=" +
                            surveyID;
                        let dummy = document.getElementById("dummy");
                        dummy.value = survey_link;
                        console.log("Navigator object: ",navigator, "\nNavigator.clipboard", navigator.clipboard);

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
                                navigateWithRefreshToken("/admin_board/surveys").then(data => userInfo = data);
                            })
                            .catch((err) => {});
                    })
                    .catch((err) => {
                        console.log(err);
                        swal("Failed to edit survey.", "Please try again, and contact an administator if it still doesn't work. Error:\n" + err, "error");
                    });
            } else {
                surveyService
                    .postSurvey(info)
                    .then((data) => {
                        console.log("postSurvey data: ", data);
                        const survey_link =
                            window.location.href.split("/admin_board")[0] +
                            "?takeSurvey=1&surveyID=" +
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
                            navigateWithRefreshToken("/admin_board/surveys").then(data => userInfo = data);
                        });
                    })
                    .catch((err) => {
                        console.log(err);
                        swal("Failed to create survey.", "Please try again, and contact an administator if it still doesn't work. Error:\n" + err, "error");
                    });
            }
        }
    };

    const validateFormInputs = (formObj) => {
        let errorMessage = "";
        for (let key in formObj) {
            let val = formObj[key];
            console.log("keys: ", key, typeof key);
            if (val === "") {
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

    function validateExpectedComparisons(e){
        if(e.target.value === ""){
            e.target.value = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');
        }
        const input = e.target.value;
        const parsed = parseInt(input, 10)
        console.log("validating expected comparisons with input", input)
        if(isNaN(parsed) && input !== ""){
            console.log("validateExpectedComparisons invalid input:", input)
            e.target.value = 2
            return
        }
        else if(typeof(parsed) == "number"){
            if(parsed > 100){
                document.getElementById("expected_comparisons").value = 100;
            }
            else if(parsed < 0){
                document.getElementById("expected_comparisons").value = 0;
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
            } else {
                swal("Researcher is already added");
                return;
            }
        }
    };

    const removeResearcher = (event) => {
        //console.log("Survey researchers before deletion: ", surveyResearchers);
        let index = surveyResearchers.findIndex((e) => {
            return (
                event.target.parentElement.childNodes[0].innerHTML ===
                    e.owner_email && !e.obligatory
            );
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
        const search_term = e.target.value;
        console.log("searching for ", search_term);
        if (search_term !== undefined && search_term !== "" && search_term !== oldSearchTerm) {
            const timeSinceLastSearch =
                new Date().getTime() - epochMsAtLastSearch;
                console.log(e)
                console.log("epochMsAtLastSearch:",epochMsAtLastSearch,", timeSinceLastSearch:",timeSinceLastSearch,"keyCode: ", e.keyCode)
            //Check that the search string is at least 3 chars long, is different than the last search term
            //and that at least half a second has gone by since the last search, or that the user manually hit enter to search
            //this is to reduce stress on the backend, save on bandwith and otherwise improve the latency of searching.
            if (
                (search_term.length > 2 &&
                    timeSinceLastSearch > 500) ||
                (e.keyCode === 13 && timeSinceLastSearch > 500)
            ) {
                oldSearchTerm = search_term;
                epochMsAtLastSearch = new Date().getTime();
                userService
                    .search(search_term)
                    .then((result) => {
                        console.log("Search result: ", result);
                        searchResults = result.data;
                    })
                    .catch((err) => console.log(err));
            }
        } else {
            console.log("Search term was ", search_term);
            if(search_term !== oldSearchTerm) searchResults = [];
        }
    };

    $: optionsData & surveyResearchers & searchResults;
</script>

<div id="create_wrapper">
    <div id="general_info_form">
        <div id="main_input_wrapper">
            <input
                type="text"
                class="text_input"
                id="survey_title"
                placeholder="Survey title"
                title="A title for what you're researching. Will not be shown to the judges. e.g. 'Preference of snacks'"
                />
            <input
                type="text"
                class="text_input"
                id="survey_question"
                placeholder="Survey question"
                title="The question the judges will answer. Will be shown to judges. e.g. 'Which snack do you prefer?'"
            />
            <textarea
                on:keydown={textAreaAdjust}
                class="text_input textareas"
                id="judge_instructions"
                placeholder="Judge instructions"
                title="A field for extra info you want to give the judge before they answer your survey."
            />
            <textarea
                on:keydown={textAreaAdjust}
                class="text_input textareas"
                id="survey_description"
                placeholder="Survey description"
                title="An internal description of the survey. Will not be shown to judges."
            />
            <div id="dropdownsAndCheckboxesWrapper">
                <div id="purposeWrapper" class="dropdownWrappers">
                    <label for="purpose">Purpose</label>
                    <select name="purpose" id="purposeDropdown" value={purpose} title="The purpose of this survey. Will not be shown to judges.">
                        <option value="research">Research</option>
                        <option value="grading">Grading</option>
                        <option value="fun">For fun</option>
                        <option value="testing">Testing</option>
                    </select>
                </div>
                <div id="mediaTypeWrapper" class="dropdownWrappers">
                    <label for="mediaType">Media type</label>
                    <select
                        name="mediaType"
                        id="mediaTypeDropdown"
                        on:change={(e) => {
                            surveyMediaType = e.target.value;
                        }}
                        value={surveyMediaType}
                    >
                        <option value="text">Text</option>
                        <option value="image">Image</option>
                        <option value="pdf">PDF</option>
                        <option value="mix">Mix</option>
                    </select>
                </div>
                <div class="dropdownWrappers">
                    <label for="accessibility">Accessibility</label>
                    <select name="accessibility" id="accessibilityDropdown" title="How you want judges to access your survey. Either share a full link or a 6-digit code.">
                        <option value="link">Link</option>
                        <option value="code">Code</option>
                    </select>
                </div>
                <div id="checkboxWrapper" class="dropdownWrappers">
                    <label for="activeCheckbox">Active survey</label>
                    <input
                        type="checkbox"
                        id="activeCheckbox"
                        name="activeCheckbox"
                        value="active"
                        title="Whether the survey should be active (answerable by judges). Can be changed at any time."
                    />
                </div>
            </div>
            <br />
            <div id="expectedComparisonsWrapper">
                <label for="expected_comparisons">Expected comparisons per judge</label>
                <input id="expected_comparisons" type="number" maxlength="3" max="100" on:input={validateExpectedComparisons}>
            </div>
            <br />
            <div id="searchWrapper">
                <label for="researcher_search">Add researchers</label>
                <SearchDropdown
                    searchFunc={searchForUsers}
                    {userInfo}
                    {searchResults}
                    onClickFunc={addResearcher}
                />
                <br>
                <br>
                <h4 id="researchersTitle">
                    Researchers participating in survey
                </h4>
                <div class="addedResearchersWrapper">
                    {#each surveyResearchers as researcher}
                        <ResearcherBox
                            {researcher}
                            deleteFunc={removeResearcher} 
                            {userInfo}
                            onchangeFunc={changeResearcherRights}
                        />
                    {/each}
                </div>
            </div>
            
        </div>
        <div id="options_wrapper">
            {#each optionsData as data}
                <OptionBox
                    title={data.title}
                    bind:mediaType={data.mediatype}
                    {userInfo}
                />
            {/each}
            <button id="submitBtn" on:click={sendForm}>Submit</button>
        </div>

        <input type="text" id="dummy" value="hello" />
    </div>
    <button id="new_option_button" on:click={createNewOption}>+</button>
</div>

<style>
    #create_wrapper {
        display: grid;
        margin: auto;
        padding-top: 5vh;
        text-align: center;
        background-color: #eee;
        grid-template:
            "menu title"
            "menu main_inputs"
            "menu options";
        overflow: hidden;
    }
    #general_info_form {
        display: grid;
        grid-template-rows: auto;
        height: 100%;
        margin-bottom: 5vh;
    }

    #main_input_wrapper {
        background-color: #fff;
        width: 60%;

        margin: 1vh auto 1vh auto;
        grid-area: "main_inputs";
    }
    .text_input {
        width: 100%;
    }
    #survey_title {
        font-size: 2.5rem;
        max-height: 20vh;
    }
    #survey_question {
        font-size: 2rem;
        max-height: 16vh;
    }
    .textareas {
        line-height: 2rem;
        font-size: 1.5rem;
        min-height: 18vh;
        height: auto;
        word-wrap: break-word;
        padding: 2vw;
        margin-bottom: 5vh;
    }

    .dropdownWrappers {
        margin-left: 2vw;
        font-size: 1.2rem;
        float: left;
        /*border: 2px solid rgba(160, 160, 160, 0.6);*/
        padding: 1vh;
        text-align: center;
        height: 60%;
    }
    label {
        margin-bottom: 1vh;
    }
    #dropdownsAndCheckboxesWrapper {
        height: 16vh;
    }
    p {
        font-size: 1.5rem;
    }
    #general_info_form {
        text-align: left;
    }

    label {
        left: 0;
    }
    input {
        padding: 2vw;
        border-top: 0px;
        border-left: 0px;
        border-right: 0px;
    }
    textarea {
        padding: 1vh;
        border-top: 0px;
        border-left: 0px;
        border-right: 0px;
        max-width: 100%;
        min-width: 100%;
    }

    :global(.option_title) {
        font-size: 1rem;
        float: left;
    }
    :global(.dropdown_media_options) {
        font-size: 1rem;
        float: left;
    }
    #title {
        grid-area: "title";
    }
    #options_wrapper {
        grid-area: "options";
        background-color: #fff;
        width: 60%;
        margin: 1vh auto 1vh auto;
    }
    #new_option_button {
        position: fixed;
        right: 2vh;
        bottom: 7vh;
        font-size: 3rem;
    }
    #submitBtn {
        margin-top: 5vh;
        margin-left: 40%;
        width: 20%;
        font-size: 1.5rem;
    }
    #dummy {
        visibility: hidden;
    }
    #activeCheckbox {
        margin: auto;
        transform: scale(2);
    }
    #expectedComparisonsWrapper{
        margin-left: 2vw;
        font-size: 1.6rem;
    }
    #expected_comparisons{
        padding: 1vh;
        border: 1px solid #ccc;
    }
    #searchWrapper {
        margin-left: 2vw;
        font-size: 1.6rem;
    }
    #researcher_search {
        padding: 1vh;
        width: 40%;
        font-size: 1.2rem;
    }

    .addedResearchersWrapper {
        display: grid;
        grid-template-columns: auto;
        grid-column-gap: 2vh;
        margin-right: 1.5vw;
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
