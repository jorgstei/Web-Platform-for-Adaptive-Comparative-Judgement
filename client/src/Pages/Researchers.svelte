<script>
  import { userService } from "../Services/UserService";
  import { onMount } from "svelte";
  import Table from "../Components/Table.svelte";
  import TableFilter from "../Components/TableFilter.svelte";
  export let userInfo;

  console.log("in researchers");
  const tableFilterParams = {
    countFunction: () => userService.getCount(),
    limit: 5,
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
      fieldName: "createdAt",
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
        "18.02.2021",
        data[i]._id,
      ];
      data2DArray.push(arr);
    }
    data2DArray = data2DArray
    console.log("Tranformed researchers data 2D array", data2DArray);
  }
  $: data && generateTable();
</script>

{#if data2DArray}
  <Table
    bind:filterBy
    tableTitle="Researchers"
    bind:userInfo
    bind:tableData={data2DArray}
    {tableAttributes}
    deleteFunc={async (id) => {
      await userService.deleteUserByID(id);
    }}
  />
  <TableFilter bind:filterBy bind:data bind:userInfo {...tableFilterParams} />
{/if}

<style>
</style>
