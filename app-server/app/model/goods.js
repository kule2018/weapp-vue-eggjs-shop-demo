'use strict';
const db = require('../../database/db.js');

module.exports = app => {
  const goodsSchema = require('../schema/goods.js')(app);
  const goodsCategorySchema = require('../schema/goodscategory.js')(app);
  const Goods = db.defineModel(app, 'goods', goodsSchema);
  const Goodscategory = db.defineModel(app, 'goodscategory', goodsCategorySchema, {
    timestamps: false,
    freezeTableName: true,
  });

  // 关系
  Goodscategory.hasMany(Goods, { foreignKey: 'categoryUuid' });

  /**
   * 查询key为类别的商品数据
   * @param {object} { categoryAttributes, merchantUuid, goodsAttributes } - 条件
   * @return {object|null} - 查找结果
   */
  Goods.getGoodsWithCategory = async ({ categoryAttributes, merchantUuid, goodsAttributes }) => {
    return await Goodscategory.findAll({
      attributes: categoryAttributes,
      where: { orgUuid: merchantUuid },
      include: [
        {
          model: Goods,
          attributes: goodsAttributes,
        },
      ],
    });
  };

  /**
   * 查询某类别的商品数量
   * @param {string} categoryUuid - 类别uuid
   * @return {number|null} - 商品数量
   */
  Goods.countGoodsByCategory = async categoryUuid => {
    return await Goods.count({
      where: { categoryUuid },
    });
  };

  /**
   * 查询商品分页列表
   * @param {object} { attributes, pagination, filter } - 条件
   * @return {object|null} - 查找结果
   */
  Goods.query = async ({ userUuid, attributes, pagination = {}, filter = {} }) => {
    const { page, pageSize: limit } = pagination;
    const { count, rows } = await Goods.findAndCountAll({
      offset: (page - 1) * limit,
      limit,
      attributes,
      where: { ...filter, orgUuid: userUuid },
      order: [['createdTime', 'DESC']],
    });

    return { page, count, rows };
  };

  /**
   * 查询商品
   * @param {sting} uuid - 商品uuid
   * @return {object|null} - 查找结果
   */
  Goods.get = async uuid => {
    return await Goods.findById(uuid);
  };

  return Goods;
};

