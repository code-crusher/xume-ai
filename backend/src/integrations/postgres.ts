

const saveDataInPostgres = async (data: any) => {
    console.log(data);
}

saveDataInPostgres.schema = {
    table: "string",
    columns: "string[]",
    values: "any[]"
}

export default {
    saveDataInPostgres
}