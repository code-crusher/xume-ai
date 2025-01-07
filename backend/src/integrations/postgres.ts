const executeQuery = async (data: any) => {
    console.log(data?.query);
}

executeQuery.schema = {
    query: "string"
}

export default {
    executeQuery
}