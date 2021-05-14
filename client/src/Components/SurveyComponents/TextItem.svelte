<script>
    import {
        TextField,
        Textarea,
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
    import { onMount } from "svelte";

    export let option;
    export let optionMediaTypeItems;
    export let functionObject;
    export let disableFields = false;
    export let onFocusFunc;

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
    onMount(()=>{
        let selects = [...document.getElementsByClassName("textItemSelect")]
        selects.forEach((e)=>{
            e.addEventListener("click", onFocusFunc)
        })      

    })

</script>

<Card style="cursor: default; background-color:rgb(235,235,235);" hover>
    <Row>
        <Col cols={12}>
            <CardText>
                <Button
                    fab
                    outlined
                    class="float-left"
                    on:click={()=>{option.showOverlay = true; console.log("clicked on card");}}
                    >
                    <Icon path={mdiFullscreen}/>
                </Button>
                {#if !disableFields}
                <Button
                fab
                outlined
                class="float-right"
                on:click={() => functionObject.removeOption(option)}
                >
                    <Icon path={mdiDeleteForever}/>
                </Button>
                {/if}
                
                <div style="margin-bottom: 5em;">Item</div>
                <TextField
                hint="*Required"
                bind:value={option.tag}
                on:change={() => {console.log("edited text tag");option.editedArr["tag"] = "tag"}}
                class="mt-4"
                style="min-width:100%;"
                disabled={disableFields}
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
                    disabled={disableFields}
                    on:focus={onFocusFunc}
                >
                    <div slot="append">
                        <Tooltip
                            top
                            bind:active={option.showTooltip}
                        >
                            <Icon path={mdiInformationOutline} />
                            <span slot="tip">
                                Item text
                            </span>
                        </Tooltip>
                    </div>
                    Item value
                </TextField>

                <Select
                    items={optionMediaTypeItems}
                    bind:value={option.mediaType}
                    on:change={onChangeMediaType}
                    disabled={disableFields}
                    mandatory
                    on:click={onFocusFunc}
                    class="mt-4 textItemSelect">
                    Media Type
                </Select>
            </CardText>
        </Col>
    </Row>
</Card>


<Overlay
bind:active={option.showOverlay}
opacity={1}
color={"#eee"}
style="cursor:default;"
>
    <div style="width: 50vw;">
        <TextField type="text" accept="application/text" bind:value={option.tag} disabled={disableFields}>
            Item Tag
        </TextField>
    
        <Textarea
            bind:value={view}
            on:change={onChangeData}
            style="min-width:100%; margin-top:2vh;"
            disabled={disableFields}
            on:focus={onFocusFunc}
        >
            Item value
        </Textarea>
        <Button style="width: 30%; margin-top:10vh;" outlined on:click={(e)=>{option.showOverlay = false; e.stopPropagation();}}>
            Close overlay
        </Button>
    </div>
</Overlay>