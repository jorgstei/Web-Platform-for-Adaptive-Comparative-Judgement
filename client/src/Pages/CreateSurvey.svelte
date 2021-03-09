<script>
    import OptionBox from "../Components/OptionBox.svelte";
    import swal from "sweetalert";
    import {surveyService} from "../Services/SurveyService";
    import {comparisonObjectService} from "../Services/ComparisonObjectService";
    import { navigate } from "svelte-routing";
    import queryString from "query-string";
    import { onMount } from "svelte";
    import {sha512} from "js-sha512";
    export let purpose = "research";
    export let surveyMediaType = "text";
    export let accessibility = "open";
    export let optionsData = [];
    export let userInfo;
    export let editing = false;
    let surveyID = null;

    if(editing){
        let params = queryString.parse(window.location.search);
        surveyID = params.id;
        console.log("SurveyID from RawSurveyData.svelte: ", surveyID)
        onMount(async ()=> {
            await surveyService.getSurveyByID(surveyID)
            .then(async (data) => {
                console.log("surveydata in create_survey", data);
                console.log(document.getElementById("mediaTypeDropdown"));

                document.getElementById("survey_title").value = data.title;
                document.getElementById("survey_question").value = data.surveyQuestion;
                document.getElementById("judge_instructions").value = data.judgeInstructions;
                document.getElementById("survey_description").value = data.internalDescription;
                document.getElementById("purposeDropdown").value = data.purpose;
                document.getElementById("accessibilityDropdown").value = data.accessibility;
                textAreaAdjustByElement(document.getElementById("judge_instructions"));
                textAreaAdjustByElement(document.getElementById("survey_description"));
                
                console.log("compobj:", data.items)
                for(const item of data.items){
                    console.log("asd", data);
                    optionsData.push({title: item.data, mediatype: item.type})
                }
                optionsData = optionsData;
            })
            
        });
    }
    else{
        optionsData.push({name: "", mediatype: "text"});
        optionsData.push({name: "", mediatype: "text"});
    }

    const getMediaType = () => {
        const select = document.getElementById("mediaTypeDropdown");
        return select.value;
    }

    const textAreaAdjust = (e) => {
        console.log("adjusting", e);
        e.target.style.height = (e.target.scrollHeight > e.target.clientHeight) ? (e.target.scrollHeight)+"px" : "12vh";
    }

    const textAreaAdjustByElement = (el) => {
        console.log("adjusting", el);
        el.style.height = (el.scrollHeight > el.clientHeight) ? (el.scrollHeight)+"px" : "12vh";
    }
    
    const createNewOption = () => {
        optionsData = [...optionsData, {title: "", mediatype: getMediaType()}]
        let dummy = document.getElementById("dummy");
        dummy.scrollIntoView(true);
    }

    const sendForm = () => {
        let optionsContent = document.getElementById("options_wrapper").children;
        optionsContent = [...optionsContent];
        const optionArr = optionsContent.slice(0,optionsContent.length -1);
        
        let optionsData = [];
        for (let i = 0; i < optionArr.length; i++) {
            const children = [...optionArr[i].children];
            const text = children[0].value;
            const wrapper = [...children[1].children];
            const mediaType = wrapper[1].value;
            optionsData.push({data: text, type: mediaType})
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
            owners: [{owner_id: userInfo.userid, rights: {manageMembers: true, editSurvey: true, viewResults: true}}]
        }
        console.log("CREATE SURVEY INFO OBJ", info);

        let [everyFieldFilled, errorMessage] = validateFormInputs(info);
        console.log(errorMessage)
        if(!everyFieldFilled){
                alert("Every field is obligatory.\n" + errorMessage)
            }
            else{
                console.log(surveyService);
                if(editing){
                    surveyService.put(surveyID, info).then(data => {
                        console.log(data);
                        const survey_link = window.location.href.split("/admin_board")[0] + "?takeSurvey=1&surveyID="+data.loc;
                        let dummy = document.getElementById("dummy");
                        dummy.value = survey_link;
                        console.log(dummy.value);
                        console.log(navigator, navigator.clipboard);
                        navigator.clipboard.writeText(survey_link).then(()=>{
                            swal("Successfully updated survey!", "Your link is:\n"+ survey_link + "\n It has been copied to your clipboard for you!", "success");
                            navigate("/admin_board/surveys");
                        })
                    }).catch(err => {
                        console.log(err);
                        alert("Failed to create")
                    })
                }
                else{
                    surveyService.postSurvey(info).then(data => {
                        console.log(data);
                        const survey_link = window.location.href.split("/admin_board")[0] + "?takeSurvey=1&surveyID="+data.loc;
                        let dummy = document.getElementById("dummy");
                        dummy.value = survey_link;
                        console.log(dummy.value);
                        console.log(navigator, navigator.clipboard);
                        navigator.clipboard.writeText(survey_link).then(()=>{
                            swal("Successfully created survey!", "Your link is:\n"+ survey_link + "\n It has been copied to your clipboard for you!", "success");
                            navigate("/admin_board/surveys");
                        })
                    }).catch(err => {
                        console.log(err);
                        alert("Failed to create")
                    })
                }
            }

    }

    const validateFormInputs = (formObj) => {
            let errorMessage = "";
            for(let key in formObj){
                let val = formObj[key];
                console.log("keys: ", key, typeof key)
                if(val === ""){
                    errorMessage = key + " is not filled out";
                    return [false, errorMessage];
                }
                else if(key === "items"){
                    if(val.length < 2){
                        errorMessage = "The survey must have 2 or more options";
                        
                        return [false, errorMessage];
                    }
                    for (let i = 0; i < val.length; i++) {
                        for(let key2 in val[i]){
                            if(val[i][key2] === ""){
                                errorMessage = key2 + " is not filled out in option " + (i+1);
                                return [false, errorMessage];
                            }
                        }
                    }
                }
            }
        return [true, ""];
    }
    const addResearcher = () => {
        console.log("adding researcher");
        let wrapper = document.getElementById("searchWrapper");
        let input = document.getElementById("researcher_search");
        if(input.value != ""){
            let p = document.createElement("p");
            p.innerHTML = input.value;
            wrapper.appendChild(p);
            input.value = "";
        }
        
    }
    const addResearcherOnEnter = (e) => {
        console.log("addresearcheronenter with event", e)
        if(e.keyCode == 13){
            addResearcher();
        }
    }
    $: optionsData
</script>

<div id="create_wrapper">
    <div id="general_info_form">
        <div id="main_input_wrapper">
            <input type="text" class="text_input" id="survey_title" placeholder="Survey title e.g. 'Preference of snacks'">
            <input type="text" class="text_input" id="survey_question" placeholder="Survey question e.g. 'Which snack do you prefer?'" >
            <textarea on:keydown={textAreaAdjust} class="text_input textareas" id="judge_instructions" placeholder="Judge instructions"></textarea>
            <textarea on:keydown={textAreaAdjust} class="text_input textareas" id="survey_description" placeholder="Survey description"></textarea>
            <div id="dropdownsAndCheckboxesWrapper">
                <div id="purposeWrapper" class="dropdownWrappers">
                    <label for="purpose">Purpose</label>
                    <select name="purpose" id="purposeDropdown" value={purpose}>
                        <option value="research">Research</option>
                        <option value="grading">Grading</option>
                        <option value="fun">For fun</option>
                        <option value="testing">Testing</option>
                    </select>
                </div>
                <div id="mediaTypeWrapper" class="dropdownWrappers" >
                    <label for="mediaType">Media type</label>
                    <select name="mediaType" id="mediaTypeDropdown" on:change={(e)=> {surveyMediaType = e.target.value}} value={surveyMediaType}>
                        <option value="text">Text</option>
                        <option value="image">Image</option>
                        <option value="pdf">PDF</option>
                        <option value="mix">Mix</option>
                    </select>
                </div>
                <div class="dropdownWrappers">
                    <label for="accessibility">Accessibility</label>
                    <select name="accessibility" id="accessibilityDropdown" value={accessibility}>
                        <option value="open">Open</option>
                        <option value="link">Link</option>
                        <option value="code">Code</option>
                    </select>
                </div>
                <div id="checkboxWrapper" class="dropdownWrappers">
                    <label for="activeCheckbox">Active survey</label>
                    <input type="checkbox" id="activeCheckbox" name="activeCheckbox" value="active">
                </div>
            </div>
            <div id="searchWrapper">
                <label for="researcher_search">Add researchers</label>
                <input type="search" id="researcher_search" name="researcher_search" aria-label="Search for researchers" placeholder="🔍Search..." on:keydown={addResearcherOnEnter}>
                <h4>Researchers participating in survey</h4>
            </div>
        </div>
        <div id="options_wrapper">
            {#each optionsData as data}
                <OptionBox title={data.title} bind:mediaType={data.mediatype} userInfo={userInfo}/>
            {/each}
            <button id="submitBtn" on:click={sendForm}>Submit</button>
        </div>
        
        <input type="text" id="dummy" value="hello">
    </div>
    <button id="new_option_button" on:click={createNewOption}>+</button>
</div>

<style>
    #create_wrapper{
        display: grid;
        margin: auto;
        padding-top: 5vh;
        text-align: center;  
        background-color: #eee;
        grid-template: 
        "menu title"
        "menu main_inputs"
        "menu options";
        overflow:hidden;

    }
    #general_info_form {
        display:grid;
        grid-template-rows: auto;
        height: 100%;
        margin-bottom: 5vh;
    }

    #main_input_wrapper{
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
        word-wrap:break-word;
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
    p{
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
    textarea{
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
    #searchWrapper {
        margin-left: 2vw;
        font-size: 1.6rem;
    }
    #researcher_search {
        padding: 1vh;
        width: 40%;
        font-size: 1.2rem;
    }
    
    
</style>