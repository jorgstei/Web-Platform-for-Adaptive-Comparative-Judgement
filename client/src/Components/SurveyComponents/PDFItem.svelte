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


    export let option;
    export let optionMediaTypeItems;
    export let functionObject;

    function onFileSelected(e){
        if(e?.target?.files[0]){
            option.data = e.target.files[0]
            option.tag = option.tag == "" ? e.target.files[0].name : option.tag
            option = option
            console.log("File selected: ", option.data)
        }
    }

    async function showOverlay(){
        const objectIdRegex = /^[0-9a-fA-F]{24}$/
        //If option.data is a valid objectID we must assume we should fetch the complete data from server
        if(typeof(option.data) == "string" && option.data.match(objectIdRegex)){
            await surveyItemFileService.get(option.data).then(response => {
                if(response.status < 300){
                    console.log(response.data)
                    option.data = nodeBufferToFile(response.data.data.data, "application/pdf")
                }
                else{
                    console.error("Couldn't get PDF object from server")
                }
            })
        }
        option.showOverlay = true; console.log("clicked on card");
    }

</script>

<Card style="cursor: default; background-color:rgb(220,220,220);" hover>
    <Row>
        <Col cols={11}>
            <CardText>
                <div>Item</div>
                <input type="file" id="pdfupload-btn-{option.uuid}" on:change={onFileSelected} hidden/>
                <label class="labelBtn" for="pdfupload-btn-{option.uuid}">Choose File</label>
                <TextField
                    hint="*Required"
                    bind:value={option.tag}
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
        <Col cols={1}>
            <Button
                fab
                outlined
                class="float-right"
                on:click={() => functionObject.removeOption(option)}
                >
                <Icon path={mdiDeleteForever}/>
            </Button>
            
            <Button
                fab
                outlined
                class="float-right mt-9"
                on:click={showOverlay}
                >
                <Icon path={mdiFullscreen}/>
            </Button>
        </Col>
    </Row>
</Card>

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