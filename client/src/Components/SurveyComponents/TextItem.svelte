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

    export let option;
    export let optionMediaTypeItems;
    export let functionObject;

    let view = option.data

    function onChangeMediaType(e) {
        option.mimeType = functionObject.getInputFieldTypeFromMediaType(option.mediaType)
        option.editedArr["mimeType"] = "mimeType"
    }

    function onChangeData(e) {
        option.editedArr["data"] = "data"
        option.data = new File([view], "rawtext.txt", {type: "text/plain"})
        console.log("Changed text option.data: ", option.data)
    }

</script>

<Card style="cursor: default; background-color:rgb(235,235,235);" hover>
    <Row>
        <Col cols={11}>
            <CardText>
                <div>Item</div>
                <TextField
                hint="*Required"
                bind:value={option.tag}
                on:change={() => {console.log("edited text tag");option.editedArr["tag"] = "tag"}}
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
                <TextField
                    hint="*Required"
                    bind:value={view}
                    on:change={onChangeData}
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
                                >Item text</span
                            >
                        </Tooltip>
                    </div>
                    Item value
                </TextField>

                <Select
                    items={optionMediaTypeItems}
                    bind:value={option.mediaType}
                    on:change={onChangeMediaType}
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
                on:click={()=>{option.showOverlay = true; console.log("clicked on card");}}
                >
                <Icon path={mdiFullscreen}/>
            </Button>
        </Col>
    </Row>
</Card>