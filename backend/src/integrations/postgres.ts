const executeQuery = async (data: any) => {
    console.log(data?.sqlQuery);
}

executeQuery.schema = {
    sqlQuery: "string"
}

export default {
    executeQuery
}