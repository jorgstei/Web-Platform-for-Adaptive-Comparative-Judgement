<script>
    import {Card, CardText, CardActions} from "svelte-materialify"
    export let userInfo = null;
</script>
{#if userInfo != null}
    <h1 class="text-h1 ma-2 mb-6" style="font-size: 5rem">Profile</h1>
    <h5 class="text-h5 ma-2 mb-6">Welcome {userInfo.email}</h5>
    <Card class="elevation-4">
        <CardText>

        </CardText>
        <CardActions>

        </CardActions>
    </Card>
{/if}