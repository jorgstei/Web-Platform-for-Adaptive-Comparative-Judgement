<script>
  import { userService } from "../Services/UserService";
  import { onMount } from "svelte";
  import {dateFromObjectId} from "../Utility/dateFromObjectId"
  import Table from "../Components/Table.svelte";
  import TableFilter from "../Components/TableFilter.svelte";
  import { Overlay, ProgressCircular } from 'svelte-materialify';

  let loadingData = true;
  export let userInfo;

  console.log("in researchers");
  const tableFilterParams = {
    countFunction: () => userService.getCount(),
    limit: 10,
    direction: -1,
    filterFunction: (a, b, c, d) => userService.getSorted(a, b, c, d),
  };
  let filterBy = {
    filterName: "_id",
    counter: 0,
  };
  let tableAttributes = [
    {
      fieldName: "fullName",
      viewName: "full name",
    },
    {
      fieldName: "email",
      viewName: "email",
    },
    {
      fieldName: "_id",
      viewName: "joined on",
    },
    {
      fieldName: "_id",
      viewName: "id",
    },
    {
      fieldName: "",
      viewName: "delete",
    },
  ];
  let data2DArray;
  let data = [];
  onMount(async () => {
    console.log("Researchers data: ", data);
  });

  async function generateTable() {
    data2DArray = [];
    for (let i = 0; i < data.length; i++) {
      // add data according to tableAttributes array
      let arr = [
        data[i].firstName != null && data[i].lastName != null
          ? data[i].firstName + " " + data[i].lastName
          : data[i].email.split("@")[0],
        data[i].email,
        dateFromObjectId(data[i]._id).toLocaleString("en-UK").split(',')[0],
        data[i]._id,
      ];
      data2DArray.push(arr);
    }
    data2DArray = data2DArray
    console.log("Tranformed researchers data 2D array", data2DArray);
  }
  $: data && generateTable();
</script>

<Overlay bind:active={loadingData}>
  <h1 class="text-h1 mb-16 white-text">Loading data...</h1>
  <ProgressCircular color="white" indeterminate size={128} />
</Overlay>
{#if data2DArray}
  <h1 class="text-h1 ma-2" style="font-size: 5rem">Users</h1>
  <div class="d-flex flex-column justify-content-center">
      <Table
      bind:filterBy
      bind:userInfo
      bind:tableData={data2DArray}
      itemName = "researcher"
      {tableAttributes}
      deleteFunc={async (id) => {
        await userService.deleteUserByID(id);
      }}
    />
    <TableFilter bind:loadingData={loadingData} bind:filterBy={filterBy} bind:data={data} bind:userInfo={userInfo} {...tableFilterParams} />
  </div>
  
{/if}

<style>
</style>
