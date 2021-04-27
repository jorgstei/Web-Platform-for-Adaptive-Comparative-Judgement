<script>
    import {
        TextField,
        Button,
        Icon,
        Tooltip,
        Select,
        Card,
        CardText,
        Row,
        Col,
        Overlay,
    } from "svelte-materialify";
    import {
        mdiDeleteForever,
        mdiInformationOutline,
        mdiFullscreen,
    } from "@mdi/js";
    import { surveyItemFileService } from "../../Services/SurveyItemFileService";
    import { nodeBufferToBlobURL, nodeBufferToFile } from "../../Utility/nodeBufferToBlobURL";
    import { onMount } from "svelte";
    import PDFView from "./PDFView.svelte"


    export let option;
    export let optionMediaTypeItems;
    export let functionObject;
    
    let uploadLabelText = "Choose File"
    let view = undefined

    onMount(() => {
        console.log("in pdfitem with option", option);
        let uploadBtn = document.getElementById("pdfupload-btn-"+option.uuid)
        if(!uploadBtn){
            console.error("mytag unable to get uploadBtn")
        }
        uploadLabelText = option.fileName == "" ? "Choose File" : option.fileName
    })

    function onFileSelected(e){
        view = undefined
        if(e?.target?.files[0]){
            option.data = e.target.files[0]

            option.editedArr["data"] = "data";
            option.editedArr["fileName"] = "fileName";
            option.fileName = e.target.files[0].name
            uploadLabelText = e.target.files[0].name
            if(option.tag == ""){
                option.tag = e.target.files[0].name
                option.editedArr["tag"] = "tag"
            }
            view = URL.createObjectURL(e.target.files[0])

            option = option
            console.log("File selected: ", option.data)
        }
        else{
            uploadLabelText = "Choose File"
        }
    }

    async function showOverlay(){
        const objectIdRegex = /^[0-9a-fA-F]{24}$/
        //If option._id is a valid objectID we must assume we should fetch the complete data from server
        if(view == undefined && typeof(option._id) == "string" && option._id.match(objectIdRegex)){
            await surveyItemFileService.get(option._id).then(response => {
                if(response.status < 300){
                    console.log(response.data)
                    view = URL.createObjectURL(nodeBufferToFile(response.data.data.data, "application/pdf"))
                    console.log("mytag3 view ready")
                }
                else{
                    console.error("Couldn't get PDF object from server")
                }
            })
        }
        option.showOverlay = true; console.log("clicked on card");
    }

</script>

<Card style="cursor: default; background-color:rgb(235,235,235);" hover>
    <Row>
        <Col cols={12}>
            <CardText>
                <Button
                fab
                outlined
                class="float-left"
                on:click={showOverlay}
                >
                    <Icon path={mdiFullscreen}/>
                </Button>

                <Button
                fab
                outlined
                class="float-right"
                on:click={() => functionObject.removeOption(option)}
                >
                    <Icon path={mdiDeleteForever}/>
                </Button>
            
                
                <div>Item</div>
                <input type="file" accept="application/pdf" id="pdfupload-btn-{option.uuid}" on:change={onFileSelected} hidden/>
                <label class="labelBtn" style="width:80%; margin:auto;" for="pdfupload-btn-{option.uuid}">{uploadLabelText}</label>
                
                <TextField
                    hint="*Required"
                    bind:value={option.tag}
                    on:change={() => {console.log("edited pdf tag");option.editedArr["tag"] = "tag"}}
                    class="mt-4"
                    style="min-width:100%;"
                >
                    <div slot="append">
                        <Tooltip
                            top
                            bind:active={option.showTooltip}
                        >
                            <Icon path={mdiInformationOutline} />
                            <span slot="tip"
                                >The file name or unique tag. Used to identify specific items</span
                            >
                        </Tooltip>
                    </div>
                    Item Tag
                </TextField>

                <Select
                    items={optionMediaTypeItems}
                    bind:value={option.mediaType}
                    on:change={()=>option.mimeType = functionObject.getInputFieldTypeFromMediaType(option.mediaType)}
                    class="mt-4">Media Type</Select
                >
            </CardText>
            
        </Col>
        
    </Row>
</Card>
<Overlay
bind:active={option.showOverlay}
opacity={1}
color={"#eee"}
style="cursor:default"
>
    <TextField type={"text"} accept={"application/text"} bind:value={option.tag}>
        Item Tag
    </TextField>
    {#if view != undefined}
        <PDFView iframeId="preview" width="70vh" height="70vh" src={view}></PDFView>
        <Button style="width: 30%; margin-top:10vh;" outlined on:click={(e)=>{option.showOverlay = false; e.stopPropagation();}}>
            Close overlay
        </Button>
    {/if}
</Overlay>

<style>
    .labelBtn{
        padding: 0.5rem;
        font-family: sans-serif;
        border-radius: 0.3rem;
        cursor: pointer;
    }
    .labelBtn:hover{
        background-color: gray;
    }
</style>