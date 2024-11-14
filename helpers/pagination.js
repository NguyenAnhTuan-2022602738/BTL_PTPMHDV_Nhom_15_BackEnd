module.exports = (objectPagination, query, countCars) => {
    if(query.page){
        objectPagination.currentPage = parseInt(query.page);
    }

    if(query.limit){
        objectPagination.limitItems = parseInt(query.limit);
    }

    objectPagination.skip = (objectPagination.currentPage - 1) * objectPagination.limitItems;

    
    const totalPage = Math.ceil(countCars / objectPagination.limitItems);
    objectPagination.totalPage = totalPage;

    return objectPagination;
    
}