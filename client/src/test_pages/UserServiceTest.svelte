<script>
    import { object_without_properties } from "svelte/internal";
    import Footer from "../Components/Footer.svelte";
    import Navbar from "../Components/Navbar.svelte";
    import TableFilter from "../Components/TableFilter.svelte";
    import AboutProject from "../Pages/AboutProject.svelte";
    import AdminBoard from "../Pages/AdminBoard.svelte";
    import App from "../Pages/App.svelte";
    import { surveyService } from "../Services/SurveyService";
    const tableFilterParams =
    {
        countFunction: () => surveyService.getCount(),
        direction: 1,
        filterFunction: (a, b, c, d) => surveyService.getSorted(a, b, c, d),
        filterBy: "dateCreated"
    }
</script>
<main>
    <TableFilter {...tableFilterParams}></TableFilter>
</main>

<style>
    main {
        padding-top: 5vh;
        width: 60%;
        margin: auto;
    }
    #welcomeWrapper {
        text-align: left;
    }
</style>