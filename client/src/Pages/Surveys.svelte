<script>
    import { surveyService } from "../Services/SurveyService";
    import { userService } from "../Services/UserService";
    import Table from "../Components/Table.svelte";
    import { onMount } from "svelte";
    import TableFilter from "../Components/TableFilter.svelte";
    export let userInfo;

    const tableFilterParams = {
        countFunction: () => surveyService.getCount(),
        limit: 5,
        direction: -1,
        filterFunction: (a, b, c, d) => surveyService.getSorted(a, b, c, d),
    };
    let filterBy = {
        filterName:"dateCreated",
        counter: 0
    }
    console.log("in surveys");
    let dataHeaders = [
        {
            fieldName: "title",
            viewName: "title",
        },
        {
            fieldName: "users.fullName",
            viewName: "researcher",
        },
        {
            fieldName: "dateCreated",
            viewName: "created",
        },
        {
            fieldName: "items.data",
            viewName: "items"
        },
        {
            fieldName: "active",
            viewName: "active"
        },
        {
            fieldName: "_id",
            viewName: "id"
        },
        {
            fieldName: "",
            viewName: "data"
        },
        {
            fieldName: "",
            viewName: "edit"
        },
        {
            fieldName: "",
            viewName: "share"
        },
        {
            fieldName: "",
            viewName: "delete"
        },
    ];
    let data2DArray;
    let userRights = [];
    let activeStatus = [];
    let data = [];
    onMount(async () => {
        if (userInfo == null) {
            return;
        } else {
            console.log("userinfo in surveys", userInfo);
        }
    });

    async function generateTable() {
        data2DArray = [];
        for (let i = 0; i < data.length; i++) {
            if (!(userInfo.role == "admin")) {
                userRights.push(
                    data[i].owners.find((e) => userInfo.userid == e.ownerId)
                        .rights
                );
            } else {
                userRights.push({
                    manageMembers: true,
                    editSurvey: true,
                    viewResults: true,
                });
            }
            activeStatus.push(data[i].active);
            let email = "No owner";
            if (
                data[i].owners != undefined &&
                data[i].owners.length > 0 &&
                data[i].owners[0].ownerId != null
            ) {
                await userService
                    .getUserByID(data[i].owners[0].ownerId)
                    .then((userData) => {
                        if (
                            userData != null &&
                            userData != undefined &&
                            userData.email != null
                        )
                            email = userData.email;
                    })
                    .catch((err) =>
                        console.log("Could not getUserByID\n", err)
                    );
            }
            const YYYY_MM_DD_Date = data[i].dateCreated.split("T")[0];
            const DD_MM_YYYY_Date = YYYY_MM_DD_Date.split("-")
                .reverse()
                .join(".");
            //console.log(YYYY_MM_DD_Date, " -> ", DD_MM_YYYY_Date);
            const arr = [
                data[i].title,
                email,
                DD_MM_YYYY_Date,
                data[i].items.length,
                data[i].active,
                data[i]._id,
            ];
            data2DArray.push(arr);
        }
        data2DArray = data2DArray;
        console.log("dataHeaders", dataHeaders)
        console.log("Transformed survey 2D array data:", data2DArray);
    }

    $: data && generateTable();
    /*
    //Chronbachs alpha test
    //https://www.researchgate.net/post/How_do_I_compute_the_internal_consistency_of_a_scale_which_is_made_up_of_binary_coded_yes1_no0_answers
    const testArr = [1,7,3,12,6,16,5,9,8,3,2]
    const variance = (arr) => {
        let sum = 0;
        arr.forEach(e => sum += e);
        const average = sum/arr.length;
        let squareDiff = [];
        arr.forEach(e => squareDiff.push(Math.pow(e-average, 2)));
        let sumOfSquareDiff = 0;
        squareDiff.forEach(e=>sumOfSquareDiff+=e);
        return sumOfSquareDiff/arr.length;
    }
    //console.log("Variance: ", variance(testArr));
    */
</script>

<div>
    {#if data2DArray}
        <Table
            bind:filterBy={filterBy}
            tableTitle="Surveys"
            bind:tableData={data2DArray}
            bind:userInfo
            tableAttributes={dataHeaders}
            {userRights}
            surveyActivityStatus={activeStatus}
            deleteFunc={async (id) => {
                await surveyService.deleteSurvey(id);
            }}
        />
        <TableFilter
            bind:filterBy={filterBy}
            bind:data={data}
            bind:userInfo={userInfo}
            {...tableFilterParams}
        />
    {/if}
</div>

<style>
</style>
