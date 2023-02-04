module.exports = {
    removeFields: (item, fields) => {
        fields.forEach(f => {
            item[f] = undefined;
        })
        return item;
    },
}