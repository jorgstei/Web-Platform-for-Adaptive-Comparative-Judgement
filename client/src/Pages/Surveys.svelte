<script>
    import { surveyService } from "../Services/SurveyService";
    import { userService } from "../Services/UserService";
    import Table from "../Components/Table.svelte";
    import { onMount } from "svelte";
    import TableFilter from "../Components/TableFilter.svelte";
    export let userInfo;

    const tableFilterParams = {
        countFunction: () => surveyService.getCount(),
        limit: 10,
        direction: 1,
        filterFunction: (a, b, c, d) => surveyService.getSorted(a, b, c, d),
    };
    let filterBy = {
        filterName: "_id",
        counter: 0,
    };
    console.log("in surveys");
    let dataHeaders = [
        {
            fieldName: "title",
            viewName: "title",
        },
        {
            fieldName: "users.email",
            viewName: "researcher",
        },
        {
            fieldName: "dateCreated",
            viewName: "created",
        },
        {
            fieldName: "itemsCount",
            viewName: "items",
        },
        {
            fieldName: "inviteCode",
            viewName: "code"
        },
        {
            fieldName: "_id",
            viewName: "id",
        },
        {
            fieldName: "",
            viewName: "data",
        },
        {
            fieldName: "",
            viewName: "edit",
        },
        {
            fieldName: "",
            viewName: "share",
        },
        {
            fieldName: "",
            viewName: "delete",
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
            console.log("data length:", data.length);
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
                data[i].users != undefined &&
                data[i].users.length > 0 &&
                data[i].users[0].email != null
            ) {
                email = data[i].users[0].email;
            }
            const YYYY_MM_DD_Date = data[i].dateCreated.split("T")[0];
            const DD_MM_YYYY_Date = YYYY_MM_DD_Date.split("-").reverse().join(".");
            //console.log(YYYY_MM_DD_Date, " -> ", DD_MM_YYYY_Date);
            let strInviteCode = data[i].inviteCode+"";
            while(strInviteCode.length < 6){
                strInviteCode = "0"+strInviteCode
            }
            const arr = [
                data[i].title,
                email,
                DD_MM_YYYY_Date,
                data[i].items.length,
                strInviteCode,
                data[i]._id,
            ];
            
            if ( !data2DArray.some((e) => e[e.length - 1] == arr[arr.length - 1]) ) {
                data2DArray.push(arr);
                data2DArray[i] = data2DArray[i];
            }
        }
        data2DArray = data2DArray;
        console.log("Transformed survey 2D array data:", data2DArray);
    }

    $: data && generateTable();
</script>

{#if data2DArray}
    <Table
        bind:filterBy
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
    <TableFilter bind:filterBy={filterBy} bind:data={data} bind:userInfo={userInfo} {...tableFilterParams} />
{/if}

<style>
</style>
