// 获取数据库引用
const db = wx.cloud.database();

/* 添加api */
const add = (collectionName, data = {}) => {
    return db.collection(collectionName).add({
        data
    })
}

/* 查询api  id */
const findById = (collectionName, id = '') => {
    return db.collection(collectionName).doc(id).get()

}

/* 查询api  where 全部获取 */

const findAll = async (collectionName, where = {}, orderBy = { field: '_id', sort: 'desc' }) => {
    // 云开发， 获取数据数据
    // 在程序端，一次性只能获取20条数据，在云端，一次性只能获取100条数据
    const MAX_LIMIT = 20;
    const countResult = await db.collection(collectionName).count();
    const total = countResult.total;
    // 计算需分几次取
    const batchTimes = Math.ceil(total / MAX_LIMIT);
    // 承载所有读操作的 promise 的数组
    const tasks = []
    for (let i = 0; i < batchTimes; i++) {
        const promise = db.collection(collectionName).where(where).skip(i * MAX_LIMIT).limit(MAX_LIMIT).orderBy(orderBy.field, orderBy.sort).get()
        tasks.push(promise)
    }

    if ((await Promise.all(tasks)).length <= 0) {
        return { data: [] };
    }
    // 等待所有
    return (await Promise.all(tasks)).reduce((acc, cur) => {
        return {
            data: acc.data.concat(cur.data),
        }
    })
}

/* 查询  where  分页 */
const find = async (collectionName, where = {}, page = 1, limit = 4, orderBy = { field: "_id", sort: "desc" }) => {
    // skip 分页，跳过多少条
    let skip = (page - 1) * limit;
    return db.collection(collectionName).where(where).skip(skip).limit(limit).orderBy(orderBy.field, orderBy.sort).get();
}

/* 删除一条记录 */

const del = async (collectionName, id = '') => {
    return db.collection(collectionName).doc(id).remove()
}
/* 删除 */
const removeByWhere = (collectionName, where = {}) => {
    return db.collection(collectionName).where(where).remove()
}

/* 修改一条记录 */
const change = async (collectionName, id = '', data = {}) => {
    return db.collection(collectionName).doc(id).update({ data })
}

export default {
    add,
    findById,
    findAll,
    find,
    del,
    change,
    db,
    removeByWhere
}